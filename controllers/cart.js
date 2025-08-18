const cartSchema = require('../models/cartSchema');
const productsSchema = require('../models/productsSchema');
const usersSchema = require('../models/usersSchema');
const wishlistSchema = require('../models/wishlistSchema');
const couponSchema = require('../models/couponSchema');
const couponSessionClr = require('../helpers/couponSessionClr');
const ordersSchema = require('../models/ordersSchema');
const { apiLogger, errorLogger } = require('../middleware/logger');

const getCart = async (req, res, next) => {

  const email = req.session.users?.email;

  if (!req.session.users?.email) {
    return res.redirect('/login');
  }

  const user = await usersSchema.findOne({ email });
  if (!user) return res.redirect('/login');


  //Active offers Checking

  const [productsList, cartList] = await Promise.all([
    productsSchema.find(),
    cartSchema.find({ userId: user._id })
  ]);

  const cartProductIds = cartList.flatMap(cart =>
    cart.items.map(item => item.productId.toString())
  );

  for (const product of productsList) {
    if (!cartProductIds.includes(product._id.toString())) {
      continue;
    }

    const currentDate = new Date();
    const activeFrom = new Date(product.startDate);
    const expireTo = new Date(product.endDate);

    let salePrice = product.regularPrice;

    if (
      product.discountPercentage > 0 &&
      currentDate >= activeFrom &&
      currentDate <= expireTo
    ) {
      salePrice = Math.ceil(
        product.regularPrice -
        (product.regularPrice * product.discountPercentage) / 100
      );
    }

    await cartSchema.updateOne(
      { userId: user._id, 'items.productId': product._id },
      { $set: { 'items.$.price': salePrice } }
    );
  }




  const cartItem = await cartSchema.findOne({ userId: user._id }).populate('items.productId');


  if (!cartItem || !cartItem.items || cartItem.items.length === 0) {
    return res.render('cart', {
      cartItems: [],
      totalAmount: 0,
      tax: 0,
      net: 0
    });
  }

  let totalAmount = cartItem.items.reduce((sum, item) => {
    return sum + (parseFloat(item.price) * parseInt(item.quantity));
  }, 0);
  const tax = Math.round(totalAmount - (totalAmount / 1.18));
  const net = Math.round(totalAmount / 1.18);

  const shippingCharge = 40;
  if (totalAmount <= 1000) {
    totalAmount = totalAmount + shippingCharge;
  }

  req.session.totalAmount = totalAmount;
  req.session.shippingCharge = shippingCharge;

  let errorMessage = null;
  const errorType = req.query.error;

  if (errorType === 'out_of_stock') {
    errorMessage = 'Some items in your cart are out of stock or unavailable.';
  } else if (errorType === 'empty_cart') {
    errorMessage = 'Your cart is empty.';
  }

  couponSessionClr(req);

  res.render('cart', { errorMessage, cartItem, net, totalAmount, tax, shippingCharge })

};


const productDetailAddCart = async (req, res, next) => {

  try {

    const { productId, selectedColor, selectedSize, action } = req.body;
    const email = req.session.users?.email;

    const [usersData, currproduct] = await Promise.all([
      usersSchema.findOne({ email }),
      productsSchema.findById(productId)
    ]);

    const cart = await cartSchema.findOne({ userId: usersData._id });

    if (!cart) {

      const cartData = new cartSchema({

        userId: usersData._id,
        items: [{
          productId,
          quantity: 1,
          price: currproduct.salePrice,
          regularPrice: currproduct.regularPrice,
          color: selectedColor,
          size: selectedSize
        }]
      });
      await cartData.save();

      apiLogger.info('Cart created successfully', {
        controller: 'cart',
        action: 'createCart',
        userId: usersData._id,
        productId, productId,
        color: selectedColor,
        size: selectedSize
      });

      couponSessionClr(req);

    } else {

      const productData = await productsSchema.findOne(
        {
          _id: productId,
          variants: {
            $elemMatch: {
              color: selectedColor,
              size: selectedSize
            }
          }
        },
        { 'variants.$': 1 }
      );

      if (!productData || !productData.variants.length) {
        console.log("Variant not found");
        return;
      }

      const stock = productData.variants[0].stockQuantity;

      if (stock <= 0) {
        return res.json({ message: "The variant is out of stock!" });
      } else {

        const addData = {
          productId,
          quantity: 1,
          price: currproduct.salePrice,
          regularPrice: currproduct.regularPrice,
          color: selectedColor,
          size: selectedSize
        };

        const updateResult = await cartSchema.updateOne(
          {
            _id: cart._id,
            items: {
              $not: {
                $elemMatch: {
                  productId: productId,
                  color: selectedColor,
                  size: selectedSize
                }
              }
            }
          },
          {
            $push: { items: addData }
          }
        );

        apiLogger.info('Product added to cart', {
          controller: 'cart',
          action: 'addToCart',
          userId: usersData._id,
          productId,
          color: selectedColor,
          size: selectedSize
        });

        if (updateResult.modifiedCount > 0) {
          await wishlistSchema.updateOne(
            { userId: usersData._id },
            { $pull: { productId: productId } }
          );
          return res.json({ message: "Added to Cart" });
        } else {
          return res.json({ message: "Variant already in cart!" });
        }

      }

      couponSessionClr(req);

    }

  } catch (error) {
    errorLogger.error('Failed to add to cart', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'cart',
      action: 'addToCart'
    });
    next(error);
  }

};


