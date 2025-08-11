const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const { apiLogger, errorLogger } = require('../middleware/logger');

const ordersSchema = require('../models/ordersSchema');
require('../models/addressSchema');
require('../models/productsSchema');




hbs.registerHelper('addone', function (index) { return index + 1;});

hbs.registerHelper('calcTotal', function (qty, price) {
  return ((qty * price)/1.18).toFixed(2);
});

hbs.registerHelper('calcGST', function (qty, price, gstRate) {
  const total = (qty * price)/1.18;
  return ((total * gstRate) / 100).toFixed(2);
});

hbs.registerHelper('calcTotalWithGST', function (qty, price) {
  const total = qty * price;
  return total;
});

hbs.registerHelper('calcGSTTotal', function (items, gstRate) {
  const totalGST = items.reduce((sum, item) => {
    return sum + (((item.qty * item.price)/1.18) * gstRate) / 100;
  }, 0);
  return totalGST.toFixed(2);
});

hbs.registerHelper('calcGrandTotal', function (items, gstRate) {
  const grandTotal = items.reduce((sum, item) => {
    const total = item.qty * item.price;
    return (sum + total)/1.18;
  }, 0);
  return grandTotal.toFixed(2);
});





const downloadInvoice = async (req, res) => {

 try {
    const orderId = req.params.orderId;
    const orderData = await ordersSchema.findOne({ orderId: orderId, 'productInfo.status': 'confirmed' }).populate('productInfo.productId').populate('addressId'); 


    const templatePath = path.join(__dirname, '../views/invoice.hbs');
    const templateContent = fs.readFileSync(templatePath, 'utf-8');

    const confirmedProducts = orderData.productInfo.filter(
    item => item.status === 'confirmed'
    );

    if (confirmedProducts.length === 0) {
    return res.status(400).send('No confirmed items found in the order.');
    }

    const items = confirmedProducts.map(item => ({
    name: item.productId.productName,
    qty: item.quantity,
    price: item.price
    }));

    const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

    const compiledTemplate = hbs.compile(templateContent);

    const html = compiledTemplate({
      orderId: orderData.orderId,
      date: orderData.createdAt.toLocaleDateString(),
   
        customername: orderData.addressId.fullName,
        customeraddress: `${orderData.addressId.houseNo},  ${orderData.addressId.street}, ${orderData.addressId.district}, ${orderData.addressId.state}, ${orderData.addressId.pinCode}`,
        customerphone: orderData.addressId.mobileNumber,

      items,
      total
    });

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true
    });

    await browser.close();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice_${orderId}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    res.end(pdfBuffer);
  } catch (error) {

    errorLogger.error('Failed to download invoice', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'invoice',
      action: 'downloadInvoice'
    });
    next(error);

  }
};


module.exports = { downloadInvoice };
