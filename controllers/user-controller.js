const userService = require('../service/user-service');
const userModel = require('../models/user-model');
const User = require("../models/user-model")

class UserController {

    async registration(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.registration(req, email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(201).send({ message: req.t("user_create_success"), userData});
        } catch (e) {
            next(e);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(req, email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.status(200).send(userData)
        } catch (e) {
            next(e);
        }
    }

    async logout(req, res, next) {
        try {
            const {refreshToken} = req.cookies;
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
            const {refreshToken} = req.cookies;
            const userData = await userService.refresh(req, refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async googleVerify (req, res, next) {
      try {
        const id = req.user.id
        const userData = await userService.googleVerify(req, id)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return res.status(201).send({ message: req.t("user_create_success"), userData});
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
      } catch (e) {
        next(e)
      }
    }

    async updateUserMe(req, res, next) {
      try {
        const userUpdate = await userService.updateUserMe(req, req.user.id, { ...req.body })
        return res.status(200).send({ message: req.t("user_update"), userUpdate })
      } catch (e) {
        next(e);
      }
    }

    async forgotPassword(req, res, next) {
      try {
        const email = req.body.email
        const user = await userModel.findOne({email})
        if(!user) {
          return res.status(400).send({ message: "User not found" })
        }
        await userService.forgotPassword(req, user)
        return res.status(200).send({ message: req.t("reset_link_send") });
      } catch (e) {
        next(e);
      }
    }

    async resetPasswordUser(req, res, next) {
      try {
        const token = req.params.token
        const userData = await userService.resetPassword(req, token , req.body)
        res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
        return res.status(200).send({ message: req.t("reset_password_done") });
      } catch (e) {
        next(e)
      }
    }

    async uploadAvatarUser (req, res, next) {
      try {
        await userService.uploadAvatar(req, res)
        const body = { avatar: `${process.env.API_URL}/avatars/${req.file.filename}`}
        const updateUser = await userService.updateUserMe(req, req.user.id, {...body})
        return res.status(200).send({ message: req.t("user_update"), updateUser })
      } catch (e) {
        next(e)
      }
    }
}


module.exports = new UserController();
