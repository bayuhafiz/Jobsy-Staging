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
    braintree = require('braintree');

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


// Algolia-search configuration ================================================
var HttpsAgent = require('agentkeepalive').HttpsAgent;
var Algolia = require('algolia-search');
var keepaliveAgent = new HttpsAgent({
    maxSockets: 1,
    maxKeepAliveRequests: 0, // no limit on max requests per keepalive socket
    maxKeepAliveTime: 30000 // keepalive for 30 seconds
});
var client = new Algolia('SQX1HWFCVJ', 'c0fa958b479a53e6b7cdf980ea7bf35b', keepaliveAgent);


// Here are our precious module
module.exports = function(app, passport) {

    // =============================================================================
    // =========================================================== MAIN PAGES ROUTES
    // =============================================================================

    // show the home page ===========================
    app.get('/', function(req, res) {
        res.redirect('/home');
    });

    app.get('/home', function(req, res) {
        if (req.user) {
            var user = req.user;
            if ((user.actStatus == 'inactive') || (user.initLogin == true)) {
                res.render('act.ejs', {
                    title: 'Activation',
                    actStatus: user.actStatus,
                    initLogin: user.initLogin,
                    userid: user.id,
                    info: req.flash('info')
                });
            } else {
                res.render('home.ejs', {
                    title: 'Homepage',
                    user: user,
                    initLogin: user.initLogin,
                    initCompany: user.initCompany,
                    credit: user.credits,
                    success: req.flash('success'),
                    error: req.flash('error'),
                    info: req.flash('info')
                });
            }
        } else {
            res.render('home.ejs', {
                title: 'Homepage',
                user: null,
                success: req.flash('success'),
                error: req.flash('error'),
                info: req.flash('info')
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
                userid: user.id,
                info: req.flash('info')
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
                    credit: user.credits,
                    success: req.flash('success'),
                    error: req.flash('error'),
                    info: req.flash('info')
                });
            });
        }
    });


    // =============================================================================
    // END OF MAIN PAGES ROUTES ====================================================
    // =============================================================================


    // =============================================================================
    // ================================================== AUTHENTICATE (FIRST LOGIN)
    // =============================================================================

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dash', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/dash', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

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

    // Resend activate account
    app.get('/resend/:id', isLoggedIn, function(req, res) {
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
                                        req.flash('info', 'We have resent your activation email, please kindly check your junk/trash if you cannot find it in your inbox.');
                                        res.redirect('/dash');
                                    }
                                });
                            }
                        });
                    });
                }
            });
    });


    // =============================================================================
    // ================================================ AUTHORIZE (ALREADY LOGGED IN
    // =============================================================================

    // update account settings --------------------------------
    app.post('/account/profile', isLoggedIn, function(req, res) {
        User.findById(req.user.id, function(err, user) {
            if (err) return next(err);

            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.companyName = req.body.companyName;

            user.save(function(err) {
                if (err)
                    return next(err);
                req.flash('success', 'Your account has been updated.');
                res.redirect('/dash');
            });

        });
    });

    // locally --------------------------------
    app.get('/password', isLoggedIn, function(req, res) {
        var user = req.user;
        res.render('pass', {
            title: 'Change Password',
            user: user
        });
    });

    app.post('/password', isLoggedIn, function(req, res) {
        User.findById(req.user.id, function(err, user) {
            if (err) return next(err);
            if (req.body.password == req.body.confirmPassword) {
                user.password = user.generateHash(req.body.password);
                user.save(function(err) {
                    req.logout();
                    req.flash('success', 'Your password has been updated. You can now login using your new password.');
                    res.redirect('http://' + req.headers.host + '/');
                });
            } else {
                req.flash('error', 'Password confirmation did not match!');
                res.redirect('back');
            }
        });
    });

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.session.destroy(function(err) {
            res.redirect('http://' + req.headers.host + '/'); // Redirect back to Http 
        });
    });


    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================

    // forgot password -------------------------------------------------------------
    app.post('/forgot', function(req, res) {
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
                        req.flash('error', 'No account with that email address exists.');
                        res.redirect('/home');
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
                                    req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                                    done(err, 'done');
                                }
                            });
                        }
                    });
                });

            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/');
        });
    });

    // resetting password ------------------------------
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

    app.post('/reset/:id', function(req, res) {
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
                                    console.log(err);
                                } else {
                                    done(err, 'done');
                                }
                            });
                        }
                    });
                });

            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/dash');
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
    // JOB MANIPULATION ROUTES =====================================================
    // =============================================================================

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


    // Create new job post --------------------------------------------
    app.post('/job/create', isLoggedIn, function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                var random_id = crypto.randomBytes(10).toString('hex');
                var filePath = './public/uploads/logo/' + random_id + '.png';
                var database_filepath = random_id + '.png';

                if (req.files.file) {
                    var tmpPath = req.files.file.path;
                    var targetPath = path.resolve(filePath);
                    // Begin upload proces
                    if (path.extname(req.files.file.name).toLowerCase() == '.png' || path.extname(req.files.file.name).toLowerCase() == '.jpg') {
                        fs.rename(tmpPath, targetPath, function(err) {
                            if (err) {
                                req.flash('error', err);
                                res.redirect('back');
                            }
                            console.log('Using NEW logo >>> ' + database_filepath);
                            done(err, database_filepath, token);
                        });
                    } else {
                        fs.unlink(tmpPath, function(err) {
                            req.flash('error', 'Only *.png or *.jpg allowed');
                            res.redirect('/dash');
                        });
                    }
                } else { // if no new logo inserted
                    database_filepath = req.body.savedLogo;
                    console.log('Using PREVIOUS logo >>> ' + database_filepath);
                    done(false, database_filepath, token);
                }
            },
            function(src, token, done) {
                User.findById(req.user.id, function(err, user) {
                    if (err) return next(err);

                    var init_status = req.user.initLogin;
                    if (init_status == true) {
                        init_status = false;
                    }

                    user.initLogin = init_status;
                    user.initPost = false;
                    user.initCompany = {
                        logo: src,
                        name: req.body.companyName,
                        location: req.body.location,
                        description: req.body.description
                    };

                    user.save(function(err) {
                        if (err)
                            return next(err);

                        var job = new Job({
                            profile: {
                                logo: src,
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

                        job.save(function(err) {
                            if (err) return next(err);
                            req.flash('success', 'Job successfully created.');
                            done(err, 'done');
                        });
                    });

                });

            },
        ], function(err) {
            if (err) {
                req.flash('error', err);
                res.redirect('/dash');
            }
            res.redirect('/dash');
        });
    })

    // Edit job post ---------------------------------
    app.get('/edit/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) return next(err);

            console.log(JSON.stringify(job));

            res.render('edit', {
                title: 'Edit Job',
                job: job
            });
        });
    });

    app.post('/update/:id', isLoggedIn, function(req, res, next) {
        var logo = '';

        // Doing image replacement
        var random_id = crypto.randomBytes(10).toString('hex');
        var filePath = './public/uploads/logo/' + random_id + '.png';
        var database_filepath = random_id + '.png';

        if (req.files.logo) {
            var tmpPath = req.files.logo.path;
            var targetPath = path.resolve(filePath);

            if (req.body.oldLogo === req.files.logo.name) {

                logo = req.body.oldLogo;

            } else {
                if (path.extname(req.files.logo.name).toLowerCase() == '.png' || path.extname(req.files.logo.name).toLowerCase() == '.jpg') {
                    if (req.body.oldLogo != 'dummy.png') {
                        fs.unlink('./public/uploads/logo/' + req.body.oldLogo, function(err) {
                            if (err) {
                                req.flash('error', err);
                                res.redirect('/dash');
                            }
                        });
                    }

                    fs.rename(tmpPath, targetPath, function(err) {
                        if (err) {
                            req.flash('error', err);
                            res.redirect('/dash');
                        }
                    });

                    logo = database_filepath;

                } else {
                    fs.unlink(tmpPath, function(err) {
                        req.flash('error', 'Only *.png or *.jpg file allowed!');
                        res.redirect('/dash');
                    });
                }
            }
        }

        Job.findById(req.params.id, function(err, job) {
            if (err) {
                req.flash('error', err);
                res.redirect('back');
            }

            if ((logo == '') || (logo == undefined)) {
                job.profile.logo = req.body.oldLogo;
            } else {
                job.profile.logo = logo;
            }

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
            job.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('back');
                }

                req.flash('success', 'Job has been updated.');
                res.redirect('/dash');
            });

        });
    });

    // Pause / Publish job post -------------------------------------
    app.get('/job/stat/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                req.flash('error', err);
                res.redirect('/dash');
            }
            if (job.status == 'published') {
                job.status = 'paused';
            } else {
                job.status = 'published';
            }

            job.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/dash');
                }
                req.flash('success', 'Job status changed!');
                res.redirect('/dash');
            });

        });
    });

    // Set app status as reviewed -------------------------------------
    app.get('/app/set/:id', isLoggedIn, function(req, res, next) {
        App.findById(req.params.id, function(err, app) {
            if (err) {
                req.flash('error', err);
                res.redirect('/dash');
            }
            if (app.read == false) {
                app.read = true;
            } else {
                app.read = false;
            }

            app.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/dash');
                }

                Job.findById(app.jobId, function(err, job) {
                    job.newApp = job.newApp - 1;
                    job.save(function(err) {
                        if (err) {
                            req.flash('error', err);
                            res.redirect('/dash');
                        }

                        req.flash('success', 'Application is reviewed!');
                        res.redirect('/dash');

                    });
                });

            });
        });
    });

    // Delete job post ----------------------------------------------
    app.get('/job/del/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                req.flash('error', err);
                res.redirect('back');
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

            job.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('back');
                }

                if (status == 0) {
                    req.flash('success', 'Job post has been deleted');
                } else if (status == 1) {
                    req.flash('success', 'Job post has been restored');
                }

                res.redirect('/dash');
            });

        });
    });

    // Get application on job post read ---------------------------------
    app.get('/job/app/:id', isLoggedIn, function(req, res, next) {
        App.findById(req.params.id, function(err, app) {
            if (err) {
                req.flash('error', err);
                res.redirect('/dash');
            }
            if (app.read == false) { // Remove the 'new' label
                app.read = true;
                Job.findById(app.jobId, function(err, job) {
                    if (err) {
                        req.flash('error', err);
                        res.redirect('/dash');
                    }
                    job.newApp = job.newApp - 1; // Minus 1 of new app
                    job.save(function(err) {
                        if (err) {
                            req.flash('error', err);
                            res.redirect('/dash');
                        }
                    });
                });
            } else {
                app.read = true;
            }
            app.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('/dash');
                }
            });
            res.redirect('/dash');
        });
    });

    // APPLY FOR A JOB ---------------------------------
    app.post('/apply/:id', function(req, res, next) {
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
                                req.flash('error', err);
                                res.redirect('/home');
                            } else {
                                // Save the values into database
                                var app = new App({
                                    jobId: job._id,
                                    firstName: req.body.firstName,
                                    lastName: req.body.lastName,
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
                                        req.flash('error', err);
                                        res.redirect('/home');
                                    }
                                });

                                // Add app number to job collection
                                Job.findById(job._id, function(err, job) {
                                    if (err) {
                                        req.flash('error', err);
                                        res.redirect('/home');
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
                                                fullName: 'Full Name: ' + req.body.firstName + ' ' + req.body.lastName,
                                                phone: 'Phone: ' + req.body.phone,
                                                email: 'Email: ' + req.body.email,
                                                location: 'Location: ' + req.body.location,
                                                applyDate: 'Date Applied: ' + now
                                            },
                                            footer: 'You can review the application on your dashboard by clicking on related job posting title.'
                                        };

                                        // Send a single email
                                        template('email', locals, function(err, html, text) {
                                            if (err) {
                                                console.log(err);
                                            } else {
                                                transport.sendMail({
                                                    from: 'Jobsy Mailer <mailer@jobsy.io>',
                                                    to: job.email,
                                                    subject: 'New application for: ' + position + ' at ' + company,
                                                    html: html,
                                                    text: text
                                                }, function(err, responseStatus) {
                                                    if (err) {
                                                        console.log(err);
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
                                                                console.log(err);
                                                            } else {
                                                                transport.sendMail({
                                                                    from: 'Jobsy Mailer <mailer@jobsy.io>',
                                                                    to: req.body.email,
                                                                    subject: 'Your application for: ' + position + ' at ' + company,
                                                                    html: html,
                                                                    text: text
                                                                }, function(err, responseStatus) {
                                                                    if (err) {
                                                                        console.log(err);
                                                                    } else {
                                                                        console.log('Email to applicant: ' + req.body.email + ' sent!!!');
                                                                        req.flash('success', 'Success! Your application have been successfully sent.');
                                                                        res.redirect('/home');
                                                                    }
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
                                            req.flash('error', err);
                                            res.redirect('/home');
                                        }
                                    });
                                });
                            }
                        });
                    } else {
                        fs.unlink(tmpPath, function(err) {
                            req.flash('error', 'Only PDF file allowed');
                            res.redirect('/home');
                        });
                    }
                }
            });
    });






    // =============================================================================
    // ============================================================= PAYMENT SYSTEMS
    // =============================================================================

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
    })




    // =============================================================================
    // ================================================================== API ROUTES
    // =============================================================================

    // ============================ ALGOLIA SEARCH APIs ============================
    app.get('/alg', function(req, res) {
        res.render('notif', {
            msg: 'Select action by clicking buttons below',
            datas: 'none',
            title: 'Algolia Control Center'
        });
    });

    app.get('/alg/init', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-local');
        } else {
            var index = client.initIndex('Jobs');
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
                            console.error(err);
                            return;
                        }

                        res.render('notif', {
                            msg: 'Pushing database.. Done!',
                            datas: JSON.stringify(content),
                            title: 'Initial Import'
                        });
                    });
                }
            }
        });
    });

    app.get('/alg/clear', function(req, res) {
        var host = req.host; // checking host to determine index
        if (host == 'localhost') {
            var index = client.initIndex('Jobs-local');
        } else {
            var index = client.initIndex('Jobs');
        }
        
        index.clearIndex(function(err, content) {
            if (err) {
                console.error(err);
                return;
            }

            res.render('notif', {
                msg: 'Clearing index.. Done!',
                datas: JSON.stringify(content),
                title: 'Clear Index'
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
                console.error(err);
                return;
            }

            console.log(content);
        });
    });

    app.get('/alg/delete/:id', function(req, res) {
        var id = req.params.id;
        index.deleteObject(id, function(err) {
            if (err) {
                res.send(err);
                return;
            } else {
                res.send("Object has been successfully deleted..");
            }
        });
    });

    // ======================== END of ALGOLIA SEARCH APIs =========================


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
    app.get('/api/search/:keyword', function(req, res) {
        var keyword = req.params.keyword;
        index.search(keyword, function(err, content) {
            if (err) {
                console.error(err);
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

    // Fetch all published jobs based on filters
    app.get('/api/jobs/:category/:location/:jobType', function(req, res) {

        // ----------------------------- Filters w/ one 'all' -----------------------------
        if ((req.params.category == 'all') && (req.params.location != 'all') && (req.params.jobType != 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'profile.location': req.params.location
                }, {
                    'details.jobType': req.params.jobType
                }]
            };
        } else if ((req.params.category != 'all') && (req.params.location == 'all') && (req.params.jobType != 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'details.category': req.params.category
                }, {
                    'details.jobType': req.params.jobType
                }]
            };
        } else if ((req.params.category != 'all') && (req.params.location != 'all') && (req.params.jobType == 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'profile.location': req.params.location
                }, {
                    'details.category': req.params.category
                }]
            };
        }
        // -------------------------- Filters with 2 'all's ------------------------
        if ((req.params.category == 'all') && (req.params.location == 'all') && (req.params.jobType != 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'details.jobType': req.params.jobType
                }]
            };
        } else if ((req.params.category == 'all') && (req.params.location != 'all') && (req.params.jobType == 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'profile.location': req.params.location
                }]
            };
        } else if ((req.params.category != 'all') && (req.params.location == 'all') && (req.params.jobType == 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'details.category': req.params.category
                }]
            };
        }
        // ---------------------------- Filters with 3 'all's ----------------------------
        else if ((req.params.category == 'all') && (req.params.location == 'all') && (req.params.jobType == 'all')) {
            var filter = {
                'status': "published"
            };
        }
        // ---------------------------- Filters with NO 'all' ----------------------------
        else if ((req.params.category != 'all') && (req.params.location != 'all') && (req.params.jobType != 'all')) {
            var filter = {
                $and: [{
                    'status': "published"
                }, {
                    'profile.location': req.params.location
                }, {
                    'details.jobType': req.params.jobType
                }, {
                    'details.category': req.params.category
                }]
            };
        }

        // ============================= Execute the filters ==============================
        Job.find(filter, null, {
                sort: {
                    createdAt: -1
                }
            },
            function(err, jobs) {
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

    // Edit job post API based on job ID
    app.get('/api/job/edit/:id', function(req, res) {
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


    // =============================================================================
    // END OF API ROUTES ===========================================================
    // =============================================================================
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
