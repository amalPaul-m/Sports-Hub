const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const wishlistSchema = require('../models/wishlistSchema');
const cartSchema = require('../models/cartSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getProducts = async function (req, res, next) {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const [totalUsers, productsList, totalUsersUnlist, productsUnList] = await Promise.all([
        productsSchema.countDocuments({ isActive: true }),
        productsSchema.find({ isActive: true }).sort({ updatedAt: -1 }).skip(skip).limit(limit),
        productsSchema.countDocuments({ isActive: true }),
        productsSchema.find({ isActive: false }).sort({ updatedAt: -1 }).skip(skip).limit(limit)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);
    const totalPagesUnlist = Math.ceil(totalUsersUnlist / limit);

    res.render('productslist', {
      productsList, productsUnList,
      currentPage: page,
      totalPages,currentPageUnlist: page,
      totalPagesUnlist
    });


  } catch (error) {
        errorLogger.error('Failed to fetch get data', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'products',
        action: 'getProducts'
    });
    next(error); 
  }
};


const getAddProducts = async function (req, res, next) {

  try {
    const category = await productTypesSchema.find({ status: "active" }).sort({ _id: 1 });

    res.render('addProducts', { category });

  } catch (error) {
    errorLogger.error('Failed to fetch add products data', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'getAddProducts'
    });
    next(error);
  }
};


const postAddProducts = async function (req, res) {

  try {

    const imageNames = req.files.map(file => file.filename);

    const body = req.body;

    const parseVariants = () => {
    const result = [];
    let i = 0;
    while (req.body[`variantSize_${i}`]) {
      result.push({
        size: req.body[`variantSize_${i}`],
        color: req.body[`variantColor_${i}`],
        stockQuantity: parseInt(req.body[`variantStock_${i}`])
      });
      i++;
    }
    return result;
  };

    const variants = parseVariants();

    const product = new productsSchema ({
      productName: req.body?.productName,
      description: req.body?.description,
      category: req.body?.category,
      unitSize: req.body?.unitSize,
      regularPrice: parseFloat(req.body?.regularPrice),
      salePrice: parseFloat(req.body?.salePrice),
      ageRange: req.body?.ageRange,
      material: req.body?.material,
      itemWeight: parseFloat(req.body?.itemWeight),
      warranty: parseInt(req.body?.warranty),
      brandName: req.body?.brandName,
      imageUrl: imageNames, 
      variants: variants.map(v => ({
        size: v.size,
        color: v.color,
        stockQuantity: parseInt(v.stockQuantity)
      }))
    });

    await product.save();

    apiLogger.info('Product added successfully', {
      controller: 'products',
      action: 'postAddProducts',
      productId: product._id,
      productName: product.productName
    });

    res.redirect('/products/add?success=1');

  } catch (error) {
    errorLogger.error('Failed to add product', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'postAddProducts'
    });
    next(error);
  }

};


const listGetProducts = async function (req, res, next) {
  try {
    const userId = req.params?.id;

    // status set to active
    await productsSchema.findByIdAndUpdate(userId,{ isActive: true });

    res.redirect('/products');
  } catch (error) {
    errorLogger.error('Failed to list product', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'listGetProducts'
    });
    next(error);
  }
};


const unlistGetProducts = async function (req, res, next) {
  try {
    const productId = req.params?.id;

    await productsSchema.findByIdAndUpdate(productId, { isActive: false });

    await wishlistSchema.updateMany(
      { productId: productId },
      { $pull: { productId: productId } }
    );

    const carts = await cartSchema.find({ 'items.productId': productId });

    for (const cart of carts) {
      cart.items = cart.items?.filter(
        item => item.productId.toString() !== productId
      );
      await cart.save();
    }

    res.redirect('/products');
  } catch (error) {
    errorLogger.error('Failed to unlist product', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'unlistGetProducts'
    });
    next(error);
  }
};




const editGetProducts = async function (req, res, next) {

  try {
    const productId = req.params?.id;

    const [productDetails, category] = await Promise.all([
      productsSchema.findById(productId),
      productTypesSchema.find({ status: "active" }).sort({ _id: 1 })
    ]);

    res.render('editProducts', {
      productDetails: [productDetails],
      category
    });

  } catch (error) {
    errorLogger.error('Failed to fetch edit products data', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'editGetProducts'
    });
    next(error);
  }

};



