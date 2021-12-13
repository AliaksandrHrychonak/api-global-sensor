const ApiError = require('../exceptions/api-error');
const tokenService = require('../service/token-service');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
        }
        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
        }
        const userData = tokenService.validateAccessToken(accessToken);
        if (!userData) {
            return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
        }
        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError(req.t("user_unauthorized")));
    }
};
