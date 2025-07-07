const express = require('express');
const router = express.Router();
const indexControllers = require('../controllers/index')

router.get('/', indexControllers.getIndex);

module.exports = router;
