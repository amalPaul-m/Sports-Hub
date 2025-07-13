const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const checkoutControll = require('../controllers/checkout')


router.get('/', checkBlockedUser, checkoutControll.getCheckout);
router.post('/', checkBlockedUser, checkoutControll.postCheckout);

router.get('/payment', checkBlockedUser, checkoutControll.getPayment);
router.post('/payment', checkBlockedUser, checkoutControll.postPayment);

router.get('/confirm', checkBlockedUser, checkoutControll.getConfirm);
router.post('/confirm', checkBlockedUser, checkoutControll.postConfirm);

module.exports = router;