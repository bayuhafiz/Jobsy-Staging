module.exports = {

	// Mailgun credentials
    mailgun: {
        user: process.env.MAILGUN_USER || 'postmaster@mg.colorblindlabs.com',
        password: process.env.MAILGUN_PASSWORD || '2110b5de8bc0901a30477989ad9732b9'
    }

}
