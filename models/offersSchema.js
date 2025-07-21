const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    offerType: {
        type: String,
        enum: ['Product', 'Category'],
        required: true
    },
    targetName: {
        type: String,
        required: true
    },
    offerName: {
        type: String,
        required: true
    },
    discountPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('offers', offerSchema);
