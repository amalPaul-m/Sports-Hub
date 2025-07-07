const checkSession = (req, res, next) => {
  if (req.session.user) {
    return next();
  } else if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
};

const isLoggin = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/home');
  } else if (req.isAuthenticated()) {
    return res.redirect('/home');
  } else {
    next();
  }
};


module.exports = { checkSession, isLoggin }