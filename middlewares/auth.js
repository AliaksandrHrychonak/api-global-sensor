const ApiError = require('../exceptions/api-error');
const tokenService = require('../services/token-service');
const errConfig = require('../utils/error-config');

module.exports = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return next(ApiError.UnauthorizedError(errConfig.unauthorized_error));
    }
    const accessToken = authorizationHeader.split(' ')[1];
    if (!accessToken) {
      return next(ApiError.UnauthorizedError(errConfig.unauthorized_error));
    }
    const user = tokenService.validateAccessToken(accessToken);
    if (!user) {
      return next(ApiError.UnauthorizedError(errConfig.unauthorized_error));
    }
    req.user = user;
    return next();
  } catch (e) {
    return next(ApiError.UnauthorizedError(errConfig.unauthorized_error));
  }
};
