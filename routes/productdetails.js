const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const productDetailsControllers = require('../controllers/productdetails')

router.get('/',checkBlockedUser, productDetailsControllers.getProductDetails);

module.exports = router;