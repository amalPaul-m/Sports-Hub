const usersSchema = require('../models/usersSchema')
const generateOtp = require('../authentication/generateotp');
const sendVerificationEmail = require('../authentication/mailer');

const postVerifyOtp = async (req, res, next) => {
  try {

    const otp = req.body.otp;

    console.log('Received OTP:', otp);
    console.log('Session OTP:', req.session.otp);
    console.log('userData:', req.session.userData);

    if (otp === req.session.otp) {
      const userData = new usersSchema( req.session.userData ); // Retrieve user data from session
      console.log(userData)

      await userData.save();

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


module.exports = {postVerifyOtp, postResendOtp}