const usersSchema = require('../models/usersSchema');
const addressSchema = require('../models/addressSchema');
const ordersSchema = require('../models/ordersSchema');
const productsSchema = require('../models/productsSchema');
const returnSchema = require('../models/returnSchema');
const walletSchema = require('../models/walletSchema');
const reviewSchema = require('../models/reviewSchema');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const { apiLogger, errorLogger } = require('../middleware/logger');

const getyouraccount = async (req, res, next) => {

  try {
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    res.render('youraccount', {
      usersData,
      domainLink: process.env.DOMAIN_LINK
    });

  } catch (error) {
    errorLogger.error('Failed to get your account', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'getyouraccount'
    });
    next(error);
  }

};

const getyourprofile = async (req, res, next) => {

  try {
    const email = req.session.users?.email;
    const usersDetails = await usersSchema.findOne({ email });
    res.render('yourprofile', { usersDetails });

  } catch (error) {
    errorLogger.error('Failed to get your profile', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'getyourprofile'
    });
    next(error);
  }
};

const posteditprofile = async (req, res, next) => {

  try {

    const { name, email, phone } = req.body;

    await usersSchema.findOneAndUpdate(
      { email: email },
      { $set: { name: name, phone: phone } },
      { new: true }
    );

    apiLogger.info('Profile updated successfully', {
      controller: 'youraccount',
      action: 'posteditprofile',
      email: email
    });

    const usersDetails = await usersSchema.findOne({ email });

    res.render('yourprofile', { usersDetails });


  } catch (error) {
    errorLogger.error('Failed to edit profile', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'posteditprofile'
    });
    next(error);
  }

}


const getchangepassword = async (req, res, next) => {

  res.render('changepassword');

}


const patchchangepassword = async (req, res, next) => {

  try {

    const { oldpassword, newpassword } = req.body;
    const email = req.session.users?.email;

    const usersData = await usersSchema.findOne({ email });
    const match = await bcrypt.compare(oldpassword, usersData.password);
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    if (!match) {
      res.render('changepassword', { content: 'Invalid old passowrd' });
    } else {

      await usersSchema.findOneAndUpdate(
        { email: email },
        { $set: { password: hashedPassword } },
        { new: true }
      );

      apiLogger.info('Password changed successfully', {
        controller: 'youraccount',
        action: 'patchchangepassword',
        email: email
      });

      res.redirect('/logout?success=1');

    }
  } catch (error) {
    errorLogger.error('Failed to change password', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'patchchangepassword'
    });
    next(error);
  }
}





const getaddress = async (req, res, next) => {

  try {
    const email = req.session.users?.email;
    const userId = await usersSchema.find({ email });
    const addressData = await addressSchema.find({ userId });
    console.log(addressData)

    res.render('address', { addressData });

  } catch (error) {
    errorLogger.error('Failed to get address', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'getaddress'
    });
    next(error);
  }

};


const postaddress = async (req, res, next) => {

  try {

    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    const addressData = new addressSchema({
      userId: usersData._id,
      fullName: req.body?.fullName,
      mobileNumber: req.body?.mobileNumber,
      pinCode: req.body?.pinCode,
      street: req.body?.street,
      houseNo: req.body?.houseNo,
      district: req.body?.district,
      state: req.body?.state,
      landMark: req.body?.landMark,
      alternate_number: req.body?.alternate_number,
      addressType: req.body?.addressType
    });

    await addressData.save();

    apiLogger.info('Address added successfully', {
      controller: 'youraccount',
      action: 'postaddress',
      userId: usersData._id,
      addressType: req.body?.addressType
    });

    res.redirect('/youraccount/address');

  } catch (error) {
    errorLogger.error('Failed to add address', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'postaddress'
    });
    next(error);
  }
};


