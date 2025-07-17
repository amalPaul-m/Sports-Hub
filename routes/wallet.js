const express = require('express');
const router = express.Router();
const walletControllers = require('../controllers/wallet');
const userAuthantication = require('../middleware/userAuthantication');

router.get('/',userAuthantication, walletControllers.getWallet);


module.exports = router;