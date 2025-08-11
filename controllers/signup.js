const usersSchema = require('../models/usersSchema')
const generateOtp = require('../authentication/generateotp');
const sendVerificationEmail = require('../authentication/mailer');
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const { apiLogger, errorLogger } = require('../middleware/logger');


const getSignup = async (req, res, next) => {

  const referralCode = req.query.ref;
  req.session.refferal = referralCode;
  let refferals;
  if(referralCode){
  refferals = await usersSchema.findOne({referal: req.session.refferal});
  }

  if(req.session.refferal && !refferals) {
    res.render('signup', {className: "block"});
  }else {
    res.render('signup', {className: "none"});
  }

};


const postSignup = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const nameTag = name.split(' ').join('').toLowerCase();
    const code = crypto.randomBytes(3).toString("hex"); 
    const refferalCode = `${nameTag}${code}`;

    const number = parseInt(await usersSchema.countDocuments({ phone }));
  
    if(number>3){
      res.render('signup',
        {
          content : 'Try another phone number'
        }
      )
    }else{

    const user = await usersSchema.findOne({ email });
    if (user) {
      res.render('signup', 
      { content: 'This Email is already exist, try another' });

    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const userData = {
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
        referal: refferalCode
      };


      //OTP generation and sending logic can be added here

      const otp = generateOtp();
      const emailSend = await sendVerificationEmail(email, otp);

      if (!emailSend) {
        return res.json("email-error");
      }
      req.session.otp = otp; // Store OTP in session
      req.session.userData = userData; // Store user data in session for later use
      res.render('verifyOtp',
        {
          content: `One Time Password (OTP) has been send via Email to ${email}`,
          alert: 'mt-5'
        }
      )

      console.log('OTP sent to:', email, 'OTP:', otp);

    }
  }
  } catch (error) {
    errorLogger.error('Failed to signup', {
        originalMessage: error.message,
        stack: error.stack,
        controller: 'signup',
        action: 'postSignup'
    });
    next(error); 
  }
};

module.exports = { getSignup, postSignup }