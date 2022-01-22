const AuthService = require('../services/auth-service');
const ApiError = require('../exceptions/api-error');

const { NODE_ENV } = process.env;
const { CLIENT_URL } = NODE_ENV === 'production' ? process.env : require('../utils/config');

class AuthController {
  async register(req, res, next) {
    try {
      const {
        email,
        password,
        name,
        surname,
        acceptTerms,
      } = req.body;
      const user = await AuthService.register(name, surname, email, password, acceptTerms);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None',
      });
      return res.status(201).send(user);
    } catch (err) {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(ApiError.BadRequestError('user_data_err'));
      } else if (err.code === 11000) {
        next(ApiError.ForbiddenError('409'));
      } else {
        next(err);
      }
    }
  }

  async login(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequestError('user_data_err');
      }
      const {
        email,
        password,
      } = req.body;
      const user = await AuthService.login(email, password);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None',
      });
      return res.status(200).send(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError('400'));
      } else {
        next(err);
      }
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await AuthService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (err) {
      next(err);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await AuthService.activate(activationLink);
      return res.redirect(CLIENT_URL);
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await AuthService.refresh(refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None',
      });
      return res.json(userData);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
