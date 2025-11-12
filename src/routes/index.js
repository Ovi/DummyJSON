import { Router } from 'express';
import forceHTTPS from '../middleware/force-https.js';
import staticRoutes from './static.js';
import authRoutes from './auth.js';
import cartRoutes from './cart.js';
import commentRoutes from './comment.js';
import postRoutes from './post.js';
import productRoutes from './product.js';
import quoteRoutes from './quote.js';
import recipeRoutes from './recipe.js';
import todoRoutes from './todo.js';
import userRoutes from './user.js';
import httpRoutes from './http.js';
import testRoutes from './test.js';
import imageRoutes from './image.js';
import iconRoutes from './icon.js';
import customResponseRoutes from './custom-response.js';
import ipRoutes from './ip.js';
import redirectRoutes from './redirect.js';

const router = Router();

// static page routes
router.use('/', forceHTTPS, staticRoutes);

// static resource routes
router.use('/auth', authRoutes);
router.use(['/cart', '/carts'], cartRoutes);
router.use(['/comment', '/comments'], commentRoutes);
router.use(['/post', '/posts'], postRoutes);
router.use(['/product', '/products'], productRoutes);
router.use(['/quote', '/quotes'], quoteRoutes);
router.use(['/recipe', '/recipes'], recipeRoutes);
router.use(['/todo', '/todos'], todoRoutes);
router.use(['/user', '/users'], userRoutes);
router.use(['/http', '/https'], httpRoutes);
router.use(['/test', '/ping', '/health'], testRoutes);

// dynamic resource routes
router.use(['/image', '/i'], imageRoutes);
router.use('/icon', iconRoutes);
router.use('/c', customResponseRoutes);
router.use('/ip', ipRoutes);

// redirect other routes
router.use('/', redirectRoutes);

export default router;
