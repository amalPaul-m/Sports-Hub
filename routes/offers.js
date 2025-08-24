const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const offersControllers = require('../controllers/offers')

router.get('/', authAdmin.checkSessionAdmin, offersControllers.getOffers);

router.get('/add/product-offer', authAdmin.checkSessionAdmin, offersControllers.getAddProductOffers);
router.post('/add/product-offer', authAdmin.checkSessionAdmin, offersControllers.postAddProductOffers);

router.get('/add/category-offer', authAdmin.checkSessionAdmin, offersControllers.getAddCategoryOffers);
router.post('/add/category-offer', authAdmin.checkSessionAdmin, offersControllers.postAddCategoryOffers);

router.delete('/delete/:id', authAdmin.checkSessionAdmin, offersControllers.deleteOffers);

router.get('/edit/Product/:id', authAdmin.checkSessionAdmin, offersControllers.getEditProductOffers);
router.post('/edit-product-offer/:id', authAdmin.checkSessionAdmin, offersControllers.postEditProductOffers);

router.get('/edit/Category/:id', authAdmin.checkSessionAdmin, offersControllers.getEditCategoryOffers);
router.post('/edit-category-offer/:id', authAdmin.checkSessionAdmin, offersControllers.postEditCategoryOffers);


module.exports = router;