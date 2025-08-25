const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const nocache = require('nocache');
const bodyParser = require('body-parser');
const passport = require('passport');
const hbs = require('hbs');
const dotenv = require('dotenv');
const Razorpay = require('razorpay');
const fetch = require('node-fetch');
dotenv.config();
require('dotenv').config();
const methodOverride = require('method-override');
const moment = require('moment');
const errorHandler = require('./middleware/errorHandler');
const connectToDB = require('./configuration/db');
connectToDB();
require('./auth/google'); // passport strategy




const indexRouter = require('./routes/index');
const homeRouter = require('./routes/home');
const loginRouter = require('./routes/login')
const signupRouter = require('./routes/signup')
const productsRouter = require('./routes/products')
const logoutRouter = require('./routes/logout')
const forgotRouter = require('./routes/forgot')
const verifyOtpRouter = require('./routes/verifyOtp');
const resetRouter = require('./routes/reset');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin'); 
const dashboardRouter = require('./routes/dashboard');
const customersRouter = require('./routes/customers'); 
const categoryRouter = require('./routes/category');
const userProductsRouter = require('./routes/userproducts');
const productdetailsRouter = require('./routes/productdetails');
const yourAccountRouter = require('./routes/youraccount');
const cartRouter = require('./routes/cart');
const checkoutRouter = require('./routes/checkout');
const invoiceRouter = require('./routes/invoice');
const orderslistRouter = require('./routes/orderslist');
const returnsRouter = require('./routes/return');
const wishlistRouter = require('./routes/wishlist');
const walletRouter = require('./routes/wallet');
const couponRouter = require('./routes/coupon');
const offersRouter = require('./routes/offers');
const salesreportRouter = require('./routes/salesreport');

const app = express();


//session handling
app.use(session({
  secret: process.env.SESSION_SECRET || 'someStrongRandomSecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Set to true if using HTTPS
    httpOnly: true, // Helps prevent XSS attacks
    maxAge: 1000 * 60 * 60 * 24
  }
}))


app.use(methodOverride('_method'));
//cache remove
app.use(nocache())


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());


// Prevent caching to block back button after logout
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Register Helper


hbs.registerHelper('addOne', function (value) {
  return value + 1;
});

hbs.registerHelper('length', function (array) {
  return array.length;
});


hbs.registerHelper('last8', function (objectId) {
  return objectId.toString().slice(-8);
});

hbs.registerHelper('add', (a, b) => a + b);
hbs.registerHelper('mul', (a, b) => a * b);
hbs.registerHelper('subtract', (a, b) => a - b);
hbs.registerHelper('eq', (a, b) => a === b);
hbs.registerHelper('ne', (a, b) => a !== b);
hbs.registerHelper('gt', (a, b) => a > b);
hbs.registerHelper('lt', (a, b) => a < b);
hbs.registerHelper('or', function (a, b, options) {
    return a || b ? options.fn(this) : options.inverse(this);
});
hbs.registerHelper('ore', function (a, b) {
    return a || b;
});
hbs.registerHelper('getPaymentAmount', function (paymentInfo) {
    return paymentInfo && paymentInfo.length && paymentInfo[0].totalAmount
        ? paymentInfo[0].totalAmount
        : 0;
});
hbs.registerHelper('safeSubtract', function(a, b) {
    const valA = Number(a) || 0;
    const valB = Number(b) || 0;
    const result = valA - valB;
    return result < 0 ? 0 : result;
});
hbs.registerHelper('json', function (context) {
  return JSON.stringify(context);
});
hbs.registerHelper('formatDate', function (date, format) {
  return moment(date).format(format);
});

hbs.registerHelper('cutWords', function (text, wordCount) {
  if (!text) return '';
  return text.split(' ').slice(0, wordCount).join(' ') + '...';
});

hbs.registerHelper('pagination', (totalPages) => {
  let pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  return pages;
});


hbs.registerHelper('gte', function (a, b) {
  return a >= b;
});

hbs.registerHelper('percentage', function (a, b) {
  const per = Math.ceil(((a-b)/a)*100);
  return per;
});

