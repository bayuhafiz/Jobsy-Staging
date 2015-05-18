// load all the things we need
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var path = require('path'),
    templatesDir = path.resolve(__dirname, '..', 'views'),
    emailTemplates = require('email-templates'),
    nodemailer = require('nodemailer');

var LocalStrategy = require('passport-local').Strategy;

// load up the secret file
var secrets = require('./secret');

// load up the user model
var User = require('../app/models/user');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function() {
                User.findOne({
                    'email': email
                }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user)
                        return done(null, false, req.flash('error', 'No user with that email found'));

                    if (!user.validPassword(password))
                        return done(null, false, req.flash('error', 'Wrong password'));

                    // all is well, return user
                    else
                        return done(null, user);
                });
            });

        }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
        },
        function(req, email, password, done) {
            if (email)
                email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

            // asynchronous
            process.nextTick(function() {
                // if the user is not already logged in:
                if (!req.user) {
                    User.findOne({
                        'email': email
                    }, function(err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('error', 'That email is already taken'));
                        } else {

                            // Generate random token
                            var token = crypto.randomBytes(16).toString('hex');

                            // create the user
                            var newUser = new User();

                            newUser.email = email;
                            newUser.password = newUser.generateHash(password);
                            newUser.firstName = req.body.firstName;
                            newUser.lastName = req.body.lastName;
                            newUser.companyName = req.body.companyName;
                            newUser.email = req.body.email;
                            newUser.image = 'dummy.png';
                            newUser.password = newUser.generateHash(req.body.password);
                            newUser.actToken = token;
                            newUser.actTokenCreated = Date.now();
                            newUser.actTokenExpired = Date.now() + 3600000; // 1 hour
                            newUser.actStatus = 'inactive';

                            newUser.save(function(err) {
                                if (err)
                                    return done(err);

                                emailTemplates(templatesDir, function(err, template) {
                                    // Send activation mail to user
                                    var transport = nodemailer.createTransport({
                                        service: 'Mailgun',
                                        auth: {
                                            user: secrets.mailgun.user,
                                            pass: secrets.mailgun.password
                                        }
                                    });

                                    // An users object with formatted email function
                                    var locals = {
                                        email: newUser.email,
                                        button: {
                                            link: 'http://' + req.headers.host + '/activate/' + newUser.actToken,
                                            text: 'activate your account'
                                        },
                                        header: 'Hi ' + newUser.firstName,
                                        body: 'Thanks for creating a Jobsy Account. To continue, please confirm your email address by clicking the button below'
                                    };

                                    // Send a single email
                                    template('email', locals, function(err, html, text) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            transport.sendMail({
                                                from: 'Jobsy Mailer <mailer@jobsy.io>',
                                                to: locals.email,
                                                subject: 'Jobsy Account Activation!',
                                                html: html,
                                                text: text
                                            }, function(err, responseStatus) {
                                                if (err) {
                                                    console.log(err);
                                                } else {
                                                    return done(null, newUser);
                                                }
                                            });
                                        }
                                    });
                                });

                            });
                        }

                    });
                    // if the user is logged in but has no local account...
                } else if (!req.user.email) {
                    // ...presumably they're trying to connect a local account
                    // BUT let's check if the email used to connect a local account is being used by another user
                    User.findOne({
                        'email': email
                    }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {
                            return done(null, false, req.flash('error', 'That email is already taken'));
                            // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                        } else {
                            var user = req.user;
                            user.email = email;
                            user.password = user.generateHash(password);
                            user.save(function(err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }
                    });
                } else {
                    // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                    return done(null, req.user);
                }

            });

        }));

};
