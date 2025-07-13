const mongoose = require('mongoose');

const orderCounterSchema = new mongoose.Schema({
    year: {
        type: Number,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('ordercounter', orderCounterSchema);
