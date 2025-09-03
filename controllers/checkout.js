const addressSchema = require('../models/addressSchema');
const usersSchema = require('../models/usersSchema');
const cartSchema = require('../models/cartSchema');
const ordersSchema = require('../models/ordersSchema');
const walletSchema = require('../models/walletSchema');
const mongoose = require('mongoose');
const productsSchema = require('../models/productsSchema');
const generateOrderId = require('../helpers/generateOrderId');
const razorpayInstance = require('../configuration/razorpay');
const transactionSchema = require('../models/transactionSchema');
const couponSchema = require('../models/couponSchema');
const stockHoldSchema = require('../models/stockHoldSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getCheckout = async (req, res, next) => {

  try {
    const email = req.session.users?.email;
    if (!email) return res.redirect('/login');

    const usersData = await usersSchema.findOne({ email });
    if (!usersData) return res.redirect('/login');

    const user = usersData._id;

    const cartItem = await cartSchema.findOne({ userId: user }).populate('items.productId');
    if (!cartItem || !cartItem?.items?.length) {
      return res.redirect('/cart?error=empty_cart');
    }

    const unavailableItems = [];

    for (const item of cartItem.items) {
      const product = item.productId;

      const matchingVariant = product?.variants?.find(variant =>
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
    
    // Hold the stock quantity when complete the payment

    let stockHoldData = await stockHoldSchema.findOne({ userId: user });

for (const product of cartItem.items) {
  const productId = product.productId;
  const color = product.color;
  const size = product.size;
  const quantity = product.quantity;

  if (!stockHoldData) {
    stockHoldData = new stockHoldSchema({
      userId: user,
      items: [{ productId, quantity, color, size }]
    });
    await stockHoldData.save();
  } else {
    // Check if this variant already exists in hold
    const existingItem = stockHoldData.items.find(
      (i) =>
        String(i.productId) === String(productId) &&
        i.color === color &&
        i.size === size
    );

    if (existingItem) {
      // Just update the quantity
      existingItem.quantity += quantity;
    } else {
      stockHoldData.items.push({ productId, quantity, color, size });
    }

    await stockHoldData.save();
  }
}



    const addressData = await addressSchema.find({ userId: user });

    res.render('checkout', { addressData });

  } catch (error) {
    errorLogger.error('Error in getCheckout:', {
      message: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'getCheckout',
      userId: req.session.users?._id || null
    });
    next(error);
  }
};


const postCheckout = async (req, res, next) => {

  const addressId = req.body;

  if (!addressId) {
    return res.status(400).send('Address not selected');
  }

  req.session.selectedAddressId = addressId;

  res.redirect('/checkout/confirm');
};


const getConfirm = async (req, res, next) => {

  try {

    const rawAddress = req.session.selectedAddressId;
    const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.redirect('/login')
    }

    const validAddressId = new mongoose.Types.ObjectId(addressId);
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });
    const user = usersData._id;




    const cart = await cartSchema.findOne({ userId: user }).populate('items.productId');
    const stockHoldData = await stockHoldSchema.findOne({ userId: user });
    if ((!stockHoldData || !stockHoldData.items?.length) && (!cart || !cart.items?.length))  {
      return res.redirect('/cart?error=empty_cart');
    }

    const unavailableItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      const matchingVariant = product?.variants?.find(variant =>
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






    const [cartItem, orderAddress] = await Promise.all([

      cartSchema.findOne({ userId: user }).populate('items.productId'),
      addressSchema.findById(validAddressId)

    ]);

    if (!cartItem) {
      res.redirect('/cart');
    }

    let totalAmount = cartItem?.items?.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const tax = Math.round(totalAmount - (totalAmount / 1.18));
    const net = parseFloat(Math.round(totalAmount / 1.18));


    // COUPON HANDLING

    const code = req.session.couponCode;

    let payableAmount = 0;
    let discountAmount = 0;


    if (code) {

      const couponData = await couponSchema.findOne({ code: code });

      if (couponData.discountAmount !== null) {

        payableAmount = totalAmount - couponData.discountAmount;
        discountAmount = couponData.discountAmount;

      } else if (couponData.discountPercentage !== null) {

        discountAmount = Math.floor((couponData.discountPercentage / 100) * totalAmount);
        if(discountAmount > 5000) {
          // discountAmount = 5000;
          const discountPer = Math.floor((5000/totalAmount)*100);
          discountAmount = Math.floor((discountPer/100)*totalAmount);
        }
        payableAmount = Math.floor(totalAmount - discountAmount);
      }

    } else {
      payableAmount = totalAmount;
      discountAmount = 0;
    }

    let shipping;
    if (payableAmount < 1000) {

      shipping = req.session.shippingCharge;
      payableAmount = payableAmount + shipping;
      totalAmount = totalAmount + shipping;

    } else {
      shipping = '0';
    }
    req.session.payableAmount = payableAmount;

    res.render('confirm', {
      cartItem, orderAddress,
      totalAmount, tax, net, payableAmount, discountAmount, code, shipping
    });

  } catch (error) {
    errorLogger.error('Error in getConfirm:', {
      message: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'getConfirm',
      userId: req.session.users?._id || null
    });
    next(error);
  }
};


