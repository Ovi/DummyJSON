const router = require('express').Router();

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

// dynamic resource routes
const countRoute = require('./count');

router.use('/', staticRoutes);
router.use('/auth', authRoutes);
router.use('/carts', cartRoutes);
router.use('/comments', commentRoutes);
router.use('/posts', postRoutes);
router.use('/products', productRoutes);
router.use('/quotes', quoteRoutes);
router.use('/todos', todoRoutes);
router.use('/users', userRoutes);
router.use('/count', countRoute);

module.exports = router;
