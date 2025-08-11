const { apiLogger, errorLogger } = require('../middleware/logger');

const getReturn = async (req, res) => {

    try {
        const email = req.session.users?.email;
        if (!email) {
            return res.redirect('/login');
        }

        res.render('return', {  });

    } catch (error) {

        errorLogger.error('Error in getReturn controller', {
            message: error.message,
            stack: error.stack,
            controller: 'return',
            action: 'getReturn'
        });
        next(error);
    }
}

module.exports = { getReturn }