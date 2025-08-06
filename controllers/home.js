const productsSchema = require('../models/productsSchema')
const productTypesSchema = require('../models/productTypesSchema')
// const cartSchema = require('../models/cartSchema');
// const usersSchema = require('../models/usersSchema');


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


    
      // const email = req.session.email;
      // const userId = await usersSchema.findOne({email: email});
      // const id = userId._id;
      // const cartItemCount = await cartSchema.findOne({userId: id});
      // const total = cartItemCount.items;
      // const itemLength = total.length;
      // console.log('Total Count :', itemLength);

    res.render('home',
      {
        products,
        category,
        discountProducts
      });



  } catch (err) {

    err.message = 'Cant access category or products';
    next(err);

  }
};





module.exports = { getHome }