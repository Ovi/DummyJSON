const router = require('express').Router();
const forceHTTPS = require('../middleware/forceHTTPS');

// static page routes
router.use('/', forceHTTPS, require('./static'));

// static resource routes
router.use('/auth', require('./auth'));
router.use(['/cart', '/carts'], require('./cart'));
router.use(['/comment', '/comments'], require('./comment'));
router.use(['/post', '/posts'], require('./post'));
router.use(['/product', '/products'], require('./product'));
router.use(['/quote', '/quotes'], require('./quote'));
router.use(['/recipe', '/recipes'], require('./recipe'));
router.use(['/todo', '/todos'], require('./todo'));
router.use(['/user', '/users'], require('./user'));
router.use(['/http', '/https'], require('./http'));
router.use(['/test', '/ping', '/health'], require('./test'));
router.use(['/image', '/i'], require('./image'));
router.use('/icon', require('./icon'));

// dynamic resource routes
router.use('/c', require('./custom-response'));

// redrector
router.use('/', require('./redirect'));

module.exports = router;
