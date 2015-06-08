var mongoose = require('mongoose');

module.exports = mongoose.model('App', {
    jobId: {
        type: String,
        default: ''
    },
    fullName: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        default: ''
    },
    lastJob: {
        type: String,
        default: ''
    },
    resumeFile: {
        type: String,
        default: ''
    },
    coverLetter: {
        type: String,
        default: ''
    },
    applyDate: {
        type: Date,
        default: null    
    },
    read: {
        type: Boolean,
        default: false
    }
});
