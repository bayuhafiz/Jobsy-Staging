var User = require('../models/user');

// create the user
var newUser = new User();

newUser.firstName = 'Jobsy';
newUser.lastName = 'Admin';
newUser.companyName = 'Colorblind Labs';
newUser.email = 'bayu@colorblindlabs.com';
newUser.image = 'dummy.png';
newUser.password = newUser.generateHash('qwpo');
newUser.actStatus = 'activated';

User.findOne({
    email: 'bayu@colorblindlabs.com'
}, function(err, existingUser) {
    if (!existingUser) {
        newUser.save(function(err) {
            if (err)
                return done(err);
        });
    }
});
