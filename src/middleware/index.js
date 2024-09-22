const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const applyRateLimit = require('../utils/apply-rate-limit');
const requestLogger = require('./request-logger');
const cleanRequest = require('./clean-request');
const delayResponse = require('./delay-response');

function injectMiddleWares(app) {
  // enable compression.
  app.use(compression());

  // enable CORS.
  app.use(cors());

  // use helmet JS.
  app.use(helmet());

  // remove unwanted headers
  app.use((req, res, next) => {
    const headersToRemove = ['Server', 'X-Powered-By'];
    headersToRemove.forEach(header => res.removeHeader(header));

    // set custom headers
    res.set({
      'X-Powered-By': 'Cats on Keyboards',
      Server: 'BobTheBuilder',
    });

    // redirect www to non-www
    if (req.headers.host.slice(0, 4) === 'www.') {
      const newHost = req.headers.host.slice(4);
      res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
      return;
    }

    next();
  });

  // apply cookie-parser middleware
  app.use(cookieParser());

  app.use(express.json({ limit: '300kb' })); // for parsing application/json
  app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  applyRateLimit(app);

  app.use(requestLogger);

  app.use(cleanRequest);

  app.use(delayResponse);
}

module.exports = injectMiddleWares;
