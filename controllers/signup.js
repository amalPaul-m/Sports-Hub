const usersSchema = require('../models/usersSchema')
const generateOtp = require('../authentication/generateotp');
const sendVerificationEmail = require('../authentication/mailer');
const bcrypt = require('bcrypt');


const getSignup = function (req, res, next) {

  res.render('signup', 
  { cssFile: '/stylesheets/signup.css', 
  jsFile: '/javascripts/signup.js' });

};



const postSignup = async (req, res) => {
  try {
    console.log(req.body)

    const { name, email, password, phone } = req.body;

    const number = parseInt(await usersSchema.countDocuments({ phone }))
    console.log('count:',number)
    if(number>3){
      res.render('signup',
        {
          content : 'Try another phone number',
          cssFile: '/stylesheets/signup.css', 
          jsFile: '/javascripts/signup.js' 
        }
      )
    }else{

    const user = await usersSchema.findOne({ email });
    if (user) {
      res.render('signup', 
      { content: 'This Email is already exist, try another', 
      cssFile: '/stylesheets/signup.css', 
      jsFile: '/javascripts/signup.js' 
    });

    } else {
      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const userData = {
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone
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
          cssFile: '/stylesheets/verifyOtp.css',
          jsFile: '/javascripts/verifyOtp.js',
          content: `One Time Password (OTP) has been send via Email to ${email}`,
          alert: 'mt-5'
        }
      )

      console.log('OTP sent to:', email, 'OTP:', otp);

    }
  }
  } catch (err) {
    err.message = 'Error inserting user';
    next(err);
  }
};

module.exports = {getSignup, postSignup}