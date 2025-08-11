const usersSchema = require('../models/usersSchema')
const bcrypt = require('bcrypt');
const { apiLogger, errorLogger } = require('../middleware/logger');


const getLogin = function (req, res, next) {

  if (req.session.user) {
    // Already logged in: prevent returning to login page
    return res.redirect('/home');
  }
  res.render('login');
};


const postLogin = async (req, res) => {

  try {
    const { email, password } = req.body;
    const status = "active"; 
    const user = await usersSchema.findOne({ email });

    if (!user) {
      return res.render('login', 
      { message: 'Invalid email or password' });
    }

    if (user.status !== status) {
      return res.render('login', 
      { message: 'Admin Blocked your profile, please connect to customer service' });
    }

  const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.render('login', 
      { message: 'Invalid email or password' });
    }
    // Login success

    req.session.userEmail = user.email;
    req.session.user = true;
    req.session.isAdmin = false;

    req.session.users = {
      id: user._id,
      email: user.email,
      name: user.name
    };

    res.redirect('/home');

  } catch (error) {
    
    errorLogger.error('Login error', {
      controller: 'login',
      action: 'postLogin',
      error: error.message
    });
    next(error);

  }
};


module.exports = { getLogin, postLogin }