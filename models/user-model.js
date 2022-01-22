const {
  Schema,
  model,
} = require('mongoose');
const bcrypt = require('bcryptjs');
const isEmail = require('validator/lib/isEmail');
const ApiError = require('../exceptions/api-error');
const errConfig = require('../utils/error-config');

const UserSchema = new Schema({
  name: {
    type: String,
    default: 'Name',
    minlength: 2,
    maxlength: 30,
  },
  surname: {
    type: String,
    default: 'Surname',
    minlength: 2,
    maxlength: 30,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: errConfig.email_error,
    },
  },
  avatar: {
    type: String,
    default: 'https://api-global-sensor.monster/public/avatars/user.png',
  },
  acceptTerms: {
    type: Boolean,
    required: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  roles: [{
    type: String,
    ref: 'Role',
  }],
  isActivated: {
    type: Boolean,
    default: false,
  },
  activationLink: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({
    email,
  }).select('+password')
    .then((user) => {
      if (!user) {
        throw ApiError.UnauthorizedError(errConfig.unauthorized_error_credentials);
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw ApiError.UnauthorizedError(errConfig.unauthorized_error_credentials);
          }
          return user;
        });
    });
};

module.exports = model('User', UserSchema);
