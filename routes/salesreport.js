const express = require('express');
const router = express.Router();
const salesreportControllers = require('../controllers/salesreport');

router.get('/', salesreportControllers.getSalesReport);
router.get('/exportExcel', salesreportControllers.exportExcelSalesReport);
router.get('/exportPdf', salesreportControllers.exportPdfSalesReport);
router.get('/salesreport-export', salesreportControllers.getSalesReportExport);



module.exports = router;