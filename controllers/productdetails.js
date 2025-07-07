const productsSchema = require('../models/productsSchema')

const getProductDetails = async function (req, res) {

    try {
        const id = req.query.productId;

        const productDetails = await productsSchema.findOne({ _id : id });

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


        if (productDetails.isActive) {

            res.render('productdetails',
                {
                    cssFile: '/stylesheets/productdetails.css',
                    jsFile: '/javascripts/productDetails.js', productDetails, relatedProducts,uniqueVariants, totalStock
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