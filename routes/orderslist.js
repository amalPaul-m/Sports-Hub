const express = require('express');
const router = express.Router();
const orderslistController = require('../controllers/orderslist');

router.get('/', orderslistController.getOrderslist);
router.patch('/shipped/:id', orderslistController.shippedOrder);
router.patch('/outofdelivery/:id', orderslistController.outofdeliveryOrder);
router.patch('/delivered/:id', orderslistController.delivered);
router.patch('/cancelled/:id', orderslistController.cancelled);

router.patch('/accept/:id', orderslistController.acceptReturn);
router.patch('/reject/:id', orderslistController.rejectReturn);

router.get('/ordersreturnlist', orderslistController.getReturnOrderslist);

module.exports = router;