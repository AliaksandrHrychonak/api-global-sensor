const { celebrate, Joi } = require('celebrate');
const validator = require('validator')

const method = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  }
  throw new Error('URL validation err');
};

module.exports.validateReqister = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    surname: Joi.string().min(2).max(30).required(),
    avatar: Joi.string().custom(method),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
  }),
});

module.exports.validateLogin = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
});

module.exports.forgotPassword= celebrate({
  body: Joi.object().keys({
    newPassword: Joi.string().required().min(8),
    verifyPassword: Joi.string().required().min(8),
  }),
});

module.exports.validateUpdateMe = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    surname: Joi.string().min(2).max(30),
  }),
});

module.exports.validateSendMailInfo = celebrate({
  body: Joi.object().keys({
    fullname: Joi.string().min(2).max(40).required(),
    email: Joi.string().email().required(),
    message: Joi.string().min(2).max(400).required()
  }),
});