const editaddress = async (req, res, next) => {

  try {

    const addressId = req.body?.addressId;

    const editAddressData = {
      fullName: req.body?.fullName,
      mobileNumber: req.body?.mobileNumber,
      pinCode: req.body?.pinCode,
      street: req.body?.street,
      houseNo: req.body?.houseNo,
      district: req.body?.district,
      state: req.body?.state,
      landMark: req.body?.landMark,
      alternate_number: req.body?.alternate_number,
      addressType: req.body?.addressType
    };

    await addressSchema.findByIdAndUpdate(addressId, { $set: editAddressData }, { new: true });

    apiLogger.info('Address edited successfully', {
      controller: 'youraccount',
      action: 'editaddress',
      addressId: addressId,
      addressType: req.body?.addressType
    });

    res.redirect('/youraccount/address');

  } catch (error) {
    errorLogger.error('Failed to edit address', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'editaddress'
    });
    next(error);
  }
};


const deleteaddress = async (req, res, next) => {

  try {

    const addressId = req.body?.addressId;

    await addressSchema.findByIdAndDelete(addressId);

    apiLogger.info('Address deleted successfully', {
      controller: 'youraccount',
      action: 'deleteaddress',
      addressId: addressId
    });

    res.redirect('/youraccount/address');

  } catch (error) {
    errorLogger.error('Failed to delete address', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'deleteaddress'
    });
    next(error);
  }

};



const checkPinCode = async (req, res, next) => {
  try {
    const { pincode } = req.params;
    const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);

    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    errorLogger.error('Failed to check pin code', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'checkPinCode'
    });
    next(error);
  }
};




const getyourorders = async (req, res, next) => {
  try {
    const email = req.session.users?.email;

    const user = await usersSchema.findOne({ email });

    const userId = user._id;

    const reviewData = await reviewSchema.find({ userId: userId });
    const reviewMap = reviewData.map(r => r.productId.toString());

    const reviewDataMap = {};

    reviewData.forEach(review => {
      reviewDataMap[review.productId.toString()] = {
        rating: review.rating,
        comment: review.comment,
        imageUrl: review.imageUrl,
      };
    });

    console.log(reviewDataMap)

    // Pagination for undelivered
    const page = parseInt(req.query.page) || 1;
    const limit = 2;
    const skip = (page - 1) * limit;

    // Pagination for delivered
    const page1 = parseInt(req.query.page1) || 1;
    const limit1 = 2;
    const skip1 = (page1 - 1) * limit1;

    // Undelivered orders with at least one confirmed item
    const [orderData, totalOrders] = await Promise.all([
      ordersSchema.find({
        userId,
        deliveryStatus: { $nin: ['delivered', 'cancelled'] },
        "productInfo.status": "confirmed"
      })
        .populate('productInfo.productId')
        .populate('addressId')
        .populate('couponInfo')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      ordersSchema.countDocuments({
        userId,
        deliveryStatus: { $nin: ['delivered', 'cancelled'] },
        "productInfo.status": "confirmed"
      }),
    ]);


    // Delivered orders
    const [orderData1, totalOrders1] = await Promise.all([
      ordersSchema.find({
        userId,
        deliveryStatus: 'delivered',
        "productInfo.status": "confirmed"
      })
        .populate('productInfo.productId')
        .populate('addressId')
        .sort({ createdAt: -1 })
        .skip(skip1)
        .limit(limit1),

      ordersSchema.countDocuments({
        userId,
        deliveryStatus: 'delivered',
        "productInfo.status": "confirmed"
      }),
    ]);

    // Render only once
    res.render('yourorders', {
      orderData,
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      orderData1,
      currentPage1: page1,
      totalPages1: Math.ceil(totalOrders1 / limit1),
      reviewMap,
      reviewDataMap,
      razorpayKey: process.env.RAZORPAY_API_KEY
    });

  } catch (error) {
    errorLogger.error('Failed to get your orders', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'getyourorders'
    });
    next(error);
  }
};



