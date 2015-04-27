var mongoose = require('mongoose');

module.exports = mongoose.model('Pay', {
    status: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: ''
    },
    updatedAt: {
        type: Date
    },
    createdAt: {
        type: Date
    },
    deleteReason: {
        type: String,
        default: ''
    },
    app: {
        type: Number,
        default: 0
    },
    newApp: {
        type: Number,
        default: 0
    },
    email: {
        type: String,
        default: ''
    }
});
