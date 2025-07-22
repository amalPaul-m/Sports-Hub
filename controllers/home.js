const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')


const getHome = async function (req, res, next) {

  if (!req.isAuthenticated() && !req.session.user) {  
    return res.redirect('/login');
  }

  try {

    const category = await productTypesSchema.find({ status: "active" }).sort({ _id: 1 });
    const products = await productsSchema.find({ isActive: true }).sort({ updatedAt: -1 }).limit(4);

    const discountProducts = await productsSchema.find({
      isActive: true, $expr: {
        $lte: ["$salePrice",
          { $multiply: ["$regularPrice", 0.5] }]
      }
    }).limit(4);

    res.render('home',
      {
        products,
        discountProducts
      });

  } catch (err) {

    err.message = 'Cant access category or products';
    next(err);

  }
};

module.exports = { getHome }