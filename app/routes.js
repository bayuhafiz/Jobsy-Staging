var async = require('async'),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    path = require('path'),
    templatesDir = path.resolve(__dirname, '..', 'views'),
    emailTemplates = require('email-templates'),
    nodemailer = require('nodemailer'),
    fs = require('fs'),
    unirest = require('unirest'),
    gm = require('gm'),
    util = require('util'),
    braintree = require('braintree'),
    generatePassword = require('password-generator'),
    less = require('less');

// Mandrill configuration
var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('jnbaFnbflDUZ6lIZD7PqVw');

// For development purpose ONLY!
var util = require('util');
var gateway = braintree.connect({
    environment: braintree.Environment.Sandbox,
    merchantId: "wr9spyx7zjcmt7f8",
    publicKey: "3mt3683g3hyp38p7",
    privateKey: "b2caa2806a3edc7f9d06bb7163d50d63"
});

// Load up the secret file
var secrets = require('../config/secret');

// Cloudinary images CDN settings
var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'jobsyimgcdn',
    api_key: '534351268798955',
    api_secret: 'IzlEJLEVY93u-90xIOqguA-9E5c'
});

// Load up the model files
var Job = require('./models/job');
var User = require('./models/user');
var App = require('./models/app');
var Pay = require('./models/pay');
var Invite = require('./models/invite');

// Algolia-search configuration ================================================
var HttpsAgent = require('agentkeepalive').HttpsAgent;
var Algolia = require('algoliasearch');
var keepaliveAgent = new HttpsAgent({
    maxSockets: 1,
    maxKeepAliveRequests: 0, // no limit on max requests per keepalive socket
    maxKeepAliveTime: 30000 // keepalive for 30 seconds
});
var client = new Algolia('0C3DP08PJ4', 'e800495e92ef6b58b109bb2ee91727e1', keepaliveAgent); 


