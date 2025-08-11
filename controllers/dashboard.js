const ordersSchema = require('../models/ordersSchema');
const usersSchema = require('../models/usersSchema');
const returnSchema = require('../models/returnSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getDashboard = async (req, res, next) => {

  try {

  if (!req.session.isAdmin) {
    console.log(req.session.isAdmin)
    return res.redirect('/admin');
  }

    const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
    const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

    const query = {
      deliveryStatus: { $ne: "cancel" }
    };

    if (fromDate && toDate) {
      toDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: fromDate, $lte: toDate };
    }

    const ordersData = await ordersSchema.find(query);

  let sum = 0;
  let totalSale = 0;
  for(let orders of ordersData){
    for(let products of orders.productInfo){
      if(products.status==='confirmed'){
        sum += products.price * products.quantity;
      }
    }
    totalSale = sum - orders.couponInfo[0]?.discount;
  }

  const [orderCount, usersCount, returnCount] = await Promise.all([
    ordersSchema.countDocuments(query),
    usersSchema.countDocuments(query),
    returnSchema.countDocuments(query)
  ]);


  const matchStage = {
  'productInfo.status': 'confirmed'
  };

  if (fromDate && toDate) {
    matchStage.createdAt = { $gte: fromDate, $lte: toDate };
  }


  const [topCategories, topSellingProducts, topSellingBrands] = await Promise.all([
    
  ordersSchema.aggregate([{ $unwind: '$productInfo' },
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
]),

ordersSchema.aggregate([
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
]),

ordersSchema.aggregate([

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
])
]);



const monthlyTotals = Array(12).fill(0); 

for (let order of ordersData) {
  let orderTotal = 0;

  for (let product of order.productInfo) {
    if (product.status === 'confirmed') {
      orderTotal += product.price * product.quantity;
    }
  }

  const discount = order.couponInfo?.[0]?.discountAmount || 0;
  const netTotal = orderTotal - discount;

  const monthIndex = new Date(order.createdAt).getMonth(); 
  monthlyTotals[monthIndex] += netTotal;
}



  
  res.render('dashboard', { totalSale, orderCount, usersCount, 
    returnCount, topCategories, topSellingProducts, topSellingBrands, monthlyTotals,
    fromDate: req.query.fromDate || '',
    toDate: req.query.toDate || '' 
  });

} catch (error){
    errorLogger.error('Error fetching dashboard data', {
        error: error.message,
        controller: 'dashboard',
        action: 'getDashboard'
    });
    next(error);
}
}

module.exports = { getDashboard }