hbs.registerHelper('StockCount', function (variants) {
  let totalStock = 0;
        for(const variant of variants) {
            totalStock+=variant.stockQuantity;
    }
    return totalStock;
});

hbs.registerHelper('range', function (start, end) {
  let arr = [];
  for (let i = start; i <= end; i++) {
    arr.push(i);
  }
  return arr;
});

hbs.registerHelper('firstImage', function (imagesArray) {
  return imagesArray?.[0]; 
});

hbs.registerHelper('formatDateFull', function(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'short', 
    day: '2-digit',    
    month: 'long',      
    year: 'numeric'     
  }).replace(',', ''); 
});


hbs.registerHelper('splitTime', function (datetime) {
    const date = new Date(datetime);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes}:${seconds} ${ampm}`;
});

hbs.registerHelper('gst', function (a) {
  return (a-(a/1.18)).toFixed(2);
});

hbs.registerHelper('netAmount', function (a) {
  return (a/1.18).toFixed(2);
});

hbs.handlebars.registerHelper('includes', function (array, value) {
    if (!array) return false;
    return array.includes(value.toString());
});

hbs.registerHelper('formatDate', function(dateString) {
    if (!dateString) return '';
    return dateString.toISOString().slice(0, 10);
});

hbs.registerHelper('json', function(context) {
  return JSON.stringify(context);
});

hbs.registerHelper('times', function(n, block) {
  let accum = '';
  for (let i = 0; i < n; ++i) {
    accum += block.fn(i);
  }
  return accum;
});


hbs.registerHelper('includes', function (array, value, options) {
  const id = value.toString();
  const match = Array.isArray(array) && array.map(v => v.toString()).includes(id);
  return match ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('toString', function(value) {
  return value.toString();
});

hbs.registerHelper('getAvgRating', function(productId, reviewSummary) {
  if (!Array.isArray(reviewSummary)) return 0;
  const found = reviewSummary.find(r => r.productId == productId.toString());
  return found ? found.avgRating : 0;
});
// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

hbs.registerPartials(path.join(__dirname, 'views/partials'));

hbs.registerHelper('section', function (name, options) {
    if (!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
    return null;
});

hbs.registerHelper('or', function (a, b, options) {
    return a || b ? options.fn(this) : options.inverse(this);
});

hbs.registerHelper('calcTotalRegularPrice', function (productInfo) {
    let total = 0;
    productInfo.forEach(item => {
        if (!isNaN(item.regularPrice)) {
            total += Number(item.regularPrice*item.quantity);
        }
    });
    return total;
});

hbs.registerHelper('length', function (value) {
  if (Array.isArray(value) || typeof value === 'string') {
    return value.length;
  }
  return 0;
});

hbs.registerHelper('for', function(from, to, step, block) {
  let accum = '';
  for (let i = from; i < to; i += step) {
    accum += block.fn(i);
  }
  return accum;
});

hbs.registerHelper('getItem', function (array, index) {
  return array?.[index];
});


app.enable("trust proxy");

app.use((req, res, next) => {
  if (req.secure) {
    next();
  } else {
    res.redirect("https://" + req.headers.host + req.url);
  }
});


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// middlewares

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/home', homeRouter);
app.use('/login', loginRouter);
app.use('/signup', signupRouter);
app.use('/products', productsRouter);
app.use('/logout', logoutRouter);
app.use('/forgot', forgotRouter);
app.use('/verifyOtp', verifyOtpRouter);
app.use('/reset', resetRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/dashboard', dashboardRouter);
app.use('/customers', customersRouter);
app.use('/category', categoryRouter)
app.use('/userproducts', userProductsRouter);
app.use('/productdetails', productdetailsRouter);
app.use('/youraccount', yourAccountRouter);
app.use('/cart', cartRouter);
app.use('/checkout', checkoutRouter);
app.use('/invoice', invoiceRouter);
app.use('/orderslist', orderslistRouter);
app.use('/return', returnsRouter);
app.use('/wishlist', wishlistRouter);
app.use('/wallet', walletRouter);
app.use('/coupon', couponRouter);
app.use('/offers', offersRouter);
app.use('/salesreport',salesreportRouter);

app.use(errorHandler);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
