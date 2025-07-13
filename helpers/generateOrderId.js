const OrderCounter = require('../models/orderCounter');

async function generateOrderId() {
    const currentYear = new Date().getFullYear();

    const counter = await OrderCounter.findOneAndUpdate(
        { year: currentYear },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
    );

    const orderNumber = String(counter.count).padStart(4, '0');
    return `SportsHub-${currentYear}-${orderNumber}`;
}

module.exports = generateOrderId;
