const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authAdmin = require('../middleware/authAdmin');
const productsControllers = require('../controllers/products')

router.get('/', authAdmin.checkSessionAdmin, productsControllers.getProducts);

router.get('/add', authAdmin.checkSessionAdmin, productsControllers.getAddProducts);

router.post('/add', authAdmin.checkSessionAdmin, upload.array('images', 5), productsControllers.postAddProducts);

router.patch('/list/:id', authAdmin.checkSessionAdmin, productsControllers.listGetProducts);

router.patch('/unlist/:id', authAdmin.checkSessionAdmin, productsControllers.unlistGetProducts);

router.get('/edit/:id', authAdmin.checkSessionAdmin, productsControllers.editGetProducts);

router.get('/edit/thumbDel/:urlid/:productId', authAdmin.checkSessionAdmin, productsControllers.editThumbGetProducts);

router.patch('/update', authAdmin.checkSessionAdmin, upload.array('images', 5), productsControllers.updatePostProducts);

router.get('/search', authAdmin.checkSessionAdmin, productsControllers.searchProducts);

module.exports = router;    