const postConfirm = async (req, res, next) => {

  res.redirect('/checkout/payment');

};

const removeConfirm = (req, res, next) => {

  delete req.session.couponCode;
  res.redirect('/checkout/confirm');

};

const getPayment = async (req, res, next) => {

  const email = req.session.users?.email;
  if (!email) return res.redirect('/login');

  const usersData = await usersSchema.findOne({ email });
  if (!usersData) return res.redirect('/login');

  const user = usersData._id;

    const cart = await cartSchema.findOne({ userId: user }).populate('items.productId');
    const stockHoldData = await stockHoldSchema.findOne({ userId: user });
    if ((!stockHoldData || !stockHoldData.items?.length) && (!cart || !cart.items?.length))  {
      return res.redirect('/cart?error=empty_cart');
    }

    const unavailableItems = [];

    for (const item of cart.items) {
      const product = item.productId;

      const matchingVariant = product?.variants?.find(variant =>
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



  const wallet = await walletSchema.findOne({ userId: usersData._id });
  const walletBalance = wallet ? wallet.balance : 0;

  res.render('payment', {
    razorpayKey: process.env.RAZORPAY_API_KEY,
    walletBalance
  });
};

const postPayment = async (req, res, next) => {

  try {

    if (req.session.payableAmount > 1000) {

      return res.render('payment', { message: 'Cash on Delivery not applicable for order value greater than ₹1000' });

    }

    const rawAddress = req.session.selectedAddressId;
    const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.redirect('/login')
    }

    const orderId = await generateOrderId();

    const validAddressId = new mongoose.Types.ObjectId(addressId);
    const paymentType = 'COD';
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });
    const user = usersData._id;
    const cartItem = await cartSchema.findOne({ userId: user });

    const totalAmount = cartItem?.items?.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const discount = Math.floor(totalAmount - req.session.payableAmount);

    const couponData = await couponSchema.findOne({ code: req.session.couponCode });

    const newOrder = new ordersSchema({
      orderId,
      userId: user,
      deliveryStatus: 'pending',
      productInfo: cartItem.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        regularPrice: item.regularPrice,
        color: item.color,
        size: item.size,
      })),
      addressId: validAddressId,
      paymentInfo: {
        totalAmount: req.session.payableAmount,
        paymentMethod: paymentType,
        paymentStatus: paymentType === 'COD' ? 'unpaid' : 'paid',
        // transactionId: paymentType === 'Razorpay' ? req.session.razorpayPaymentId  : null
      },
      couponInfo: {
        couponCode: req.session.couponCode || null,
        discount: discount || 0,
        discountAmount: couponData ? couponData.discountAmount : 0,
        discountPercentage: couponData ? couponData.discountPercentage : 0
      }
    });

    await newOrder.save();

    apiLogger.info('Order created successfully', {
      controller: 'checkout',
      action: 'postPayment',
      orderId: newOrder.orderId,
      userId: user,
      couponCode: req.session.couponCode || null,
      totalAmount: req.session.payableAmount,
      paymentMethod: paymentType
    });

    if (req.session.couponCode) {
      await couponSchema.findOneAndUpdate({ code: req.session.couponCode },
        { $inc: { balance: -1 } }
      );
    }

    delete req.session.payableAmount;
    delete req.session.couponCode;
    delete req.session.shippingCharge;

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
    delete req.session.shippingCharge;


    res.render('ordersuccess');

  } catch (error) {
    errorLogger.error('Error in postPayment:', {
      message: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'postPayment',
      userId: req.session.users?._id || null
    });
    next(error);
  }

};



