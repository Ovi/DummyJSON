const router = require('express').Router();
const path = require('path');

const availableResources = [
  'products',
  'carts',
  'users',
  'posts',
  'comments',
  'todos',
  'quotes',
  'auth',
  'http',
];

router.get('/', (req, res) => {
  res.render('index', { path: 'home' });
});

router.get('/docs', (req, res) => {
  res.render('docs', {
    path: 'docs',
    page: '',
    description: `Different types of REST Endpoints filled with JSON data to use in developing the frontend without worrying about writing a backend.`,
  });
});

router.get('/docs/:resource', (req, res, next) => {
  const resource = (req.params.resource || '').toLowerCase();

  if (!availableResources.includes(resource)) {
    next();
    return;
  }

  res.render(`docs-${resource}`, {
    path: 'docs',
    page: resource,
    description: `REST Endpoints filled with ${resource.toUpperCase()} JSON data to use in developing the frontend without worrying about writing a backend.`,
  });
});

router.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'robots.txt'));
});

router.get('/sitemap.xml', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'sitemap.xml'));
});

router.get('/ads.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'ads.txt'));
});

module.exports = router;
