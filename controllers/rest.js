const usersSchema = require('../models/usersSchema')
const bcrypt = require('bcrypt');
const { apiLogger, errorLogger } = require('../middleware/logger');


const getRest = (req, res, next) => {
  if (!req.session.resetEmail) return res.redirect('/forgot');

  res.render('reset');
};


const postRest = async (req, res, next) => {

  try {
    const newPassword = req.body?.password;
    console.log(newPassword);
    const email = req.session.resetEmail;

    if (!newPassword || !email) {
      console.log('Missing password or session email');
      return res.redirect('/forgot');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await usersSchema.findOneAndUpdate({ email: email },
      { $set: { password: hashedPassword } }, { new: true })

    // Optional: destroy session after password reset
    req.session.destroy(() => {
      res.redirect('/login');
    });
  }
  catch (error) {
    errorLogger.error('Failed to reset', {
      originalMessage: error.message,
      stack: error.stack,
      controller: 'reset',
      action: 'postRest'
    });
    next(error);
  }
};


module.exports = { getRest, postRest }