const cancelorder = async (req, res, next) => {

  try {
    const orderId = String(req.params.orderId);
    const productSize = req.params.size;
    const productId = new mongoose.Types.ObjectId(req.params.productId);
    const reason = req.body?.reason === 'Others' ? req.body?.otherReason : req.body?.reason;
    const order = await ordersSchema.findOneAndUpdate(
      { orderId: orderId, "productInfo.productId": productId, "productInfo.size": productSize },
      {
        $set: {
          "productInfo.$.status": "cancelled",
          "productInfo.$.cancelReason": reason
        }
      },
      { new: true, runValidators: true }
    );


    if (!order) {
      return res.status(404).send('Order not found');
    }

    // Find the cancelled item
    const item = order.productInfo.find(p => {
      const pid = p.productId?._id || p.productId;
      return String(pid) === String(productId);
    });

    if (!item) return res.status(404).send('Item not found in order');

    const quantity = Number(item.quantity) || 0;
    if (quantity <= 0) return res.status(400).send('Invalid quantity to restore');

    const normalizedColor = String(item.color || '').replace('#', '').trim().toLowerCase();
    const normalizedSize = String(item.size || '').trim().toLowerCase();

    // Restore quantity to product variant
    const result = await productsSchema.updateOne(
      {
        _id: productId,
        variants: {
          $elemMatch: {
            color: { $regex: new RegExp(`^#?${normalizedColor}$`, 'i') },
            size: { $regex: new RegExp(`^${normalizedSize}$`, 'i') }
          }
        }
      },
      {
        $inc: { "variants.$.stockQuantity": quantity }
      }
    );


    // Check if all items in the order are cancelled
    const updatedOrder = await ordersSchema.findOne({ orderId });

    const allCancelled = updatedOrder.productInfo.every(p => p.status === "cancelled");

    if (allCancelled) {
      await ordersSchema.updateOne(
        { orderId },
        { $set: { deliveryStatus: "cancelled" } }
      );
    }

    //amount return to wallet

    if (order.paymentInfo?.[0]?.paymentMethod === 'online' || order.paymentInfo?.[0]?.paymentMethod === 'wallet') {

      const email = req.session.users?.email;
      const usersData = await usersSchema.findOne({ email });
      const totalAmount = item.price * item.quantity;
      let returnAmount = 0;
      const couponInfo = order.couponInfo?.[0];
      const discountAmount = couponInfo?.discountAmount;
      const discountPercentage = couponInfo?.discountPercentage;
      let discountDataAmount = 0;
      let discountDataPer = 0;

      if (discountAmount) {

        const discount = order.couponInfo?.[0]?.discountAmount;
        const count = order.productInfo?.length;
        const difference = discount / count;
        discountDataAmount = difference;
        returnAmount = Math.ceil(totalAmount - difference);


      } else if (discountPercentage) {

        const discountPer = order.couponInfo?.[0]?.discountPercentage;
        const discount = totalAmount * (discountPer / 100);
        discountDataPer = discount;
        returnAmount = Math.ceil(totalAmount - discount);

      } else {

        returnAmount = totalAmount;

      }

      await ordersSchema.updateOne(
          { orderId },
          { $inc: { "paymentInfo.0.totalAmount": -returnAmount } }
        );


      const existingWallet = await walletSchema.findOne({ userId: usersData._id });

      if (existingWallet) {
        await walletSchema.updateOne(
          { userId: usersData._id },
          {
            $inc: { balance: returnAmount },
            $push: {
              transaction: {
                type: 'add',
                amount: returnAmount,
                description: 'Refund for cancelled order',
              }
            }
          }
        );

        const orderData = await ordersSchema.findOne({ orderId });
        if(orderData.couponInfo?.[0]?.discountAmount) {
          await ordersSchema.updateOne(
            { orderId },
            { $inc: { "couponInfo.0.discount": -discountDataAmount } }
          );

        }else if(orderData.couponInfo?.[0]?.discountPercentage) {
          await ordersSchema.updateOne(
            { orderId },
            { $inc: { "couponInfo.0.discount": -discountDataPer } }
          );
        }

      } else {
        const walletData = new walletSchema({
          userId: usersData._id,
          balance: returnAmount,
          transaction: [{
            type: 'add',
            amount: returnAmount,
            description: 'Refund for cancelled order',
          }]
        });

        await walletData.save();

        const orderData = await ordersSchema.findOne({ orderId });
        if(orderData.couponInfo?.[0]?.discountAmount) {
          await ordersSchema.updateOne(
            { orderId },
            { $inc: { "couponInfo.0.discount": -discountDataAmount } }
          );
        }else if(orderData.couponInfo?.[0]?.discountPercentage) {
          await ordersSchema.updateOne(
            { orderId },
            { $inc: { "couponInfo.0.discount": -discountDataPer } }
          );
        }

        await ordersSchema.updateOne(
            { orderId },
            { $inc: { "paymentInfo.0.totalAmount": -totalAmount } }
          );

      }
    }

    apiLogger.info('Order cancelled successfully', {
      controller: 'youraccount',
      action: 'cancelorder',
      orderId: orderId,
      productId: productId,
      reason: reason
    });

    res.redirect('/youraccount/yourorders?success=3');

  } catch (error) {
    errorLogger.error('Failed to cancel order', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'cancelorder'
    });
    next(error);
  }
};