const removeCart = async (req, res, next) => {

  try {
    const cartId = req.params?.id;
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    await cartSchema.findOneAndUpdate({ userId: usersData._id },
      { $pull: { items: { _id: cartId } } }, { new: true });

    couponSessionClr(req);

    apiLogger.info('Item removed from cart', {
      controller: 'cart',
      action: 'removeCart',
      userId: usersData._id,
      cartId
    });

    res.redirect('/cart');

  } catch (error) {

    errorLogger.error('Failed to remove item from cart', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'cart',
      action: 'removeCart'
    });
    next(error);

  }

};



const increaseItemCount = async (req, res) => {

  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;
  const productId = req.params?.productId;

  try {
    const cart = await cartSchema.findOne({ userId });
    const { size, color } = req.body;
    // const item = cart.items.find(i => i.productId.toString() === productId);
    const item = cart.items.find(i =>
      i.productId.toString() === productId &&
      i.size === req.body?.size &&
      i.color === req.body?.color
    );
    if (!item) return res.status(404).json({ success: false });

    const product = await productsSchema.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const matchedVariant = product.variants?.find(
      v => v.size === item.size && v.color === item.color
    );


    if (!matchedVariant) {

      couponSessionClr(req);

      return res.json({
        success: false,
        stock: 0,
        message: "Variant not found for selected size and color."
      });
    }

    if (item.quantity >= matchedVariant.stockQuantity) {

      couponSessionClr(req);

      return res.json({
        success: false,
        outOfStock: true,
        stock: Number(matchedVariant.stockQuantity),
        message: `Only ${matchedVariant.stockQuantity} available in stock`
      });
    }

    if (item.quantity >= 3) {

      couponSessionClr(req);

      return res.json({
        success: false,
        maxReached: true,
        stock: Number(matchedVariant.stockQuantity),
        message: "Maximum quantity of 3 reached"
      });
    }

    item.quantity += 1;
    await cart.save();

    const updatedPrice = item.quantity * item.price;
    const cartTotal = cart?.items?.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    const netAmount = +(cartTotal / 1.18).toFixed(2);
    const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
    let grandTotal = +(cartTotal).toFixed(2);
    let shipping;
    if (cartTotal < 1000) {
      shipping = req.session.shippingCharge;
      grandTotal = grandTotal + shipping;
    } else {
      shipping = '0.00';
    }


    req.session.totalAmount = cartTotal;

    couponSessionClr(req);
    const payable = grandTotal;

    res.json({
      success: true,
      newQty: item.quantity,
      stock: Number(matchedVariant.stockQuantity),
      updatedPrice,
      cartTotal,
      totalTax,
      grandTotal,
      netAmount,
      payable,
      shippingCharge: shipping,
      couponAmount: 0
    });

  } catch (error) {
    errorLogger.error('Failed to increase item count', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'cart',
      action: 'increaseItemCount'
    });
    next(error);
  }
};




