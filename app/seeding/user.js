var User = require('../models/user');

// create the user
var newUser = new User();

newUser.firstName = 'Jobsy';
newUser.lastName = 'Admin';
newUser.companyName = 'Colorblind Labs';
newUser.email = 'bayu@colorblindlabs.com';
newUser.password = newUser.generateHash('qwpo');
newUser.actStatus = 'inactive';
newUser.initLogin = true;
newUser.actToken = '123';

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
