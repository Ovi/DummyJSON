const openapiSpec = require('../utils/openapi');
const { log, logError } = require('../helpers/logger');
const { version } = require('../../package.json');

// We'll set up a middleware that will dynamically load the ESM module
let apiReferenceMiddleware = null;

const initializeApiReference = async () => {
  try {
    const scalarModule = await import('@scalar/express-api-reference');
    const { apiReference } = scalarModule;

    apiReferenceMiddleware = apiReference({
      // URL to the OpenAPI specification
      url: '/api-docs/openapi.json',
      // URL to the API reference
      cdn: 'https://cdn.jsdelivr.net/npm/@scalar/api-reference',
      // Set theme, using the default theme
      theme: 'default',
      // Title for the API reference
      title: 'DummyJSON API Reference',
      // Version of the API
      version,
    });

    log('Scalar API Reference initialized successfully');
  } catch (error) {
    logError('Failed to initialize Scalar API Reference:', { error });
    // Provide a fallback middleware
    apiReferenceMiddleware = (req, res) => {
      res.status(500).json({ message: 'API documentation is currently unavailable' });
    };
  }
};

initializeApiReference();

const serveOpenAPISpec = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(openapiSpec);
};

// Middleware that checks if the API reference is loaded and uses it
const serveApiReference = (req, res, next) => {
  if (!apiReferenceMiddleware) {
    return res.status(503).json({ message: 'API documentation is loading, please try again shortly' });
  }

  return apiReferenceMiddleware(req, res, next);
};

module.exports = {
  serveOpenAPISpec,
  serveApiReference,
};
