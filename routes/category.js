const express = require('express');
const router = express.Router();
const categoryControll = require('../controllers/category')


router.get('/', categoryControll.getCategory);

router.post('/', categoryControll.postCategory);

router.patch('/unblock/:id/:name', categoryControll.unblockCategory);

router.patch('/block/:id/:name', categoryControll.blockCategory);

router.patch('/update/:id', categoryControll.updateCategory);

module.exports = router;