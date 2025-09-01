const ordersSchema = require('../models/ordersSchema');
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const { apiLogger, errorLogger } = require('../middleware/logger');

const SHIPPING_CHARGE = Number(process.env.SHIPPING_CHARGE) || 0;

const getSalesReport = async (req, res, next) => {

    try {

        const page = parseInt(req.query.page) || 1;
        const limit = 10;
        const skip = (page - 1) * limit;


        const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
        const toDate = req.query.toDate ? new Date(req.query.toDate) : null;

        const query = {};
        if (fromDate && toDate) {
            toDate.setHours(23, 59, 59, 999);
            query.createdAt = { $gte: fromDate, $lte: toDate };
        }

        const [totalCoupons, ordersData] = await Promise.all([
            ordersSchema.countDocuments({ ...query, deliveryStatus: 'delivered' }),
            ordersSchema.find({...query, deliveryStatus:'delivered'}).sort({ createdAt: -1 })
                .skip(skip).limit(limit)
                .populate('userId')
        ]);

        const totalPages = Math.ceil(totalCoupons / limit);

        let grandTotalRegularPrice = 0;
        ordersData.forEach(order => {
            order.productInfo.forEach(item => {
                if (!isNaN(item.regularPrice)) {
                    grandTotalRegularPrice += Number(item.regularPrice * item.quantity);
                }
            });
        });


        let totalDiscountSum = 0;
        ordersData.forEach(order => {
            let regularTotal = 0;
            order.productInfo.forEach(item => {
                if (!isNaN(item.regularPrice)) {
                    regularTotal += Number(item.regularPrice * item.quantity);
                }
            });
            const discount = regularTotal - order.paymentInfo[0]?.totalAmount;
            if (!isNaN(discount) && regularTotal > 1000) {
                totalDiscountSum += discount;
            } else {
                totalDiscountSum += Number(discount + SHIPPING_CHARGE);
            }
        });

        req.session.query = query;
        req.session.salescount = totalCoupons;
        req.session.totalOrderAmount = grandTotalRegularPrice;
        req.session.totaldiscount = totalDiscountSum;

        res.render('salesreport', {

            ordersData,
            currentPage: page,
            totalPages,
            totalCoupons,
            grandTotalRegularPrice,
            totalDiscountSum,
            shippingCharge: grandTotalRegularPrice<1000 ? SHIPPING_CHARGE : 0,
            fromDate: req.query.fromDate || '',
            toDate: req.query.toDate || ''
        })

    } catch (error) {
        errorLogger.error('Error in getSalesReport', {
            message: error.message,
            stack: error.stack,
            controller: 'salesreport',
            action: 'getSalesReport',
            query: req.query
        });
        next(error);
    }
};




const exportExcelSalesReport = async (req, res, next) => {
    try {
        const ordersData = await ordersSchema.find({...req.session.query, deliveryStatus:'delivered'})
            .sort({ createdAt: -1 })
            .populate('userId');

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Sl.No', key: 'slno', width: 10 },
            { header: 'Order ID', key: 'orderId', width: 25 },
            { header: 'Customer', key: 'customer', width: 20 },
            { header: 'Total ₹', key: 'total', width: 15 },
            { header: 'Discount ₹', key: 'discount', width: 15 },
            { header: 'Payment', key: 'payment', width: 15 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Date', key: 'date', width: 25 },
        ];

        let slNo = 1;
        ordersData.forEach(order => {
            const totalRegularPrice = order.productInfo.reduce(
                (sum, item) => sum + (item.regularPrice * item.quantity || 0),
                0
            );

            const payment = order.paymentInfo?.[0] || {};
            const totalAmount = payment.totalAmount || 0;
            const paymentMethod = payment.paymentMethod || "N/A";

            const discount = totalRegularPrice > 1000
                ? totalRegularPrice - totalAmount
                : totalRegularPrice - (totalAmount - SHIPPING_CHARGE);

            worksheet.addRow({
                slno: slNo++,
                orderId: order.orderId || "N/A",
                customer: order.userId?.name || 'Guest',
                total: totalRegularPrice,
                discount: discount,
                payment: paymentMethod,
                status: order.deliveryStatus || 'N/A',
                date: order.createdAt.toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        errorLogger.error('Error in exportExcelSalesReport', {
            message: error.message,
            stack: error.stack,
            controller: 'salesreport',
            action: 'exportExcelSalesReport',
            query: req.session.query
        });
        next(error);
    }
};





const getSalesReportExport = async (req, res, next) => {
    try {

        const ordersData = await ordersSchema.find({...req.session.query, deliveryStatus:'delivered'})
            .sort({ createdAt: -1 })
            .populate('userId');

        res.render('salesreport-export', {
            layout: false,
            ordersData,
            shippingCharge: SHIPPING_CHARGE
        });

    } catch (error) {
        errorLogger.error('Error in getSalesReportExport', {
            message: error.message,
            stack: error.stack,
            controller: 'salesreport',
            action: 'getSalesReportExport',
            query: req.session.query
        });
        next(error);
    }
};

const exportPdfSalesReport = async (req, res, next) => {
    try {
        const ordersData = await ordersSchema.find({...req.session.query, deliveryStatus:'delivered'}).populate('userId')
        .sort({ createdAt: -1 });

        const saleCount = req.session.salescount;
        const totalOrderAmount = req.session.totalOrderAmount;
        const totalDiscount = req.session.totaldiscount;
        const html = await new Promise((resolve, reject) => {
            res.render('salesreport-export', { layout: false, ordersData, saleCount, totalOrderAmount, totalDiscount }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true
        });

        await browser.close();

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="sales-report.pdf"',
            'Content-Length': pdfBuffer.length
        });

        res.end(pdfBuffer);
    } catch (error) {
        errorLogger.error('Error in exportPdfSalesReport', {
            message: error.message,
            stack: error.stack,
            controller: 'salesreport',
            action: 'exportPdfSalesReport',
            query: req.session.query
        });
        next(error);
    }
};



module.exports = {
    getSalesReport, exportExcelSalesReport,
    getSalesReportExport, exportPdfSalesReport
}