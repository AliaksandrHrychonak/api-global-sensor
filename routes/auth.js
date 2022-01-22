const { Router } = require('express');
const authController = require('../controllers/auth-controller');

const router = new Router();

const { validateReqister, validateLogin } = require('../middlewares/validation-handler');

router.post('/signup', validateReqister, authController.register);
router.post('/signin', validateLogin, authController.login);
router.post('/logout', authController.logout);
router.get('/activate/:link', authController.activate);
router.get('/refresh', authController.refresh);

// router.post('/forgot_password', authController.forgotPassword)
// router.post('/forgot_password/:token', forgotPassword, authController.resetPasswordUser)

module.exports = router;
