const Router = require('express').Router;
const router = new Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const roleMiddleware = require('../middlewares/role-middleware');

const {
  validateUpdateMe,
  validateSendMailInfo
} = require('../middlewares/validation')

router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);
router.get('/user/me', authMiddleware, userController.getUserMe);
router.patch('/user/me', authMiddleware, validateUpdateMe, userController.updateUserMe);
router.patch('/user/me/secret', authMiddleware, forgotPassword, userController.resetPasswordUser)
router.post('/user/me/avatar', authMiddleware, userController.uploadAvatarUser)
router.post('/contact', validateSendMailInfo, userController.callbackInfo)
module.exports = router