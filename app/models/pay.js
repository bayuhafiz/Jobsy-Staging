var mongoose = require('mongoose');

module.exports = mongoose.model('Pay', {
    order_id: {
        type: String,
        default: ''
    },
    user_email: {
        type: String,
        default: ''
    },
    payment_type: {
        type: String,
        default: ''
    },
    transaction_time: {
        type: String,
        default: ''
    },
    status_code: {
        type: String,
        default: ''
    },
    gross_amount: {
        type: String,
        default: ''
    }
});
