const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const restControllers = require('../controllers/rest')


router.get('/',restControllers.getRest);

router.post('/',restControllers.postRest);

module.exports = router;