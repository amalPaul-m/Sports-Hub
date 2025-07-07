const usersSchema = require('../models/usersSchema')
const checkBlockedUser = async function (req, res, next) {
  try {

    const email = req.user?.email || req.session.userEmail;
    const userId = req.session.userId;

    let user = null;

    if (email) {
      user = await usersSchema.findOne({ email: email });
    } else if (userId) {
      user = await usersSchema.findById(userId);
    }

    if (user && user.status === 'blocked') {
      console.log(`User blocked: ${user.email || user._id}`);
      req.session.destroy(() => {
        return res.redirect('/login?blocked=true');
      });
      return;
    }

    next();
  } catch (err) {
    console.error('Middleware error:', err);
    res.status(500).send('Internal server error');
  }
};

module.exports = checkBlockedUser;
