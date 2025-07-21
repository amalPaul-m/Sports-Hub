const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const checkoutControll = require('../controllers/checkout')


router.get('/',userAuthantication, checkBlockedUser, checkoutControll.getCheckout);
router.post('/',userAuthantication, checkBlockedUser, checkoutControll.postCheckout);

router.get('/confirm',userAuthantication, checkBlockedUser, checkoutControll.getConfirm);
router.post('/confirm',userAuthantication, checkBlockedUser, checkoutControll.postConfirm);

router.get('/remove',userAuthantication, checkBlockedUser, checkoutControll.removeConfirm);

router.get('/payment',userAuthantication, checkBlockedUser, checkoutControll.getPayment);
router.get('/payment/COD',userAuthantication, checkBlockedUser, checkoutControll.postPayment);

router.post('/create-razorpay-order', userAuthantication, checkBlockedUser, checkoutControll.createRazorpayOrder);
router.get('/razorpay-success', userAuthantication, checkBlockedUser, checkoutControll.getRazorpaySuccess);
router.get('/payment-cancelled', userAuthantication, checkBlockedUser, checkoutControll.getRazorpayFailure);

router.post('/wallet-payment', userAuthantication, checkBlockedUser, checkoutControll.postWallet);

router.get('/success', userAuthantication, checkBlockedUser, checkoutControll.getSuccess);

module.exports = router;