const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const accountController = require('../controllers/youraccount')

router.get('/',checkBlockedUser, userAuthantication, accountController.getyouraccount);
router.get('/profile',checkBlockedUser, userAuthantication, accountController.getyourprofile);
router.patch('/editprofile',checkBlockedUser, userAuthantication, accountController.posteditprofile);
router.get('/changepassword',checkBlockedUser, userAuthantication, accountController.getchangepassword);
router.patch('/changepassword',checkBlockedUser, userAuthantication, accountController.patchchangepassword);

router.get('/address',checkBlockedUser, userAuthantication, accountController.getaddress);
router.post('/address',checkBlockedUser, userAuthantication, accountController.postaddress);
router.patch('/editaddress',checkBlockedUser, userAuthantication, accountController.editaddress);
router.delete('/deleteaddress',checkBlockedUser, userAuthantication, accountController.deleteaddress);

router.get('/yourorders', userAuthantication, accountController.getyourorders);
router.patch('/cancelorder/:orderId/:productId', userAuthantication, accountController.cancelorder);

router.post('/return', userAuthantication, accountController.postReturn);

router.get('/cancelledorders', userAuthantication, accountController.getCancelledOrders);

module.exports = router;