

const getReturn = async (req, res) => {

    try {
        const email = req.session.users?.email;
        if (!email) {
            return res.redirect('/login');
        }

        res.render('return', {  });

    } catch (error) {

        err.message = 'Error inserting return item';
        next(error);
    }
}

module.exports = { getReturn }