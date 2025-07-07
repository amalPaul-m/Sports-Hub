const express = require('express');
const router = express.Router();
const logoutControllers = require('../controllers/logout')

router.get('/', logoutControllers.getLogout);

router.get('/admin', logoutControllers.getAdminLogout);

module.exports = router;


