var async = require('async');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var path = require('path');
var fs = require('fs');

// Load up the secret file
var secrets = require('../config/secret');

// Load up the model files
var Job = require('./models/job');
var User = require('./models/user');
var App = require('./models/app');

// Here are our precious module
module.exports = function(app, passport) {

    // =============================================================================
    // MAIN PAGES ROUTES ===========================================================
    // =============================================================================

    // show the home page ===========================
    app.get('/', function(req, res) {
        res.redirect('/home');
    });

    app.get('/home', function(req, res) {
        if (req.isAuthenticated()) {
            var user = req.user;
            res.render('home.ejs', {
                title: 'Homepage',
                user: user,
                success: req.flash('success'),
                error: req.flash('error'),
                info: req.flash('info')
            });
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
        Job.find({
            email: req.user.email
        }, null, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs) {
            var user = req.user;

            res.render('dash.ejs', {
                title: 'Dashboard',
                user: user,
                jobs: jobs,
                success: req.flash('success'),
                error: req.flash('error'),
                info: req.flash('info')
            });
        });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect: '/dash', // redirect to the secure profile section
        failureRedirect: '/', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/home', // redirect to the secure profile section
        failureRedirect: '/home', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

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
                }

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
                            req.flash('success', 'Congratulation! Your account has been activated.');
                            // res.redirect(req.session.returnTo || '/');
                            res.redirect('/dash');
                        });
                    }
                });
            });
    });

    

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN  ===============================================
    // =============================================================================

    // update account settings --------------------------------
    app.post('/account/profile', isLoggedIn, function(req, res) {
        User.findById(req.user.id, function(err, user) {
            if (err) return next(err);

            // Doing image replacement
            var image = '';
            var random_id = crypto.randomBytes(10).toString('hex');
            var filePath = './public/uploads/profile/' + random_id + '.png';
            var database_filepath = random_id + '.png';

            // Begin uploading image
            if (req.files.img) {
                var tmpPath = req.files.img.path;
                var targetPath = path.resolve(filePath);

                if (req.body.oldImg == req.files.img.name) { // if no new image presents
                    image = req.body.oldImg;
                } else {
                    if (path.extname(req.files.img.name).toLowerCase() == '.png' || path.extname(req.files.img.name).toLowerCase() == '.jpg') {
                        if (req.body.oldImg != 'dummy.png') {
                            fs.unlink('./public/uploads/profile/' + req.body.oldImg, function(err) {
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
                        image = database_filepath;
                    } else {
                        fs.unlink(tmpPath, function(err) {
                            req.flash('error', 'Error! only .png or .jpg file allowed');
                            res.redirect('/dash');
                        });
                    }
                }
            } else {
                image = req.body.oldImg;
            }

            // save user settings into databse
            user.image = image;
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
                    res.redirect('/');
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
                        res.redirect('/');
                    }

                    user.resToken = token;
                    user.resTokenCreated = Date.now();
                    user.resTokenExpired = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                var transporter = nodemailer.createTransport({
                    service: 'Mailgun',
                    auth: {
                        user: secrets.mailgun.user,
                        pass: secrets.mailgun.password
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'mailer@jobsy.io',
                    subject: 'Reset your password on Jobsy',
                    text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('info',
                        'An e-mail has been sent to ' + user.email + ' with further instructions.');
                    done(err, 'done');
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
                var transporter = nodemailer.createTransport({
                    service: 'Mailgun',
                    auth: {
                        user: secrets.mailgun.user,
                        pass: secrets.mailgun.password
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'mailer@jobsy.io',
                    subject: 'Your Jobsy password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                transporter.sendMail(mailOptions, function(err) {
                    req.flash('success', 'Your password has been changed.');
                    done(err);
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

                    if (path.extname(req.files.file.name).toLowerCase() == '.png' || path.extname(req.files.file.name).toLowerCase() == '.jpg') {
                        fs.rename(tmpPath, targetPath, function(err) {
                            if (err) {
                                req.flash('error', err);
                                res.redirect('back');
                            }
                            done(err, database_filepath, token);
                        });
                    } else {
                        fs.unlink(tmpPath, function(err) {
                            req.flash('error', 'Only *.png or *.jpg allowed');
                            res.redirect('/dash');
                        });
                    }
                } else {
                    done(false, '', token);
                }
            },
            function(src, token, done) {
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
                    req.flash('success', 'Job post successfully created.');
                    done(err, 'done');
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

                req.flash('success', 'Job information has been successfully updated.');
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

    // Delete job post ----------------------------------------------
    app.get('/job/del/:id', isLoggedIn, function(req, res, next) {
        Job.findById(req.params.id, function(err, job) {
            if (err) {
                req.flash('error', err);
                res.redirect('back');
            }
            if ((job.status == 'published') || (job.status == 'paused')) {
                job.status = 'deleted';
            } else {
                job.status = 'published';
            }


            job.save(function(err) {
                if (err) {
                    req.flash('error', err);
                    res.redirect('back');
                }
                req.flash('success', 'Job post has been deleted');
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

                                    job.app = job.app + 1;
                                    job.newApp = job.newApp + 1;

                                    job.save(function(err) {
                                        if (err) {
                                            req.flash('error', err);
                                            res.redirect('/home');
                                        }
                                    });

                                });

                                /* Begin to send the email */
                                var now = new Date();

                                var smtpTransport = nodemailer.createTransport({
                                    service: 'Mailgun',
                                    auth: {
                                        user: secrets.mailgun.user,
                                        pass: secrets.mailgun.password
                                    }
                                });

                                var mailOptions = {
                                    to: job.email,
                                    from: req.body.email,
                                    subject: 'Jobsy - Application for: ' + job.position + ' at ' + job.company,
                                    html: '<div style="width:75%; border:1px solid #f0f0f0;padding: 55px 130px 80px 80px;margin-top:20px;border-top: 6px solid #2ac5ee;border-bottom: 6px solid #2ac5ee;"><h1 style="color:#2ac5ee; padding-top:30px;padding-bottom:30px;">JOBSY - Find your jobs, easily.</h1>You are receiving this email because there is a user apllying for the job you had been posted, with following details:<br/><br/><h3><table style="border-spacing: 0px;"><tbody><tr><td>Full name</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeFName + ' ' + req.body.resumeLName + '</td><tr><tr><td>Location</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeLocation + '</td></tr><tr><td>Email</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeEmail + '</td></tr><tr><td>Phone</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumePhone + '</td></tr><tr><td>LinkedIn</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeLinkedin + '</td></tr><tr><td>Facebook</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeFacebook + '</td></tr><tr><td>Twitter @</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeTwitter + '</td></tr><tr><td>Website</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;"><br/>' + req.body.resumeWebsite + '</td></tr><tr><td>Cover Letters</td><td style="padding-left:15px;">:</td><td style="padding: 0 0 0 25px;">' + req.body.resumeMessage + '</td></tr></tbody></table></h3><br/><br/>Please check the attachment section for applicant\'s resume<div style="border-top:1px solid #f0f0f0; margin-top:90px;"><p>(C) JOBSY - Find your jobs, easily. <br>help@jobsy.com</p></div></div>',
                                    filename: req.body.resumeFName + '_' + req.body.resumeLName + '#' + now
                                };


                                smtpTransport.sendMail(mailOptions, function(err) {
                                        // Send user confirmation email
                                        var smtpTransport = nodemailer.createTransport({
                                            service: 'Mailgun',
                                            auth: {
                                                user: secrets.mailgun.user,
                                                pass: secrets.mailgun.password
                                            }
                                        });

                                        // Sending notification email to applicant's
                                        var mailOptions = {
                                            to: req.body.email,
                                            from: 'mailer@jobsy.io',
                                            subject: 'Jobsy - Applied Job: ' + job.position + ' at ' + job.company,
                                            html: '<div style="width:75%; border:1px solid #f0f0f0;padding: 55px 130px 80px 80px;margin-top:20px;border-top: 6px solid #2ac5ee;border-bottom: 6px solid #2ac5ee;"><h1 style="color:#2ac5ee; padding-bottom:30px;">JOBSY - Find your jobs, easily.</h1><br/><h3>Your job application for the position ' + job.position + ' at ' + job.company + ' has been sent successfully sent on ' + now + '.</h3><br/>You can see the job page you applied by clicking on the following link, or paste this into your browser: <br/><br/>http://' + req.headers.host + '/job/' + job._id + '<br/><br/><br/>Good luck!<br/><br/><div style="border-top:1px solid #f0f0f0; margin-top:90px;"><p>(C) JOBSY - Find your jobs, easily. <br>help@jobsy.com</p></div></div>'
                                        };

                                        smtpTransport.sendMail(mailOptions, function(err) {
                                            req.flash('success', 'Success! Your application have been successfully sent.');
                                            res.redirect('/home');
                                        })

                                    })
                                    /* End of sending email part */
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
    // API ROUTES ==================================================================
    // =============================================================================
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

    app.get('/api/users', function(req, res) {
        User.find({
            actStatus: 'activated'
        }, {
            _id: 0
        }, function(err, users) {
            res.json(users);
        });
    });

    app.get('/api/jobs/:email', function(req, res) {
        Job.find({
            $and: [{
                email: req.params.email
            }, {
                status: {
                    $not: /deleted/
                }
            }]
        }, null, {
            sort: {
                createdAt: -1
            }
        }, function(err, jobs, count) {
            res.json(jobs);
        });
    });

    app.get('/api/job/:id', function(req, res) {
        var id = req.params.id;
        Job.findOne({
            _id: id
        }, function(err, job) {
            res.json(job);
        });
    });

    app.get('/api/job/edit/:id', function(req, res) {
        var id = req.params.id;
        Job.findOne({
            _id: id
        }, function(err, job) {
            res.json(job);
        });
    });

    app.get('/api/job/app/:id', function(req, res) {
        App.find({
            _id: req.params.id
        }, function(err, app) {
            res.json(app);
        });
    });

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


    /**
     * Pause /api/job/pause/:id
     */
    exports.getPauseJob = function(req, res) {
        var id = req.params._id;
        if (id) {
            Job.findOne({
                _id: id
            }, function(err, job) {
                res.json({
                    info: 'You clicked PAUSE button!.'
                });
            });
        } else {
            res.json({
                info: 'Job has not been deleted.'
            });
        }
    };


    /**
     * Delete /api/job/delete/:id
     */

    exports.getDeleteJob = function(req, res) {
        var id = req.params.id;

        if (id) {
            Job.findOne({
                _id: id
            }, function(err, job) {
                job.update({
                    _id: req.params.id
                }, function(err) {
                    if (err) return;
                    res.json({
                        info: 'Job has been deleted successfully.'
                    });
                });
                /*if(job.remove()) {
                  res.json({info:'Job has been deleted successfully.'});
                } else {
                  res.json({info:'Job has not been deleted.'});
                }*/
            });
        } else {
            res.json({
                info: 'Job has not been deleted.'
            });
        }
    };

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
