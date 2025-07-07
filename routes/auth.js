const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);


router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login',
  }),
  (req, res) => {

    req.session.users = {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        isAdmin: false 
      };

    res.redirect('/home');
  }
);


module.exports = router;
