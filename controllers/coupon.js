const couponSchema = require('../models/couponSchema');

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

        console.log(existCoupon)

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

        res.redirect('/coupon/add?success=1')

    }catch (error) {
       error.message = 'not add coupon data';
       console.log(error)
       next(error);
    }

}


const patchDelCoupon = async(req,res,next) => {

    try {

        const couponId = req.params.id;

        await couponSchema.findByIdAndDelete(couponId);

        res.redirect('/coupon?success=1');

    }catch (error) {
       error.message = 'not add coupon data';
       console.log(error)
       next(error);
    }

}


const getEditCoupon = async(req,res,next) => {

    try {

        const couponId = req.params.id;
        const couponData = await couponSchema.findById(couponId);

        res.render('editcoupon', { couponData });

    }catch (error) {
       error.message = 'not edit coupon data';
       console.log(error)
       next(error);
    }
};


const updateCoupon = async (req,res,next) => {

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

        res.redirect('/coupon?success=2');
};

module.exports = { getCoupon, postAddCoupon, getAddCoupon, 
    patchDelCoupon, getEditCoupon, updateCoupon }