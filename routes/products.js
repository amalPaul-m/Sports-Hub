const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const productsControllers = require('../controllers/products')

router.get('/', productsControllers.getProducts);

router.get('/add', productsControllers.getAddProducts);

router.post('/add', upload.array('images', 5), productsControllers.postAddProducts);

router.patch('/list/:id', productsControllers.listGetProducts);

router.patch('/unlist/:id', productsControllers.unlistGetProducts);

router.get('/edit/:id', productsControllers.editGetProducts);

router.get('/edit/thumbDel/:urlid/:productId', productsControllers.editThumbGetProducts);

router.patch('/update', upload.array('images', 5), productsControllers.updatePostProducts);

router.get('/search', productsControllers.searchProducts);

module.exports = router;    