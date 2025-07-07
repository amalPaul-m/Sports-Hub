const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers')

router.get('/', customersController.getCustomers);

router.patch('/unblock/:id', customersController.unblockCustomers);

router.patch('/block/:id', customersController.blockCustomers);

router.get('/search', customersController.searchCustomers);

module.exports = router;