const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const setClientInfo = require('./set-client-info');
const requestLogger = require('./request-logger');
const cleanRequest = require('./clean-request');
const delayResponse = require('./delay-response');
const rateLimiter = require('./rate-limiter');
const wwwRedirect = require('./www-redirect');
const removeHeaders = require('./remove-headers');

// for parsing application/json
const expressJson = express.json({ limit: '300kb' });
// for parsing application/x-www-form-urlencoded
const expressUrlencoded = express.urlencoded({ extended: true, limit: '300kb' });

// allow cross-origin resource policy
const helmetConfig = {
  crossOriginResourcePolicy: false,
};

function injectMiddleWares(app) {
  app.set('trust proxy', 1);
  app.use(setClientInfo);
  app.use(rateLimiter);
  app.use(helmet(helmetConfig));
  app.use(cors());
  app.use(compression());
  app.use(cookieParser());
  app.use(expressJson);
  app.use(expressUrlencoded);
  app.use(requestLogger);
  app.use(cleanRequest);
  app.use(wwwRedirect);
  app.use(removeHeaders);
  app.use(delayResponse);
}

module.exports = injectMiddleWares;
