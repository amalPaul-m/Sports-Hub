const HttpStatus = require('../constants/httpStatus');

module.exports = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  res.status(res.statusCode !== HttpStatus.OK ? res.statusCode : HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
