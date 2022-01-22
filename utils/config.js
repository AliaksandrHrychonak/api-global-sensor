const DB_URL = 'mongodb://localhost:27017/testDB';
const SALT = 10;
const PORT = 5000;
const JWT_ACCESS_SECRET = 'jwt-secret-key';
const JWT_REFRESH_SECRET = 'jwt-refresh-secret-key';
const API_URL = 'http://localhost:5000';
const CLIENT_URL = 'https://globalsensor.pro';
const SECRET_RESET_USER = '12345678';
const COOKIES_CONFIG = {
  maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'None',
};
module.exports = {
  PORT,
  DB_URL,
  SALT,
  JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET,
  API_URL,
  CLIENT_URL,
  SECRET_RESET_USER,
  COOKIES_CONFIG,
};
