
const productsSchema = require('../models/productsSchema');
const offersSchema = require('../models/offersSchema');
const productTypesSchema = require('../models/productTypesSchema');

const getOffers = async(req,res,next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 5;  
        const skip = (page - 1) * limit;
        
        const totalOffers = await offersSchema.countDocuments();

        const totalPages = Math.ceil(totalOffers / limit);



        
        const offerType = req.query.offerType;

        let offersData;

        if(!offerType) {

            offersData = await offersSchema.find()
        .sort({createdAt: -1})
        .skip(skip).limit(limit);

        }else {

        offersData = await offersSchema.find()
        .sort({offerType: 1})
        .skip(skip).limit(limit);

        }

                
       

        res.render('offers', { 

        offersData,
        currentPage: page,
        totalPages
    });

    } catch(error) {
        err.message = 'Error get offers';
        console.log(err);
        next(err);
    }    
};


const getAddProductOffers = async (req,res,next) => {

    try {

        const productsData = await productsSchema.distinct('productName')

        res.render('productoffer', { productsData });

    } catch (error) {
        err.message = 'Error get add product offers';
        console.log(err);
        next(err);
    }
    
};


const postAddProductOffers = async (req,res,next) => {

    try {

        const { targetName, offerName,
             discountPercentage, startDate, endDate } = req.body;
        
        const productsoffer = new offersSchema({
            offerType: 'Product',
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate:  endDate
        })

        productsoffer.save();


        const productDetail = await productsSchema.findOne({productName: targetName})
        const categoryOff = await offersSchema.findOne({targetName: productDetail.category})
        const updateOffer = {
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }
        
        if(!categoryOff || categoryOff.discountPercentage < discountPercentage){
            await productsSchema.updateMany({productName: targetName},
                { $set: { ...updateOffer }}
            )
        }


        res.redirect('/offers/add/product-offer?success=1');
    } catch (error) {
        error.message = 'Error post add product offers';
        console.log(err);
        next(err);
    }

};



const getAddCategoryOffers = async(req,res,next) => {

    try {
    
        const categoryData = await productTypesSchema.find();

        res.render('categoryoffer', { categoryData });


    } catch(error) {
        error.message = 'Error get category offers';
        console.log(err);
        next(err);
    }

};


const postAddCategoryOffers = async (req,res,next) => {

    try {

        const { targetName, offerName,
             discountPercentage, startDate, endDate } = req.body;
        
        const categoryoffer = new offersSchema({
            offerType: 'Category',
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate:  endDate
        })

        categoryoffer.save();

        
        const categoryDetail = await productsSchema.find({category: targetName});

        for(const product of categoryDetail){

            const productOff = await offersSchema.findOne({
                targetName: product.productName,
                offerType: 'Product'
            });

            if(!productOff || product.discountPercentage < discountPercentage){
            await productsSchema.updateOne({_id: product._id},
                { $set: { 
                    discountPercentage,
                    startDate,
                    endDate
                 }}
            )
        }
        }

        res.redirect('/offers/add/category-offer?success=1');

    } catch (error) {
        error.message = 'Error get category offers';
        console.log(error);
        next(error);
    }

};


const deleteOffers = async (req,res,next) => {

    try {

        const offerId = req.params.id;
        const offer = await offersSchema.findById(offerId);

        if(offer.offerType==='Product') {

            const productData = await productsSchema.findOne({productName: offer.targetName});
            const offerData = await offersSchema.findOne({
                offerType: 'Category',
                targetName: productData.category
            });
            if(!offerData){
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
            }else {
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
        
        } else if(offer.offerType==='Category') {

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

        res.redirect('/offers?success=1');

    } catch(error) {
        error.message = 'Error delete offers';
        console.log(err);
        next(err);
    }

};


const getEditProductOffers = async (req,res,next) => {

    try {

        const offerId = req.params.id;
        const editData = await offersSchema.findByIdAndUpdate(offerId);
        const productsData = await productsSchema.distinct('productName');

        res.render('editproductoffer', { editData, productsData });

    } catch(error) {
        error.message = 'Error edit product offers';
        console.log(error);
        next(error);
    }

}; 



const postEditProductOffers = async (req,res,next) => {

    try {

        const offerId = req.params.id;

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
            { $set: { ...productsoffer }}, { new: true }
        );


        const productDetail = await productsSchema.findOne({productName: targetName})
        const categoryOff = await offersSchema.findOne({targetName: productDetail.category})
        const updateOffer = {
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate: endDate
        }
        
        if(!categoryOff || categoryOff.discountPercentage < discountPercentage || 
                new Date(product.startDate).getTime() < new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() < new Date(endDate).getTime() || 
                new Date(product.startDate).getTime() > new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() > new Date(endDate).getTime() ){

            await productsSchema.updateMany({productName: targetName},
                { $set: { ...updateOffer }}
            )
        }


        res.redirect('/offers?success=2');

    } catch(error) {
        error.message = 'Error post edit product offers';
        console.log(error);
        next(error);
    } 

};


const getEditCategoryOffers = async (req,res,next) => {

    try {

        const offerId = req.params.id;
        const editData = await offersSchema.findByIdAndUpdate(offerId);
        const productTypesData = await productTypesSchema.distinct('name');

        res.render('editcategoryoffer', { editData, productTypesData });

    } catch(error) {
        error.message = 'Error edit product offers';
        console.log(error);
        next(error);
    }

}; 


const postEditCategoryOffers = async (req,res,next) => {

    try {

        const offerId = req.params.id;

        const { targetName, offerName,
             discountPercentage, startDate, endDate } = req.body;
        
        const categoryoffer = {
            targetName: targetName,
            offerName: offerName,
            discountPercentage: discountPercentage,
            startDate: startDate,
            endDate:  endDate
        }

        await offersSchema.findByIdAndUpdate(offerId,
            { $set: { ...categoryoffer }}, { new: true }
        );


        const categoryDetail = await productsSchema.find({category: targetName});

        for(const product of categoryDetail){

            const productOff = await offersSchema.findOne({
                targetName: product.productName,
                offerType: 'Product'
            });

            if(!productOff || product.discountPercentage < discountPercentage || 
                new Date(product.startDate).getTime() < new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() < new Date(endDate).getTime() || 
                new Date(product.startDate).getTime() > new Date(startDate).getTime() ||
                new Date(product.endDate).getTime() > new Date(endDate).getTime()) {
                    
            await productsSchema.updateOne({_id: product._id},
                { $set: { 
                    discountPercentage : discountPercentage,
                    startDate: startDate,
                    endDate: endDate
                 }}
            )
        }
        }


        res.redirect('/offers?success=2');

    } catch (error) {
        error.message = 'Error get category offers';
        console.log(error);
        next(error);
    }

};


module.exports = { getOffers, getAddProductOffers, postAddProductOffers, 
    getAddCategoryOffers, postAddCategoryOffers, deleteOffers, 
    getEditProductOffers, getEditCategoryOffers, postEditProductOffers,postEditCategoryOffers }