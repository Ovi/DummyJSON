import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Router } from 'express';
import { capitalize } from '../utils/util.js';
import { logError } from '../helpers/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();

const { GOOGLE_TAG_ID, GOOGLE_ADS_TXT_CONTENT, BANNER_CONTENT, STATS, SPONSORS_CONTENT } = process.env;
const commonVariables = {
  googleTagId: GOOGLE_TAG_ID,
  bannerContent: BANNER_CONTENT,
  canonical: 'https://dummyjson.com',
};

const sponsors = parseSponsors(SPONSORS_CONTENT);

function isSafeUrl(value) {
  return typeof value === 'string' && (value.startsWith('https://') || value.startsWith('/public/'));
}

function parseSponsors(raw) {
  if (!raw) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    logError('Invalid SPONSORS_CONTENT JSON', { error: error.message });
    return null;
  }

  const featured = (Array.isArray(parsed.featured) ? parsed.featured : [])
    .filter(s => s && typeof s.name === 'string' && isSafeUrl(s.url) && isSafeUrl(s.logo))
    .slice(0, 3)
    .map(s => ({ name: s.name, url: s.url, logo: s.logo, tagline: typeof s.tagline === 'string' ? s.tagline : '' }));

  const supporters = (Array.isArray(parsed.supporters) ? parsed.supporters : [])
    .filter(s => s && typeof s.name === 'string' && isSafeUrl(s.url) && isSafeUrl(s.avatar))
    .map(s => ({ name: s.name, url: s.url, avatar: s.avatar }));

  if (!featured.length && !supporters.length) return null;

  const cta = {
    label: typeof parsed.cta?.label === 'string' ? parsed.cta.label : 'Become a sponsor',
    url: isSafeUrl(parsed.cta?.url) ? parsed.cta.url : 'https://buymeacoffee.com/muhammadovi',
  };

  return { featured, supporters, cta };
}

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
  'tools',
];

router.get('/', (req, res) => {
  res.render('index', { ...commonVariables, stats: STATS || '500 million', sponsors });
});

router.get('/docs', (req, res) => {
  res.render('docs', {
    ...commonVariables,
    page: '',
    canonical: `https://dummyjson.com/docs`,
    description: `DummyJSON provides a free fake REST API with placeholder JSON data for development, testing, and prototyping. Access realistic data quickly for your projects.`,
  });
});

router.get('/docs/2fa', (req, res) => {
  res.redirect(301, '/docs/tools#tools-2fa-get');
});

router.get('/docs/:resource', (req, res, next) => {
  const resource = (req.params.resource || '').toLowerCase();

  if (!availableResources.includes(resource)) {
    next();
    return;
  }

  const capitalizedResource = capitalize(resource);

  let description = `REST Endpoints filled with ${capitalizedResource} JSON data, DummyJSON provides a free fake REST API with placeholder JSON data for development, testing, and prototyping. Access realistic data quickly for your projects.`;

  if (resource === 'image') {
    description = `The ${capitalizedResource} endpoint provides customizable placeholder images by specifying size in the URL, with options for background color, text color, and display text, ideal for use in websites and wireframes.`;
  }

  if (resource === 'tools') {
    description = `Developer tools docs for DummyJSON — generate TOTP 2FA codes and create custom JSON API responses for development, testing, and prototyping.`;
  }

  res.render(`docs-${resource}`, {
    ...commonVariables,
    page: capitalizedResource,
    canonical: `https://dummyjson.com/docs/${resource}`,
    description,
  });
});

router.get('/custom-response', (req, res) => {
  res.render('custom-response', {
    ...commonVariables,
  });
});

router.get('/webhook', (req, res) => {
  res.render('webhook', {
    ...commonVariables,
    canonical: 'https://dummyjson.com/webhook',
  });
});

router.get('/tools', (req, res) => {
  res.render('tools', {
    ...commonVariables,
    canonical: 'https://dummyjson.com/tools',
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

export default router;
