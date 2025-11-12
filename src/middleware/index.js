import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import setClientInfo from './set-client-info.js';
import requestLogger from './request-logger.js';
import cleanRequest from './clean-request.js';
import delayResponse from './delay-response.js';
import rateLimiter from './rate-limiter.js';
import wwwRedirect from './www-redirect.js';
import removeHeaders from './remove-headers.js';

// for parsing application/json
const expressJson = express.json({ limit: '300kb' });
// for parsing application/x-www-form-urlencoded
const expressUrlencoded = express.urlencoded({ extended: true, limit: '300kb' });

// allow cross-origin resource policy
const helmetConfig = {
  crossOriginResourcePolicy: false,
};

function injectMiddleWares(app) {
  app.set('trust proxy', true);
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

export default injectMiddleWares;