// Here are our precious module
module.exports = function(app, passport) {

    // =============================================================================
    // =========================================================== MAIN PAGES ROUTES
    // show the home page ===========================
    app.get('/', function(req, res) {
        if (req.user) {
            var user = req.user;
            if ((user.actStatus == 'inactive') || (user.initLogin == true)) {
                res.render('act.ejs', {
                    title: 'Activation',
                    actStatus: user.actStatus,
                    initLogin: user.initLogin,
                    userid: user.id
                });
            } else {
                res.render('home.ejs', {
                    title: 'Homepage',
                    user: user,
                    initLogin: user.initLogin,
                    initCompany: user.initCompany,
                    credits: user.credits
                });
            }
        } else {
            res.render('home.ejs', {
                title: 'Homepage',
                user: null
            });
        }
    });
    // DASHBOARD SECTION =========================
    app.get('/dash', isLoggedIn, function(req, res) {
        var user = req.user;
        if ((user.actStatus == 'inactive') || (user.initLogin == true)) { // If user not activated or has no post yet
            res.render('act.ejs', {
                title: 'Activation',
                actStatus: user.actStatus,
                initLogin: user.initLogin,
                userid: user.id
            });
        } else {
            Job.find({
                email: req.user.email
            }, null, {
                sort: {
                    createdAt: -1
                }
            }, function(err, jobs) {
                res.render('dash.ejs', {
                    title: 'Dashboard',
                    user: user,
                    initLogin: user.initLogin,
                    initCompany: user.initCompany,
                    credits: user.credits
                });
            });
        }
    });
    // END OF MAIN PAGES ROUTES ====================================================


    // ================================================== AUTHENTICATE (FIRST LOGIN)
    // Get activate account
    app.get('/activate/:token', function(req, res) {
        User
            .findOne({
                actToken: req.params.token
            })
            .exec(function(err, user) {
                if (err) return next(err);
                if (user.actStatus == 'activated') { // If user already activated
                    req.flash('error', 'Your account already activated. You can now login.');
                    res.redirect('/');
                } else {
                    // Change the status
                    user.actStatus = 'activated';
                    user.actToken = undefined;
                    user.actTokenCreated = undefined;
                    user.actTokenExpired = undefined;
                    user.save(function(err) {
                        if (err) {
                            req.flash('error', 'User activate token is invalid or has expired.');
                            res.redirect('/');
                        } else {
                            //req.flash('success', { msg: 'Your account has been activated. You can now login using your email and password' });
                            req.logIn(user, function(err) {
                                if (err) return next(err);
                                res.redirect('/dash');
                            });
                        }
                    });
                }
            });
    });
    // Deactivate account -----------------------------------
    app.get('/unlink', isLoggedIn, function(req, res) {
        var user = req.user;
        user.email = undefined;
        user.password = undefined;
        user.save(function(err) {
            req.logout();
            req.flash('info', 'Your account has been successfully deleted.');
            res.redirect('/');
        });
    });


    // =============================================================================
    // IMAGE MANIPULATION ROUTES =====================================================
    // Upload temp Logo ---------------------------------
    app.post('/logo/temp', function(req, res) {
        console.log("Uploading: \n" + JSON.stringify(req.files.img));
        cloudinary.uploader.upload(req.files.img.path, function(result) {
            console.log('Success!\n' + JSON.stringify(result));
            res.json({
                "status": "success",
                "url": result.url,
                "width": result.width,
                "height": result.height
            });
        });
    });
    // Upload Cropped Logo ---------------------------------
    app.post('/logo/save', function(req, res) {
        console.log(util.inspect(req.files, {
            showHidden: false,
            depth: null
        }));
        //console.log("Saving: \n" + req.imgUrl);
    });


    // =============================================================================
    // ======================================================= BEGIN PAYMENT SYSTEMS
    // Buy Credits /////
    app.get('/buy/:amount', isLoggedIn, function(req, res) {
        var userId = req.user._id; // Get logged user id
        var amount = parseInt(req.params.amount) * 50000;
        // Generate random order ID
        var order_id = Date.now() + Math.floor((Math.random() * 10000) + 1);
        // Create Base64 Object
        var Base64 = {
            _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            encode: function(r) {
                var t, e, o, a, h, n, c, d = "",
                    C = 0;
                for (r = Base64._utf8_encode(r); C < r.length;) t = r.charCodeAt(C++), e = r.charCodeAt(C++), o = r.charCodeAt(C++), a = t >> 2, h = (3 & t) << 4 | e >> 4, n = (15 & e) << 2 | o >> 6, c = 63 & o, isNaN(e) ? n = c = 64 : isNaN(o) && (c = 64), d = d + this._keyStr.charAt(a) + this._keyStr.charAt(h) + this._keyStr.charAt(n) + this._keyStr.charAt(c);
                return d
            },
            decode: function(r) {
                var t, e, o, a, h, n, c, d = "",
                    C = 0;
                for (r = r.replace(/[^A-Za-z0-9\+\/\=]/g, ""); C < r.length;) a = this._keyStr.indexOf(r.charAt(C++)), h = this._keyStr.indexOf(r.charAt(C++)), n = this._keyStr.indexOf(r.charAt(C++)), c = this._keyStr.indexOf(r.charAt(C++)), t = a << 2 | h >> 4, e = (15 & h) << 4 | n >> 2, o = (3 & n) << 6 | c, d += String.fromCharCode(t), 64 != n && (d += String.fromCharCode(e)), 64 != c && (d += String.fromCharCode(o));
                return d = Base64._utf8_decode(d)
            },
            _utf8_encode: function(r) {
                r = r.replace(/\r\n/g, "\n");
                for (var t = "", e = 0; e < r.length; e++) {
                    var o = r.charCodeAt(e);
                    128 > o ? t += String.fromCharCode(o) : o > 127 && 2048 > o ? (t += String.fromCharCode(o >> 6 | 192), t += String.fromCharCode(63 & o | 128)) : (t += String.fromCharCode(o >> 12 | 224), t += String.fromCharCode(o >> 6 & 63 | 128), t += String.fromCharCode(63 & o | 128))
                }
                return t
            },
            _utf8_decode: function(r) {
                for (var t = "", e = 0, o = c1 = c2 = 0; e < r.length;) o = r.charCodeAt(e), 128 > o ? (t += String.fromCharCode(o), e++) : o > 191 && 224 > o ? (c2 = r.charCodeAt(e + 1), t += String.fromCharCode((31 & o) << 6 | 63 & c2), e += 2) : (c2 = r.charCodeAt(e + 1), c3 = r.charCodeAt(e + 2), t += String.fromCharCode((15 & o) << 12 | (63 & c2) << 6 | 63 & c3), e += 3);
                return t
            }
        };
        // Define the string
        var string = 'VT-server-XzWLJbFxyzU72hwjhpmM_K-y:';
        var encodedString = Base64.encode(string);
        var auth = 'Basic ' + encodedString + ':';
        var arr = {
            "payment_type": "vtweb",
            "vtweb": {
                "credit_card_3d_secure": true
            },
            "transaction_details": {
                "order_id": order_id,
                "gross_amount": amount
            }
        }
        unirest.post('https://api.sandbox.veritrans.co.id/v2/charge')
            .header({
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': auth
            })
            .send(arr)
            .end(function(response) {
                var pay = new Pay({
                    order_id: order_id,
                    user_email: req.user.email
                });
                // Save transaction data
                pay.save(function(err) {
                    if (err) {
                        req.flash('error', err);
                        res.redirect('/dash');
                    }
                    // Saving credits amount into session
                    req.session.credit = req.params.amount;
                    console.log("Saving init transaction success...");
                    res.redirect(response.body.redirect_url);
                });
            });
    });
    // Payment notifiication handler
    app.post('/payment/notif', isLoggedIn, function(req, res) {
        Pay.find({
            "order_id": req.body.order_id
        }, function(err, pay) {
            pay.gross_amount = req.body.gross_amount;
            pay.payment_type = req.body.payment_type;
            pay.transaction_time = req.body.transaction_time;
            pay.status_code = req.body.status_code;
            pay.save(function(err) {
                if (err) {
                    req.flash('error', err);
                }
                res.send('Success! saved to database >>>\n' + req.body);
            });
        })
    });
    // Payment status handler
    app.get('/payment/:state', isLoggedIn, function(req, res) {
        var state = req.params.state;
        switch (state) {
            case "finish":
                var status_code = req.query.status_code;
                var order_id = req.query.order_id;
                if (status_code == '200') {
                    console.log('Looking for transaction with order_id: ' + order_id);
                    Pay.find({
                        "order_id": order_id
                    }, function(err, pay) {
                        if (err) {
                            req.flash('error', err);
                            res.redirect('/dash');
                        } else {
                            var new_credit = req.session.credit;
                            console.log('Adding ' + new_credit + ' credits to user: ' + req.user.email + ' (ID: ' + req.user.id + ') / ' + status_code);
                            // Add credit to user
                            User.findById(req.user.id, function(err, user) {
                                console.log('User\'s last credits >>> ' + user.credits);
                                user.credits = user.credits + parseInt(new_credit); // add the credits
                                console.log('New user\'s credits >>> ' + user.credits);
                                user.save(function(err) {
                                    if (err) {
                                        req.flash('error', err);
                                    } else {
                                        // Transaction success...
                                        req.session.credit = false;
                                        console.log('Success the credit has been added...');
                                        req.flash('success', 'Your credit has been added.');
                                    }
                                })
                            });
                        }
                    });
                } else {
                    console.log('Transaction pending or cancelled... now deleting...');
                    Pay.find({
                            order_id: req.query.order_id
                        })
                        .remove(function(err) {
                            if (err) { // if failed remove
                                req.flash('error', err);
                                res.redirect('/dash');
                            } else { // if succeeded
                                console.log('Success!! init transaction deleted...');
                                req.flash('error', 'You cancelled the transaction.');
                            }
                        });
                    req.flash('error', 'Your transaction is failed to process...');
                };
                break;
            case "unfinish":
                Pay.find({
                        order_id: req.query.order_id
                    })
                    .remove(function(err) {
                        if (err) { // if failed remove
                            req.flash('error', err);
                            res.redirect('/dash');
                        } else { // if succeeded
                            console.log('Success!! init transaction deleted...');
                            req.flash('error', 'You cancelled the transaction.');
                        }
                    });
                break;
            case "error":
                req.flash('error', 'Your transaction failed to process...');
                break;
            default:
                req.flash('error', 'Oops, something bad happened...');
        };
        res.redirect('/dash');
    });
    // TESTING ONLY!!!!
    app.get('/bt/:amount', isLoggedIn, function(req, res) {
        var userId = req.user._id; // Get logged user id
        var amount = parseInt(req.params.amount) * 50000;
        gateway.transaction.sale({
            amount: amount,
            creditCard: {
                number: '4111111111111111',
                expirationDate: '05/18'
            }
        }, function(err, result) {
            if (err) throw err;
            if (result.success) {
                util.log('Transaction ID: ' + result.transaction.id);
            } else {
                util.log(result.message);
            }
        });
    });
    // ====================================================== END OF PAYMENT SYSTEMS
    // =============================================================================


    // =============================================================================
    // ============================================================ BEGIN API ROUTES

    // =========================== USER MANIPULATIONS APIs ==========================
    // User sign in handlers
    app.post('/api/account/signin', passport.authenticate('local-login', {
        successRedirect: '/signinSuccess',
        failureRedirect: '/signinFailure',
        failureFlash: true
    }));
    app.get('/signinSuccess', function(req, res) {
        res.json({
            'type': 'success',
            'msg': 'You will be redirected to your dashboard..'
        });
    });
    app.get('/signinFailure', function(req, res) {
        var arr = req.session.flash.error;
        var msg = arr[arr.length - 1]; // to prevent multi msg
        res.json({
            'type': 'error',
            'msg': msg
        });
    });

    // User log out
    app.get('/api/account/signout', isLoggedIn, function(req, res) {
        req.session.destroy(function(err) {
            res.json({
                'msg': 'You are successfully signed out'
            });
        });
    });

    // User sign up / register
    app.post('/api/account/signup', passport.authenticate('local-signup', {
        successRedirect: '/signupSuccess',
        failureRedirect: '/signupFailure',
        failureFlash: true
    }));
    app.get('/signupSuccess', function(req, res) {
        res.json({
            'type': 'success',
            'msg': 'Your account has been created. Please check your email for further instructions.'
        });
    });
    app.get('/signupFailure', function(req, res) {
        var arr = req.session.flash.error;
        var msg = arr[arr.length - 1]; // to prevent multi msg
        res.json({
            'type': 'error',
            'msg': msg
        });
    });

    // forgot password -------------------------------------------------------------
    app.post('/api/account/forgot', function(req, res) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(16, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({
                    email: req.body.email.toLowerCase()
                }, function(err, user) {
                    if (!user) {
                        res.json({
                            'type': 'error',
                            'msg': 'No account with that email address exists'
                        });
                        return;
                    } else {
                        user.resToken = token;
                        user.resTokenCreated = Date.now();
                        user.resTokenExpired = Date.now() + 3600000; // 1 hour
                        user.save(function(err) {
                            done(err, token, user);
                        });
                    }
                });
            },
            function(token, user, done) {
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
                        header: 'Hi ' + user.firstName,
                        body: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account. Please click on the following button to complete the process:',
                        button: {
                            link: 'http://' + req.headers.host + '/reset/' + token,
                            text: 'Click to reset your password'
                        },
                        footer: 'If you did not request this, please ignore this email and your password will remain unchanged.'
                    };
                    // Send a single email
                    template('email', locals, function(err, html, text) {
                        if (err) {
                            console.log(err);
                        } else {
                            transport.sendMail({
                                from: 'Jobsy Mailer <mailer@jobsy.io>',
                                to: user.email,
                                subject: 'Reset your password on Jobsy',
                                html: html,
                                text: text
                            }, function(err, responseStatus) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    res.json({
                                        'type': 'success',
                                        'msg': 'An e-mail has been sent to ' + user.email + ' with further instructions'
                                    });
                                    done(err, 'done');
                                }
                            });
                        }
                    });
                });
            }
        ], function(err) {
            if (err) return next(err);
        });
    });

    // resetting password ----------------------------------------------------------
    app.get('/reset/:token', function(req, res) {
        User
            .findOne({
                resToken: req.params.token
            })
            .where('resTokenExpired').gt(Date.now())
            .exec(function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    res.redirect('/');
                }
                res.render('reset', {
                    title: 'Reset Password',
                    user: user
                });
            });
    });
    app.post('/api/account/reset/:id', function(req, res) {
        async.waterfall([
            function(done) {
                User
                    .findById(req.params.id)
                    .exec(function(err, user) {
                        user.password = user.generateHash(req.body.newPass);
                        user.resToken = undefined;
                        user.resTokenCreated = undefined;
                        user.resTokenExpired = undefined;
                        user.save(function(err) {
                            if (err) return next(err);
                            req.logIn(user, function(err) {
                                done(err, user);
                            });
                        });
                    });
            },
            function(user, done) {
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
                        header: 'Hi ' + user.firstName,
                        body: 'This is a confirmation that the password for your account ' + user.email + ' has just been changed.'
                    };
                    // Send a single email
                    template('email', locals, function(err, html, text) {
                        if (err) {
                            console.log(err);
                        } else {
                            transport.sendMail({
                                from: 'Jobsy Mailer <mailer@jobsy.io>',
                                to: user.email,
                                subject: 'Your Jobsy account password has been changed',
                                html: html,
                                text: text
                            }, function(err, responseStatus) {
                                if (err) {
                                    res.json({
                                        'type': 'error',
                                        'msg': err
                                    });
                                } else {
                                    res.json({
                                        'type': 'success',
                                        'msg': 'Your password has been successfully changed. You will be redirected to your dashboard now..'
                                    });
                                }
                            });
                        }
                    });
                });
            }
        ], function(err) {
            if (err) return next(err);
        });
    });
    // Resend activate account
    app.get('/api/account/resend/:id', isLoggedIn, function(req, res) {
        User
            .findOne({
                _id: req.params.id
            })
            .exec(function(err, user) {
                if (user.actStatus == 'activated') {
                    return next(err);
                } else {
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
                            email: user.email,
                            button: {
                                link: 'http://' + req.headers.host + '/activate/' + user.actToken,
                                text: 'activate your account'
                            },
                            header: 'Hi ' + user.firstName,
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
                                        res.json({
                                            'type': 'success',
                                            'msg': 'We have resent your activation email, please kindly check your junk/trash if you cannot find it in your inbox.'
                                        });
                                    }
                                });
                            }
                        });
                    });
                }
            });
    });
    // update account settings --------------------------------
    app.post('/api/account/update', isLoggedIn, function(req, res) {
        User.findById(req.user.id, function(err, user) {
            if (err) {
                res.json({
                    'type': 'error',
                    'msg': 'No such account exists'
                });
                return;
            }
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.companyName = req.body.companyName;
            user.save(function(err) {
                if (err) {
                    res.json({
                        'type': 'error',
                        'msg': err
                    });
                    return;
                }
                res.json({
                    'type': 'success',
                    'msg': 'Your account has been updated'
                });
            });
        });
    });
    // update user password -----------------------------------
    app.post('/api/account/pass', isLoggedIn, function(req, res) {
        User.findById(req.user.id, function(err, user) {
            if (err) {
                res.json({
                    'type': 'error',
                    'msg': 'No such account exists'
                });
                return;
            }
            user.password = user.generateHash(req.body.newPass);
            user.save(function(err) {
                if (err) {
                    res.json({
                        'type': 'error',
                        'msg': err
                    });
                    return;
                }
                res.json({
                    'type': 'success',
                    'msg': 'You will be automatically signed out. And you will be able to re-signin later using your new password.'
                });
            });
        });
    });

    // Create an account for different user
    app.post('/api/account/custom', isLoggedIn, function(req, res) {
        // Generate random pass
        var rPass = generatePassword()

        // create the user
        var newUser = new User();
        newUser.password = newUser.generateHash(rPass);
        newUser.firstName = req.body.firstName;
        newUser.lastName = req.body.lastName;
        newUser.email = req.body.email;
        newUser.actStatus = 'activated';
        newUser.initPost = false;
        newUser.initLogin = false;
        newUser.credits = 2;
        newUser.save(function(err) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: 'Couldn\'t create new account. Database error!'
                })
                return;
            } else {
                res.json({
                    type: 'success',
                    msg: 'Account with email: ' + req.body.email + ' has been successfully created. You may now continue to create new job post for the respected user.',
                    uEmail: req.body.email,
                    uPass: rPass,
                    uFirstName: req.body.firstName,
                    uLastName: req.body.lastName
                })
            }
        })
    })


    // =========================== JOB MANIPULATIONS APIs ==========================
    // Create a job post
    app.post('/api/job/post', isLoggedIn, function(req, res) {
        var token = crypto.randomBytes(20).toString('hex');
        var image_data = req.body.cropped_image;
        var base64Data = image_data.replace(/^data:image\/png;base64,/, "");
        var random_id = crypto.randomBytes(10).toString('hex');
        var logo = random_id + '.png';

        // Writing file to disk
        fs.writeFile('./public/uploads/logo/' + logo, base64Data, 'base64', function(err) {
            if (err) {
                var msg = {
                    'type': 'error',
                    'msg': 'Failed to save logo...'
                };
                res.json(msg);
                return;
            }
        });

        if (req.body.userEmail == undefined) { // create for self
            console.log('Create job for self');
            User.findById(req.user.id, function(err, user) {
                if (err) {
                    var msg = {
                        'type': 'error',
                        'msg': err
                    };
                    res.json(msg);
                    return;
                }
                var init_status = req.user.initLogin;
                if (init_status == true) {
                    init_status = false;
                }
                user.initLogin = init_status;
                user.initPost = false;
                user.initCompany = {
                    logo: logo,
                    name: req.body.companyName,
                    location: req.body.location,
                    description: req.body.description
                };
                user.save(function(err) {
                    if (err) {
                        var msg = {
                            'type': 'error',
                            'msg': err
                        };
                        res.json(msg);
                        return;
                    }
                    var job = new Job({
                        profile: {
                            logo: logo,
                            name: req.body.companyName,
                            location: req.body.location,
                            description: req.body.description
                        },
                        details: {
                            jobTitle: req.body.jobTitle,
                            category: req.body.category,
                            jobType: req.body.jobType,
                            jobScope: req.body.jobScope,
                            requirements: req.body.requirements,
                            currency: req.body.currency,
                            salaryFrom: req.body.salaryFrom,
                            salaryTo: req.body.salaryTo,
                            salaryType: req.body.salaryType,
                        },
                        token: token,
                        status: 'published',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        email: req.user.email
                    });
                    job.save(function(err, job) {
                        if (err) {
                            var msg = {
                                'type': 'error',
                                'msg': err
                            };
                            res.json(msg);
                            return;
                        }

                        // Saving to search engine
                        var host = req.host; // checking host to determine index
                        if (host == 'localhost') {
                            var index = client.initIndex('Jobs-Local');
                        } else {
                            var subDomain = host.split('.'); // if not localhost
                            if (subDomain.length > 2) {
                                subDomain = subDomain[0].split("-").join(" ");
                            } else {
                                subDomain = "";
                            }
                            if (subDomain == 'staging') {
                                var index = client.initIndex('Jobs-Staging');
                            } else {
                                var index = client.initIndex('Jobs-Live');
                            }
                        }

                        var arr = {
                            "details": {
                                "jobType": job.details.jobType,
                                "category": job.details.category,
                                "jobTitle": job.details.jobTitle
                            },
                            "profile": {
                                "location": job.profile.location,
                                "name": job.profile.name
                            },
                            "objectID": job._id
                        };
                        index.saveObject(arr, function(err) {
                            if (err) {
                                var msg = {
                                    'type': 'error',
                                    'msg': err
                                };
                                res.json(msg);
                                return;
                            } else {
                                var msg = {
                                    'type': 'success',
                                    'msg': 'Job post successfully created!'
                                };
                                res.json(msg);
                            }
                        });
                    });
                });
            });
        } else { // create for another account
            User.findOne({
                'email': req.body.userEmail
            }, function(err, user) {
                if (err) {
                    var msg = {
                        'type': 'error',
                        'msg': err
                    };
                    res.json(msg);
                    return;
                }
                user.initCompany = {
                    logo: logo,
                    name: req.body.companyName,
                    location: req.body.location,
                    description: req.body.description
                };
                user.save(function(err) {
                    if (err) {
                        var msg = {
                            'type': 'error',
                            'msg': err
                        };
                        res.json(msg);
                        return;
                    }
                    var job = new Job({
                        profile: {
                            logo: logo,
                            name: req.body.companyName,
                            location: req.body.location,
                            description: req.body.description
                        },
                        details: {
                            jobTitle: req.body.jobTitle,
                            category: req.body.category,
                            jobType: req.body.jobType,
                            jobScope: req.body.jobScope,
                            requirements: req.body.requirements,
                            currency: req.body.currency,
                            salaryFrom: req.body.salaryFrom,
                            salaryTo: req.body.salaryTo,
                            salaryType: req.body.salaryType,
                        },
                        token: token,
                        status: 'published',
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                        email: req.body.userEmail
                    });
                    job.save(function(err, job) {
                        if (err) {
                            var msg = {
                                'type': 'error',
                                'msg': err
                            };
                            res.json(msg);
                            return;
                        }

                        // Sending email to client
                        emailTemplates(templatesDir, function(err, template) {
                            // Send the client an email
                            var transport = nodemailer.createTransport({
                                service: 'Mailgun',
                                auth: {
                                    user: secrets.mailgun.user,
                                    pass: secrets.mailgun.password
                                }
                            });
                            // An users object with formatted email function
                            var locals = {
                                header: 'Your first job post has been created!',
                                body: 'Your very first job with the position ' + req.body.jobTitle + ' at ' + req.body.companyName + ' has been successfully created.You may sign into your Jobsy account using your email and the following password: ' + req.body.userEmail
                            };

                            // Send a single email
                            template('email', locals, function(err, html, text) {
                                if (err) {
                                    res.json({
                                        type: 'error',
                                        msg: err
                                    });
                                    return;
                                } else {
                                    transport.sendMail({
                                        from: 'Jobsy Mailer <mailer@jobsy.io>',
                                        to: req.body.userEmail,
                                        subject: 'First Job Post',
                                        html: html,
                                        text: text
                                    }, function(err, responseStatus) {
                                        if (err) {
                                            res.json({
                                                type: 'error',
                                                msg: err
                                            });
                                            return;
                                        }

                                    });
                                }
                            });
                        });

                        // Saving to search engine
                        var host = req.host; // checking host to determine index
                        if (host == 'localhost') {
                            var index = client.initIndex('Jobs-Local');
                        } else {
                            var subDomain = host.split('.'); // if not localhost
                            if (subDomain.length > 2) {
                                subDomain = subDomain[0].split("-").join(" ");
                            } else {
                                subDomain = "";
                            }
                            if (subDomain == 'staging') {
                                var index = client.initIndex('Jobs-Staging');
                            } else {
                                var index = client.initIndex('Jobs-Live');
                            }
                        }

                        var arr = {
                            "details": {
                                "jobType": job.details.jobType,
                                "category": job.details.category,
                                "jobTitle": job.details.jobTitle
                            },
                            "profile": {
                                "location": job.profile.location,
                                "name": job.profile.name
                            },
                            "objectID": job._id
                        };
                        index.saveObject(arr, function(err) {
                            if (err) {
                                var msg = {
                                    'type': 'error',
                                    'msg': err
                                };
                                res.json(msg);
                                return;
                            } else {
                                res.json({
                                    type: 'success',
                                    msg: 'Job post for account: ' + req.body.userEmail + ' has been successfully created.'
                                });
                                res.json(msg);
                            }
                        });
                    });
                });
            });
        }

    });
    // Edit job post ---------------------------------
    app.post('/api/job/edit/:id', isLoggedIn, function(req, res, next) {
        console.log('Create job for other user');

        var changed = req.body.changed;
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                var msg = {
                    'type': 'error',
                    'msg': err
                };
                res.json(msg);
                return;
            }

            // Doing image replacement
            if (changed == 'yes') { // if there is image renewal
                // Deleting previous logo from disk
                var old_logo = './public/uploads/logo/' + job.profile.logo;
                fs.stat(old_logo, function(err, stat) {
                    if (err == null) {
                        console.log('File exists. Now begin deleting...');
                        fs.unlinkSync(old_logo);
                    } else if (err.code == 'ENOENT') {
                        console.log('File doesn\'t exist. Going next round...');
                    }
                });

                // Then let's save the new logo
                var image_data = req.body.cropped_image;
                var base64Data = image_data.replace(/^data:image\/png;base64,/, "");
                var random_id = crypto.randomBytes(10).toString('hex');
                var logo = random_id + '.png';
                // Writing file to disk
                fs.writeFile('./public/uploads/logo/' + logo, base64Data, 'base64', function(err) {
                    if (err) {
                        var msg = {
                            'type': 'error',
                            'msg': 'Failed to save logo...'
                        };
                        res.json(msg);
                        return;
                    }
                });
                // assign to database
                var newLogo = logo;
            } else {
                var newLogo = job.profile.logo;
            }

            job.profile.logo = newLogo;
            job.profile.name = req.body.companyName;
            job.profile.location = req.body.location;
            job.profile.description = req.body.description;
            job.details.jobTitle = req.body.jobTitle;
            job.details.category = req.body.category;
            job.details.jobType = req.body.jobType;
            job.details.jobScope = req.body.jobScope;
            job.details.requirements = req.body.requirements;
            job.details.currency = req.body.currency;
            job.details.salaryFrom = req.body.salaryFrom;
            job.details.salaryTo = req.body.salaryTo;
            job.details.salaryType = req.body.salaryType;
            job.updatedAt = Date.now();
            // Save into database
            job.save(function(err, job) {
                if (err) {
                    var msg = {
                        'type': 'error',
                        'msg': err
                    };
                    res.json(msg);
                    return;
                }
                // Saving to search engine server
                var host = req.host; // checking host to determine index
                if (host == 'localhost') {
                    var index = client.initIndex('Jobs-Local');
                } else {
                    var subDomain = host.split('.'); // if not localhost
                    if (subDomain.length > 2) {
                        subDomain = subDomain[0].split("-").join(" ");
                    } else {
                        subDomain = "";
                    }
                    if (subDomain == 'staging') {
                        var index = client.initIndex('Jobs-Staging');
                    } else {
                        var index = client.initIndex('Jobs-Live');
                    }
                }

                var arr = {
                    "details": {
                        "jobType": job.details.jobType,
                        "category": job.details.category,
                        "jobTitle": job.details.jobTitle
                    },
                    "profile": {
                        "location": job.profile.location,
                        "name": job.profile.name
                    },
                    "objectID": job._id
                };
                index.saveObject(arr, function(err) {
                    if (err) {
                        var msg = {
                            'type': 'error',
                            'msg': err
                        };
                        res.json(msg);
                        return;
                    }
                    var msg = {
                        'type': 'success',
                        'msg': 'Job has been updated.'
                    };
                    res.json(msg);
                });
            });
        });
    });
    // Pause / Publish job post
    app.get('/api/job/stat/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: 'Error finding related job post'
                });
                return;
            }
            if (job.status == 'published') {
                job.status = 'paused';
            } else {
                job.status = 'published';
            }
            job.save(function(err, job) {
                if (err) {
                    res.json({
                        type: 'error',
                        msg: 'Error saving to database'
                    });
                    return;
                }
                // Saving to search engine server
                var host = req.host; // checking host to determine index
                if (host == 'localhost') {
                    var index = client.initIndex('Jobs-Local');
                } else {
                    var subDomain = host.split('.'); // if not localhost
                    if (subDomain.length > 2) {
                        subDomain = subDomain[0].split("-").join(" ");
                    } else {
                        subDomain = "";
                    }
                    if (subDomain == 'staging') {
                        var index = client.initIndex('Jobs-Staging');
                    } else {
                        var index = client.initIndex('Jobs-Live');
                    }
                }

                if (job.status == 'published') { // For re-publishing action
                    var arr = {
                        "details": {
                            "jobType": job.details.jobType,
                            "category": job.details.category,
                            "jobTitle": job.details.jobTitle
                        },
                        "profile": {
                            "location": job.profile.location,
                            "name": job.profile.name
                        },
                        "objectID": job._id
                    };
                    index.saveObject(arr, function(err) {
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: 'Error saving to search engine server. Please contact administrator.'
                            });
                            return;
                        }
                        var msg = {
                            'type': 'success',
                            'title': 'Published!',
                            'msg': 'Job post <strong>' + job.details.jobTitle.toUpperCase() + '</strong> is now published'
                        };
                        res.json(msg);
                    });
                } else { // For pausing action
                    index.deleteObject(job._id, function(err) {
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: 'Error deleting from search engine server. Please contact administrator.'
                            });
                            return;
                        }
                        var msg = {
                            'type': 'success',
                            'title': 'Paused!',
                            'msg': 'Job post <strong>' + job.details.jobTitle.toUpperCase() + '</strong> is now paused'
                        };
                        res.json(msg);
                    });
                }
            });
        });
    });
    // Delete job post
    app.get('/api/job/del/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err
                });
                return;
            }
            var status = '';
            if ((job.status == 'published') || (job.status == 'paused')) {
                job.status = 'deleted';
                status = 0;
            } else {
                job.status = 'published';
                status = 1;
            }
            job.updatedAt = Date.now();
            job.save(function(err, job) {
                if (err) {
                    res.json({
                        type: 'error',
                        msg: err
                    });
                    return;
                }
                // Saving to search engine server
                var host = req.host; // checking host to determine index
                if (host == 'localhost') {
                    var index = client.initIndex('Jobs-Local');
                } else {
                    var subDomain = host.split('.'); // if not localhost
                    if (subDomain.length > 2) {
                        subDomain = subDomain[0].split("-").join(" ");
                    } else {
                        subDomain = "";
                    }
                    if (subDomain == 'staging') {
                        var index = client.initIndex('Jobs-Staging');
                    } else {
                        var index = client.initIndex('Jobs-Live');
                    }
                }

                if (status == 0) { // For deleting action
                    index.deleteObject(job._id, function(err) { // Delete from search engine server 
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: err
                            });
                            return;
                        }
                        var msg = {
                            'type': 'success',
                            'title': 'Deleted!',
                            'msg': 'Job post <strong>' + job.details.jobTitle.toUpperCase() + '</strong> has been successfully deleted'
                        };
                        res.json(msg);
                    });
                } else if (status == 1) { // For restoring action
                    var arr = {
                        "details": {
                            "jobType": job.details.jobType,
                            "category": job.details.category,
                            "jobTitle": job.details.jobTitle
                        },
                        "profile": {
                            "location": job.profile.location,
                            "name": job.profile.name
                        },
                        "objectID": job._id
                    };
                    index.saveObject(arr, function(err) { // Add to search engine server
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: err
                            });
                            return;
                        }
                        var msg = {
                            'type': 'success',
                            'title': 'Restored!',
                            'msg': 'Job post <strong>' + job.details.jobTitle.toUpperCase() + '</strong> has been successfully restored'
                        };
                        res.json(msg);
                    });
                }
            });
        });
    });
    // APPLY FOR A JOB ---------------------------------
    app.post('/api/job/apply/:id', function(req, res, next) {
        Job
            .findById(req.params.id, function(err, job) {
                var random_id = crypto.randomBytes(10).toString('hex');
                var filePath = './public/uploads/resume/' + random_id + '.pdf';
                var database_filepath = random_id + '.pdf';
                if (req.files.resumeFile) {
                    var tmpPath = req.files.resumeFile.path;
                    var targetPath = path.resolve(filePath);
                    if (path.extname(req.files.resumeFile.name).toLowerCase() == '.pdf') {
                        /* Begin Upload process */
                        fs.rename(tmpPath, targetPath, function(err) {
                            if (err) {
                                res.json({
                                    type: 'error',
                                    msg: 'Failed uploading file to server'
                                });
                                return;
                            } else {
                                // Save the values into database
                                var app = new App({
                                    jobId: job._id,
                                    fullName: req.body.fullName,
                                    phone: req.body.phone,
                                    email: req.body.email,
                                    location: req.body.location,
                                    lastJob: req.body.lastJob,
                                    resumeFile: database_filepath,
                                    coverLetter: req.body.coverLetter,
                                    applyDate: Date.now()
                                });
                                app.save(function(err) {
                                    if (err) {
                                        res.json({
                                            type: 'error',
                                            msg: 'Failed saving to database'
                                        });
                                        return;
                                    }
                                });
                                // Add app number to job collection
                                Job.findById(job._id, function(err, job) {
                                    if (err) {
                                        res.json({
                                            type: 'error',
                                            msg: err
                                        });
                                        return;
                                    }
                                    var position = job.details.jobTitle;
                                    var company = job.profile.name;
                                    console.log('Sending application for: ' + position + ' at ' + company);
                                    emailTemplates(templatesDir, function(err, template) {
                                        var now = new Date();
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
                                            header: 'New Application Received!',
                                            body: 'You got new application for job posting ' + position + ' at ' + company + ':',
                                            app: {
                                                fullName: 'Full Name: ' + req.body.fullName,
                                                location: 'Location: ' + req.body.location,
                                                applyDate: 'Date Applied: ' + now
                                            },
                                            footer: 'You can review the application on your dashboard by clicking on related job posting title.'
                                        };
                                        // Send a single email
                                        template('email', locals, function(err, html, text) {
                                            if (err) {
                                                if (err) {
                                                    res.json({
                                                        type: 'error',
                                                        msg: err
                                                    });
                                                    return;
                                                }
                                            } else {
                                                transport.sendMail({
                                                    from: 'Jobsy Mailer <mailer@jobsy.io>',
                                                    to: job.email,
                                                    subject: 'New application for: ' + position + ' at ' + company,
                                                    html: html,
                                                    text: text
                                                }, function(err, responseStatus) {
                                                    if (err) {
                                                        res.json({
                                                            type: 'error',
                                                            msg: err
                                                        });
                                                        return;
                                                    } else {
                                                        console.log('Email to employer: ' + job.email + ' sent!!!');
                                                        // If email to employer has been sent
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
                                                            header: 'Application sent successfully!',
                                                            body: 'Your job application for the position ' + position + ' at ' + company + ' has been successfully sent on ' + now + '.',
                                                            footer: 'The company will contact you directly if your application were successfull. Good luck.'
                                                        };
                                                        // Send a single email
                                                        template('email', locals, function(err, html, text) {
                                                            if (err) {
                                                                res.json({
                                                                    type: 'error',
                                                                    msg: err
                                                                });
                                                                return;
                                                            } else {
                                                                transport.sendMail({
                                                                    from: 'Jobsy Mailer <mailer@jobsy.io>',
                                                                    to: req.body.email,
                                                                    subject: 'Your application for: ' + position + ' at ' + company,
                                                                    html: html,
                                                                    text: text
                                                                }, function(err, responseStatus) {
                                                                    if (err) {
                                                                        res.json({
                                                                            type: 'error',
                                                                            msg: err
                                                                        });
                                                                        return;
                                                                    }
                                                                    console.log('Email to applicant: ' + req.body.email + ' sent!!!');
                                                                    res.json({
                                                                        type: 'success',
                                                                        msg: 'Your application have been successfully sent. The company will contact you directly if your application were successfull. Good luck..'
                                                                    });
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    });
                                    job.app = job.app + 1;
                                    job.newApp = job.newApp + 1;
                                    job.save(function(err) {
                                        if (err) {
                                            res.json({
                                                type: 'error',
                                                msg: err
                                            });
                                            return;
                                        }
                                    });
                                });
                            }
                        });
                    } else {
                        fs.unlink(tmpPath, function(err) {
                            res.json({
                                type: 'error',
                                msg: 'Please upload a PDF file only!'
                            });
                            return;
                        });
                    }
                }
            });
    });
    // GET APPLICATION DETAILS ---------------------------------
    app.get('/api/job/app/:id', isLoggedIn, function(req, res, next) {
        App.findById(req.params.id, function(err, app) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: 'Failed finding application!'
                });
                return;
            }
            if (app.read == false) { // if app hasn't been reviewed
                app.read = true; // Remove the 'new' label
                Job.findById(app.jobId, function(err, job) {
                    if (err) {
                        res.json({
                            type: 'error',
                            msg: err
                        });
                        return;
                    }
                    job.newApp = job.newApp - 1; // Minus 1 of new app
                    job.save(function(err) {
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: err
                            });
                            return;
                        }

                        // Let's reduce user credit
                        /*User.findOne({
                            email: req.user.email
                        }, function(err, user) {
                            user.credits = user.credits - 1; // Minus 1 user credit
                            user.save(function(err) {
                                if (err) {
                                    res.json({
                                        type: 'error',
                                        msg: err
                                    });
                                    return;
                                }
                            })
                        })*/
                    });
                });
            } else {
                app.read = true;
            }
            app.save(function(err, app) {
                if (err) {
                    res.json({
                        type: 'error',
                        msg: err
                    });
                    return;
                }
                // Send the result
                res.json(app);
            });
        });
    });
    // Handler for downloading resume file ----------------------------------
    app.get('/download/:id', isLoggedIn, function(req, res) {
        App.findById(req.params.id, function(err, app) {
            var file = './public/uploads/resume/' + app.resumeFile;
            var time = Math.floor(Date.now() / 1000);
            var newName = app.fullName + '_' + time + '.pdf';
            res.download(file, newName.replace(/ /g, "_"));
        });
    });
    // SEND INVITATION EMAIL ---------------------------------
    app.post('/api/job/invite', isLoggedIn, function(req, res) {
        if (req.body.email == req.user.email) { // if the target email is the same to sender's email
            res.json({
                type: 'error',
                msg: 'You can\'t send email to yourself'
            });
            return;
        }

        User
            .findOne({
                'email': req.body.email
            }, function(err, user) {
                if (user != null) { // if user already registered
                    res.json({
                        type: 'error',
                        msg: 'This user email is already registered. You don\'t need to send them another invitation.'
                    });
                } else {
                    // Generate random token
                    var token = crypto.randomBytes(20).toString('hex');

                    // save user invitation queue to database
                    // create the user
                    var newInvite = new Invite();

                    newInvite.email = req.body.email;
                    newInvite.url = req.body.jobUrl;
                    newInvite.token = token;
                    newInvite.sender = req.user.email;

                    newInvite.save(function(err) {
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: 'Error saving to database'
                            });
                            return;
                        }

                        emailTemplates(templatesDir, function(err, template) {
                            var now = new Date();
                            // Send invitation to user
                            var transport = nodemailer.createTransport({
                                service: 'Mailgun',
                                auth: {
                                    user: secrets.mailgun.user,
                                    pass: secrets.mailgun.password
                                }
                            });
                            // An users object with formatted email function
                            var locals = {
                                email: req.body.email,
                                button: {
                                    link: 'http://' + req.headers.host + '/accept/' + token,
                                    text: 'Confirm'
                                },
                                header: 'Congratulation!',
                                body: 'You are being invited to post your job for free at JOBSY. If you are interested, hit the button below to confirm this invitation email.'
                            };
                            // Send a single email
                            template('email', locals, function(err, html, text) {
                                if (err) {
                                    if (err) {
                                        res.json({
                                            type: 'error',
                                            msg: err
                                        });
                                        return;
                                    }
                                } else {
                                    transport.sendMail({
                                        from: 'Jobsy Mailer <mailer@jobsy.io>',
                                        to: req.body.email,
                                        subject: 'Invitation for free job post',
                                        html: html,
                                        text: text
                                    }, function(err, responseStatus) {
                                        if (err) {
                                            res.json({
                                                type: 'error',
                                                msg: err
                                            });
                                        } else {
                                            res.json({
                                                type: 'success',
                                                msg: 'Invitation email has been succesfully sent to ' + req.body.email
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    });
                }
            });
    });
    // ACCEPT INVITATION ----------------------------------
    app.get('/accept/:token', function(req, res) {
        Invite
            .findOne({
                token: req.params.token
            })
            .exec(function(err, invite) {
                if (!invite) {
                    res.render('accept', {
                        title: 'Invitation Confirmation',
                        type: 'error',
                        msg: 'Your token is invalid!'
                    });
                    return;
                }
                if (invite.confirm == true) { // If user already confirmed
                    res.render('accept', {
                        title: 'Invitation Confirmation',
                        type: 'error',
                        msg: 'You already accepted this invitation. You may signin to your account to visit your dashboard.'
                    });
                } else {
                    // Change the status
                    invite.confirm = true;
                    invite.save(function(err) {
                        if (err) {
                            res.render('accept', {
                                title: 'Invitation Confirmation',
                                type: 'error',
                                msg: 'Error updating data to database. Please contact Jobsy customer service..'
                            });
                        } else {
                            // Sending email to admin
                            emailTemplates(templatesDir, function(err, template) {
                                var now = new Date();
                                // Send invitation to user
                                var transport = nodemailer.createTransport({
                                    service: 'Mailgun',
                                    auth: {
                                        user: secrets.mailgun.user,
                                        pass: secrets.mailgun.password
                                    }
                                });
                                // An users object with formatted email function
                                var locals = {
                                    email: invite.sender,
                                    button: {
                                        link: invite.url,
                                        text: 'Source Job Post'
                                    },
                                    header: 'Invitation accepted.',
                                    body: 'Invitee with this email address: ' + invite.email + ' accepts your invitation. You may now create a CUSTOM JOB POST via your dashboard by using the source job below:'
                                };
                                // Send a single email
                                template('email', locals, function(err, html, text) {
                                    if (err) {
                                        if (err) {
                                            res.render('accept', {
                                                title: 'Invitation Confirmation',
                                                type: 'error',
                                                msg: 'Error sending email'
                                            });
                                        }
                                    } else {
                                        transport.sendMail({
                                            from: 'Jobsy Mailer <mailer@jobsy.io>',
                                            to: invite.sender,
                                            subject: 'Invitation accepted!',
                                            html: html,
                                            text: text
                                        }, function(err, responseStatus) {
                                            if (err) {
                                                res.render('accept', {
                                                    title: 'Invitation Confirmation',
                                                    type: 'error',
                                                    msg: 'Error sending email'
                                                });
                                            } else {
                                                res.render('accept', {
                                                    title: 'Invitation Confirmed!',
                                                    type: 'success',
                                                    msg: 'Thank you.',
                                                    url: invite.url
                                                });
                                            }
                                        });
                                    }
                                });
                            });
                        }
                    });
                }
            });
    });

    // ACCEPT INVITATION ----------------------------------
    app.get('/accept', function(req, res) {
        res.render('accept', {
            title: 'Invitation Confirmed!',
            type: 'success',
            msg: 'Thank you.'
        });
    });
    // ======================== END of JOB MANIPULATIONS APIs ========================



    // Fetch all activated users
    app.get('/api/users', function(req, res) {
        User.find({
            actStatus: 'activated'
        }, {
            _id: 0
        }, function(err, users) {
            res.json(users);
        });
    });
    // Fetch all published jobs
    app.get('/api/jobs', function(req, res) {
        Job.find({
            status: 'published'
        }, null, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            res.json(jobs);
        });
    });
    // Fetch all published jobs
    app.get('/api/jobs/backup', function(req, res) {
        Job.find({
            status: 'published'
        }, {
            _id: 0,
            __v: 0
        }, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            res.json(jobs);
        });
    });
    // Fetch all apps
    app.get('/api/apps', function(req, res) {
        App.find({}, {
            _id: 0,
            __v: 0
        }, {
            sort: {
                applyDate: -1
            }
        }, function(err, apps) {
            res.json(apps);
        });
    });
    // Search all published jobs based on keywords :: AlgoliaSearch powered ::
    app.get('/api/search/:category/:location/:jobType/:keyword', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-Local');
        } else {
            var subDomain = host.split('.'); // if not localhost
            if (subDomain.length > 2) {
                subDomain = subDomain[0].split("-").join(" ");
            } else {
                subDomain = "";
            }
            if (subDomain == 'staging') {
                var index = client.initIndex('Jobs-Staging');
            } else {
                var index = client.initIndex('Jobs-Live');
            }
        }

        // Declare the filters vars
        var key = req.params.keyword,
            cat = req.params.category,
            loc = req.params.location,
            typ = req.params.jobType;

        // Setting up keywords
        if (key == 'null') {
            var keySet = ''
        } else {
            var keySet = key;
        }

        // Setting up filters logic
        if ((cat != 'all') && (loc != 'all') && (typ != 'all')) {
            var filters = [
                'details.category:' + cat,
                'profile.location:' + loc,
                'details.jobType:' + typ
            ];
        } else if ((cat == 'all') && (loc != 'all') && (typ != 'all')) {
            var filters = [
                'profile.location:' + loc,
                'details.jobType:' + typ
            ];
        } else if ((cat != 'all') && (loc == 'all') && (typ != 'all')) {
            var filters = [
                'details.category:' + cat,
                'details.jobType:' + typ
            ];
        } else if ((cat != 'all') && (loc != 'all') && (typ == 'all')) {
            var filters = [
                'details.category:' + cat,
                'profile.location:' + loc
            ];
        } else if ((cat != 'all') && (loc == 'all') && (typ == 'all')) {
            var filters = [
                'details.category:' + cat
            ];
        } else if ((cat == 'all') && (loc != 'all') && (typ == 'all')) {
            var filters = [
                'profile.location:' + loc
            ];
        } else if ((cat == 'all') && (loc == 'all') && (typ != 'all')) {
            var filters = [
                'details.jobType:' + typ
            ];
        } else if ((cat == 'all') && (loc == 'all') && (typ == 'all')) {
            var filters = '';
        }
        // building up the sentence
        if (filters == '') {
            var facetSet = {
                facets: '*'
            }
        } else {
            var facetSet = {
                facets: '*',
                facetFilters: filters
            }
        }

        // faceting setting
        index.setSettings({
            attributesForFaceting: ['details.category', 'profile.location', 'details.jobType']
        });

        // begin the search
        index.search(keySet, facetSet, function(err, content) {
            if (err) {
                res.json({
                    error: "error",
                    msg: err
                });
                return;
            }

            // Begin processing the results
            var arr = [];
            var ids = [];
            if (content.hits.length > 0) {
                for (var h in content.hits) {
                    var ids = ids.concat(content.hits[h].objectID);
                }
                // fetching related job from DB
                Job.find({
                    _id: {
                        $in: ids
                    }
                }, function(err, job) {
                    res.json(job);
                    return;
                });
            } else {
                res.json(arr);
                return;
            }
        });
    });
    // Function for empty keyword search
    app.get('/api/search', function(req, res) {
        Job.find({
            status: 'published'
        }, null, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            res.json(jobs);
        });
    });
    // Fetch user related jobs
    app.get('/api/jobs/:email/:condition', function(req, res) {
        var cond = req.params.condition;
        if (cond == 'hide') {
            var filter = {
                $and: [{
                    'status': {
                        $not: /deleted/
                    }
                }, {
                    'email': req.params.email
                }]
            };
        } else if (cond == 'show') {
            var filter = {
                $and: [{
                    'status': 'deleted'
                }, {
                    'email': req.params.email
                }]
            };
        }
        Job.find(filter, null, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            res.json(jobs);
        });
    });
    // Fetch spesific job based on job ID
    app.get('/api/job/:id', function(req, res) {
        var id = req.params.id;
        Job.findOne({
            _id: id
        }, function(err, job) {
            res.json(job);
        });
    });
    // Fetch applications related to spesific job post
    app.get('/api/job/apps/:id', function(req, res) {
        App.find({
            jobId: req.params.id
        }, null, {
            sort: {
                applyDate: -1
            }
        }, function(err, apps) {
            res.json(apps);
        });
    });
    // Fetch spesific application based on application ID
    app.get('/api/job/app/:id', function(req, res) {
        App.find({
            _id: req.params.id
        }, function(err, app) {
            res.json(app);
        });
    });


    // ============================ ALGOLIA CC APIs ============================
    app.get('/alg', function(req, res) {
        res.render('alg', {
            msg: 'Select action by clicking buttons below',
            datas: 'none',
            title: 'Algolia Control Center'
        });
    });

    app.get('/alg/init', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-Local');
        } else {
            var subDomain = host.split('.'); // if not localhost
            if (subDomain.length > 2) {
                subDomain = subDomain[0].split("-").join(" ");
            } else {
                subDomain = "";
            }
            if (subDomain == 'staging') {
                var index = client.initIndex('Jobs-Staging');
            } else {
                var index = client.initIndex('Jobs-Live');
            }
        }

        Job.find({
            "status": 'published'
        }, {
            "createdAt": 0,
            "updatedAt": 0,
            "email": 0,
            "newApp": 0,
            "app": 0,
            "deleteReason": 0,
            "token": 0,
            "status": 0,
            "profile.description": 0,
            "profile.logo": 0,
            "details.jobScope": 0,
            "details.requirements": 0,
            "details.currency": 0,
            "details.salaryFrom": 0,
            "details.salaryTo": 0,
            "details.salaryType": 0
        }, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            if (jobs.length > 0) {
                for (var i in jobs) {
                    var arr = {
                        "details": {
                            "jobType": jobs[i].details.jobType,
                            "category": jobs[i].details.category,
                            "jobTitle": jobs[i].details.jobTitle
                        },
                        "profile": {
                            "location": jobs[i].profile.location,
                            "name": jobs[i].profile.name
                        },
                        "objectID": jobs[i]._id
                    };
                    // Save the datas
                    index.saveObject(arr, function(err, content) {
                        if (err) {
                            res.json({
                                type: 'error',
                                msg: err,
                            });
                            return;
                        }
                        res.json({
                            type: 'success',
                            msg: content,
                            title: 'Initial Import..'
                        });
                    });
                }
            }
        });
    });
    // Clearing index data
    app.get('/alg/clear', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-Local');
        } else {
            var subDomain = host.split('.'); // if not localhost
            if (subDomain.length > 2) {
                subDomain = subDomain[0].split("-").join(" ");
            } else {
                subDomain = "";
            }
            if (subDomain == 'staging') {
                var index = client.initIndex('Jobs-Staging');
            } else {
                var index = client.initIndex('Jobs-Live');
            }
        }

        index.clearIndex(function(err, content) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            }
            res.json({
                type: 'success',
                msg: content,
                title: 'Clearing index..'
            });
        });
    });
    app.get('/alg/update/:data', function(req, res) {
        index.saveObject({
            firstname: 'Jimmie',
            lastname: 'Barninger',
            objectID: 'myID1'
        }, function(err, content) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            }
            res.json({
                type: 'success',
                msg: JSON.stringify(content),
                title: 'Updating data..'
            });
        });
    });
    app.get('/alg/delete/:id', function(req, res) {
        var id = req.params.id;
        index.deleteObject(id, function(err) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            } else {
                res.json({
                    type: 'success',
                    msg: JSON.stringify(content),
                    title: 'Deleting data..'
                });
            }
        });
    });
    // ======================== END of ALGOLIA SEARCH APIs =========================



    // ============================ MANDRILL APIs ============================
    app.get('/email', function(req, res) {
        res.render('email', {
            msg: 'Select action by clicking buttons below',
            datas: 'none',
            title: 'Mandrill Control Center'
        });
    });

    app.get('/email/users/call', function(req, res) {
        mandrill_client.users.info({}, function(result) {
            var data = JSON.stringify(result);
            console.log(data);
            res.json({
                type: 'success',
                title: 'Users Call',
                msg: data
            });
        }, function(e) {
            // Mandrill returns the error as an object with name and message keys
            res.json({
                type: 'error',
                title: 'Oops!',
                msg: 'A mandrill error occurred: ' + e.name + ' - ' + e.message
            });
            // A mandrill error occurred: Invalid_Key - Invalid API key
        });
    });

    app.get('/email/clear', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-local');
        } else {
            var index = client.initIndex('Jobs');
        }
        index.clearIndex(function(err, content) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            }
            res.json({
                type: 'success',
                msg: content,
                title: 'Clearing index..'
            });
        });
    });

    app.get('/email/update/:data', function(req, res) {
        index.saveObject({
            firstname: 'Jimmie',
            lastname: 'Barninger',
            objectID: 'myID1'
        }, function(err, content) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            }
            res.json({
                type: 'success',
                msg: JSON.stringify(content),
                title: 'Updating data..'
            });
        });
    });

    app.get('/email/delete/:id', function(req, res) {
        var id = req.params.id;
        index.deleteObject(id, function(err) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err,
                });
                return;
            } else {
                res.json({
                    type: 'success',
                    msg: JSON.stringify(content),
                    title: 'Deleting data..'
                });
            }
        });
    });
    // ======================== END of MANDRILL APIs =========================



    // =========================== ADMIN PANEL ROUTES =============================
    // index page
    app.get('/admin/:token', function(req, res) {
        if (req.params.token === 'hello123') {
            res.render('admin/index', {
                title: 'Jobsy CC'
            });
        } else {
            res.redirect('/');
        }
    });


    // End of admin panel

    // END OF API ROUTES ===========================================================
    // =============================================================================

    // Email sending testing
    app.get('/test-email/:email', function(req, res) {
        // Sending testing email
        emailTemplates(templatesDir, function(err, template) {
            if (err) {
                res.json({
                    type: 'error',
                    msg: err
                });
                return;
            }

            var now = new Date();
            // Send invitation to user
            var transport = nodemailer.createTransport({
                service: 'Mailgun',
                auth: {
                    user: secrets.mailgun.user,
                    pass: secrets.mailgun.password
                }
            });
            // An users object with formatted email function
            var locals = {
                email: req.params.email,
                button: {
                    link: 'http://' + req.headers.host + '/',
                    text: 'Confirm'
                },
                header: 'Just Testing!',
                body: 'You are being invited to post your job for free at JOBSY. If you are interested, hit the button below to confirm this invitation email.'
            };
            // Send a single email
            template('email', locals, function(err, html, text) {
                if (err) {
                    res.json({
                        type: 'error',
                        msg: err
                    });
                    return;
                }

                transport.sendMail({
                    from: 'Jobsy Mailer <mailer@jobsy.io>',
                    to: req.params.email,
                    subject: 'Testing Email',
                    html: html,
                    text: text
                }, function(err, responseStatus) {
                    if (err) {
                        res.json({
                            type: 'error',
                            msg: err
                        });
                    } else {
                        res.json({
                            type: 'success',
                            msg: 'Invitation email has been succesfully sent to ' + req.params.email
                        });
                    }
                });

            });
        });
    });
    // View email template
    app.get('/view-template', function(req, res) {
        res.render('email/html');
    })

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
