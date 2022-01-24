const { Router } = require('express');

const router = new Router();
const ApiError = require('../exceptions/api-error');
const errorConfig = require('../utils/error-config');
const userController = require('../controllers/user-controller');
const { validateFeedbackForm } = require('../middlewares/validation-handler');

const authRoutes = require('./auth');
const userRoutes = require('./user');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/contact', validateFeedbackForm, userController.sendFeedbackForm)
router.use('*', () => { throw ApiError.NotFoundError(errorConfig.not_found_error); });

module.exports = router;
