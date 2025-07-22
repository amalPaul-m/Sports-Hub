const usersSchema = require('../models/usersSchema');
const addressSchema = require('../models/addressSchema');
const ordersSchema = require('../models/ordersSchema');
const productsSchema = require('../models/productsSchema');
const returnSchema = require('../models/returnSchema');
const walletSchema = require('../models/walletSchema')
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

const getyouraccount = async (req, res, next) => {

    try {
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        res.render('youraccount',{ usersData });

    } catch (err) {

        err.message = 'Error get youraccount';
        console.log(err)
        next(err);
    }
    
};

const getyourprofile = async (req,res,next) => {

    try{
        const email = req.session.users?.email;
        const usersDetails = await usersSchema.findOne({ email });
        res.render('yourprofile', { usersDetails });

    } catch(err) {
        err.message = 'Error get youraccount';
        console.log(err)
        next(err);
    }
};

const posteditprofile = async (req,res,next) => {

    try {

        const { name, email, phone } = req.body;

        await usersSchema.findOneAndUpdate(
            { email: email },                 
            { $set: { name: name, phone: phone } },
            { new: true }                      
        );

        const usersDetails = await usersSchema.findOne({ email });

        res.render('yourprofile', { usersDetails });


    } catch(err) {
        err.message = 'Error update youraccount';
        console.log(err)
        next(err);
    }

}


const getchangepassword = async (req,res,next) => {

    res.render('changepassword');

}


const patchchangepassword = async (req,res,next) => {

    try { 

    const { oldpassword, newpassword } = req.body;
    const email = req.session.users?.email;

    const usersData = await usersSchema.findOne({ email });
    const match = await bcrypt.compare(oldpassword, usersData.password);
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    if(!match) {
        res.render('changepassword', { content: 'Invalid old passowrd' });
    }else {

    await usersSchema.findOneAndUpdate(
            { email: email },                 
            { $set: { password:hashedPassword } },
            { new: true }                      
        );
    
        res.redirect('/logout?success=1');

     }   
   } catch (err) {
        err.message = 'Error change password';
        console.log(err)
        next(err);
   }
}    





const getaddress = async (req, res, next) => {

    try {
        const email = req.session.users?.email;
        const userId = await usersSchema.find({email});
        const addressData = await addressSchema.find({userId});
        console.log(addressData)

        res.render('address',{ addressData });

    } catch (err) {

        err.message = 'Error get address';
        console.log(err)
        next(err);
    }
    
};


const postaddress = async (req,res,next) => {

    try {

        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        const addressData = new addressSchema ({
            userId: usersData._id,
            fullName: req.body.fullName,
            mobileNumber: req.body.mobileNumber,
            pinCode: req.body.pinCode,
            street: req.body.street,
            houseNo: req.body.houseNo,
            district: req.body.district,
            state: req.body.state,
            landMark: req.body.landMark,
            alternate_number: req.body.alternate_number,    
            addressType: req.body.addressType
        });

            await addressData.save();
            res.redirect('/youraccount/address');

    }catch (err) {
        err.message = 'Error save address';
        console.log(err)
        next(err);
    }
};


const editaddress = async (req,res,next) => {

    try {

        const addressId = req.body.addressId;

        const editAddressData = {
            fullName: req.body.fullName,
            mobileNumber: req.body.mobileNumber,
            pinCode: req.body.pinCode,
            street: req.body.street,
            houseNo: req.body.houseNo,
            district: req.body.district,
            state: req.body.state,
            landMark: req.body.landMark,
            alternate_number: req.body.alternate_number,    
            addressType: req.body.addressType
        };

        await addressSchema.findByIdAndUpdate(addressId, { $set: editAddressData }, { new: true });
        res.redirect('/youraccount/address');

    } catch(err) {
        err.message = 'Error edit address';
        console.log(err)
        next(err);
    }
};


const deleteaddress = async (req,res,next) => {

    try {
        
        const addressId = req.body.addressId;

        await addressSchema.findByIdAndDelete(addressId)
        res.redirect('/youraccount/address'); 

    }catch(err) {
        err.message = 'Error delete address';
        console.log(err)
        next(err);
    }

};

const getyourorders = async (req, res, next) => {
  try {
    const email = req.session.users?.email;

    const user = await usersSchema.findOne({ email });

    const userId = user._id;

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
      totalPages1: Math.ceil(totalOrders1 / limit1)
    });

  } catch (error) {
    err.message = 'Error getting orders';
    console.log(error);
    next(error);
  }
};



const cancelorder = async (req, res, next) => {

    try {
        const orderId = String(req.params.orderId); 
        const productId = new mongoose.Types.ObjectId(req.params.productId);
        const reason = req.body.reason;
        const order = await ordersSchema.findOneAndUpdate(
        { orderId: orderId, "productInfo.productId": productId },
        { $set: { "productInfo.$.status": "cancelled", 
            "productInfo.$.cancelReason": reason } },
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
        const normalizedSize  = String(item.size || '').trim().toLowerCase();

        // Restore quantity to product variant
        const result = await productsSchema.updateOne(
        {
            _id: productId,
            variants: {
            $elemMatch: {
                color: { $regex: new RegExp(`^#?${normalizedColor}$`, 'i') },
                size:  { $regex: new RegExp(`^${normalizedSize}$`, 'i') }
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

        if(order.paymentInfo[0].paymentMethod==='online'||order.paymentInfo[0].paymentMethod==='wallet'){

        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });
        const totalAmount = item.price*item.quantity;
        let returnAmount = 0;

        if(order.couponInfo?.[0]?.discountAmount!==null || order.couponInfo?.[0]?.discountAmount!==0){

            const discount = order.couponInfo?.[0]?.discountAmount;
            const count = order.productInfo.length;
            const difference = discount / count;
            returnAmount = Math.ceil(totalAmount - difference);


        }else if(order.couponInfo?.[0]?.discountPercentage!==null || order.couponInfo?.[0]?.discountPercentage!==0){

            const discountPer = order.couponInfo?.[0]?.discountPercentage;
            const discount = totalAmount * (discountPer / 100);
            returnAmount = Math.ceil(totalAmount - discount);
        }else {
            returnAmount = totalAmount;
        }


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

                }
            }

                res.redirect('/youraccount/yourorders?success=3');

            } catch (error) {
                error.message = 'Error cancel order';
                console.log(error);
                next(error);
            }
        };



const postReturn = async (req, res, next) => {
  try {
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    const { orderId, productId, reason } = req.body;
    const objectOrderId = new ObjectId(orderId);
    const objectProductId = new ObjectId(productId);

    const returnData = new returnSchema({
      orderId: objectOrderId,
      userId: usersData._id,
      productId: objectProductId,
      reason: reason
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

        error.message = 'Error cancel order';
        console.log(error);
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
        error.message = 'Error getting cancelled orders';
        console.log(error);
        next(error);
    }
}



module.exports = { 
    getyouraccount, getyourprofile, posteditprofile, 
    getchangepassword, patchchangepassword,getaddress, postaddress, 
    editaddress, deleteaddress, getyourorders, cancelorder, postReturn,
    getCancelledOrders
 }