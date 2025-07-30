const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const restControllers = require('../controllers/rest')


router.get('/',userAuthantication, checkBlockedUser, restControllers.getRest);

router.post('/',userAuthantication, checkBlockedUser, restControllers.postRest);

module.exports = router;