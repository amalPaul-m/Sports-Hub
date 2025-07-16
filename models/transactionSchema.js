const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    orderId: {
        type: String,
        ref: 'orders',
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'COD', 'wallet'],
        required: true
    },
    paymentId: {
        type: String,
        required: true
    },
     orderid: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['captured', 'failed'],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('transactionHistory', transactionSchema);
