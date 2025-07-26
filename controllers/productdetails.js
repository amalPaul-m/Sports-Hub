const productsSchema = require('../models/productsSchema');
const cartSchema = require('../models/cartSchema');
const usersSchema = require('../models/usersSchema');
const wishlistSchema = require('../models/wishlistSchema');
const reviewSchema = require('../models/reviewSchema');


const getProductDetails = async function (req, res, next) {

    try {

        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });
        const userId = usersData._id;
        const id = req.query.productId;

        if (!email) {
            return res.redirect('/login');
        }

        const isInCart = await cartSchema.findOne({
        userId: userId,
        "items.productId": id  
        });

        const hide = isInCart?'disabled':'';
        const btnvalue = isInCart?'In Cart':'Add to Cart';

        
        const productDetails = await productsSchema.findOne({ _id : id });
        const productDetailsId = productDetails.toObject();


        const cat = productDetails.category;
        const relatedProducts = await productsSchema.find({_id: { $ne: id },category: cat}).limit(4);
        
        //unique color
        const seenColors = new Set();
        const uniqueVariants = [];

        for (const variant of productDetails.variants) {
        if (!seenColors.has(variant.color)) {
            seenColors.add(variant.color);
            uniqueVariants.push(variant);
        }
        }

        //total stock

        let totalStock = 0;
        for(const variant of productDetails.variants) {
            totalStock+=variant.stockQuantity;
        }

        let buttonVal = '';
        let message = '';

        if(totalStock===0) {
            buttonVal = 'none';
            message = 'out of Stock'
        }

        const productReview = await reviewSchema.find({ productId: id }).populate('userId')
        const count = productReview.length;
        const totalRating = productReview.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = count ? (totalRating / count).toFixed(1) : 0;

        const review1 = await reviewSchema.countDocuments({productId: id, rating:'1'});
        const review2 = await reviewSchema.countDocuments({productId: id, rating:'2'});
        const review3 = await reviewSchema.countDocuments({productId: id, rating:'3'});
        const review4 = await reviewSchema.countDocuments({productId: id, rating:'4'});
        const review5 = await reviewSchema.countDocuments({productId: id, rating:'5'});
        const totalReview = review1+review2+review3+review4+review5;
        const review1Per = Math.ceil((review1/totalReview)*100);
        const review2Per = Math.ceil((review2/totalReview)*100);
        const review3Per = Math.ceil((review3/totalReview)*100);
        const review4Per = Math.ceil((review4/totalReview)*100);
        const review5Per = Math.ceil((review5/totalReview)*100);

        const review = {
            review1Per, review2Per, review3Per, review4Per, review5Per,
            review1, review2, review3, review4, review5
        }
        
        const wishlistProductIds = await wishlistSchema.find({ userId:userId }).distinct('productId');
        productDetails.isWishlisted = wishlistProductIds
        .map(id => id.toString())
        .includes(productDetails._id.toString());

        if (productDetails.isActive) {

            res.render('productdetails',
                {
                    productDetails, 
                    productReview,
                    averageRating, count, review,
                    relatedProducts,uniqueVariants, 
                    totalStock, hide, btnvalue, buttonVal, message
                })

        } else {
            res.redirect('/userproducts')
        }
    } catch (err) {

        err.message = 'Fetch data error';
        next(err);

    }
};

module.exports = { getProductDetails }