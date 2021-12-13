const tokenService = require('../service/token-service');
const ApiError = require('../exceptions/api-error');

module.exports = function (roles) {
    return function (req, res, next) {
        try {
            const accessToken = req.headers.authorization.split(' ')[1]
            if (!accessToken) {
              return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
            }
            const userData = tokenService.validateAccessToken(accessToken)
            let hasRole = false
            userData.roles.forEach(role => {
                if (roles.includes(role)) {
                    hasRole = true
                }
            })
            if (!hasRole) {
              return next(ApiError.NotAuthorization(req.t("not_access")));
            }
            next();
        } catch (e) {
          return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
        }
    }
};