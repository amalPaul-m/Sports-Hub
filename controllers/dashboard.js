

const getDashboard = function (req, res, next) {

  console.log('hello', req.session.isAdmin)
  if (!req.session.isAdmin) {
    console.log(req.session.isAdmin)
    return res.redirect('/admin');
  }
  res.render('dashboard', { cssFile: '/stylesheets/adminDashboard.css', jsFile: '/javascripts/adminDashboard.js' });
};


module.exports = {getDashboard}