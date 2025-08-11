const ordersSchema = require('../models/ordersSchema');
const returnsSchema = require('../models/returnSchema');
const razorpayInstance = require('../configuration/razorpay');
const walletSchema = require('../models/walletSchema');
const usersSchema = require('../models/usersSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');


const getOrderslist = async (req, res,next) => {

    try {

        const perPage = 8;
        const page = parseInt(req.query.page) || 1;
        const [totalOrders, orders] = await Promise.all([
            ordersSchema.countDocuments(),
            ordersSchema.find()
            .populate('addressId').populate('productInfo.productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
        ]);

        const totalPages = Math.ceil(totalOrders / perPage);
        
        console.log(orders);
        res.render('orderslist', {
        orders,
        currentPage: page,
        totalPages
        });

    } catch (error) {
        errorLogger.error('Error fetching orders list', {
            controller: 'orderslist',
            action: 'getOrderslist',
            error: error.message
        });
        next(error);
    }
}


const shippedOrder = async (req, res, next) => {
    try { 
        const orderId = req.params.id;
        console.log(orderId);

        const updatedOrder = await ordersSchema.findByIdAndUpdate(
            orderId,
            { deliveryStatus: 'shipped' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        apiLogger.info('Order status updated to shipped', {
            controller: 'orderslist',
            action: 'shippedOrder',
            orderId
        });

        res.redirect('/orderslist');
    
} catch(error) {
        errorLogger.error('Error updating order status to shipped', {
            controller: 'orderslist',
            action: 'shippedOrder',
            orderId,
            error: error.message
        });
        next(error);
    }
};


const outofdeliveryOrder = async (req, res, next) => {
    try { 
        const orderId = req.params.id;
        console.log(orderId);

        const updatedOrder = await ordersSchema.findByIdAndUpdate(
            orderId,
            { deliveryStatus: 'outofdelivery' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        apiLogger.info('Order status updated to out of delivery', {
            controller: 'orderslist',
            action: 'outofdeliveryOrder',
            orderId
        });

        res.redirect('/orderslist');
    
} catch(error) {
        errorLogger.error('Error updating order status to out of delivery', {
            controller: 'orderslist',
            action: 'outofdeliveryOrder',
            orderId,
            error: error.message
        });
        next(error);
    }
}


const delivered = async (req, res, next) => {
    try { 
        const orderId = req.params.id;
        console.log(orderId);

        const updatedOrder = await ordersSchema.findByIdAndUpdate(
            orderId,
            { deliveryStatus: 'delivered' },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        apiLogger.info('Order status updated to delivered', {
            controller: 'orderslist',
            action: 'delivered',
            orderId
        });

        res.redirect('/orderslist');

    } catch(error) {
        errorLogger.error('Error updating order status to delivered', {
            controller: 'orderslist',
            action: 'delivered',
            orderId,
            error: error.message
        });
        next(error);
    }
}


const cancelled = async (req, res, next) => {
    try { 
        const orderId = req.params.id;
        console.log(orderId);

        const updatedOrder = await ordersSchema.findByIdAndUpdate(
            orderId,
            { deliveryStatus: 'cancelled' },
            { new: true }
        );

        await ordersSchema.updateMany(
            { _id: orderId },
            { $set: { 'productInfo.$[].status': 'cancelled' } }
        );

        if (!updatedOrder) {
            return res.status(404).send('Order not found');
        }

        apiLogger.info('Order status updated to cancelled', {
            controller: 'orderslist',
            action: 'cancelled',
            orderId
        });

        res.redirect('/orderslist');

    } catch(error) {
        errorLogger.error('Error updating order status to cancelled', {
            controller: 'orderslist',
            action: 'cancelled',
            orderId,
            error: error.message
        });
        next(error);
    }
};




const getReturnOrderslist = async (req, res, next) => {
    try {

        const perPage = 8;
        const page = parseInt(req.query.page) || 1;
        const [totalOrders, returns] = await Promise.all([
            returnsSchema.countDocuments(),
            returnsSchema.find()
            .populate({
            path: 'orderId',
            populate: {
                path: 'productInfo.productId'  
            }
            })
            .populate('productId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
        ])

        const totalPages = Math.ceil(totalOrders / perPage);
        
        res.render('ordersreturnlist', {
            returns,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        errorLogger.error('Error fetching return orders list', {
            controller: 'orderslist',
            action: 'getReturnOrderslist',
            error: error.message
        });
        next(error);
    }
}


const acceptReturn = async (req, res, next) => {
    
    try {
        const returnId = req.params.id;
        const updatedReturn = await returnsSchema.findById(
            returnId

        ).populate({
        path: 'orderId',
        select: 'paymentInfo' 
        });

        if (!updatedReturn) {
            return res.status(404).send('Return request not found');
        }

        const paymentInfo = updatedReturn.orderId?.paymentInfo;
        const itemId = updatedReturn.productId;
        const orderId = updatedReturn.orderId._id;
        let totalAmount = 0;

        if (paymentInfo[0].paymentMethod === 'online'){

            
        const [order, orderData] = await Promise.all([
            
            ordersSchema.findOne({ _id: orderId, "productInfo.productId": itemId },
            { productInfo: { $elemMatch: { productId: itemId } } }),
            ordersSchema.findOne({_id: orderId})

        ]);

        const productInfo = order.productInfo[0];
        totalAmount = productInfo.price*productInfo.quantity;


                let returnAmount = 0;
        
                if(orderData.couponInfo?.[0]?.discountAmount!==null && orderData.couponInfo?.[0]?.discountAmount!==0){
        
                    const discount = orderData.couponInfo?.[0]?.discountAmount;
                    const count = orderData.productInfo.length;
                    const difference = discount / count;
                    returnAmount = Math.ceil(totalAmount - difference);
        
        
                }else if(orderData.couponInfo?.[0]?.discountPercentage!==null && orderData.couponInfo?.[0]?.discountPercentage!==0){
        
                    const discountPer = orderData.couponInfo?.[0]?.discountPercentage;
                    const discount = totalAmount * (discountPer / 100);
                    returnAmount = Math.ceil(totalAmount - discount);
                }else {
                    
                    returnAmount = totalAmount;
                }


            
        await razorpayInstance.payments.refund(paymentInfo[0].transactionId, {
            amount: returnAmount * 100, // Amount in paise
        });


        await returnsSchema.findByIdAndUpdate(
            returnId,
            { status: 'accept' },
            { new: true }
        ).populate({
        path: 'orderId',
        select: 'paymentInfo' 
        });

        if (!updatedReturn) {
            return res.status(404).send('Return request not found');
        }

        
        }else {


            const order = await ordersSchema.findOne(
            { _id: orderId, "productInfo.productId": itemId },
            { productInfo: { $elemMatch: { productId: itemId } } }
            );

            const productInfo = order.productInfo[0];
            totalAmount = productInfo.price*productInfo.quantity;
            
            const orderData = await ordersSchema.findOne({_id: orderId});
            const userId = orderData.userId;

            let returnAmount = 0;
        
                if(orderData.couponInfo?.[0]?.discountAmount!==null && orderData.couponInfo?.[0]?.discountAmount!==0){
        
                    const discount = orderData.couponInfo?.[0]?.discountAmount || 0;
                    const count = orderData.productInfo.length;
                    const difference = discount / count;
                    returnAmount = Math.ceil(totalAmount - difference);
        
        
                }else if(orderData.couponInfo?.[0]?.discountPercentage!==null && orderData.couponInfo?.[0]?.discountPercentage!==0){
        
                    const discountPer = orderData.couponInfo?.[0]?.discountPercentage  || 0;
                    const discount = totalAmount * (discountPer / 100);
                    returnAmount = Math.ceil(totalAmount - discount);
                    
                }else {

                    returnAmount = totalAmount;

                }

                const existingWallet = await walletSchema.findOne({ userId: userId });
            
                    if (existingWallet) {
                        await walletSchema.updateOne(
                            { userId: userId },
                            {
                                $inc: { balance: returnAmount },
                                $push: {
                                    transaction: {
                                        type: 'add',
                                        amount: returnAmount,
                                        description: 'Refund for returned order',
                                    }
                                }
                            }
                        );
                    } else {
                        const walletData = new walletSchema({
                            userId: userId,
                            balance: returnAmount,
                            transaction: [{
                                type: 'add',
                                amount: returnAmount,
                                description: 'Refund for returned order',
                            }]
                        });
            
                            await walletData.save();
            
                    }
            

            await returnsSchema.findByIdAndUpdate(
            returnId,
            { status: 'accept' },
            { new: true }
            ).populate({
            path: 'orderId',
            select: 'paymentInfo' 
            });

        if (!updatedReturn) {
            return res.status(404).send('Return request not found');
        }

    }
        res.redirect('/orderslist/ordersreturnlist');

    } catch (error) {
        errorLogger.error('Error accepting return request', {
            controller: 'orderslist',
            action: 'acceptReturn',
            error: error.message
        });
        next(error);
    }

}

const rejectReturn = async (req, res, next) => {
    try {   
        const returnId = req.params.id;
        console.log(returnId);

        const updatedReturn = await returnsSchema.findByIdAndUpdate(
            returnId,
            { status: 'reject' },
            { new: true }
        );

        if (!updatedReturn) {
            return res.status(404).send('Return request not found');
        }

        apiLogger.info('Return request rejected successfully', {
            controller: 'orderslist',
            action: 'rejectReturn',
            returnId
        });

        res.redirect('/orderslist/ordersreturnlist');

    } catch (error) {
        errorLogger.error('Error rejecting return request', {
            controller: 'orderslist',
            action: 'rejectReturn',
            error: error.message
        });
        next(error);
    }   

}   

module.exports = { getOrderslist, shippedOrder, outofdeliveryOrder, 
    delivered, cancelled, getReturnOrderslist, acceptReturn, rejectReturn };