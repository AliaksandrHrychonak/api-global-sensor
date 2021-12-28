const fs = require('fs')
const path = require('path')

const UserModel = require('../models/user-model');
const RoleModel = require('../models/role-model')
const UserDto = require('../dtos/user-dto');

const bcrypt = require('bcrypt');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

const mailService = require('./mail-service');
const tokenService = require('./token-service');

const upload = require("../middlewares/upload");
const ApiError = require('../exceptions/api-error');

const { SECRET_RESET_USER, API_URL } = process.env

class UserService {
    async registration(req, name, surname, email, password) {
      const candidate = await UserModel.findOne({email})
      if (candidate) {
        throw ApiError.BadRequest(req.t("user_is_exists"))
      }

      const hash = await bcrypt.hash(password, 10);
      const activationLink = uuid.v4();
      const userRole = await RoleModel.findOne({ value: "USER" })
      const user = await UserModel.create({ name, surname, email, password: hash, activationLink, roles: [userRole.value] })

        // await mailService.sendActivationMail(email, `${API_URL}/auth/activate/${activationLink}`);

      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto}
    }

    async activate(req, activationLink) {
      const user = await UserModel.findOne({activationLink})
      if (!user) {
        throw ApiError.BadRequest(req.t("invalid_activation_link"))
      }
      user.isActivated = true;
      await user.save();
    }

    async login(req, email, password) {
      const user = await UserModel.findUserByCredentials(email, password)
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async googleVerify(req, id) {
      const user = await UserModel.findById(id)
      if(!user) {
        throw ApiError.BadRequest(req.t("user_not_found_exception"))
      }
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto}
    }

    async refresh(req, refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError(req.t("user_unauthorized"));
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError(req.t("user_unauthorized"));
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto});

        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
      const users = await UserModel.find();
      return users;
    }

    async getUserMe(req, id) {
      const user = await UserModel.findById(id);
      const userDto = new UserDto(user);
      if(!user) {
        throw ApiError.BadRequest(req.t("user_not_found_exception"))
      }
      return userDto;
    }

    async updateUserMe(req, id, body) {
      const userUpdate = await UserModel.findByIdAndUpdate(id, body, { runValidators: true, new: true })
      if(!userUpdate) {
        throw ApiError.BadRequest(req.t("user_not_found_exception"))
      }
      const user = new UserDto(userUpdate);
      return user
    }

    async forgotPassword(req, user) {
      if (!user) {
        throw ApiError.BadRequest(req.t("user_not_found_exception"))
      }
      if(user) {
        let tokenObject = {
          email: user.email,
          id: user._id
        };
        const secret = SECRET_RESET_USER
        const token = jwt.sign(tokenObject, secret);
        await UserModel.findByIdAndUpdate({ _id: user._id }, { resetPasswordData: token, resetPasswordDataExpires: Date.now() + 86400000 }, { new: true })
        await mailService.sendForgotPasswordMail(user.email, `${process.env.CLIENT_URL}/auth/reset_password/${token}`);
      }
    }

    async resetPassword(req, token, body) {
      const user = await UserModel.findOne({
        resetPasswordData: token,
        resetPasswordDataExpires: { $gt: Date.now() }
      })
      if(!user) {
        throw ApiError.BadRequest(req.t("user_not_found_exception"))
      }
      if (body.newPassword !== body.verifyPassword) {
        throw ApiError.BadRequest(req.t("user_password_not_match"))
      }
      if (user && body.newPassword === body.verifyPassword) {
        const hashPassword = await bcrypt.hash(body.newPassword, 10);
        const newBody = {password : hashPassword, resetPasswordData: undefined, resetPasswordDataExpires: undefined}
        const updateUser = await UserModel.findByIdAndUpdate(user.id, { ...newBody }, {new: true})
        return updateUser
      }
      const userDto = new UserDto(updateUser);
      const tokens = tokenService.generateTokens({...userDto});
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {...tokens, user: userDto}
    }

    async uploadAvatar(req, res) {

      await upload(req, res);
      if (req.file == undefined) {
        throw ApiError.BadRequest(req.t("not_upload_file"))
      }
      return
    }

    async deleteOldAvatar(user) {
      if (user.avatar !== `${API_URL}/public/avatars/defaultAvatar.png`) {
        const avatarFile = user.avatar.slice(user.avatar.lastIndexOf('/'))
        const pathAvatar = path.resolve(`public/avatars/${avatarFile}`)
        fs.unlinkSync(pathAvatar)
        return
      }
      return
    }
}

module.exports = new UserService();
