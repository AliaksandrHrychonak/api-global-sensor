const ApiError = require('../exceptions/api-error');

module.exports = function (err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({ message: err.message})
  }

  const { status = 500, message } = err;
  res.status(status).json({
    message: status === 500
      ? req.t("server_error")
      : message,
  })

  return next();
};
