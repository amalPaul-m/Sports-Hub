const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const dashboardControllers = require('../controllers/dashboard')

router.get('/', authAdmin.checkSessionAdmin, dashboardControllers.getDashboard);

module.exports = router