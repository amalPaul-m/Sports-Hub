const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const customersController = require('../controllers/customers')

router.get('/', authAdmin.checkSessionAdmin, customersController.getCustomers);

router.patch('/unblock/:id', authAdmin.checkSessionAdmin, customersController.unblockCustomers);

router.patch('/block/:id', authAdmin.checkSessionAdmin, customersController.blockCustomers);

router.get('/search', authAdmin.checkSessionAdmin, customersController.searchCustomers);

module.exports = router;