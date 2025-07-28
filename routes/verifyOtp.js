const express = require('express');
const router = express.Router();
const verifyOtpControllers = require('../controllers/verifyOtp')
const userAuthantication = require('../middleware/userAuthantication');

router.post('/', verifyOtpControllers.postVerifyOtp);

router.post('/resendOtp', verifyOtpControllers.postResendOtp);

module.exports = router;