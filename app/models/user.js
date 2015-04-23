var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        default: ''
    },
    lastName: {
        type: String,
        default: ''
    },
    companyName: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    credits: {
        type: Number,
        default: 0
    },
    actStatus: {
        type: String,
        default: ''
    },
    actToken: {
        type: String,
        default: ''
    },
    actTokenCreated: {
        type: Date,
        default: null
    },
    actTokenExpired: {
        type: Date,
        default: null
    },
    resToken: {
        type: String,
        default: ''
    },
    resTokenCreated: {
        type: Date,
        default: null
    },
    resTokenExpired: {
        type: Date,
        default: null
    },
    passToken: {
        type: String,
        default: ''
    },
    passTokenCreated: {
        type: Date,
        default: null
    },
    passTokenExpired: {
        type: Date,
        default: null
    },
    initLogin: {
        type: Boolean,
        default: true
    },
    initPost: {
        type: Boolean,
        default: true
    },
    initCompany: {
        logo: {
            type: String,
            default: ''
        },
        name: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        }
    }
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
