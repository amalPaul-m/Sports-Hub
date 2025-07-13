const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const accountController = require('../controllers/youraccount')

router.get('/',checkBlockedUser, accountController.getyouraccount);
router.get('/profile',checkBlockedUser, accountController.getyourprofile);
router.patch('/editprofile',checkBlockedUser, accountController.posteditprofile);
router.get('/changepassword',checkBlockedUser, accountController.getchangepassword);
router.patch('/changepassword',checkBlockedUser, accountController.patchchangepassword);

router.get('/address',checkBlockedUser, accountController.getaddress);
router.post('/address',checkBlockedUser, accountController.postaddress);
router.patch('/editaddress',checkBlockedUser, accountController.editaddress);
router.delete('/deleteaddress',checkBlockedUser, accountController.deleteaddress);

router.get('/yourorders', accountController.getyourorders);
router.patch('/cancelorder/:orderId/:productId', accountController.cancelorder);

router.post('/return', accountController.postReturn);

router.get('/cancelledorders', accountController.getCancelledOrders);

module.exports = router;