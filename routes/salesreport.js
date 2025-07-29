const express = require('express');
const router = express.Router();
const authAdmin = require('../middleware/authAdmin');
const salesreportControllers = require('../controllers/salesreport');

router.get('/', authAdmin.checkSessionAdmin, salesreportControllers.getSalesReport);
router.get('/exportExcel', authAdmin.checkSessionAdmin, salesreportControllers.exportExcelSalesReport);
router.get('/exportPdf', authAdmin.checkSessionAdmin, salesreportControllers.exportPdfSalesReport);
router.get('/salesreport-export', authAdmin.checkSessionAdmin, salesreportControllers.getSalesReportExport);



module.exports = router;