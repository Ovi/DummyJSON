const path = require('node:path');
const router = require('express').Router();
const { capitalize } = require('../utils/util');

const { GOOGLE_TAG_ID, GOOGLE_PUBLISHER_ID, GOOGLE_ADS_TXT_CONTENT, BANNER_CONTENT } = process.env;
const commonVariables = {
  googleTagId: GOOGLE_TAG_ID,
  googlePublisherId: GOOGLE_PUBLISHER_ID,
  bannerContent: BANNER_CONTENT,
  canonical: 'https://dummyjson.com',
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
    canonical: `https://dummyjson.com/docs`,
    description: `DummyJSON provides a free fake REST API with placeholder JSON data for development, testing, and prototyping. Access realistic data quickly for your projects.`,
  });
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
    canonical: `https://dummyjson.com/docs/${resource}`,
    description: `REST Endpoints filled with ${capitalizedResource} JSON data, DummyJSON provides a free fake REST API with placeholder JSON data for development, testing, and prototyping. Access realistic data quickly for your projects.`,
  });
});

router.get('/custom-response', (req, res) => {
  res.render('custom-response', {
    ...commonVariables,
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

router.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'public', 'favicon.ico'));
});

module.exports = router;
