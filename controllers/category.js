const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const wishlistSchema = require('../models/wishlistSchema');
const cartSchema = require('../models/cartSchema');

// get category page

const getCategory = async function (req, res, next) {

  try {
    
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;
    const query = req.query.q ? req.query.q.trim() : '';

    // Filter
    const filter = query
      ? {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
          { status: { $regex: query, $options: 'i' } },
        ],
      }
      : {};

    // Query data

    const[totalUsers, categoryList] = await Promise.all([
      productTypesSchema.countDocuments(filter),
      productTypesSchema
        .find()
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.render('category', {
      categoryList,
      currentPage: page,
      totalPages,
      query
    });


  } catch (err) {
    err.message = 'not get category data';
    next(err);
  }
};



const postCategory = async function (req, res, next) {

  try {
    const input = req.body.name;
    const name = input.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    const category = new productTypesSchema ( {
      name: name,
      description: req.body.description
    })


    if (await productTypesSchema.findOne({ name: category.name })) {
      res.redirect('/category?fail=1')
    } else {

      await category.save();
      console.log('category added', category);
      res.redirect('/category?success=1')
    }

  } catch (err) {
    err.message = 'not gstore category data';
    next(err);
  }
};



const unblockCategory = async function (req, res, next) {

  try {
    const categoryId = req.params.id;
    const categoryName = req.params.name;

    // status set to active

    Promise.all([
      productTypesSchema.findByIdAndUpdate(categoryId, { status: 'active' }),
      productsSchema.updateMany({ category: categoryName }, {$set: { isActive: true}})
    ]);



    res.redirect('/category');
  } catch (err) {
    err.message = 'Error unblock category';
    next(err);
  }
};



const blockCategory = async function (req, res, next) {

  try {
    const categoryId = req.params.id;
    const categoryName = req.params.name;

    await Promise.all([
      productTypesSchema.findByIdAndUpdate(categoryId, { status: 'blocked' }),
      productsSchema.updateMany({ category: categoryName }, {$set: { isActive: false}})
    ])

    const wishlistData = await wishlistSchema.find().populate('productId');

    for (const wishlist of wishlistData) {
      const filteredProducts = wishlist.productId.filter(product => product.category !== categoryName);
      
      if (filteredProducts.length !== wishlist.productId.length) {
        wishlist.productId = filteredProducts.map(p => p._id); 
        await wishlist.save();
      }
    }


    const carts = await cartSchema.find().populate('items.productId');
    for (const cart of carts) {
      const filteredItems = cart.items.filter(item =>
        item.productId && item.productId.category !== categoryName
      );

      if (filteredItems.length !== cart.items.length) {
        cart.items = filteredItems;
        await cart.save();
      }
    }

    res.redirect('/category');
  } catch (err) {
    err.message = 'Error hide category data';
    next(err);
  }
};



const updateCategory = async function (req, res, next) {

  try {
    const categoryId = req.params.id
    const input = req.body.name;
    const name = input.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

    const category = {
      name: name,
      description: req.body.description
    }
    console.log(categoryId)


    if (await productTypesSchema.findOne({ name: category.name })) {
      res.redirect('/category?fail=1')
    } else {
      
      await productTypesSchema.findByIdAndUpdate(categoryId, { $set: category });
      // await db.collection('productTypes').updateOne({ _id: new ObjectId(categoryId) }, { $set: category })
      console.log('category added', category);
      res.redirect('/category?success=2')
    }
   
  } catch (err) {
    err.message = 'not store category data';  
    next(err);
  }
};


module.exports = {getCategory, postCategory, unblockCategory, blockCategory, updateCategory}