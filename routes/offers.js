const express = require('express');
const router = express.Router();
const offersControllers = require('../controllers/offers')

router.get('/', offersControllers.getOffers);

router.get('/add/product-offer', offersControllers.getAddProductOffers);
router.post('/add/product-offer', offersControllers.postAddProductOffers);

router.get('/add/category-offer', offersControllers.getAddCategoryOffers);
router.post('/add/category-offer', offersControllers.postAddCategoryOffers);

router.delete('/delete/:id', offersControllers.deleteOffers);

router.get('/edit/Product/:id', offersControllers.getEditProductOffers);
router.post('/edit-product-offer/:id', offersControllers.postEditProductOffers);

router.get('/edit/Category/:id', offersControllers.getEditCategoryOffers);
router.post('/edit-category-offer/:id', offersControllers.postEditCategoryOffers);


module.exports = router;