const decreaseItemCount = async (req, res) => {
  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;
  const productId = req.params?.productId;

  try {
    const cart = await cartSchema.findOne({ userId });
    const { size, color } = req.body;
    // const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
    const itemIndex = cart?.items?.findIndex(i =>
      i.productId.toString() === productId &&
      i.size === req.body.size &&
      i.color === req.body.color
    );

    if (itemIndex === -1) return res.status(404).json({ success: false });

    const item = cart.items[itemIndex];


    if (item.quantity === 1) {
      const cartTotal = cart?.items?.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const netAmount = +(cartTotal / 1.18).toFixed(2);
      const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
      let grandTotal = +(cartTotal).toFixed(2);
      let shipping;
      if (cartTotal < 1000) {
        shipping = req.session.shippingCharge;
        grandTotal = grandTotal + shipping;
      } else {
        shipping = '0.00';
      }

      req.session.totalAmount = cartTotal;

      couponSessionClr(req);

      const payable = grandTotal;

      return res.json({
        success: true,
        newQty: item.quantity,
        updatedPrice: item.quantity * item.price,
        cartTotal,
        totalTax,
        grandTotal,
        netAmount,
        payable,
        shippingCharge: shipping,
        couponAmount: 0
      });
    }


    item.quantity -= 1;
    await cart.save();

    const updatedPrice = item.quantity * item.price;
    const cartTotal = cart?.items?.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const netAmount = +(cartTotal / 1.18).toFixed(2);
    const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
    let grandTotal = +(cartTotal).toFixed(2);
    let shipping1;
    if (cartTotal < 1000) {
      shipping1 = req.session.shippingCharge;
      grandTotal = grandTotal + shipping1;
    } else {
      shipping1 = '0.00';
    }

    req.session.totalAmount = cartTotal;

    couponSessionClr(req);
    const payable = grandTotal;

    res.json({
      success: true,
      newQty: item.quantity,
      updatedPrice,
      cartTotal,
      totalTax,
      grandTotal,
      netAmount,
      payable,
      shippingCharge: shipping1,
      couponAmount: 0
    });
  } catch (error) {
    errorLogger.error('Failed to decrease item count', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'cart',
      action: 'decreaseItemCount'
    });
    next(error);
  }
};



const checkCoupon = async (req, res, next) => {

  const { couponCode } = req.body;
  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;
  const couponList = await couponSchema.findOne({ code: couponCode });

  const codeExist = await ordersSchema.findOne({
    userId: userId,
    "couponInfo.couponCode": couponCode
  });


  if (codeExist && codeExist?.couponInfo?.[0]?.couponCode === couponCode) {
    return res.json({
      success: false,
      message: 'You have already used this coupon.'
    })
  }

  if (!couponList) {
    res.json({
      success: false,
      message: 'Please Enter Valid Coupon Code.'
    })
  } else {

    const currentDate = new Date();
    const activeFrom = new Date(couponList.activeFrom);
    const expireTo = new Date(couponList.expireTo);

    const dateCheck = currentDate >= activeFrom && currentDate <= expireTo;
    const balance = couponList.balance > 0 ? true : false;
    const validAmount = req.session.totalAmount >= couponList.minimumOrderAmount ? true : false;
    const status = couponList.isActive;

    if (dateCheck && balance && validAmount && status) {


      let couponAmount = 0;

      if (couponList.discountAmount !== null) {
        couponAmount = couponList.discountAmount;
      } else if (couponList.discountPercentage !== null) {
        if( req.session.totalAmount < 1000) {
          couponAmount = (req.session.totalAmount - 40) * (couponList.discountPercentage / 100);
        } else {
          couponAmount = req.session.totalAmount * (couponList.discountPercentage / 100);
        }
      }

      const payable = req.session.totalAmount - couponAmount;

      // if (req.session.totalAmount < 1000) {
      //   payable = payable + req.session.shippingCharge;
      // }

      req.session.couponCode = couponCode;

      res.json({
        success: true,
        message: 'Coupon Code Applied Successfully!',
        couponAmount,
        payable
      })

    } else {

      res.json({
        success: false,
        message: 'This Coupon Code is Not Applicable.'
      })

    }
  }

};




module.exports = {
  getCart, productDetailAddCart, removeCart,
  increaseItemCount, decreaseItemCount, checkCoupon
}