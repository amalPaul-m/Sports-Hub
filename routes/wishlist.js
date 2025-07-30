const express = require('express');
const router = express.Router();
const wishlistControllers = require('../controllers/wishlist');
const userAuthantication = require('../middleware/userAuthantication');
const checkBlockedUser = require('../middleware/checkBlockedUser');

router.get('/',userAuthantication, checkBlockedUser, wishlistControllers.getWishlist);
router.post('/:productId',userAuthantication, checkBlockedUser, wishlistControllers.toggleWishlist);

module.exports = router;