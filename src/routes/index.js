const router = require('express').Router();
const checkDbConnection = require('../middleware/check-db-connection');
const forceHTTPS = require('../middleware/force-https');

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
router.use('/c', checkDbConnection, require('./custom-response'));

// redirect other routes
router.use('/', require('./redirect'));

module.exports = router;
