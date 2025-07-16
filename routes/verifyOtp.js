const express = require('express');
const router = express.Router();
const verifyOtpControllers = require('../controllers/verifyOtp')
const userAuthantication = require('../middleware/userAuthantication');

router.post('/',userAuthantication, verifyOtpControllers.postVerifyOtp);

router.post('/resendOtp',userAuthantication, verifyOtpControllers.postResendOtp);

module.exports = router;