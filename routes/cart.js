const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const cartController = require('../controllers/cart');

router.get('/',userAuthantication, checkBlockedUser, cartController.getCart);
router.post('/add-buy-cart',userAuthantication, checkBlockedUser, cartController.productDetailAddCart);
router.patch('/remove/:id', userAuthantication, checkBlockedUser, cartController.removeCart);

router.patch('/increase/:productId', userAuthantication, checkBlockedUser, cartController.increaseItemCount);
router.patch('/decrease/:productId', userAuthantication, checkBlockedUser, cartController.decreaseItemCount);

router.post('/checkCoupon', userAuthantication, checkBlockedUser, cartController.checkCoupon);


module.exports = router;