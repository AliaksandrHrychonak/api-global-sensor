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
      throw ApiError.ConflictError(errConfig.incorrect_data_already_registered);
    }
    const hash = await bcrypt.hash(password, Number(SALT));
    const activationLink = uuid.v4();
    const userRole = await RoleModel.findOne({ value: 'USER' });
    if (!userRole) {
      throw ApiError.NotFoundError('err userRole find DB');
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
    if (!userDto) {
      throw ApiError.NotFoundError('err userDto generate');
    }
    return userDto;
  }

  async activate(activationLink) {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Переданны некоректные данные при попытке активации');
    }
    user.isActivated = true;
    await user.save();
  }

  async login(email, password) {
    const user = await UserModel.findUserByCredentials(email, password);
    const userDto = dtoService.releaseUser(user);
    if (!userDto) {
      throw ApiError.NotFoundError('err userDto generate');
    }
    return userDto;
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError('user_unauthorized');
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError('user_unauthorized');
    }
    const user = await UserModel.findById(userData.id);
    const userDto = await dtoService.releaseUser(user);
    if (!userDto) {
      throw ApiError.NotFoundError('err userDto generate');
    }
    return userDto;
  }
}

module.exports = new AuthService();
