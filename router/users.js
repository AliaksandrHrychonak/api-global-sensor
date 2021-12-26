const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const authMiddleware = require('../middlewares/auth-middleware');
const roleMiddleware = require('../middlewares/role-middleware');

const {
  validateUpdateMe,
} = require('../middlewares/validation')

router.get('/users', authMiddleware, roleMiddleware(['ADMIN']), userController.getUsers);
router.get('/user/me', authMiddleware, userController.getUserMe);
router.patch('/user/me', authMiddleware, validateUpdateMe, userController.updateUserMe);
router.post('/user/me/avatar', authMiddleware, userController.uploadAvatarUser)
router.post('/contact', userController.callbackInfo)


module.exports = router