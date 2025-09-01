const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const couponController = require('../controllers/coupon');

router.get('/', authAdmin.isLogginAdmin, couponController.getCoupon);
router.get('/add', authAdmin.checkSessionAdmin, couponController.getAddCoupon);
router.post('/add', authAdmin.checkSessionAdmin, couponController.postAddCoupon);

router.delete('/delete/:id', authAdmin.checkSessionAdmin, couponController.patchDelCoupon);

router.get('/edit/:id', authAdmin.checkSessionAdmin, couponController.getEditCoupon);
router.patch('/edit/:id', authAdmin.checkSessionAdmin, couponController.updateCoupon);

module.exports = router;