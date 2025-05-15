const router = require('express').Router();
const { serveOpenAPISpec, serveApiReference } = require('../middleware/openapi');

// Serve OpenAPI specification at /api-docs/openapi.json
router.get('/openapi.json', serveOpenAPISpec);

// Serve Scalar API Reference UI at /api-docs
router.use('/', serveApiReference);

module.exports = router;
