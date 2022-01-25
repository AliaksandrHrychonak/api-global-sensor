const UserService = require('../services/user-service');
const ApiError = require('../exceptions/api-error');
const mailService = require('../services/mail-service');
const errorConfig = require('../utils/error-config');

class UserController {
  async getUserMe(req, res, next) {
    try {
      const user = await UserService.getUserMe(req.user.id);
      return res.json(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(errorConfig.incorrect_data_user));
      } else {
        next(err);
      }
    }
  }

  async updateUserMe(req, res, next) {
    try {
      const user = await UserService.updateUserMe(req.user.id, { ...req.body });
      return res.status(200).send(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(errorConfig.incorrect_data_user));
      } else {
        next(err);
      }
    }
  }

  async uploadAvatarUser(req, res, next) {
    try {
      const body = {
        avatar: `${process.env.API_URL}/public/avatars/${req.file.filename}`,
      };
      console.log(req.user);
      const user = await UserService.updateUserMe(req.user.id, { ...body });
      return res.status(200).send(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(errorConfig.incorrect_data_user));
      } else {
        next(err);
      }
    }
  }

  async updateVerifyUserPassword(req, res, next) {
    try {
      const user = await UserService.updatePassword(req.user.id, req.body);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None',
      });
      return res.status(200).send(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(errorConfig.incorrect_data_user));
      } else {
        next(err);
      }
    }
  }

  async sendFeedbackForm(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequestError(errorConfig.incorrect_data_user);
      }
      const { fullname, message, email } = req.body;
      await mailService.sendMailFeedbackForm(email, fullname, message);
      return res.status(200).send({ message: 'OK' });
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(errorConfig.incorrect_data_user));
      } else {
        next(err);
      }
    }
  }
}

module.exports = new UserController();
