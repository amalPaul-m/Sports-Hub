const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')

const getIndex = async function (req, res, next) {

  try {

    const category = await productTypesSchema.find({ status: "active" }).sort({ _id: 1 });
    const products = await productsSchema.find({ isActive: true }).sort({ updatedAt: -1 }).limit(4);

    const discountProducts = await productsSchema.find({
      isActive: true, $expr: {
        $lte: ["$salePrice",
          { $multiply: ["$regularPrice", 0.5] }]
      }
    }).limit(4);

    res.render('index',
      {
        category,
        products,
        discountProducts
      });

  } catch (err) {

    err.message = 'cant access category data';
    next(err);

  }
};

module.exports = { getIndex }