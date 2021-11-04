const router = require('express').Router();

const availableResources = [
  'products',
  'carts',
  'users',
  'posts',
  'comments',
  'todos',
  'quotes',
  'auth',
];

router.get('/', (req, res) => {
  res.render('index', { path: 'home' });
});

router.get('/docs', (req, res) => {
  res.render('docs', { path: 'docs', page: '' });
});

router.get('/docs/:resource', (req, res, next) => {
  const resource = (req.params.resource || '').toLowerCase();

  if (!availableResources.includes(resource)) {
    next();
    return;
  }

  res.render(`docs-${resource}`, { path: 'docs', page: resource });
});

module.exports = router;
