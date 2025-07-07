const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userProductsControllers = require('../controllers/userproducts')

router.get('/',checkBlockedUser, userProductsControllers.getUserProducts);
router.get('/filter',checkBlockedUser, userProductsControllers.filterUserProducts);
router.get('/search',checkBlockedUser, userProductsControllers.searchUserProducts);

module.exports = router;


