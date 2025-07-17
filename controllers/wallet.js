const walletSchema = require('../models/walletSchema');
const usersSchema = require('../models/usersSchema');

const getWallet = async (req,res,next) => {

    const email = req.session.users?.email;
    const usersData = await usersSchema.findOne({ email });

    const walletData = await walletSchema.findOne({userId: usersData._id})

    res.render('wallet', {
        cssFile: '/stylesheets/wallet.css', 
        jsFile: '/javascripts/wallet.js',
        walletData
    })
}

module.exports = { getWallet }