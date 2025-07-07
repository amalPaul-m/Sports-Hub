const express = require('express');
const router = express.Router();
const accountController = require('../controllers/youraccount')

router.get('/', accountController.getyouraccount);
router.get('/profile', accountController.getyourprofile);
router.patch('/editprofile', accountController.posteditprofile);
router.get('/changepassword', accountController.getchangepassword);
router.patch('/changepassword', accountController.patchchangepassword);

router.get('/address', accountController.getaddress);
router.post('/address', accountController.postaddress);
router.patch('/editaddress', accountController.editaddress);
router.delete('/deleteaddress', accountController.deleteaddress);

router.get('/yourorders', accountController.getyourorders);

module.exports = router;