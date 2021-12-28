const {
  Schema,
  model
} = require('mongoose');
const ApiError = require('../exceptions/api-error');
const bcrypt = require('bcrypt');
const validator = require('validator')
const isEmail = require('validator/lib/isEmail')

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
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'Validation ERR!',
    },
  },
  avatar: {
    type: String,
    default: "https://api-global-sensor.monster/public/avatars/user.png",
    validate: {
      validator: (link) => validator.isURL(link, { require_protocol: true }),
      message: 'Validation ERR!',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  roles: [
    {
      type: String,
      ref: 'Role',
    }
  ],
  isActivated: {
    type: Boolean,
    default: false
  },
  activationLink: {
    type: String
  },
  resetPasswordData: {
    type: String,
  },
  googleId: {
    type: String,
  },
  resetPasswordDataExpires: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.statics.findUserByCredentials = function а(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw ApiError.BadRequest('User not found!')
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw ApiError.BadRequest('Error Access');
          }
          return user;
        });
    });
};

module.exports = model('User', UserSchema);