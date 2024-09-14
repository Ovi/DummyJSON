const cluster = require('node:cluster');
const onFinished = require('on-finished');
const onHeaders = require('on-headers');
const Log = require('../models/log');
const { isRequestInWhitelist } = require('../helpers');
const { isDbConnected } = require('../utils/db');

const { LOG_ENABLED, DB_LOG_ENABLED } = process.env;

let requestCount = 0;
let customRequestCount = 0;
startCountLogger();

function logger(req, res, next) {
  if (isRequestInWhitelist(req)) {
    next();
    return;
  }

  requestCount += 1;

  const requestURL = req.originalUrl || req.url;

  if (requestURL.startsWith('/c/') || requestURL.startsWith('/custom-response')) {
    console.log(`[CUSTOM RESPONSE] ${req.method} ${requestURL}. IP: ${getIP(req)}; UA: ${req.headers['user-agent']}`);
    customRequestCount += 1;

    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Body:', req.body);
    }
  }

  if (!LOG_ENABLED) {
    next();
    return;
  }

  // request data
  req._startAt = undefined;
  req._startTime = undefined;

  // response data
  res._startAt = undefined;
  res._startTime = undefined;

  // record request start
  recordStartTime.call(req);

  function logRequest() {
    const requestMetaData = {
      requestIP: getIP(req),
      requestMethod: req.method,
      requestTimeISO: new Date().toISOString(),
      requestUA: req.headers['user-agent'],
      requestURL,
    };

    const responseMetaData = {
      responseCode: getResponseStatus(req, res),
      responseTimeMS: getResponseTime(req, res),
    };

    const referrer = req.headers.referer || req.headers.referrer;

    const log = new Log({
      requestMetaData,
      responseMetaData,
      referrer,
      totalTimeMS: getTotalTime(req, res),
    });

    if (isDbConnected() && DB_LOG_ENABLED) {
      log.save(err => {
        if (err) {
          console.log({ logError: err.message });
        }
      });
    }

    console.log(`Resource: ${requestURL}; Referrer: ${referrer || '-'}`);
  }

  // record response start
  onHeaders(res, recordStartTime);

  // log when response finished
  onFinished(res, logRequest);

  next();
}

module.exports = logger;

function recordStartTime() {
  this._startAt = process.hrtime();
  this._startTime = new Date();
}

function getIP(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || req.ips || undefined;
}

function getResponseStatus(req, res) {
  if (isHeadersSent(res)) {
    const limitExceeded = req.rateLimit?.remaining === 0;

    const statusCode = limitExceeded ? 429 : res.statusCode;

    return String(statusCode);
  }

  return null;
}

function getResponseTime(req, res) {
  if (!req._startAt || !res._startAt) {
    // missing request and/or response start time
    return;
  }

  // calculate diff
  const ms = (res._startAt[0] - req._startAt[0]) * 1e3 + (res._startAt[1] - req._startAt[1]) * 1e-6;

  return ms;
}

function getTotalTime(req, res) {
  if (!req._startAt || !res._startAt) {
    // missing request and/or response start time
    return;
  }

  // time elapsed from request start
  const elapsed = process.hrtime(req._startAt);

  // cover to milliseconds
  const ms = elapsed[0] * 1e3 + elapsed[1] * 1e-6;

  return ms;
}

function isHeadersSent(res) {
  return typeof res.headersSent !== 'boolean' ? Boolean(res._header) : res.headersSent;
}

function startCountLogger() {
  if (!cluster.isWorker) return;

  setInterval(() => {
    process.send({
      type: 'request_counts',
      requestCount,
      customRequestCount,
    });

    requestCount = 0;
    customRequestCount = 0;
  }, 30 * 1000 /* 30 Seconds */);
}
