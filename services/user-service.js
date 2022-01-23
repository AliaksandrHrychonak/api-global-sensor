const bcrypt = require('bcryptjs');
const UserModel = require('../models/user-model');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const dtoService = require('./dto-service');
const errConfig = require('../utils/error-config');

const { NODE_ENV } = process.env;
const { SALT } = NODE_ENV === 'production' ? process.env : require('../utils/config');

class UserService {
  async getUserMe(id) {
    const user = await UserModel.findById(id);
    const userDto = new UserDto(user);
    if (!user || !userDto) {
      throw ApiError.BadRequestError(errConfig.user_not_found_exception);
    }
    return userDto;
  }

  async updateUserMe(id, body) {
    const userUpdate = await UserModel.findOneAndUpdate(
      id,
      body,
      { runValidators: true, new: true },
    );
    if (!userUpdate) {
      throw ApiError.BadRequestError(errConfig.user_not_found_exception);
    }
    const user = new UserDto(userUpdate);
    return user;
  }

  async updatePassword(id, body) {
    const user = await UserModel.findOne({ id });
    if (!user) {
      throw ApiError.BadRequestError(errConfig.user_not_found_exception);
    }
    const verifyOldPassword = await UserModel.findUserByCredentials(user.email, body.oldPassword);
    if (verifyOldPassword) {
      if (body.newPassword !== body.verifyPassword) {
        throw ApiError.UnauthorizedError(errConfig.unauthorized_error_credentials);
      } else if (user && body.newPassword === body.verifyPassword) {
        const hashPassword = await bcrypt.hash(body.newPassword, Number(SALT));
        const newBody = {
          password: hashPassword,
        };
        const updateUser = await UserModel.findOneAndUpdate(id, {
          ...newBody,
        }, { runValidators: true, new: true });
        const userDto = await dtoService.releaseUser(updateUser);
        return userDto;
      } else {
        throw ApiError.BadRequestError(errConfig.user_not_found_exception);
      }
    }
  }
}

module.exports = new UserService();
