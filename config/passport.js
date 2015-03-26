// load all the things we need
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var LocalStrategy    = require('passport-local').Strategy;

// load up the secret file
var secrets = require('./secret');

// load up the user model
var User       = require('../app/models/user');

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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('error', 'No user with this email found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('error', 'Oops! Wrong password.'));

                // if user is not activated yet
                if (user.actStatus == 'inactive')
                    return done(null, false, req.flash('error', 'You have to activate your account first. Check your email for activation instruction.'));
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
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('error', 'That email is already taken.'));
                    } else {

                        // Generate random token
                        var token = crypto.randomBytes(16).toString('hex');

                        // create the user
                        var newUser            = new User();

                        newUser.email    = email;
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

                            // Send activation mail to user
                            var smtpTransport = nodemailer.createTransport({
                                service: 'Mailgun',
                                auth: {
                                    user: secrets.mailgun.user,
                                    pass: secrets.mailgun.password
                                }
                            });
                            var mailOptions = {
                                to: newUser.email,
                                from: 'mailer@jobsy.io',
                                subject: 'Jobsy - User Account Activation',
                                text: 'You are receiving this email because you have signed up on Jobsy. \n\n' +
                                    'Please click on the following link, or paste this into your browser to complete the process: \n\n' +
                                    'http://' + req.headers.host + '/activate/' + token + '\n\n' +
                                    'If you did not sign up on our website, please ignore this email.\n'
                            };
                            smtpTransport.sendMail(mailOptions, function(err) {
                                if (err)
                                    return done(err); 
                                req.flash('success', 'Your account has been created. An e-mail has been sent to ' + newUser.email
                                 + ' with further instructions.');
                                return done(null, newUser);
                            });

                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'email' :  email }, function(err, user) {
                    if (err)
                        return done(err);
                    
                    if (user) {
                        return done(null, false, req.flash('error', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.email = email;
                        user.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);
                            
                            return done(null,user);
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
