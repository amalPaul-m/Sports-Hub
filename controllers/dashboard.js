const ordersSchema = require('../models/ordersSchema');
const usersSchema = require('../models/usersSchema');
const returnSchema = require('../models/returnSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');
const {getTopCategories,getTopSellingProducts, getTopSellingBrands} = 
require('../helpers/dashboardService');

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
      getTopCategories(matchStage),
      getTopSellingProducts(matchStage),
      getTopSellingBrands(matchStage)
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