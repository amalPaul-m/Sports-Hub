
const productsSchema = require('../models/productsSchema');
const offersSchema = require('../models/offersSchema');
const productTypesSchema = require('../models/productTypesSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getOffers = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const totalOffers = await offersSchema.countDocuments();
        const totalPages = Math.ceil(totalOffers / limit);
        const offerType = req.query?.offerType;
        let offersData;

        if (!offerType) {

            offersData = await offersSchema.find()
                .sort({ createdAt: -1 })
                .skip(skip).limit(limit);

        } else {

            offersData = await offersSchema.find()
                .sort({ offerType: 1 })
                .skip(skip).limit(limit);

        }

        res.render('offers', {

            offersData,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        errorLogger.error('Error fetching offers', {
            controller: 'offers',
            action: 'getOffers',
            error: error.message
        });
        next(error);
    }
};


const getAddProductOffers = async (req, res, next) => {

    try {

        const productsData = await productsSchema.distinct('productName');

        res.render('productoffer', { productsData });

    } catch (error) {
        errorLogger.error('Error get add product offers', {
            controller: 'offers',
            action: 'getAddProductOffers',
            error: error.message
        });
        next(error);
    }

};


const postAddProductOffers = async (req, res, next) => {

    try {

        const { targetName, offerName,
            discountPercentage, startDate, endDate } = req.body;

        const productsoffer = new offersSchema({
            offerType: 'Product',
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        })

        const productsExists = await offersSchema.findOne({
            targetName: targetName,
            offerType: 'Product'
        });

        if( productsExists) {
            res.redirect('/offers/add/category-offer?error=1');
        }else {

        productsoffer.save();

        apiLogger.info('Product offer added successfully', {
            controller: 'offers',
            action: 'postAddProductOffers',
            targetName,
            discountPercentage,
            startDate,
            endDate
        });

        const productDetail = await productsSchema.findOne({ productName: targetName })
        const categoryOff = await offersSchema.findOne({ targetName: productDetail.category })
        const updateOffer = {
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }

        if (!categoryOff || categoryOff.discountPercentage < discountPercentage) {
            await productsSchema.updateMany({ productName: targetName },
                { $set: { ...updateOffer } }
            )
        }

        res.redirect('/offers/add/product-offer?success=1');
        }
    } catch (error) {
        errorLogger.error('Error post add product offers', {
            controller: 'offers',
            action: 'postAddProductOffers',
            error: error.message
        });
        next(error);
    }

};



const getAddCategoryOffers = async (req, res, next) => {

    try {

        const categoryData = await productTypesSchema.find();

        res.render('categoryoffer', { categoryData });


    } catch (error) {
        errorLogger.error('Error get add category offers', {
            controller: 'offers',
            action: 'getAddCategoryOffers',
            error: error.message
        });
        next(error);
    }

};


const postAddCategoryOffers = async (req, res, next) => {

    try {

        const { targetName, offerName,
            discountPercentage, startDate, endDate } = req.body;

        const categoryoffer = new offersSchema({
            offerType: 'Category',
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        })

        const categoryExists = await offersSchema.findOne({
            targetName: targetName,
            offerType: 'Category'
        });

        if( categoryExists) {
            res.redirect('/offers/add/category-offer?error=1');
        }else {
        categoryoffer.save();

        apiLogger.info('Category offer added successfully', {
            controller: 'offers',
            action: 'postAddCategoryOffers',
            targetName,
            discountPercentage,
            startDate,
            endDate
        });

        const categoryDetail = await productsSchema.find({ category: targetName });

        for (const product of categoryDetail) {

            const productOff = await offersSchema.findOne({
                targetName: product.productName,
                offerType: 'Product'
            });

            if (!productOff || product.discountPercentage < discountPercentage) {
                await productsSchema.updateOne({ _id: product._id },
                    {
                        $set: {
                            discountPercentage,
                            startDate,
                            endDate
                        }
                    }
                )
            }
        }

        res.redirect('/offers/add/category-offer?success=1');
        }
    } catch (error) {
        errorLogger.error('Error post add category offers', {
            controller: 'offers',
            action: 'postAddCategoryOffers',
            error: error.message
        });
        next(error);
    }

};


const deleteOffers = async (req, res, next) => {

    try {

        const offerId = req.params?.id;
        const offer = await offersSchema.findById(offerId);

        if (offer.offerType === 'Product') {

            const productData = await productsSchema.findOne({ productName: offer.targetName });
            const offerData = await offersSchema.findOne({
                offerType: 'Category',
                targetName: productData.category
            });
            if (!offerData) {
                await productsSchema.updateMany(
                    { productName: offer.targetName },
                    {
                        $set: {
                            discountPercentage: 0,
                            startDate: null,
                            endDate: null
                        }
                    }
                );
            } else {
                await productsSchema.updateMany(
                    { productName: offer.targetName },
                    {
                        $set: {
                            discountPercentage: offerData.discountPercentage,
                            startDate: offerData.startDate,
                            endDate: offerData.endDate
                        }
                    }
                );
            }

        } else if (offer.offerType === 'Category') {

            const categoryProducts = await productsSchema.find({ category: offer.targetName });

            for (const product of categoryProducts) {
                const productOffer = await offersSchema.findOne({
                    offerType: 'Product',
                    targetName: product.productName
                });

                if (productOffer) {

                    await productsSchema.updateOne(
                        { _id: product._id },
                        {
                            $set: {
                                discountPercentage: productOffer.discountPercentage,
                                startDate: productOffer.startDate,
                                endDate: productOffer.endDate
                            }
                        }
                    );
                } else {
                    await productsSchema.updateOne(
                        { _id: product._id },
                        {
                            $set: {
                                discountPercentage: 0,
                                startDate: null,
                                endDate: null
                            }
                        }
                    );
                }
            }

        }

        await offersSchema.findByIdAndDelete(offerId);

        apiLogger.info('Offer deleted successfully', {
            controller: 'offers',
            action: 'deleteOffers',
            offerId
        });

        res.redirect('/offers?success=1');

    } catch (error) {
        errorLogger.error('Error deleting offer', {
            controller: 'offers',
            action: 'deleteOffers',
            error: error.message
        });
        next(error);
    }

};


const getEditProductOffers = async (req, res, next) => {

    try {

        const offerId = req.params?.id;
        const [editData, productsData] = await Promise.all([
            offersSchema.findByIdAndUpdate(offerId),
            productsSchema.distinct('productName')
        ]);

        res.render('editproductoffer', { editData, productsData });

    } catch (error) {
        errorLogger.error('Error get edit product offers', {
            controller: 'offers',
            action: 'getEditProductOffers',
            error: error.message
        });
        next(error);
    }
};



const postEditProductOffers = async (req, res, next) => {

    try {

        const offerId = req.params?.id;

        const { targetName, offerName,
            discountPercentage, startDate, endDate } = req.body;

        const productsoffer = {
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }

        await offersSchema.findByIdAndUpdate(offerId,
            { $set: { ...productsoffer } }, { new: true }
        );


        const productDetail = await productsSchema.findOne({ productName: targetName });
        console.log(productDetail)
        const categoryOff = await offersSchema.findOne({ targetName: productDetail.category });
        const updateOffer = {
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }

        if (!categoryOff || categoryOff.discountPercentage < discountPercentage ||
            new Date(productDetail.startDate).getTime() < new Date(startDate).getTime() ||
            new Date(productDetail.endDate).getTime() < new Date(endDate).getTime() ||
            new Date(productDetail.startDate).getTime() > new Date(startDate).getTime() ||
            new Date(productDetail.endDate).getTime() > new Date(endDate).getTime()) {

            await productsSchema.updateMany({ productName: targetName },
                { $set: { ...updateOffer } }
            )
        }

        apiLogger.info('Product offer updated successfully', {
            controller: 'offers',
            action: 'postEditProductOffers',
            targetName,
            discountPercentage,
            startDate,
            endDate
        });

        res.redirect('/offers?success=2');

    } catch (error) {
        errorLogger.error('Error post edit product offers', {
            controller: 'offers',
            action: 'postEditProductOffers',
            error: error.message
        });
        next(error);
    }

};


const getEditCategoryOffers = async (req, res, next) => {

    try {

        const offerId = req.params?.id;
        const [editData, productTypesData] = await Promise.all([
            offersSchema.findByIdAndUpdate(offerId),
            productTypesSchema.distinct('name')
        ]);

        res.render('editcategoryoffer', { editData, productTypesData });

    } catch (error) {
        errorLogger.error('Error get edit category offers', {
            controller: 'offers',
            action: 'getEditCategoryOffers',
            error: error.message
        });
        next(error);
    }

};


const postEditCategoryOffers = async (req, res, next) => {

    try {

        const offerId = req.params?.id;

        const { targetName, offerName,
            discountPercentage, startDate, endDate } = req.body;

        const categoryoffer = {
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }

        await offersSchema.findByIdAndUpdate(offerId,
            { $set: { ...categoryoffer } }, { new: true }
        );


        const categoryDetail = await productsSchema.find({ category: targetName });

        for (const product of categoryDetail) {

            const productOff = await offersSchema.findOne({
                targetName: product.productName,
                offerType: 'Product'
            });

            if (!productOff || product.discountPercentage < discountPercentage ||
                new Date(product.startDate).getTime() < new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() < new Date(endDate).getTime() ||
                new Date(product.startDate).getTime() > new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() > new Date(endDate).getTime()) {
console.log('hello guys')
                await productsSchema.updateOne({ _id: product._id },
                    {
                        $set: {
                            discountPercentage: discountPercentage,
                            startDate: startDate,
                            endDate: endDate
                        }
                    }
                )
            }
        }

        apiLogger.info('Category offer updated successfully', {
            controller: 'offers',
            action: 'postEditCategoryOffers',
            targetName,
            discountPercentage,
            startDate,
            endDate
        });

        res.redirect('/offers?success=2');

    } catch (error) {
        errorLogger.error('Error post edit category offers', {
            controller: 'offers',
            action: 'postEditCategoryOffers',
            error: error.message
        });
        next(error);
    }

};


module.exports = {
    getOffers, getAddProductOffers, postAddProductOffers,
    getAddCategoryOffers, postAddCategoryOffers, deleteOffers,
    getEditProductOffers, getEditCategoryOffers, postEditProductOffers, postEditCategoryOffers
}