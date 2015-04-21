module.exports = {

	// Mailgun credentials
    mailgun: {
        user: process.env.MAILGUN_USER || 'postmaster@beta.jobsy.io',
        password: process.env.MAILGUN_PASSWORD || '68d197dd36d0584ce2cde6a90b69b93a'
    }

}
