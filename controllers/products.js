const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')

const getProducts = async function (req, res, next) {

  try {

    // pagination=================

    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalUsers = await productsSchema.countDocuments({ isActive: true });
    const totalPages = Math.ceil(totalUsers / limit);

  
    let productsList = await productsSchema
    .find({ isActive: true }).sort({ updatedAt: -1 }).skip(skip).limit(limit);


    const totalUsersUnlist = await productsSchema.countDocuments({ isActive: true });
    const totalPagesUnlist = Math.ceil(totalUsersUnlist / limit);


    let productsUnList = await productsSchema
    .find({ isActive: false }).sort({ updatedAt: -1 }).skip(skip).limit(limit);

    res.render('productslist', {
      cssFile: '/stylesheets/adminProduct.css',
      jsFile: '/javascripts/adminProduct.js', productsList, productsUnList,
      currentPage: page,
      totalPages,currentPageUnlist: page,
      totalPagesUnlist
    });


  } catch (err) {
    err.message = 'not get products data';
    next(err);
  }
};


const getAddProducts = async function (req, res, next) {

  try {
    const category = await productTypesSchema.find({ status: "active" }).sort({ _id: 1 });

    res.render('addProducts', {
      cssFile: '/stylesheets/addProduct.css',
      jsFile: '/javascripts/addProduct.js', category
    });

  } catch (err) {
    err.message = 'not get products data';
    next(err);
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
      productName: req.body.productName,
      description: req.body.description,
      category: req.body.category,
      unitSize: req.body.unitSize,
      regularPrice: parseFloat(req.body.regularPrice),
      salePrice: parseFloat(req.body.salePrice),
      ageRange: req.body.ageRange,
      material: req.body.material,
      itemWeight: parseFloat(req.body.itemWeight),
      warranty: parseInt(req.body.warranty),
      brandName: req.body.brandName,
      imageUrl: imageNames, 
      variants: variants.map(v => ({
        size: v.size,
        color: v.color,
        stockQuantity: parseInt(v.stockQuantity)
      }))
    });

    await product.save();

    res.redirect('/products/add?success=1');

  } catch (error) {
    err.message = 'Error adding products';
    next(err);
  }

};


const listGetProducts = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await productsSchema.findByIdAndUpdate(userId,{ isActive: true });

    res.redirect('/products');
  } catch (err) {
    err.message = 'Error list products';
    next(err);
  }
};


const unlistGetProducts = async function (req, res, next) {
  try {
    const userId = req.params.id;

    // status set to active
    await productsSchema.findByIdAndUpdate(userId,{isActive: false});

    res.redirect('/products');
  } catch (err) {
    err.message = 'Error unlist products';
    next(err);
  }
};



const editGetProducts = async function (req, res, next) {

  try {
    const productId = req.params.id;

    const productDetails = await productsSchema.findById(productId);
    const category = await productTypesSchema.find({ status: "active" }).sort({ _id: 1 });
    console.log(category)

    res.render('editProducts', {
      productDetails: [productDetails],
      category,
      cssFile: '/stylesheets/editProduct.css',
      jsFile: '/javascripts/editProduct.js'
    });

  } catch (err) {
    err.message = 'Error unlist products';
    next(err);
  }

};



const editThumbGetProducts = async function (req, res, next) {

  try {
    const { urlid, productId } = req.params;

    await productsSchema.findByIdAndUpdate(productId,{ $pull: { imageUrl: urlid } });

    res.redirect(`/products/edit/${productId}`);
  } catch (err) {
    err.message = 'Error edit products';
    next(err);
  }

};


const updatePostProducts = async function (req, res, next) {


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

    const variantNames = variants.map(v => ({
        size: v.size,
        color: v.color,
        stockQuantity: parseFloat(v.stockQuantity)
      }))
    

    const referId = req.body.id;
    console.log(referId)

      const product = {
      productName: req.body.productName,
      description: req.body.description,
      category: req.body.category,
      unitSize: req.body.unitSize,
      regularPrice: parseFloat(req.body.regularPrice),
      salePrice: parseFloat(req.body.salePrice),
      ageRange: req.body.ageRange,
      material: req.body.material,
      itemWeight: parseFloat(req.body.itemWeight),
      warranty: parseInt(req.body.warranty),
      brandName: req.body.brandName
    };

    await productsSchema.findByIdAndUpdate(
  referId,
  {
    $set: {
      ...product
    },
    $addToSet: {
      variants: { $each: variantNames },
      imageUrl: { $each: imageNames }
    }
  },
  { new: true, runValidators: true }
);



    res.redirect('/products/add?success=2');

  } catch (err) {
    err.message = 'Error edit products';
    console.log(err)
    next(err);
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
      totalPages,
      cssFile: '/stylesheets/adminProduct.css',
      jsFile: '/javascripts/adminProduct.js',
    });

  } catch (err) {
    console.error('[ERROR] searchProducts:', err);
    next(new Error('Error search products'));
  }
};



module.exports = {getProducts,getAddProducts, postAddProducts, listGetProducts, unlistGetProducts, editGetProducts,editThumbGetProducts, updatePostProducts, searchProducts}