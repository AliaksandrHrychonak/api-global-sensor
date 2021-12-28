const Router = require('express').Router;
const router = new Router();
const ApiError = require('../exceptions/api-error');

const userRoutes = require('./users')
const authRoutes = require('./auth')

router.use("/", userRoutes)
router.use('/auth', authRoutes)
router.use('*', () => { throw ApiError.NotFound('Not Found')})

module.exports = router