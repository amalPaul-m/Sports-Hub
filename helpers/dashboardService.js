const ordersSchema = require('../models/ordersSchema');

async function getTopCategories(matchStage) {
  return ordersSchema.aggregate([
    { $unwind: '$productInfo' },
    { $match: matchStage },
    {
      $lookup: {
        from: 'products',
        localField: 'productInfo.productId',
        foreignField: '_id',
        as: 'productDetails'
      }
    },
    { $unwind: '$productDetails' },
    {
      $group: {
        _id: '$productDetails.category',
        totalSold: { $sum: '$productInfo.quantity' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        category: '$_id',
        totalSold: 1
      }
    }
  ]);
}

async function getTopSellingProducts(matchStage) {
  return ordersSchema.aggregate([
    { $unwind: "$productInfo" },
    { $match: matchStage },
    {
      $group: {
        _id: "$productInfo.productId",
        totalSold: { $sum: "$productInfo.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$productInfo.quantity", "$productInfo.price"] }
        }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        _id: 0,
        productId: "$_id",
        productName: "$productDetails.productName",
        firstImage: { $arrayElemAt: ["$productDetails.imageUrl", 0] },
        totalSold: 1,
        totalRevenue: 1
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);
}

async function getTopSellingBrands(matchStage) {
  return ordersSchema.aggregate([
    { $unwind: "$productInfo" },
    { $match: matchStage },
    {
      $group: {
        _id: "$productInfo.productId",
        totalSold: { $sum: "$productInfo.quantity" }
      }
    },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product"
      }
    },
    { $unwind: "$product" },
    {
      $group: {
        _id: "$product.brandName",
        totalSold: { $sum: "$totalSold" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 },
    {
      $project: {
        _id: 0,
        brandName: "$_id",
        totalSold: 1
      }
    }
  ]);
}

module.exports = {
  getTopCategories,
  getTopSellingProducts,
  getTopSellingBrands
};
