const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    discountPercentage: {
        type: Number,
        default: null
    },
    limit: {
        type: Number,
        required: true
    },
    balance: {
        type: Number,
        required: true,
        default: function () {
            return this.limit;
        }
    },
    activeFrom: {
        type: Date,
        required: true
    },
    expireTo: {
        type: Date,
        required: true
    },
    minimumOrderAmount: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('coupon', couponSchema);
