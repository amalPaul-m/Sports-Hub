const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const forgotControllers = require('../controllers/forgot')

router.get('/',userAuthantication, checkBlockedUser, forgotControllers.getForgot);

router.post('/',userAuthantication, checkBlockedUser, forgotControllers.postForgot);

router.get('/verifyOtp',userAuthantication, checkBlockedUser, forgotControllers.getVerifyOtp);

router.post('/verifyOtp',userAuthantication, checkBlockedUser, forgotControllers.postVerifyOtp);

router.post('/resendotp',userAuthantication, checkBlockedUser, forgotControllers.postResendOtp);

module.exports = router;