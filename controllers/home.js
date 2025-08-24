const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const cartSchema = require('../models/cartSchema');
const usersSchema = require('../models/usersSchema');
const wishlistSchema = require('../models/wishlistSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');


const getHome = async function (req, res, next) {

  if (!req.isAuthenticated() && !req.session.user) {
    return res.redirect('/login');
  }

  try {

    const [category, products, discountProducts] = await Promise.all([
      productTypesSchema.find({ status: "active" }).sort({ _id: 1 }),
      productsSchema.find({ isActive: true }).sort({ updatedAt: -1 }).limit(4),
      productsSchema.find({
        isActive: true, $expr: {
          $lte: ["$salePrice",
            { $multiply: ["$regularPrice", 0.5] }]
        }
      }).limit(4)
    ]);


    res.render('home',
      {
        products,
        category,
        discountProducts
      });


  } catch (error) {

    errorLogger.error('Error fetching home data', {
      controller: 'home',
      action: 'getHome',
      error: error.message
    });
    next(error);

  }
};


const getHomeBadge = async (req, res, next) => {

  try {

    const email = req.session.users?.email;
    const userData = await usersSchema.findOne({ email: email });
    const userId = userData._id;
    if (!userId) return res.json({ wishlistCount: 0, cartCount: 0 });

    const [cart, wishlist] = await Promise.all([
      cartSchema.findOne({ userId }),
      wishlistSchema.findOne({ userId })
    ]);

    const cartCount = cart?.items?.length || 0;
    const wishlistCount = wishlist?.productId?.length || 0;

    res.json({ 'wishlistCount': wishlistCount, 'cartCount': cartCount });

  } catch (error) {

    errorLogger.error('Error fetching home badge data', {
      controller: 'home',
      action: 'getHomeBadge',
      error: error.message
    });
    next(error);

  }

};


module.exports = { getHome, getHomeBadge }