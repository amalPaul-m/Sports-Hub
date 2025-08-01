const usersSchema = require('../models/usersSchema');
const walletSchema = require('../models/walletSchema');
const generateOtp = require('../authentication/generateotp');
const sendVerificationEmail = require('../authentication/mailer');

const postVerifyOtp = async (req, res, next) => {
  try {

    const otp = req.body.otp;

    if (otp === req.session.otp) {
      const userData = new usersSchema( req.session.userData ); 
      console.log(userData)

      await userData.save();

      const referralCode = req.session.refferal;
      let refferals;
      if(referralCode){
      refferals = await usersSchema.findOne({referal: req.session.refferal});
      }

      if(refferals) {
        const referalUserId = refferals._id;
        const transactionData1 = {
        type: "add",
        amount: 100,
        description: "Referral Bonus"
        }
        await walletSchema.findOneAndUpdate(
        {userId: referalUserId}, 
        {
          $inc: { balance: 100 },
          $push : {transaction: transactionData1}
        },
        { new: true, upsert: true }
      );

        const referUser = userData.email;
        const userId = await usersSchema.findOne({email: referUser});
        const referUserId = userId._id;
        const transactionData2 = {
        type: "add",
        amount: 50,
        description: "Referral Bonus for Signup"
        }
        await walletSchema.findOneAndUpdate(
          {userId: referUserId },
          {
            $inc: { balance: 50 },
            $push : {transaction: transactionData2}
          },
          { new: true, upsert: true }
        );
        
      }      

      return res.json({ success: true, redirectUrl: '/login' });
    } else {

      return res.json({ success: false, message: 'Invalid OTP' });
    }
  } catch (err) {
    err.message = 'Error verifying OTP';
    console.log(err)
    next(err);
  }
};


const postResendOtp = async (req, res, next) => {
  try {
    const email = req.session.userData?.email;

    if (!email) {
      return res.json({ success: false, message: 'Email not found in session' });
    }

    const newOtp = generateOtp(); // same function you used before
    const emailSent = await sendVerificationEmail(email, newOtp);

    if (emailSent) {
      req.session.otp = newOtp;
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Failed to send email' });
    }

  } catch (err) {
    err.message = 'Error resending OTP';
    next(err);
  }
};


module.exports = { postVerifyOtp, postResendOtp }