const postWallet = async (req, res, next) => {

  try {
    const email = req.session.users?.email;
    const userData = await usersSchema.findOne({ email });
    const user = userData._id;
    const wallet = await walletSchema.findOne({ userId: user });


    const rawAddress = req.session.selectedAddressId;
    const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      res.redirect('/login')
    }

    const orderId = await generateOrderId();

    const validAddressId = new mongoose.Types.ObjectId(addressId);
    const paymentType = 'wallet';
    const cartItem = await cartSchema.findOne({ userId: user });

    const totalAmount = cartItem?.items?.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    let discount = Math.floor(totalAmount - req.session.payableAmount);

    if (!wallet || wallet.balance < totalAmount) {
      return res.json({ success: false, message: 'Sorry! Insufficient Wallet Balance' });
    }


    await walletSchema.updateOne(
      { userId: user._id },
      {
        $inc: { balance: -req.session.payableAmount },
        $push: {
          transaction: {
            type: 'deduct',
            amount: req.session.payableAmount,
            description: 'Deduction for purchase'
          }
        }
      });

    const couponData = await couponSchema.findOne({ code: req.session.couponCode });

    let discountPer = couponData ? couponData.discountPercentage : 0
    
    if(discount >= 4500) {
        discountPer = Math.floor((5000/totalAmount)*100);
        discount = Math.floor((discountPer/100)*totalAmount);
    }
    


    const newOrder = new ordersSchema({
      orderId,
      userId: user,
      deliveryStatus: 'pending',
      productInfo: cartItem.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        regularPrice: item.regularPrice,
        color: item.color,
        size: item.size,
      })),
      addressId: validAddressId,
      paymentInfo: {
        totalAmount: req.session.payableAmount,
        paymentMethod: paymentType,
        paymentStatus: 'paid'
      },
      couponInfo: {
        couponCode: req.session.couponCode || null,
        discount: discount || 0,
        discountAmount: couponData?.discountAmount || 0,
        discountPercentage: discountPer
      }
    });

    await newOrder.save();

    apiLogger.info('Order created successfully', {
      controller: 'checkout',
      action: 'postWallet',
      orderId: newOrder.orderId,
      userId: user,
      couponCode: req.session.couponCode || null,
      totalAmount: req.session.payableAmount,
      paymentMethod: paymentType
    });

    if (req.session.couponCode) {
      await couponSchema.findOneAndUpdate({ code: req.session.couponCode },
        { $inc: { balance: -1 } }
      );
    }

    delete req.session.payableAmount;
    delete req.session.couponCode;
    delete req.session.shippingCharge;

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


    res.json({ success: true });

    await cartSchema.updateOne({ userId: user }, { $set: { items: [] } });
    delete req.session.selectedAddressId;
    delete req.session.selectedPaymentType;
    delete req.session.shippingCharge;



  } catch (error) {
    errorLogger.error('Error in postWallet:', {
      message: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'postWallet',
      userId: req.session.users?._id || null
    });
    next(error);
  }
}



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


      const rawAddress = req.session.selectedAddressId;
      const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

      if (!mongoose.Types.ObjectId.isValid(addressId)) {
        res.redirect('/login')
      }

      const validAddressId = new mongoose.Types.ObjectId(addressId);

      let discount = Math.floor(totalAmount - req.session.payableAmount);

      const couponData = await couponSchema.findOne({ code: req.session.couponCode });

      let discountPer = couponData ? couponData.discountPercentage : 0
    
      if(discount >= 4500) {
          discountPer = Math.floor((5000/totalAmount)*100);
          discount = Math.floor((discountPer/100)*totalAmount);
      }

      const orderId = await generateOrderId();

      const newOrderOnline = new ordersSchema({
        orderId,
        userId: user,
        deliveryStatus: 'pending',
        orderStatus: 'cancelled',
        productInfo: cartItem.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.price,
          regularPrice: item.regularPrice,
          color: item.color,
          size: item.size,
        })),
        addressId: validAddressId,
        paymentInfo: [],
        couponInfo: {
          couponCode: req.session.couponCode || null,
          discount: discount || 0,
          discountAmount: couponData?.discountAmount || 0,
          discountPercentage: discountPer
        }
      });

      const savedOrder = await newOrderOnline.save();
      await cartSchema.updateOne({ userId: user }, { $set: { items: [] } });
      req.session.razorpayOrderId = savedOrder.orderId;



    const options = {
      amount: req.session.payableAmount * 100, // in paisa
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
    errorLogger.error('Failed to create Razorpay order', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'createRazorpayOrder',
      userId: req.session.users?._id || null
    });
    next(error);
  }
};


