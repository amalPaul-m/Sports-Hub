const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const userProductsControllers = require('../controllers/userproducts')

router.get('/',userAuthantication, checkBlockedUser, userProductsControllers.getUserProducts);
router.get('/filter',userAuthantication, checkBlockedUser, userProductsControllers.filterUserProducts);
router.get('/search',userAuthantication, checkBlockedUser, userProductsControllers.searchUserProducts);

module.exports = router;


