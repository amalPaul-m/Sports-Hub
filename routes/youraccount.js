const express = require('express');
const router = express.Router();
const checkBlockedUser = require('../middleware/checkBlockedUser');
const userAuthantication = require('../middleware/userAuthantication');
const upload = require('../middleware/upload');
const accountController = require('../controllers/youraccount');

router.get('/',checkBlockedUser, userAuthantication, accountController.getyouraccount);
router.get('/profile',checkBlockedUser, userAuthantication, accountController.getyourprofile);
router.patch('/editprofile',checkBlockedUser, userAuthantication, accountController.posteditprofile);
router.get('/changepassword',checkBlockedUser, userAuthantication, accountController.getchangepassword);
router.patch('/changepassword',checkBlockedUser, userAuthantication, accountController.patchchangepassword);

router.get('/address',checkBlockedUser, userAuthantication, accountController.getaddress);
router.post('/address',checkBlockedUser, userAuthantication, accountController.postaddress);
router.patch('/editaddress',checkBlockedUser, userAuthantication, accountController.editaddress);
router.delete('/deleteaddress',checkBlockedUser, userAuthantication, accountController.deleteaddress);
router.get('/get-pincode-info/:pincode',checkBlockedUser, userAuthantication, accountController.checkPinCode);


router.get('/yourorders',checkBlockedUser, userAuthantication, accountController.getyourorders);
router.patch('/cancelorder/:orderId/:productId',checkBlockedUser, userAuthantication, accountController.cancelorder);
router.patch('/cancelEntairOrder/:orderId',checkBlockedUser, userAuthantication, accountController.cancelEntairOrder);

router.post('/return',checkBlockedUser, userAuthantication, accountController.postReturn);

router.get('/cancelledorders',checkBlockedUser, userAuthantication, accountController.getCancelledOrders);

router.post('/review',upload.array('reviewImages', 5), checkBlockedUser, userAuthantication, accountController.postReviews);
router.post('/review/edit' ,upload.array('reviewImages', 5) , userAuthantication, accountController.postEditReviews);

module.exports = router;