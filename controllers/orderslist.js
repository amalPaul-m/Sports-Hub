const ordersSchema = require('../models/ordersSchema');
const returnsSchema = require('../models/returnSchema');


const getOrderslist = async (req, res,next) => {

    try {

        const perPage = 8;
        const page = parseInt(req.query.page) || 1;
        const totalOrders = await ordersSchema.countDocuments();
        
        const orders = await ordersSchema.find()
        .populate('addressId').populate('productInfo.productId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);


        const totalPages = Math.ceil(totalOrders / perPage);
        
        console.log(orders);
        res.render('orderslist', {
        cssFile: '/stylesheets/orderslist.css', 
        jsFile: '/javascripts/orderslist.js', orders,
        currentPage: page,
        totalPages
        });

    } catch (error) {
        error.message = 'not get orders data';
        console.log(error);
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

        res.redirect('/orderslist');
    
} catch(error) {
        error.message = 'not change status to shipped';
        console.log(error);
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

        res.redirect('/orderslist');
    
} catch(error) {
        error.message = 'not change status to out of delivery';
        console.log(error);
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

        res.redirect('/orderslist');

    } catch(error) {
        error.message = 'not change status to delivered';
        console.log(error);
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

        res.redirect('/orderslist');

    } catch(error) {
        error.message = 'not change status to cancelled';
        console.log(error);
        next(error);
    }
};




const getReturnOrderslist = async (req, res, next) => {
    try {

        const perPage = 8;
        const page = parseInt(req.query.page) || 1;
        const totalOrders = await returnsSchema.countDocuments();
        
        // const orders = await ordersSchema.find({"productInfo.status": "returned"})
        // .populate('addressId').populate('productInfo.productId')
        // .sort({ createdAt: -1 })
        // .skip((page - 1) * perPage)
        // .limit(perPage);

        const returns = await returnsSchema.find()
        .populate({
        path: 'orderId',
        populate: {
            path: 'productInfo.productId'  
        }
        })
        .populate('productId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * perPage)
        .limit(perPage);

        console.log(returns);

        const totalPages = Math.ceil(totalOrders / perPage);
        
        res.render('ordersreturnlist', {
            cssFile: '/stylesheets/orderslist.css', 
            jsFile: '/javascripts/orderslist.js', 
            returns,
            currentPage: page,
            totalPages
        });

    } catch (error) {
        error.message = 'not get return orders data';
        console.log(error);
        next(error);
    }
}

const acceptReturn = async (req, res, next) => {
    try {
        const returnId = req.params.id;
        console.log(returnId);

        const updatedReturn = await returnsSchema.findByIdAndUpdate(
            returnId,
            { status: 'accept' },
            { new: true }
        );

        if (!updatedReturn) {
            return res.status(404).send('Return request not found');
        }

        res.redirect('/orderslist/ordersreturnlist');

    } catch (error) {
        error.message = 'not change return status to accept';
        console.log(error);
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

        res.redirect('/orderslist/ordersreturnlist');

    } catch (error) {
        error.message = 'not change return status to reject';
        console.log(error);
        next(error);
    }   

}   

module.exports = { getOrderslist, shippedOrder, outofdeliveryOrder, 
    delivered, cancelled, getReturnOrderslist, acceptReturn, rejectReturn };