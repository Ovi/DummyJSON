const router = require('express').Router();
const forceHTTPS = require('../middleware/forceHTTPS');

// static page routes
const staticRoutes = require('./static');

// static resource routes
const authRoutes = require('./auth');
const cartRoutes = require('./cart');
const commentRoutes = require('./comment');
const postRoutes = require('./post');
const productRoutes = require('./product');
const quoteRoutes = require('./quote');
const todoRoutes = require('./todo');
const userRoutes = require('./user');
const httpStatusRoutes = require('./http');
const testRoutes = require('./test');

// dynamic resource routes
// no-dynamic-routes

router.use('/', forceHTTPS, staticRoutes);
router.use('/auth', authRoutes);
router.use(['/cart', '/carts'], cartRoutes);
router.use(['/comment', '/comments'], commentRoutes);
router.use(['/post', '/posts'], postRoutes);
router.use(['/product', '/products'], productRoutes);
router.use(['/quote', '/quotes'], quoteRoutes);
router.use(['/todo', '/todos'], todoRoutes);
router.use(['/user', '/users'], userRoutes);
router.use(['/http', '/https'], httpStatusRoutes);
router.use('/test', testRoutes);

module.exports = router;
