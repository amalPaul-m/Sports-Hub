const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const returnControllers = require('../controllers/return')
const userAuthantication = require('../middleware/userAuthantication');


router.get('/',userAuthantication, checkBlockedUser, returnControllers.getReturn);


module.exports = router;