const swaggerJsDoc = require('swagger-jsdoc');
const { version } = require('../../package.json');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.1.0',
  info: {
    title: 'DummyJSON API Documentation',
    version,
    description: 'Documentation for the DummyJSON REST API',
    author: 'Muhammad Ovi <contact@muhammadovi.com>',
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://dummyjson.com',
      description: 'DummyJSON API Server',
    },
  ],
  externalDocs: {
    description: 'scalar-api-docs',
    url: '/api-docs',
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/openapi-schemas/*.js'],
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;
