const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

const { NODE_ENV } = process.env;
const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = NODE_ENV === 'production' ? process.env : require('../utils/config');

class TokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '60d' });
    return {
      accessToken,
      refreshToken,
    };
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await tokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      tokenData.save();
    } else {
      const token = await tokenModel.create({
        user: userId,
        refreshToken,
      });
      return token;
    }
  }

  async removeToken(refreshToken) {
    const tokenData = await tokenModel.deleteOne({ refreshToken });
    return tokenData;
  }

  async findToken(refreshToken) {
    const tokenData = await tokenModel.findOne({
      refreshToken,
    });
    return tokenData;
  }
}

module.exports = new TokenService();
