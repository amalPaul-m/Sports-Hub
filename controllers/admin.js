
const username = process.env.ADMIN_USER;
const password = process.env.ADMIN_PASS;

const getAdminLogin = function (req, res, next) {

    res.render('adminlogin');

};


const postAdminLogin = function (req, res, next) {

    const user = req.body?.user;
    const pass = req.body?.password;
    if (user == username && pass == password) {

        req.session.isAdmin = true;
        req.session.user = false;
        return res.redirect('/dashboard');
    } else {
        req.session.passwordwrong1 = true
        res.render('adminlogin',
            { message: 'Invalid email or password' });
    }

};

module.exports = { getAdminLogin, postAdminLogin }