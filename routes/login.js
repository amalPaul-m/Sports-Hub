const express = require('express');
const router = express.Router();
const { checkSession, isLoggin } = require('../middleware/auth');
const loginControllers = require('../controllers/login')

router.get('/', isLoggin, loginControllers.getLogin);

router.post('/', isLoggin, loginControllers.postLogin);

module.exports = router;