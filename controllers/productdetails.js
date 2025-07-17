const productsSchema = require('../models/productsSchema');
const cartSchema = require('../models/cartSchema');
const usersSchema = require('../models/usersSchema');
const wishlistSchema = require('../models/wishlistSchema');


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

        const wishlistProductIds = await wishlistSchema.find({ userId:userId }).distinct('productId');
        productDetails.isWishlisted = wishlistProductIds
        .map(id => id.toString())
        .includes(productDetails._id.toString());

        if (productDetails.isActive) {

            res.render('productdetails',
                {
                    cssFile: '/stylesheets/productdetails.css',
                    jsFile: '/javascripts/productDetails.js', productDetails, 
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

module.exports = {getProductDetails}