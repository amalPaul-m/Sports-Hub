const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const categoryControll = require('../controllers/category')


router.get('/', authAdmin.checkSessionAdmin, categoryControll.getCategory);

router.post('/', authAdmin.checkSessionAdmin, categoryControll.postCategory);

router.patch('/unblock/:id/:name', authAdmin.checkSessionAdmin, categoryControll.unblockCategory);

router.patch('/block/:id/:name', authAdmin.checkSessionAdmin, categoryControll.blockCategory);

router.patch('/update/:id', authAdmin.checkSessionAdmin, categoryControll.updateCategory);

module.exports = router;