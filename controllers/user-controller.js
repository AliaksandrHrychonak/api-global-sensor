const userService = require('../service/user-service');
const userModel = require('../models/user-model');
const mailService = require('../service/mail-service');
const ApiError = require('../exceptions/api-error');
class UserController {

  async registration(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequest(req.t("user_data_err"))
      }
      const {
        name,
        surname,
        email,
        password
      } = req.body;
      const user = await userService.registration(req, name, surname, email, password);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      return res.status(201).send(user);
    } catch (err) {
      if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(ApiError.BadRequest(req.t("user_data_err")));
      } else if (err.code === 11000) {
        next(ApiError.NotAuthorization("409"));
      } else {
        next(err);
      }
    }
  }

  async login(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequest(req.t("user_data_err"))
      }
      const {
        email,
        password
      } = req.body;
      const user = await userService.login(req, email, password);
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      return res.status(200).send(user)
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError('400'));
      } else {
        next(err);
      }
    }
  }

  async callbackInfo(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequest(req.t("user_data_err"))
      }
      const {
        fullname,
        message,
        email
      } = req.body
      await mailService.sendMail(email, fullname, message);
      return res.status(200).send({
        message: 'OK'
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.NotFoundError(req.t("user_data_err")));
      } else {
        next(err);
      }
    }
  }

  async logout(req, res, next) {
    try {
      const {
        refreshToken
      } = req.cookies;
      const token = await userService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await userService.activate(req, activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const {
        refreshToken
      } = req.cookies;
      const userData = await userService.refresh(req, refreshToken);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async googleVerify(req, res, next) {
    try {
      const id = req.user.id
      const user = await userService.googleVerify(req, id)
      res.cookie('refreshToken', user.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      return res.status(201).send(user);
    } catch (e) {
      next(e)
    }
  }

  async getUsers(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  }

  async getUserMe(req, res, next) {
    try {
      const user = await userService.getUserMe(req, req.user.id)
      return res.json(user);
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.NotFoundError(req.t("user_data_err")));
      } else {
        next(err);
      }
    }
  }

  async updateUserMe(req, res, next) {
    try {
      if (!req.body) {
        throw ApiError.BadRequest(req.t("user_data_err"))
      }
      const user = await userService.updateUserMe(req, req.user.id, {
        ...req.body
      })
      return res.status(200).send(user)
    } catch (err) {
      if (err.name === 'ValidationError') {
        next(ApiError.BadRequestError(req.t("user_data_err")));
      } else if (err.code === 11000) {
        next(ApiError.NotAuthorization("409"));
      } else {
        next(err);
      }
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const email = req.body.email
      const user = await userModel.findOne({
        email
      })
      if (!user) {
        return res.status(400).send({
          message: "User not found"
        })
      }
      await userService.forgotPassword(req, user)
      return res.status(200).send({
        message: req.t("reset_link_send")
      });
    } catch (e) {
      next(e);
    }
  }

  async resetPasswordUser(req, res, next) {
    try {
      const token = req.params.token
      const userData = await userService.resetPassword(req, token, req.body)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      return res.status(200).send({
        message: req.t("reset_password_done")
      });
    } catch (e) {
      next(e)
    }
  }

  async uploadAvatarUser(req, res, next) {
    try {
      await userService.uploadAvatar(req, res)
      const body = {
        avatar: `${process.env.API_URL}/avatars/${req.file.filename}`
      }
      const updateUser = await userService.updateUserMe(req, req.user.id, {
        ...body
      })
      return res.status(200).send({
        message: req.t("user_update"),
        updateUser
      })
    } catch (e) {
      next(e)
    }
  }
}


module.exports = new UserController();