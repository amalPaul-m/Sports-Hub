const express = require('express');
const router = express.Router();
const wishlistControllers = require('../controllers/wishlist');
const userAuthantication = require('../middleware/userAuthantication');

router.get('/',userAuthantication, wishlistControllers.getWishlist);
router.post('/:productId',userAuthantication, wishlistControllers.toggleWishlist);

module.exports = router;