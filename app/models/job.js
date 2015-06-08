var mongoose = require('mongoose');

module.exports = mongoose.model('Job', {
    profile: {
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
    },
    details: {
        jobTitle: {
            type: String,
            default: ''
        },
        category: {
            type: String,
            default: ''
        },
        jobType: {
            type: String,
            default: ''
        },
        jobScope: {
            type: String,
            default: ''
        },
        requirements: {
            type: String,
            default: ''
        },
        currency: {
            type: String,
            default: ''
        },
        salaryFrom: {
            type: String,
            default: ''
        },
        salaryTo: {
            type: String,
            default: ''
        },
        salaryType: {
            type: String,
            default: ''
        }
    },
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
