const express = require('express');
const router = express.Router();
const { checkSession, isLoggin } = require('../middleware/auth');
const checkBlockedUser = require('../middleware/checkBlockedUser');
const homeControllers = require('../controllers/home')


router.get('/', checkSession, checkBlockedUser, homeControllers.getHome); 

module.exports = router;


