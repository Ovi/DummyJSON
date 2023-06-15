const router = require('express').Router();
const path = require('path');

const {
  GOOGLE_TAG_ID,
  GOOGLE_PUBLISHER_ID,
  GOOGLE_ADS_TXT_CONTENT,
} = process.env;
const commonVariables = {
  googleTagId: GOOGLE_TAG_ID,
  googlePublisherId: GOOGLE_PUBLISHER_ID,
};

const availableResources = [
  'products',
  'carts',
  'users',
  'posts',
  'comments',
  'image',
  'todos',
  'quotes',
  'auth',
  'http',
];

router.get('/', (req, res) => {
  res.render('index', { ...commonVariables, path: 'home' });
});

router.get('/docs', (req, res) => {
  res.render('docs', {
    ...commonVariables,
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
    ...commonVariables,
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

router.get('/ads.txt', (req, res, next) => {
  if (GOOGLE_ADS_TXT_CONTENT) {
    res.attachment('ads.txt');
    res.set('Content-Disposition', 'inline');
    res.type('txt');
    res.send(GOOGLE_ADS_TXT_CONTENT);

    return;
  }

  next();
});

module.exports = router;
