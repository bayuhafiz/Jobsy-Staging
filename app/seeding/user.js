var User = require('../models/user');

// create user #1
var newUser = new User();

newUser.firstName = 'Rendy';
newUser.lastName = 'Admin';
newUser.companyName = 'Colorblind Labs';
newUser.email = 'rendy@colorblindlabs.com';
newUser.password = newUser.generateHash('hello123');
newUser.actStatus = 'activated';
newUser.initLogin = false;

User.findOne({
    email: 'rendy@colorblindlabs.com'
}, function(err, existingUser) {
    if (!existingUser) {
        newUser.save(function(err) {
            if (err)
                return done(err);
        });
    }
});

// create user #2
var newUser2 = new User();

newUser2.firstName = 'Pras';
newUser2.lastName = 'Admin';
newUser2.companyName = 'Colorblind Labs';
newUser2.email = 'pras@colorblindlabs.com';
newUser2.password = newUser2.generateHash('hello123');
newUser2.actStatus = 'activated';
newUser2.initLogin = false;

User.findOne({
    email: 'pras@colorblindlabs.com'
}, function(err, existingUser) {
    if (!existingUser) {
        newUser2.save(function(err) {
            if (err)
                return done(err);
        });
    }
});