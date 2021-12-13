const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const passport = require("passport");

const {
  validateReqister,
  validateLogin,
  forgotPassword
} = require('../middlewares/validation')

router.post('/registration', validateReqister, userController.registration);
router.post('/login', validateLogin, userController.login);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);

router.post('/forgot_password', userController.forgotPassword)
router.post('/forgot_password/:token', forgotPassword, userController.resetPasswordUser)

router.get('/google', passport.authenticate('google', { scope: ["profile", "email"] }));
router.get('/google/callback', passport.authenticate("google", { session: false }), userController.googleVerify);

module.exports = router

