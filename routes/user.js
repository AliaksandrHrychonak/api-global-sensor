const { Router } = require('express');

const router = new Router();
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth');
const { validateUpdateMe, forgotPassword, validateFeedbackForm } = require('../middlewares/validation-handler');
const upload = require('../middlewares/upload-handler');

router.get('/me', authMiddleware, userController.getUserMe);
router.patch('/me', authMiddleware, validateUpdateMe, userController.updateUserMe);
router.post('/me/avatar', authMiddleware, upload.single('file'), userController.uploadAvatarUser);
router.patch('/me/secret', authMiddleware, forgotPassword, userController.updateVerifyUserPassword);
router.post('/contact', validateFeedbackForm, userController.sendFeedbackForm);

module.exports = router;
