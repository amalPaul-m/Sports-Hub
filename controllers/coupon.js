const couponSchema = require('../models/couponSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getCoupon = async (req,res,next) => {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;  
        const skip = (page - 1) * limit;

        const [couponData, totalCoupons] = await Promise.all([
            couponSchema.find().sort({createdAt:-1}).skip(skip).limit(limit),
            couponSchema.countDocuments()
        ]);

        const totalPages = Math.ceil(totalCoupons / limit);


        res.render('coupon', {
            couponData,
            currentPage: page,
            totalPages
        });

};

const getAddCoupon = (req,res,next) => {

    res.render('addcoupon');

};

const postAddCoupon = async (req,res,next) => {

    try {

        const {
            name, code, discountAmount,
            discountPercentage, activeFrom,
            expireTo, limit, minimumOrderAmount
        } = req.body;

        const existCoupon = await couponSchema.findOne({ code: code });

        if (existCoupon) {
            return res.redirect('/coupon/add?error=1');
        }


        const coupon = new couponSchema({
            name: name,
            code: code,
            discountAmount: discountAmount,
            discountPercentage: discountPercentage,
            activeFrom: activeFrom,
            expireTo: expireTo,
            limit: limit,
            minimumOrderAmount: minimumOrderAmount
        })

        await coupon.save();

        apiLogger.info('Coupon added successfully', {
            controller: 'coupon',   
            action: 'addCoupon',
            couponId: coupon._id,
            couponCode: coupon.code
        });

        res.redirect('/coupon/add?success=1')

    }catch (error) {
       errorLogger.error('Failed to add coupon', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'coupon',
        action: 'addCoupon'
    });
    next(error); 
    }

}


const patchDelCoupon = async(req,res,next) => {

    try {

        const couponId = req.params.id;

        await couponSchema.findByIdAndDelete(couponId);

        apiLogger.info('Coupon deleted successfully', {
            controller: 'coupon',
            action: 'deleteCoupon',
            couponId
        });

        res.redirect('/coupon?success=1');

    }catch (error) {
       errorLogger.error('Failed to delete coupon data', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'coupon',
        action: 'deleteCoupon'
    });
    next(error); 
    }

}


const getEditCoupon = async(req,res,next) => {

    try {

        const couponId = req.params.id;
        const couponData = await couponSchema.findById(couponId);

        res.render('editcoupon', { couponData });

    }catch (error) {
       errorLogger.error('Failed to get edit coupon', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'coupon',
        action: 'editCoupon'
    });
    next(error); 
    }
};


const updateCoupon = async (req,res,next) => {

    try {

    const couponId = req.params.id;

    const {
            name, code, discountAmount,
            discountPercentage, activeFrom,
            expireTo, limit, minimumOrderAmount
        } = req.body;

        const couponData = await couponSchema.findOne({ name: name });
        
        const limitDifference = limit - couponData.limit;

        const coupon = {
            name: name,
            code: code,
            discountAmount: discountAmount,
            discountPercentage: discountPercentage,
            activeFrom: activeFrom,
            expireTo: expireTo,
            limit: limit,
            minimumOrderAmount: minimumOrderAmount
        }

        await couponSchema.findByIdAndUpdate(
            couponId,
            {
                $set: { ...coupon },
                $inc: { balance: limitDifference }
            },
            { new: true }
        );

        apiLogger.info('Coupon updated successfully', {
            controller: 'coupon',
            action: 'updateCoupon',
            couponId,
            limitDifference
        });

        res.redirect('/coupon?success=2');

    } catch (error) {

        errorLogger.error('Failed to update coupon', {
            originalMessage: error.message,
            stack: error.stack,
            controller: 'coupon',
            action: 'updateCoupon'
        });
        next(error);
    }
};

module.exports = { getCoupon, postAddCoupon, getAddCoupon, 
    patchDelCoupon, getEditCoupon, updateCoupon }