const express = require('express');
const router = express.Router();
const couponController = require('../controllers/coupon');

router.get('/', couponController.getCoupon);
router.get('/add', couponController.getAddCoupon);
router.post('/add', couponController.postAddCoupon);

router.delete('/delete/:id', couponController.patchDelCoupon);

router.get('/edit/:id', couponController.getEditCoupon);
router.patch('/edit/:id', couponController.updateCoupon);

module.exports = router;