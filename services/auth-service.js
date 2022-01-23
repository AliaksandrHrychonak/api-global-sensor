const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const UserModel = require('../models/user-model');
const RoleModel = require('../models/role-model');
const tokenService = require('./token-service');
const dtoService = require('./dto-service');
const ApiError = require('../exceptions/api-error');
const errConfig = require('../utils/error-config');

const { NODE_ENV } = process.env;
const { SALT } = NODE_ENV === 'production' ? process.env : require('../utils/config');

class AuthService {
  async register(name, surname, email, password, acceptTerms) {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.ConflictError(errConfig.user_is_exists);
    }
    const hash = await bcrypt.hash(password, Number(SALT));
    const activationLink = uuid.v4();
    const userRole = await RoleModel.findOne({ value: 'USER' });
    if (!userRole) {
      throw ApiError.NotFoundError(errConfig.role_not_found);
    }
    const user = await UserModel.create({
      name,
      surname,
      email,
      password: hash,
      activationLink,
      roles: [userRole.value],
      acceptTerms,
    });
    const userDto = await dtoService.releaseUser(user);

    return userDto;
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.NotFoundError(errConfig.user_activate_link_err);
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findUserByCredentials(email, password);
    const userDto = dtoService.releaseUser(user);
    return userDto;
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError(errConfig.user_unauthorized);
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError(errConfig.user_unauthorized);
    }
    const user = await UserModel.findById(userData.id);
    const userDto = await dtoService.releaseUser(user);
    return userDto;
  }
}

module.exports = new AuthService();
