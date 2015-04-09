var path = require('path'),
    templatesDir = path.resolve(__dirname, '../views', 'email'),
    emailTemplates = require('email-templates'),
    nodemailer = require('nodemailer');

// load up the secret file
var secrets = require('../config/secret');

emailTemplates(templatesDir, function(err, template) {

    if (err) {
        console.log(err);
    } else {

        // Prepare nodemailer transport object
        var transport = nodemailer.createTransport({
            service: 'Mailgun',
            auth: {
                user: secrets.mailgun.user,
                pass: secrets.mailgun.password
            }
        });

        // An users object with formatted email function
        var locals = {
            email: 'bayu@colorblindlabs.com',
            name: {
                first: 'Bayu',
                last: 'Hafiz'
            }
        };

        // Send a single email
        template('activation', locals, function(err, html, text) {
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
                        console.log('Success! Email sent!!!');
                    }
                });
            }
        });

    }
});