const editThumbGetProducts = async function (req, res, next) {

  try {
    const { urlid, productId } = req.params;

    await productsSchema.findByIdAndUpdate(productId,{ $pull: { imageUrl: urlid } });

    res.redirect(`/products/edit/${productId}`);
  } catch (error) {
    errorLogger.error('Failed to edit thumbnail product', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'editThumbGetProducts'
    });
    next(error);
  }
};



const updatePostProducts = async function (req, res, next) {
  try {

    console.log(req.body);
    const imageNames = req.files?.map(file => file.filename);
    const referId = req.body.id;

    const productData = await productsSchema.findById(referId);
    const imgLength = productData.imageUrl?.length;
    const newImg = imageNames.length;
    const totalImagesAfterUpload = imgLength + newImg;
    if(totalImagesAfterUpload< 4){

      res.redirect('/products/update?error=1');

    }

    // Update Product Fields
    const product = {
      productName: req.body?.productName,
      description: req.body?.description,
      category: req.body?.category,
      unitSize: req.body?.unitSize,
      regularPrice: parseFloat(req.body?.regularPrice),
      salePrice: parseFloat(req.body?.salePrice),
      ageRange: req.body?.ageRange,
      material: req.body?.material,
      itemWeight: parseFloat(req.body?.itemWeight),
      warranty: parseInt(req.body?.warranty),
      brandName: req.body?.brandName
    };

    await productsSchema.findByIdAndUpdate(
      referId,
      {
        $set: { ...product },
        $addToSet: { imageUrl: { $each: imageNames } }
      },
      { new: true, runValidators: true }
    );


      const variantIndexes = Object.keys(req.body)
      .filter(key => key.startsWith('variantSize_'))
      .map(key => key.split('_')[1]);

    for (let index of variantIndexes) {
      const variantId = req.body[`variantId_${index}`];
      const size = req.body[`variantSize_${index}`];
      const color = req.body[`variantColor_${index}`];
      const stockQuantity = parseInt(req.body[`variantStock_${index}`]) || 0;

      if (variantId) {
        await productsSchema.updateOne(
          { _id: referId, "variants._id": variantId },
          {
            $set: {
              "variants.$.size": size,
              "variants.$.color": color,
              "variants.$.stockQuantity": stockQuantity
            }
          }
        );
      } else if (size && color) {
        await productsSchema.findByIdAndUpdate(
          referId,
          {
            $push: {
              variants: {
                size,
                color,
                stockQuantity
              }
            }
          }
        );
      }
    }

    apiLogger.info('Product updated successfully', {
      controller: 'products',
      action: 'updatePostProducts',
      productId: referId,
      productName: product.productName
    });

    res.redirect('/products/add?success=2');

  } catch (error) {
    errorLogger.error('Failed to update product', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'updatePostProducts'
    });
    next(error);
  }
};




const searchProducts = async (req, res, next) => {
  try {
    const query = req.query.searchItem || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const activeFilter = {
      isActive: true,
      $or: [{ productName: { $regex: query, $options: 'i' } }]
    };

    const inactiveFilter = {
      isActive: false,
      $or: [{ productName: { $regex: query, $options: 'i' } }]
    };

    const totalActive = await productsSchema.countDocuments(activeFilter);
    const totalPages = Math.ceil(totalActive / limit);

    let productsList = [];
    let productsUnList = [];

    productsList = await productsSchema.find(activeFilter)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    productsUnList = await productsSchema.find(inactiveFilter)
      .sort({ _id: -1 })
      

    res.render('productslist', {
      productsList,
      productsUnList,
      query,
      currentPage: page,
      totalPages
    });

  } catch (error) {
    errorLogger.error('Failed to search products', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'products',
      action: 'searchProducts'
    });
    next(error);
  }
};



module.exports = { getProducts,getAddProducts, postAddProducts, 
  listGetProducts, unlistGetProducts, editGetProducts,editThumbGetProducts, 
  updatePostProducts, searchProducts }