const cancelEntairOrder = async (req, res, next) => {
  try {
    const orderId = String(req.params?.orderId);
    const reason = req.body?.reason === 'Others' ? req.body?.otherReason : req.body?.reason;

    const order = await ordersSchema.findOne({ orderId });

    if (!order) {
      return res.status(404).send('Order not found');
    }

    order.productInfo.forEach(item => {
      item.status = 'cancelled';
      item.cancelReason = reason;
    });

    order.deliveryStatus = 'cancelled';

    await order.save();

    for (const item of order.productInfo) {
      const productId = item.productId?._id || item.productId;
      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) continue;

      const normalizedColor = String(item.color || '').replace('#', '').trim().toLowerCase();
      const normalizedSize = String(item.size || '').trim().toLowerCase();

      await productsSchema.updateOne(
        {
          _id: productId,
          variants: {
            $elemMatch: {
              color: { $regex: new RegExp(`^#?${normalizedColor}$`, 'i') },
              size: { $regex: new RegExp(`^${normalizedSize}$`, 'i') }
            }
          }
        },
        {
          $inc: { "variants.$.stockQuantity": quantity }
        }
      );
    }

    if (['online', 'wallet'].includes(order.paymentInfo?.[0]?.paymentMethod)) {
      const email = req.session.users?.email;
      const usersData = await usersSchema.findOne({ email });

      let totalRefund = 0;

      for (const item of order.productInfo) {
        const totalAmount = item.price * item.quantity;

        if (order.couponInfo?.[0]?.discountAmount) {
          const discount = order.couponInfo[0].discountAmount / order.productInfo.length;
          totalRefund += Math.ceil(totalAmount - discount);
        } else if (order.couponInfo?.[0]?.discountPercentage) {
          const discount = totalAmount * (order.couponInfo[0].discountPercentage / 100);
          totalRefund += Math.ceil(totalAmount - discount);
        } else {
          totalRefund += totalAmount;
        }
      }

      const existingWallet = await walletSchema.findOne({ userId: usersData._id });

      if (existingWallet) {
        await walletSchema.updateOne(
          { userId: usersData._id },
          {
            $inc: { balance: totalRefund },
            $push: {
              transaction: {
                type: 'add',
                amount: totalRefund,
                description: 'Refund for full order cancellation',
              }
            }
          }
        );
      } else {
        const walletData = new walletSchema({
          userId: usersData._id,
          balance: totalRefund,
          transaction: [{
            type: 'add',
            amount: totalRefund,
            description: 'Refund for full order cancellation',
          }]
        });

        await walletData.save();
      }
    }

    apiLogger.info('Entire order cancelled successfully', {
      controller: 'youraccount',
      action: 'cancelEntairOrder',
      orderId: orderId,
      reason: reason
    });

    return res.redirect('/youraccount/yourorders?success=3');
  } catch (error) {
    errorLogger.error('Failed to cancel entire order', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'cancelEntairOrder'
    });
    next(error);
  }
};


const postReturn = async (req, res, next) => {
  try {
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    const { orderId, productId, reason, otherReason } = req.body;
    let finalReason = reason === "Others" ? otherReason : reason;
    const objectOrderId = new ObjectId(orderId);
    const objectProductId = new ObjectId(productId);

    const returnData = new returnSchema({
      orderId: objectOrderId,
      userId: usersData._id,
      productId: objectProductId,
      reason: finalReason
    });

    console.log('Return Data:', returnData);
    await returnData.save();

    await ordersSchema.findOneAndUpdate(
      { _id: objectOrderId, "productInfo.productId": objectProductId },
      { $set: { "productInfo.$.status": "returned" } },
      { new: true, runValidators: true }
    );

    res.render('return');

  } catch (error) {

    errorLogger.error('Failed to post return', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'postReturn'
    });
    next(error);
  }
}



