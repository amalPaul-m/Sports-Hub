const express = require('express');
const router = express.Router();
const returnControllers = require('../controllers/return')
const userAuthantication = require('../middleware/userAuthantication');


router.get('/',userAuthantication, returnControllers.getReturn);


module.exports = router;