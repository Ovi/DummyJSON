const onFinished = require('on-finished');
const onHeaders = require('on-headers');
const Log = require('../models/log');
const { isRequestInWhitelist } = require('../helpers');

// use database to store logs
const { MONGODB_URI } = process.env;

if (MONGODB_URI) {
  require('../db/mongoose');
}

let count = 0;
startCountLogger();

function logger(req, res, next) {
  if (isRequestInWhitelist(req)) {
    next();
    return;
  }

  count += 1;

  // request data
  req._startAt = undefined;
  req._startTime = undefined;

  // response data
  res._startAt = undefined;
  res._startTime = undefined;

  // record request start
  recordStartTime.call(req);

  function logRequest() {
    const requestURL = req.originalUrl || req.url;
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

    if (MONGODB_URI) {
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

function startCountLogger() {
  const countTime = new Date().getTime();

  setInterval(() => {
    const diff = timeDifference(countTime, new Date().getTime());
    console.info(`[Count] "${count}" requests in ${diff}`);
  }, 30 * 1000 /* 30 Seconds */);
}

// Calculate the time difference between two dates
function timeDifference(startDateMS, endDateMS) {
  // Calculate the difference in milliseconds
  const difference = endDateMS - startDateMS;

  // Calculate the difference in minutes
  const minutes = Math.floor(difference / 1000 / 60);

  // Calculate the difference in hours
  const hours = Math.floor(difference / 1000 / 60 / 60);

  // Calculate the difference in days
  const days = Math.floor(difference / 1000 / 60 / 60 / 24);

  // Calculate the number of remaining hours
  const remainingHours = hours % 24;

  // Calculate the number of remaining minutes
  const remainingMinutes = minutes % 60;

  // Build the result string
  let result = '';
  if (days > 0) {
    result += `${days} days, `;
  }
  if (remainingHours > 0) {
    result += `${remainingHours} hours, `;
  }
  if (remainingMinutes >= 0) {
    result += `${remainingMinutes} minutes`;
  }

  // Return the result string
  return result;
}
