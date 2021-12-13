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
    default: 'name',
    minlength: 2,
    maxlength: 30,
  },
  surname: {
    type: String,
    default: 'surname',
    minlength: 2,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: (v) => isEmail(v),
      message: 'not email',
    },
  },
  avatar: {
    type: String,
    // default: `${process.env.API_URL}/public/avatars/defaultAvatars.png`,
    default: "https://images.unsplash.com/photo-1639269589043-a2ad517e238e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    validate: {
      validator: (link) => validator.isURL(link, { require_protocol: true }),
      message: 'not link',
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
        throw ApiError.BadRequest('Пользователь с таким email не найден')
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw ApiError.BadRequest('Неправильные почта или пароль');
          }
          return user;
        });
    });
};

module.exports = model('User', UserSchema);