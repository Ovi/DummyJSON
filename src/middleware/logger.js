const onFinished = require('on-finished');
const onHeaders = require('on-headers');
const Log = require('../models/log');
const { isRequestInWhitelist } = require('../helpers');

// use database to store logs
const { MONGODB_URI } = process.env;

if (MONGODB_URI) {
  require('../db/mongoose');
}

function logger(req, res, next) {
  // request data
  req._startAt = undefined;
  req._startTime = undefined;

  // response data
  res._startAt = undefined;
  res._startTime = undefined;

  // record request start
  recordStartTime.call(req);

  function logRequest() {
    // handle log
    if (isRequestInWhitelist(req)) return;

    const log = new Log({
      requestMetaData: {
        requestIP: getIP(req),
        requestMethod: req.method,
        requestTimeISO: new Date().toISOString(),
        requestUA: req.headers['user-agent'],
        requestURL: req.originalUrl || req.url,
      },

      responseMetaData: {
        responseCode: getResponseStatus(req, res),
        responseTimeMS: getResponseTime(req, res),
      },

      referrer: req.headers.referer || req.headers.referrer,
      totalTimeMS: getTotalTime(req, res),
    });

    if (MONGODB_URI) {
      log.save((err, result) => {
        if (err) {
          console.log({ logError: err.message });
          return;
        }

        console.log(result);
      });
    } else {
      console.log(log);
    }
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
  return (
    req.ip ||
    (req.connection && req.connection.remoteAddress) ||
    req.ips ||
    undefined
  );
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
  const ms =
    (res._startAt[0] - req._startAt[0]) * 1e3 +
    (res._startAt[1] - req._startAt[1]) * 1e-6;

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
  return typeof res.headersSent !== 'boolean'
    ? Boolean(res._header)
    : res.headersSent;
}
