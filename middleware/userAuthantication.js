const userAuthantication = async function (req, res, next) {
  try {

    const email = req.session.users?.email;
    if(!email) {
      return res.redirect('/login');
    }
    next();
  } catch (err) {
        err.message = 'user not found in session';
        console.log(err)
        next(err);
  }
};

module.exports = userAuthantication;
