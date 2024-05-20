const router = require('express').Router();
const path = require('path');
const { capitalize } = require('../utils/util');

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
  'recipes',
  'auth',
  'http',
];

router.get('/', (req, res) => {
  res.render('index', { ...commonVariables });
});

router.get('/docs', (req, res) => {
  res.render('docs', {
    ...commonVariables,
    page: '',
    description: `DummyJSON provides a fake REST API of JSON data for development, testing, and prototyping. Quickly get realistic data for your front-end projects.`,
  });
});

router.get('/image', (req, res) => {
  res.status(301).redirect('/docs/image');
});

router.get('/docs/:resource', (req, res, next) => {
  const resource = (req.params.resource || '').toLowerCase();

  if (!availableResources.includes(resource)) {
    next();
    return;
  }

  const capitalizedResource = capitalize(resource);

  res.render(`docs-${resource}`, {
    ...commonVariables,
    page: capitalizedResource,
    description: `REST Endpoints filled with ${capitalizedResource} JSON data, DummyJSON provides a fake REST API of JSON data for development, testing, and prototyping. Quickly get realistic data for your front-end projects.`,
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
