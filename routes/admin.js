const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const adminControll = require('../controllers/admin')


router.get('/', authAdmin.isLogginAdmin, adminControll.getAdminLogin);

router.post('/', authAdmin.isLogginAdmin, adminControll.postAdminLogin);


module.exports = router;