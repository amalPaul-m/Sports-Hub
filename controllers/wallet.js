const walletSchema = require('../models/walletSchema');
const usersSchema = require('../models/usersSchema');
const razorpayInstance = require('../configuration/razorpay');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getWallet = async (req, res, next) => {
    try {
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const walletData = await walletSchema.findOne({ userId: usersData._id });

        const totalTransaction = walletData?.transaction?.length || 0;

        const sortedTransactions = (walletData?.transaction || []).sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        const paginatedTransactions = sortedTransactions.slice(skip, skip + limit);

        res.render('wallet', {
            transactions: paginatedTransactions,
            currentPage: page,
            totalPages: Math.ceil(totalTransaction / limit),
            walletData,
            razorpayKey: process.env.RAZORPAY_API_KEY
        });
    } catch (error) {
        errorLogger.error('Failed to get wallet', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'wallet',
        action: 'getWallet'
    });
    next(error); 
    }
};


const createWalletOrder = async (req, res, next) => {
    try {
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });
        const { walletAmount } = req.body;
        const amount = parseFloat(walletAmount) * 100; // Razorpay in paise

        const options = {
            amount,
            currency: 'INR',
            receipt: `wallet_${Date.now().toString().slice(-6)}`,
        };

        const order = await razorpayInstance.orders.create(options);

        res.json({
            success: true,
            orderId: order.id,
            amount
        });
    } catch (error) {
        errorLogger.error('Failed to create wallet order', {
            originalMessage: error.message,
            stack: error.stack,
            controller: 'wallet',
            action: 'createWalletOrder'
        });
        next(error);
    }
};


const walletPaymentSuccess = async (req, res, next) => {
    try {
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        const { order_id, payment_id, amount } = req.query;
        // const payment = await razorpayInstance.payments.fetch(payment_id);
        const finalAmount = parseFloat(amount) / 100;

        await walletSchema.updateOne(
            { userId: usersData._id },
            {
                $inc: { balance: finalAmount },
                $push: {
                    transaction: {
                        type: 'add',
                        amount: finalAmount,
                        description: 'Wallet Recharge via Razorpay',
                        transactionId: payment_id
                    }
                }
            }
        );

        res.redirect('/wallet?success=3');
        
    } catch (error) {
        errorLogger.error('Failed to process wallet payment success', {
            originalMessage: error.message,
            stack: error.stack,
            controller: 'wallet',
            action: 'walletPaymentSuccess'
        });
        next(error);
    }
};



const addAmount = async (req,res,next) => {

    try {

        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

    }catch (error) {
        errorLogger.error('Failed to add amount to wallet', {
            originalMessage: error.message,
            stack: error.stack,
            controller: 'wallet',
            action: 'addAmount'
        });
        next(error);
    }

};


module.exports = { getWallet, addAmount, createWalletOrder, walletPaymentSuccess }