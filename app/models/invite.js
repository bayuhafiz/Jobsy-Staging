var mongoose = require('mongoose');

module.exports = mongoose.model('Invite', {
    email: {
        type: String,
        default: ''
    },
    url: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: ''
    },
    confirm: {
        type: Boolean,
        default: false
    },
    sender: {
        type: String,
        default: ''
    }
});
