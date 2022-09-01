const router = require('express').Router();
const path = require('path');
const forceHTTPS = require('../middleware/forceHTTPS');

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

router.get('/', forceHTTPS, (req, res) => {
  res.render('index', { path: 'home' });
});

router.get('/docs', forceHTTPS, (req, res) => {
  res.render('docs', {
    path: 'docs',
    page: '',
    description: `Different types of REST Endpoints filled with JSON data to use in developing the frontend without worrying about writing a backend.`,
  });
});

router.get('/docs/:resource', forceHTTPS, (req, res, next) => {
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

router.get('/robots.txt', forceHTTPS, (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'robots.txt'));
});

router.get('/sitemap.xml', forceHTTPS, (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'sitemap.xml'));
});

router.get('/ads.txt', forceHTTPS, (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'ads.txt'));
});

module.exports = router;