const getCancelledOrders = async (req, res, next) => {
  try {
    const email = req.session.users?.email;

    const user = await usersSchema.findOne({ email });
    if (!user) return res.redirect('/login');

    const userId = user._id;
    const perPage = 2;
    const page = parseInt(req.query.page) || 1;

    const totalOrders = await ordersSchema.countDocuments({
      userId,
      "productInfo.status": "cancelled"
    });

    const cancelledOrders = await ordersSchema.find({
      userId,
      $or: [
        { deliveryStatus: 'cancelled' },
        { "productInfo.status": "cancelled" }
      ]
    })
      .populate('productInfo.productId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage);

    const totalPages = Math.ceil(totalOrders / perPage);



    // returned orders

    const perPage1 = 2;
    const page1 = parseInt(req.query.page) || 1;

    const totalOrders1 = await returnSchema.countDocuments({
      userId
    });

    const returnedOrders = await returnSchema.find({ userId })
      .populate({
        path: 'orderId',
        populate: {
          path: 'productInfo.productId',
          model: 'products'
        }
      })
      .populate('productId')
      .sort({ createdAt: -1 })
      .skip((page1 - 1) * perPage1)
      .limit(perPage1);

    const totalPages1 = Math.ceil(totalOrders1 / perPage1);



    res.render('cancelledorders', {
      orderData: cancelledOrders,
      returnData: returnedOrders,
      currentPage: page,
      totalPages,
      currentPage1: page1,
      totalPages1
    });



  } catch (error) {
    errorLogger.error('Failed to get cancelled orders', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'getCancelledOrders'
    });
    next(error);
  }
}



const postReviews = async (req, res, next) => {

  try {
    const imageNames = req.files.map(file => file.filename);

    const { rating, product, comment } = req.body;

    const email = req.session.users?.email;

    const user = await usersSchema.findOne({ email });
    if (!user) return res.redirect('/login');
    const userId = user._id;

    const reviewData = await reviewSchema.findOne({ userId: userId, productId: product });

    if (reviewData) {
      res.redirect('/youraccount/yourorders?error=2');
    } else {

      const newReview = new reviewSchema({
        userId: userId,
        productId: product,
        rating: rating,
        comment: comment,
        imageUrl: imageNames
      });

      await newReview.save();

      res.redirect('/youraccount/yourorders?success=1');
    }
  } catch (error) {
    errorLogger.error('Failed to post review', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'postReviews'
    });
    next(error);
  }

};



const postEditReviews = async (req, res, next) => {

  try {
    const imageNames = req.files.map(file => file.filename);
    const { ratingEdit, productEdit, commentEdit, removedImages } = req.body;
    const removedList = removedImages ? removedImages.split(',') : [];
    const email = req.session.users?.email;

    const user = await usersSchema.findOne({ email });
    if (!user) return res.redirect('/login');
    const userId = user._id;

    const existingReview = await reviewSchema.findOne({
      userId: userId,
      productId: productEdit
    });

    let updatedImages = [
      ...existingReview.imageUrl.filter(img => !removedImages.includes(img)),
      ...imageNames
    ];

    await reviewSchema.findOneAndUpdate(
      { userId: userId, productId: productEdit },
      {
        $set: {
          rating: ratingEdit,
          comment: commentEdit,
          imageUrl: updatedImages
        }
      },
      { new: true }
    );

    apiLogger.info('Review edited successfully', {
      controller: 'youraccount',
      action: 'postEditReviews',
      userId: userId,
      productId: productEdit,
      rating: ratingEdit,
      comment: commentEdit,
      images: updatedImages
    });

    res.redirect('/youraccount/yourorders?success=1');

  } catch (error) {
    errorLogger.error('Failed to edit review', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'youraccount',
      action: 'postEditReviews'
    });
    next(error);
  }

};

module.exports = {
  getyouraccount, getyourprofile, posteditprofile,
  getchangepassword, patchchangepassword, getaddress, postaddress,
  editaddress, deleteaddress, getyourorders, cancelorder, cancelEntairOrder, postReturn,
  getCancelledOrders, postReviews, postEditReviews, checkPinCode
}