const express = require('express');
const router = express.Router();
const { checkSession, isLoggin } = require('../middleware/auth');
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const homeControllers = require('../controllers/home')


router.get('/',userAuthantication, checkSession, checkBlockedUser, homeControllers.getHome); 

module.exports = router;


