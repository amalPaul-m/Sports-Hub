const express = require('express');
const router = express.Router();
const walletControllers = require('../controllers/wallet');
const userAuthantication = require('../middleware/userAuthantication');
const checkBlockedUser = require('../middleware/checkBlockedUser');

router.get('/',userAuthantication, walletControllers.getWallet);
router.patch('/add-amount',userAuthantication, walletControllers.addAmount);
router.patch('/create-wallet-order', userAuthantication, checkBlockedUser, walletControllers.createWalletOrder);
router.get('/payment-success', walletControllers.walletPaymentSuccess);

module.exports = router;