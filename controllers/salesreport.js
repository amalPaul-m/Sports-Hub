const ordersSchema = require('../models/ordersSchema');
const ExcelJS = require('exceljs');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');


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

        
        const totalCoupons = await ordersSchema.countDocuments(query);
        const totalPages = Math.ceil(totalCoupons / limit);

        const ordersData = await ordersSchema.find(query).sort({createdAt: -1})
                        .skip(skip).limit(limit)                   
                        .populate('userId');


        let grandTotalRegularPrice = 0;
        ordersData.forEach(order => {
            order.productInfo.forEach(item => {
                if (item.status === 'confirmed' && !isNaN(item.regularPrice)) {
                    grandTotalRegularPrice += Number(item.regularPrice);
                }
            });
        });


        let totalDiscountSum = 0;
        ordersData.forEach(order => {
            let regularTotal = 0;
            order.productInfo.forEach(item => {
                if (!isNaN(item.regularPrice)) {
                    regularTotal += Number(item.regularPrice);
                }
            });
            const discount = regularTotal - order.paymentInfo[0]?.totalAmount;
            if (!isNaN(discount)) {
                totalDiscountSum += discount;
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
            fromDate: req.query.fromDate || '',
            toDate: req.query.toDate || ''
        })

    }catch (error) {
        error.message = 'Error get orders report';
        console.log('error');
        next(error);
    }
};




const exportExcelSalesReport = async (req, res, next) => {
    try {
        const ordersData = await ordersSchema.find(req.session.query)
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
            { header: 'Date', key: 'date', width: 20 },
        ];

        let slNo = 1;
        ordersData.forEach(order => {
            const totalRegularPrice = order.productInfo.reduce((sum, item) => sum + (item.regularPrice || 0), 0);
            const discount = totalRegularPrice - order.paymentInfo[0].totalAmount;

            worksheet.addRow({
                slno: slNo++,
                orderId: order.orderId,
                customer: order.userId.name,
                total: totalRegularPrice,
                discount: discount,
                payment: order.paymentInfo[0].paymentMethod,
                status: order.deliveryStatus,
                date: order.createdAt.toLocaleDateString()
            });
        });
        

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=sales-report.xlsx');

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        error.message = 'Error export excel';
        console.log('error');
        next(error);
    }
};




const getSalesReportExport =  async (req, res, next) => {
    try {

        const ordersData = await ordersSchema.find(req.session.query)
            .sort({ createdAt: -1 })
            .populate('userId');

        res.render('salesreport-export', {
            layout: false,
            ordersData
        });

    } catch (error) {
        error.message = 'Error export pdf';
        console.log('error');
        next(error);
    }
};

const exportPdfSalesReport = async (req, res, next) => {
    try {
         const ordersData = await ordersSchema.find(req.session.query).populate('userId');

         const saleCount = req.session.salescount;
         const totalOrderAmount = req.session.totalOrderAmount;
         const totalDiscount = req.session.totaldiscount;
        const html = await new Promise((resolve, reject) => {
            res.render('salesreport-export', { layout: false, ordersData, saleCount, totalOrderAmount, totalDiscount  }, (err, html) => {
                if (err) reject(err);
                else resolve(html);
            });
        });

        const browser = await puppeteer.launch();
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
        console.error('PDF Export Error:', error);
        next(error);
    }
};



module.exports = { getSalesReport, exportExcelSalesReport, 
     getSalesReportExport , exportPdfSalesReport }