const addressSchema = require('../models/addressSchema');
const usersSchema = require('../models/usersSchema');
const cartSchema = require('../models/cartSchema');
const ordersSchema = require('../models/ordersSchema');
const mongoose = require('mongoose');
const productsSchema = require('../models/productsSchema');
const generateOrderId = require('../helpers/generateOrderId');
const razorpayInstance = require('../configuration/razorpay');
const transactionSchema = require('../models/transactionSchema');

const getCheckout = async (req,res,next) => {
  
  try {
    const email = req.session.users?.email;
    if (!email) return res.redirect('/login');

    const usersData = await usersSchema.findOne({ email });
    if (!usersData) return res.redirect('/login');

    const user = usersData._id;

    const cartItem = await cartSchema.findOne({ userId: user }).populate('items.productId');
    if (!cartItem || !cartItem.items.length) {
      return res.redirect('/cart?error=empty_cart');
    }

    const unavailableItems = [];

    for (const item of cartItem.items) {
      const product = item.productId;

      const matchingVariant = product.variants.find(variant =>
        String(variant.size).trim().toLowerCase() === String(item.size).trim().toLowerCase() &&
        String(variant.color).replace('#', '').trim().toLowerCase() === String(item.color).replace('#', '').trim().toLowerCase() &&
        Number(variant.stockQuantity) >= Number(item.quantity)
      );


      if (!matchingVariant) {
        unavailableItems.push({
          productId: product._id,
          name: product.name,
          size: item.size,
          color: item.color,
          quantity: item.quantity
        });
      }
    }

    if (unavailableItems.length > 0) {
      return res.redirect('/cart?error=out_of_stock');
    }

    const addressData = await addressSchema.find({ userId: user });

    res.render('checkout', {
      cssFile: '/stylesheets/checkout.css',
      jsFile: '/javascripts/checkout.js',
      addressData
    });

  } catch (err) {
    err.message = 'Failed to load checkout page';
    console.error(err);
    next(err);
  }


    // const email = req.session.users?.email;
    // const usersData = await usersSchema.findOne({ email });
    // const user = usersData._id;
    // const addressData = await addressSchema.find({userId: user});
    // console.log(addressData);

    // res.render('checkout', {cssFile: '/stylesheets/checkout.css', 
    //     jsFile: '/javascripts/checkout.js', addressData
    // });

};

const postCheckout = async (req,res,next) => {

const addressId = req.body;

if (!addressId) {
    return res.status(400).send('Address not selected');
  }

req.session.selectedAddressId = addressId;
// res.redirect('/checkout/payment');
res.redirect('/checkout/confirm');

};

const getConfirm = async (req,res,next) => {

    try {

     const rawAddress = req.session.selectedAddressId;
    const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.redirect('/login')
    }
    
    const validAddressId = new mongoose.Types.ObjectId(addressId);
    // const paymentType = req.session.selectedPaymentType;
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });
    const user = usersData._id;


    const cartItem = await cartSchema.findOne({userId: user}).populate('items.productId');
    const orderAddress = await addressSchema.findById(validAddressId); 

    if(!cartItem){
        res.redirect('/cart');
    }

    const totalAmount = cartItem.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
        }, 0);

    const tax = Math.round(totalAmount-(totalAmount/1.18)); 
    const netAmount = parseFloat(Math.round(totalAmount/1.18));

    res.render('confirm', {cssFile: '/stylesheets/confirm.css', cartItem, orderAddress, 
        totalAmount, tax, netAmount});

  } catch(err) {
        err.message = 'not get data';  
        console.log(err)
        next(err);
  }
};


const postConfirm = async (req,res,next) => {

  //  const paymentType = req.body.payment;

  //   if (!paymentType) {
  //   return res.status(400).send('PaymentType not selected');
  // }

  //   req.session.selectedPaymentType = paymentType;
    res.redirect('/checkout/payment');
    

};

const getPayment = async (req,res,next) => {
    res.render('payment',{cssFile: '/stylesheets/payment.css', 
        jsFile: '/javascripts/payment.js',
        razorpayKey: process.env.RAZORPAY_API_KEY
    });
};

