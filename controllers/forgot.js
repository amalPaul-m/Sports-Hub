const usersSchema = require('../models/usersSchema')
const generateOtp = require('../authentication/generateotp');
const sendVerificationEmail = require('../authentication/mailer');


const getForgot = (req, res) => {

  res.render('forgot');

};



const postForgot = async (req, res) => {
  const { email } = req.body;


  const user = await usersSchema.findOne({ email });

  if (!user) {
    return res.render('forgot', { content: 'Email not found' });
  }

  const otp = generateOtp();
  const sent = await sendVerificationEmail(email, otp);

  if (sent) {
    req.session.resetOtp = otp;
    req.session.resetEmail = email;
    console.log('reset otp', req.session.resetOtp)
    console.log('reset email', req.session.resetEmail)

    res.redirect('/forgot/verifyOtp');
  } else {
    res.render('forgot', { content: 'Failed to send OTP' });
  }
};



const getVerifyOtp = (req, res) => {
  if (!req.session.resetEmail) return res.redirect('/forgot');

  res.render('verifyOtp', {
    content: `OTP sent to ${req.session.resetEmail}`,
    alert: 'mt-5 pt-4'
  });
};


const postVerifyOtp = (req, res) => {
  console.log('Received OTP:', req.body.otp);
  console.log('Session OTP:', req.session.resetOtp);

  if (String(req.body.otp) === String(req.session.resetOtp)) {
    return res.json({ success: true, redirectUrl: '/reset' }); // not res.redirect!
  } else {
    return res.json({ success: false, message: 'Invalid OTP' });
  }
};


const postResendOtp = async (req, res) => {
  try {
    const email = req.session.resetEmail;

    if (!email) {
      return res.json({ success: false, message: 'Email not found in session' });
    }

    const newOtp = generateOtp(); // same function you used before
    const emailSent = await sendVerificationEmail(email, newOtp);

    if (emailSent) {
      req.session.resetOtp = newOtp;
      return res.json({ success: true });
    } else {
      return res.json({ success: false, message: 'Failed to send email' });
    }

  } catch (err) {
    err.message = 'Error resending OTP';
    next(err);
  }
};


module.exports = { getForgot, postForgot, getVerifyOtp, postVerifyOtp, postResendOtp }