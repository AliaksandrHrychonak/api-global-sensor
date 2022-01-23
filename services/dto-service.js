const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const errConfig = require('../utils/error-config');

class DtoService {
  async releaseUser(user) {
    const userDto = new UserDto(user);
    if (!userDto) {
      throw ApiError.BadRequestError(errConfig.user_dto_not_generate);
    }
    try {
      const tokens = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      return {
        ...tokens,
        user: userDto,
      };
    } catch (e) {
      throw ApiError.BadRequestError(errConfig.user_token_not_save);
    }
  }
}

module.exports = new DtoService();
