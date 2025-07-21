const couponSchema = require('../models/couponSchema')


const couponSessionClr = async (req) => {

    if (req.session.couponCode) {

        req.session.couponCode = null;
        req.session.discountAmount = 0;
 }
}

module.exports = couponSessionClr;