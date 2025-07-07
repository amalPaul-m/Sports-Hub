const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth')
const signupControllers = require('../controllers/signup')

router.get('/', auth.isLoggin, signupControllers.getSignup);

router.post('/', signupControllers.postSignup);

module.exports = router;