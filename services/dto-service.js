const tokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');

class DtoService {
  async releaseUser(user) {
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    return {
      ...tokens,
      user: userDto,
    };
  }
}

module.exports = new DtoService();
