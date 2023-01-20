const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const applyRateLimit = require('../utils/applyRateLimit');
const logger = require('./logger');
const cleanRequest = require('./cleanRequest');

function injectMiddleWares(app) {
  // enable compression.
  app.use(compression());

  // enable CORS.
  app.use(cors());

  // use helmet JS.
  app.use(helmet());

  app.use(express.json()); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  applyRateLimit(app);

  app.use(logger);

  app.use(cleanRequest);
}

module.exports = injectMiddleWares;