const postPayment = async (req,res,next) => {

  try {

    const rawAddress = req.session.selectedAddressId;
    const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.redirect('/login')
    }

    // const lastOrder = await ordersSchema.findOne().sort({ orderId: -1 }).select('orderId');
    // const newOrderId = lastOrder ? lastOrder.orderId + 1 : 11111111;
    const orderId = await generateOrderId();

    const validAddressId = new mongoose.Types.ObjectId(addressId);
    const paymentType = 'COD';
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });
    const user = usersData._id;
    const cartItem = await cartSchema.findOne({ userId: user });

    const totalAmount = cartItem.items.reduce((sum, item) => {
        return sum + item.price * item.quantity;
        }, 0);



    const newOrder = new ordersSchema({
      orderId,
      userId: user,
      deliveryStatus: 'pending',
      productInfo: cartItem.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price : item.price,
        color: item.color,
        size: item.size,
      })),
      addressId: validAddressId,
      paymentInfo: {
        totalAmount: totalAmount,
        paymentMethod: paymentType,
        paymentStatus: paymentType === 'COD' ? 'unpaid' : 'paid',
        // transactionId: paymentType === 'Razorpay' ? req.session.razorpayPaymentId  : null
      }
    });

    await newOrder.save();

    //update quantity

    for (const item of newOrder.productInfo) {
      const normalizedColor = String(item.color).replace('#', '').trim().toLowerCase();
      const normalizedSize = String(item.size).trim().toLowerCase();

      const updateResult = await productsSchema.updateOne(
        {
          _id: item.productId,
          "variants.color": { $regex: new RegExp(`^#?${normalizedColor}$`, 'i') },
          "variants.size": { $regex: new RegExp(`^${normalizedSize}$`, 'i') }
        },
        {
          $inc: { "variants.$.stockQuantity": -item.quantity }
        }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Failed to update stock for product ${item.productId}`);
      }
    }


    await cartSchema.updateOne({ userId: user }, { $set: { items: [] } });
    delete req.session.selectedAddressId;
    delete req.session.selectedPaymentType;
    

    res.render('ordersuccess');

    } catch(err) {
        err.message = 'not save data';  
        console.log(err)
        next(err);
    }

};







const createRazorpayOrder = async (req, res, next) => {
    try {
        const email = req.session.users?.email;

        if (!email) {
            return res.status(401).json({ error: 'Unauthorized: No email in session' });
        }

        const usersData = await usersSchema.findOne({ email });
        if (!usersData) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = usersData._id;

        const cartItem = await cartSchema.findOne({ userId: user });
        if (!cartItem || !cartItem.items.length) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        const totalAmount = cartItem.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);

        const options = {
            amount: totalAmount * 100, // in paisa
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.log(error);
        next(error);
    }
};



const getRazorpaySuccess = async (req, res, next) => {
    try {
        const { payment_id, order_id } = req.query;

        const payment = await razorpayInstance.payments.fetch(payment_id);

        if( payment.status === 'captured') {

        req.session.selectedPaymentType = 'online';
        req.session.razorpayPaymentId = payment_id;
        req.session.razorpayOrderId = order_id;
            
        const rawAddress = req.session.selectedAddressId;
        const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

        if (!mongoose.Types.ObjectId.isValid(addressId)) {
          res.redirect('/login')
        }

        const orderId = await generateOrderId();

        const validAddressId = new mongoose.Types.ObjectId(addressId);
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });
        const user = usersData._id;
        const cartItem = await cartSchema.findOne({ userId: user });

        const totalAmount = cartItem.items.reduce((sum, item) => {
            return sum + item.price * item.quantity;
            }, 0);


        const newOrderOnline = new ordersSchema({
          orderId,
          userId: user,
          deliveryStatus: 'pending',
          productInfo: cartItem.items.map(item => ({
            productId: item.productId._id,
            quantity: item.quantity,
            price : item.price,
            color: item.color,
            size: item.size,
          })),
          addressId: validAddressId,
          paymentInfo: {
            totalAmount: totalAmount,
            paymentMethod: req.session.selectedPaymentType,
            paymentStatus: req.session.selectedPaymentType === 'COD' ? 'unpaid' : 'paid',
            transactionId: req.session.selectedPaymentType === 'online' ? req.session.razorpayPaymentId  : null
          }
        });

        await newOrderOnline.save();

        //update quantity

        for (const item of newOrderOnline.productInfo) {
          const normalizedColor = String(item.color).replace('#', '').trim().toLowerCase();
          const normalizedSize = String(item.size).trim().toLowerCase();

          const updateResult = await productsSchema.updateOne(
            {
              _id: item.productId,
              "variants.color": { $regex: new RegExp(`^#?${normalizedColor}$`, 'i') },
              "variants.size": { $regex: new RegExp(`^${normalizedSize}$`, 'i') }
            },
            {
              $inc: { "variants.$.stockQuantity": -item.quantity }
            }
          );

          if (updateResult.modifiedCount === 0) {
            throw new Error(`Failed to update stock for product ${item.productId}`);
          }
        }


        await transactionSchema.create({
            userId: user,
            orderId: orderId,
            paymentMethod: 'online',
            paymentId: req.session.razorpayPaymentId,
            orderid: req.session.razorpayOrderId,
            amount: totalAmount,
            status: 'captured'
        });

        await cartSchema.updateOne({ userId: user }, { $set: { items: [] } });
        delete req.session.selectedAddressId;
        delete req.session.selectedPaymentType;

        res.render('ordersuccess', {
            cssFile: '/stylesheets/ordersuccess.css',
            jsFile: '/javascripts/ordersuccess.js'
          });


        }else {

        await transactionSchema.create({
            userId: user, 
            orderId: orderId,
            paymentMethod: 'online',
            paymentId: req.session.razorpayPaymentId,
            orderid: req.session.razorpayOrderId,
            amount: totalAmount,
            status: 'failed'
        });

            res.render('orderfailed', {
            cssFile: '/stylesheets/paymentcancelled.css',
            jsFile: '/javascripts/paymentcancelled.js'
            });
        }

        

    } catch (error) {
        next(error);
    }
};


const getRazorpayFailure = (req, res, next) => {
    res.render('orderfailed', {
        cssFile: '/stylesheets/paymentcancelled.css',
        jsFile: '/javascripts/paymentcancelled.js'
    });
};

module.exports = {getCheckout, postCheckout, getPayment, postPayment, 
  getConfirm, postConfirm, createRazorpayOrder, getRazorpaySuccess, getRazorpayFailure}