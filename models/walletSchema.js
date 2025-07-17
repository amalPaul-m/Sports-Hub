const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        unique: true
    },
    balance: {
        type: Number,
        default: 0
    },
    transaction: [
        {
            type: {
                type: String, 
                enum: ['add', 'deduct'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            description: {
                type: String,
                required: true
            },
            transactionId: {
                type: String,
                default: null
            },
            orderid: {
                type: String,
                default: null
            },
            // status: {
            //     type: String,
            //     enum: ['success', 'failed'],
            //     required: true
            // },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true }); 

module.exports = mongoose.model('wallet', walletSchema);
