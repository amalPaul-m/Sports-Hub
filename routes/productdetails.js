const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const productDetailsControllers = require('../controllers/productdetails')

router.get('/',userAuthantication, checkBlockedUser, productDetailsControllers.getProductDetails);

module.exports = router;