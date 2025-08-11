const productsSchema = require('../models/productsSchema');
const productTypesSchema = require('../models/productTypesSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getIndex = async function (req, res, next) {

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

    res.render('index',
      {
        category,
        products,
        discountProducts
      });

  } catch (error) {

    errorLogger.error('Error fetching index data', {
      controller: 'index',
      action: 'getIndex',
      error: error.message
    });
    next(error);

  }
};

module.exports = { getIndex }