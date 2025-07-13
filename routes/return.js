const express = require('express');
const router = express.Router();
const returnControllers = require('../controllers/return')


router.get('/', returnControllers.getReturn);


module.exports = router;