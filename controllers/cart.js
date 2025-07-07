

const getCart = async (req,res,next) => {

    res.render('cart', {cssFile: '/stylesheets/cart.css', jsFile: '/javascripts/cart.js'})

};

module.exports = { getCart }