const cartSchema = require('../models/cartSchema');
const productsSchema = require('../models/productsSchema');
const usersSchema = require('../models/usersSchema');

const getCart = async (req,res,next) => {

    const email = req.session.users?.email;

    if (!req.session.users?.email) {
        return res.redirect('/login');
    }

    const user = await usersSchema.findOne({ email });
    if (!user) return res.redirect('/login');

    const cartItem = await cartSchema.findOne({userId: user._id}).populate('items.productId');

    if (!cartItem || !cartItem.items || cartItem.items.length === 0) {
    return res.render('cart', { cssFile: '/stylesheets/cart.css', jsFile: '/javascripts/cart.js',
        cartItems: [],
        totalAmount: 0
    });
}

    const totalAmount = cartItem.items.reduce((sum, item) => {
        return sum + (parseFloat(item.price) * parseInt(item.quantity));
        }, 0);
    const tax = Math.round(totalAmount-(totalAmount/1.18)); 
    const netAmount = Math.round(totalAmount/1.18);

    let errorMessage = null;
    const errorType = req.query.error;

    if (errorType === 'out_of_stock') {
      errorMessage = 'Some items in your cart are out of stock or unavailable.';
    } else if (errorType === 'empty_cart') {
      errorMessage = 'Your cart is empty.';
    }

    res.render('cart', {errorMessage, cartItem, totalAmount, tax, netAmount, cssFile: '/stylesheets/cart.css', jsFile: '/javascripts/cart.js'})

};


const productDetailAddCart = async (req,res,next) => {

    try {

        const { productId, selectedColor, selectedSize, action } = req.body;
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });
        const currproduct = await productsSchema.findById(productId);
        console.log(currproduct.salePrice)

        const cart = await cartSchema.findOne({userId: usersData._id});

        if(!cart) {

        const cartData = new cartSchema( {
 
                userId: usersData._id,
                items: [{
                productId,
                quantity: 1,
                price: currproduct.salePrice,
                color: selectedColor,
                size: selectedSize
                }]
        } );

        await cartData.save();

        }else {

            const addData = {
                productId,
                quantity: 1,
                price: currproduct.salePrice,
                color: selectedColor,
                size: selectedSize
            }

        await cartSchema.findOneAndUpdate(
            { _id: cart._id },
            { $push: { items: addData } }
            );

        }

    } catch (err){
        err.message = 'not store cart data';  
        console.log(err)
        next(err);
    }

};


const removeCart = async (req,res,next) => {

    try {
    const cartId = req.params.id;
    console.log(cartId)
    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    await cartSchema.findOneAndUpdate({userId : usersData._id}, 
        { $pull: { items: { _id: cartId } } }, { new: true });

    res.redirect('/cart');
    } catch (err) {

        err.message = 'not delete cart data';  
        console.log(err)
        next(err);
    }

};



const increaseItemCount = async (req, res) => {

  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;
  const productId = req.params.productId;

  try {
    const cart = await cartSchema.findOne({ userId });
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ success: false });

    const product = await productsSchema.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    const matchedVariant = product.variants.find(
      v => v.size === item.size && v.color === item.color
    );

    console.log('===============================',matchedVariant)
    if (!matchedVariant) {
      return res.json({
        success: false,
        message: "Variant not found for selected size and color."
      });
    }

    if (item.quantity >= matchedVariant.stockQuantity) {
      return res.json({
        success: false,
        outOfStock: true,
        message: `Only ${matchedVariant.stockQuantity} available in stock`
      });
    }

    if (item.quantity >= 3) {
      return res.json({
        success: false,
        maxReached: true,
        message: "Maximum quantity of 3 reached"
      });
    }

    item.quantity += 1;
    await cart.save();

    const updatedPrice = item.quantity * item.price;
    const cartTotal = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
    const grandTotal = +(cartTotal).toFixed(2);

    res.json({
      success: true,
      newQty: item.quantity,
      updatedPrice,
      cartTotal,
      totalTax,
      grandTotal
    });

  } catch (err) {
    console.error("Error in increaseItemCount:", err);
    res.status(500).json({ success: false });
  }
};




const decreaseItemCount = async (req, res) => {
  const email = req.session.users?.email;
  const usersData = await usersSchema.findOne({ email });
  const userId = usersData._id;
  const productId = req.params.productId;

  try {
    const cart = await cartSchema.findOne({ userId });
    const itemIndex = cart.items.findIndex(i => i.productId.toString() === productId);
    if (itemIndex === -1) return res.status(404).json({ success: false });

    const item = cart.items[itemIndex];


    if (item.quantity === 1) {
      const cartTotal = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
      const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
      const grandTotal = +(cartTotal).toFixed(2);

      return res.json({
        success: true,
        newQty: item.quantity,
        updatedPrice: item.quantity * item.price,
        cartTotal,
        totalTax,
        grandTotal
      });
    }


    item.quantity -= 1;
    await cart.save();

    const updatedPrice = item.quantity * item.price;
    const cartTotal = cart.items.reduce((sum, i) => sum + i.quantity * i.price, 0);
    const totalTax = +(cartTotal - cartTotal / 1.18).toFixed(2);
    const grandTotal = +(cartTotal).toFixed(2);

    res.json({
      success: true,
      newQty: item.quantity,
      updatedPrice,
      cartTotal,
      totalTax,
      grandTotal
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};




module.exports = { getCart, productDetailAddCart, removeCart, 
increaseItemCount, decreaseItemCount }