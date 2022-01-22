const ApiError = require('../exceptions/api-error');
const errConfig = require('../utils/error-config');

module.exports = ((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.status).send({
      message: err.message,
    });
  }
  const { status = 500, message } = err;
  res.status(status).send({
    message: status === 500
      ? errConfig.server_error
      : message,
  });

  return next();
});
