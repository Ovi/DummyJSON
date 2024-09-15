const cluster = require('node:cluster');
const onFinished = require('on-finished');
const onHeaders = require('on-headers');
const { isRequestInWhitelist } = require('../helpers');
const { logger } = require('../helpers/logger');

const { LOG_ENABLED } = process.env;

let requestCount = 0;
let customRequestCount = 0;

function requestLogger(req, res, next) {
  if (isRequestInWhitelist(req)) {
    next();
    return;
  }

  requestCount += 1;

  const requestURL = req.originalUrl || req.url;
  if (requestURL.startsWith('/c/') || requestURL.startsWith('/custom-response')) {
    customRequestCount += 1;
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
    const referrer = req.headers.referer || req.headers.referrer;

    const logObject = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'HTTP Request',
      meta: {
        method: req.method,
        status: getResponseStatus(req, res),
        total_time_ms: getTotalTime(req, res),
        response_time_ms: getResponseTime(req, res),
        ip: getIP(req),
        url: requestURL,
        referrer: referrer || '-',
        user_agent: req.headers['user-agent'] || '-',
      },
    };

    logger.info(logObject);
  }

  // record response start
  onHeaders(res, recordStartTime);

  // log when response finished
  onFinished(res, logRequest);

  next();
}

module.exports = requestLogger;

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

  return ms.toFixed(3);
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

  return ms.toFixed(3);
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

startCountLogger();
