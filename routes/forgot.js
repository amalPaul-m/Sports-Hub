const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const forgotControllers = require('../controllers/forgot')

router.get('/',forgotControllers.getForgot);

router.post('/',forgotControllers.postForgot);

router.get('/verifyOtp',forgotControllers.getVerifyOtp);

router.post('/verifyOtp',forgotControllers.postVerifyOtp);

router.post('/resendotp',forgotControllers.postResendOtp);

module.exports = router;