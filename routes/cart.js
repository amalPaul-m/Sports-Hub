const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const cartController = require('../controllers/cart')

router.get('/', checkBlockedUser, cartController.getCart);
router.post('/add-buy-cart', checkBlockedUser, cartController.productDetailAddCart);
router.patch('/remove/:id', checkBlockedUser, cartController.removeCart);

router.patch('/increase/:productId', checkBlockedUser, cartController.increaseItemCount);
router.patch('/decrease/:productId', checkBlockedUser, cartController.decreaseItemCount);



module.exports = router;