const retryRazorpayOrder = async (req, res, next) => {
  try {

    const { orderId } = req.body;

    const orderData = await ordersSchema.findById(orderId);

    const totalAmount = orderData.productInfo.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const finalAmount = Math.floor(totalAmount - orderData.couponInfo[0]?.discount);

    const options = {
      amount: finalAmount * 100, // in paisa
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`
    };
  console.log(options);
    const order = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency
    });

  }
  catch (error) {
    errorLogger.error('Failed to retry Razorpay order', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'retryRazorpayOrder',
      userId: req.session.users?._id || null
    });
    next(error);
  }
};



const getRazorpaySuccess = async (req, res, next) => {
  try {
    const { payment_id, order_id, orderId } = req.query;

    const payment = await razorpayInstance.payments.fetch(payment_id);

    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });
    const user = usersData._id;

    if (payment.status === 'captured') {

      req.session.selectedPaymentType = 'online';
      req.session.razorpayPaymentId = payment_id;
      req.session.razorpayTransactonOrderId = order_id;


      // const rawAddress = req.session.selectedAddressId;
      // const addressId = typeof rawAddress === 'object' ? rawAddress.addressId : rawAddress;

      // if (!mongoose.Types.ObjectId.isValid(addressId)) {
      //   res.redirect('/login')
      // }

      // const orderId = await generateOrderId();

      
      const orderNumber = !orderId ? req.session.razorpayOrderId : orderId;

      await ordersSchema.findOneAndUpdate(
      { orderId: orderNumber },
      {
        $set: {
          // orderId: orderId,
          orderStatus: 'confirmed'
        },
        $push: {
          paymentInfo: {
            totalAmount: req.session.payableAmount,
            paymentMethod: req.session.selectedPaymentType,
            paymentStatus: req.session.selectedPaymentType === 'COD' ? 'unpaid' : 'paid',
            transactionId: req.session.selectedPaymentType === 'online' ? req.session.razorpayPaymentId : null
          }
        }
      },
      { new: true }
    );

      // const validAddressId = new mongoose.Types.ObjectId(addressId);
      // const email = req.session.users?.email;
      // const usersData = await usersSchema.findOne({ email });
      // const user = usersData._id;
      // const cartItem = await cartSchema.findOne({ userId: user });

      // const totalAmount = cartItem.items.reduce((sum, item) => {
      //   return sum + item.price * item.quantity;
      // }, 0);

      // const discount = Math.floor(totalAmount - req.session.payableAmount);

      // const couponData = await couponSchema.findOne({ code: req.session.couponCode });

      // const newOrderOnline = new ordersSchema({
      //   orderId,
      //   userId: user,
      //   deliveryStatus: 'pending',
      //   productInfo: cartItem.items.map(item => ({
      //     productId: item.productId._id,
      //     quantity: item.quantity,
      //     price: item.price,
      //     regularPrice: item.regularPrice,
      //     color: item.color,
      //     size: item.size,
      //   })),
      //   addressId: validAddressId,
      //   paymentInfo: {
      //     totalAmount: req.session.payableAmount,
      //     paymentMethod: req.session.selectedPaymentType,
      //     paymentStatus: req.session.selectedPaymentType === 'COD' ? 'unpaid' : 'paid',
      //     transactionId: req.session.selectedPaymentType === 'online' ? req.session.razorpayPaymentId : null
      //   },
      //   couponInfo: {
      //     couponCode: req.session.couponCode || null,
      //     discount: discount || 0,
      //     discountAmount: couponData?.discountAmount || 0,
      //     discountPercentage: couponData?.discountPercentage || 0
      //   }
      // });

      // const savedOrder = await newOrderOnline.save();

      apiLogger.info('Order created successfully', {
        controller: 'checkout',
        action: 'getRazorpaySuccess'
      });


      if (req.session.couponCode) {
        await couponSchema.findOneAndUpdate({ code: req.session.couponCode },
          { $inc: { balance: -1 } }
        );
      }

      delete req.session.payableAmount;
      delete req.session.couponCode;
      delete req.session.shippingCharge;
      delete req.session.razorpayOrderId;

      //update quantity

      const newOrderOnline = await ordersSchema.findOne({orderId: orderNumber});

      if (!newOrderOnline) {
        throw new Error(`Order not found in DB for orderId: ${orderNumber}`);
      }

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
        userId: newOrderOnline.userId,
        orderId: newOrderOnline.orderId,
        paymentMethod: 'online',
        paymentId: req.session.razorpayPaymentId,
        orderid: req.session.razorpayTransactonOrderId,
        amount: newOrderOnline.paymentInfo?.[0]?.totalAmount,
        status: 'captured'
      });

      // await cartSchema.updateOne({ userId: user }, { $set: { items: [] } });
      delete req.session.selectedAddressId;
      delete req.session.selectedPaymentType;
      delete req.session.shippingCharge;

      res.render('ordersuccess');


    } else {

      await transactionSchema.create({
        userId: user,
        orderId: orderId,
        paymentMethod: 'online',
        paymentId: req.session.razorpayPaymentId,
        orderid: req.session.razorpayOrderId,
        amount: totalAmount,
        status: 'failed'
      });

      res.render('orderfailed');
    }



  } catch (error) {
    errorLogger.error('Failed to get Razorpay success', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'checkout',
      action: 'getRazorpaySuccess',
      userId: req.session.users?._id || null
    });
    next(error);
  }
};


const getRazorpayFailure = (req, res, next) => {

  const paymentType = req.query.payment;
  if (paymentType === 'retry') {
    res.render('orderfailedretry');
  }else {
    res.render('orderfailed');
  }

};



const getSuccess = (req, res, next) => {

  res.render('ordersuccess');

};

module.exports = {
  getCheckout, postCheckout, getPayment, postPayment,
  getConfirm, postConfirm, createRazorpayOrder, getRazorpaySuccess,
  getRazorpayFailure, postWallet, getSuccess, removeConfirm, retryRazorpayOrder
}