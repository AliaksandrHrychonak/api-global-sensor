const { Router } = require('express');

const router = new Router();
const ApiError = require('../exceptions/api-error');

const authRoutes = require('./auth');
const userRoutes = require('./user');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('*', () => { throw ApiError.NotFoundError('Not Found'); });

module.exports = router;
