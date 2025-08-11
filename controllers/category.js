const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const wishlistSchema = require('../models/wishlistSchema');
const cartSchema = require('../models/cartSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');
const { error } = require('winston');

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


  } catch (error) {
    errorLogger.error('Error fetching category data', {
      controller: 'category',
      action: 'getCategory',
      error: error.message
    });
    next(error);
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

      apiLogger.info('Category added successfully', {
        controller: 'category',
        action: 'postCategory',
        categoryId: category._id,
        categoryName: category.name
      });

      res.redirect('/category?success=1')
    }

  } catch (error) {
    errorLogger.error('Error storing category data', {
      controller: 'category',
      action: 'postCategory',
      error: error.message
    });
    next(error);
  }
};



const unblockCategory = async function (req, res, next) {

  try {
    const categoryId = req.params.id;
    const categoryName = req.params.name;

    Promise.all([
      productTypesSchema.findByIdAndUpdate(categoryId, { status: 'active' }),
      productsSchema.updateMany({ category: categoryName }, {$set: { isActive: true}})
    ]);

    apiLogger.info('Category unblocked successfully', {
      controller: 'category',
      action: 'unblockCategory',
      categoryId,
      categoryName
    });

    res.redirect('/category');

  } catch (error) {
    errorLogger.error('Error unblocking category data', {
      controller: 'category',
      action: 'unblockCategory',
      error: error.message
    });
    next(error);
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

        apiLogger.info('Wishlist updated after blocking category', {
          controller: 'category',
          action: 'blockCategory',
          wishlistId: wishlist._id,
          categoryName
        });

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

        apiLogger.info('Cart updated after blocking category', {
          controller: 'category',
          action: 'blockCategory',
          cartId: cart._id,
          categoryName
        });

      }
    }

    res.redirect('/category');
  } catch (error) {
    errorLogger.error('Error blocking category data', {
      controller: 'category',
      action: 'blockCategory',
      error: error.message
    });
    next(error);
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
      
      apiLogger.info('Category updated successfully', {
        controller: 'category',
        action: 'updateCategory',
        categoryId, 
        categoryName: category.name
      });

      res.redirect('/category?success=2')
    }
   
  } catch (error) {
    errorLogger.error('Error updating category data', {
      controller: 'category',
      action: 'updateCategory',
      error: error.message
    });
    next(error);
  }
};


module.exports = {getCategory, postCategory, unblockCategory, blockCategory, updateCategory}