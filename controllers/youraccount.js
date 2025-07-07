const usersSchema = require('../models/usersSchema');
const addressSchema = require('../models/addressSchema');
const bcrypt = require('bcrypt');

const getyouraccount = async (req, res, next) => {

    try {
        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        res.render('youraccount',
        { usersData, cssFile: '/stylesheets/yourAccount.css', jsFile: '/javascripts/yourAccount.js' });

    } catch (err) {

        err.message = 'Error get youraccount';
        console.log(err)
        next(err);
    }
    
};

const getyourprofile = async (req,res,next) => {

    try{
        const email = req.session.users?.email;
        const usersDetails = await usersSchema.findOne({ email });
        res.render('yourprofile', { usersDetails, cssFile: '/stylesheets/yourprofile.css', 
        jsFile: '/javascripts/yourprofile.js' })

    } catch(err) {
        err.message = 'Error get youraccount';
        console.log(err)
        next(err);
    }
};

const posteditprofile = async (req,res,next) => {

    try {

        const { name, email, phone } = req.body;

        await usersSchema.findOneAndUpdate(
            { email: email },                 
            { $set: { name: name, phone: phone } },
            { new: true }                      
        );

        const usersDetails = await usersSchema.findOne({ email });

        res.render('yourprofile', { usersDetails, cssFile: '/stylesheets/yourprofile.css', 
        jsFile: '/javascripts/yourprofile.js' })


    } catch(err) {
        err.message = 'Error update youraccount';
        console.log(err)
        next(err);
    }

}


const getchangepassword = async (req,res,next) => {

    res.render('changepassword', { cssFile: '/stylesheets/changepassword.css', 
        jsFile: '/javascripts/changepassword.js' })

}


const patchchangepassword = async (req,res,next) => {

    try { 

    const { oldpassword, newpassword } = req.body;
    const email = req.session.users?.email;

    const usersData = await usersSchema.findOne({ email });
    const match = await bcrypt.compare(oldpassword, usersData.password);
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    if(!match) {
        res.render('changepassword', { content: 'Invalid old passowrd', cssFile: '/stylesheets/changepassword.css', 
        jsFile: '/javascripts/changepassword.js' })
    }else {

    await usersSchema.findOneAndUpdate(
            { email: email },                 
            { $set: { password:hashedPassword } },
            { new: true }                      
        );
    
        res.redirect('/youraccount?success=1');

     }   
   } catch (err) {
        err.message = 'Error change password';
        console.log(err)
        next(err);
   }
}    





const getaddress = async (req, res, next) => {

    try {
        const email = req.session.users?.email;
        const userId = await usersSchema.find({email});
        const addressData = await addressSchema.find({userId});
        console.log(addressData)

        res.render('address',
        { addressData, cssFile: '/stylesheets/address.css', jsFile: '/javascripts/address.js' });

    } catch (err) {

        err.message = 'Error get address';
        console.log(err)
        next(err);
    }
    
};


const postaddress = async (req,res,next) => {

    try {

        const email = req.session.users?.email;
        const usersData = await usersSchema.findOne({ email });

        const addressData = new addressSchema ({
            userId: usersData._id,
            fullName: req.body.fullName,
            mobileNumber: req.body.mobileNumber,
            pinCode: req.body.pinCode,
            street: req.body.street,
            houseNo: req.body.houseNo,
            district: req.body.district,
            state: req.body.state,
            landMark: req.body.landMark,
            alternate_number: req.body.alternate_number,    
            addressType: req.body.addressType
        });

            await addressData.save();
            res.redirect('/youraccount/address');

    }catch (err) {
        err.message = 'Error save address';
        console.log(err)
        next(err);
    }
};


const editaddress = async (req,res,next) => {

    try {

        const addressId = req.body.addressId;

        const editAddressData = {
            fullName: req.body.fullName,
            mobileNumber: req.body.mobileNumber,
            pinCode: req.body.pinCode,
            street: req.body.street,
            houseNo: req.body.houseNo,
            district: req.body.district,
            state: req.body.state,
            landMark: req.body.landMark,
            alternate_number: req.body.alternate_number,    
            addressType: req.body.addressType
        };

        await addressSchema.findByIdAndUpdate(addressId, { $set: editAddressData }, { new: true });
        res.redirect('/youraccount/address');

    } catch(err) {
        err.message = 'Error edit address';
        console.log(err)
        next(err);
    }
};


const deleteaddress = async (req,res,next) => {

    try {
        
        const addressId = req.body.addressId;

        await addressSchema.findByIdAndDelete(addressId)
        res.redirect('/youraccount/address'); 

    }catch(err) {
        err.message = 'Error delete address';
        console.log(err)
        next(err);
    }

};

const getyourorders = (req,res,next) => {

    res.render('yourorders', {cssFile: '/stylesheets/yourorders.css',
        jsFile: '/javascripts/yourorders.js'
    });

};

module.exports = { getyouraccount, getyourprofile, posteditprofile, getchangepassword, patchchangepassword,
    getaddress, postaddress, editaddress, deleteaddress, getyourorders
 }