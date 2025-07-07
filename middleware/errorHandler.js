
module.exports = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
};
