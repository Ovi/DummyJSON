import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import { flushRouteStatsSnapshot } from '../helpers/route-stat.js';
import { flushUserAgentStatsSnapshot } from '../helpers/user-agent-stat.js';
import { isRequestInWhitelist } from '../helpers/index.js';
import { log, logError } from '../helpers/logger.js';
import { timeDifference } from '../utils/util.js';

const { LOG_ENABLED } = process.env;

const counts = {
  overallRequestCount: 0,
  customRouteCount: 0,
  pathCounts: {}, // last minute counts only
  userAgentCounts: {}, // last minute counts only
};

function requestLogger(req, res, next) {
  if (isRequestInWhitelist(req)) {
    next();
    return;
  }

  counts.overallRequestCount += 1;

  const requestURL = req.originalUrl;
  if (requestURL.startsWith('/c/') || requestURL.startsWith('/custom-response')) {
    counts.customRouteCount += 1;
  }

  const fullPath = requestURL.split('?')[0]?.toLowerCase();
  counts.pathCounts[fullPath] = (counts.pathCounts[fullPath] || 0) + 1;

  // Track user-agent
  const { clientInfo } = req;
  const userAgent = clientInfo?.userAgent || 'unknown';
  counts.userAgentCounts[userAgent] = (counts.userAgentCounts[userAgent] || 0) + 1;

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
    const { clientInfo } = req;
    const { ip, userAgent } = clientInfo || {};

    const logObject = {
      method: req.method,
      status: getResponseStatus(req, res),
      total_time_ms: getTotalTime(req, res),
      response_time_ms: getResponseTime(req, res),
      ip,
      url: requestURL,
      referrer: referrer || '-',
      user_agent: userAgent || '-',
    };

    log('HTTP Request', logObject);
  }

  // record response start
  onHeaders(res, recordStartTime);

  // log when response finished
  onFinished(res, logRequest);

  next();
}

export default requestLogger;

function recordStartTime() {
  this._startAt = process.hrtime();
  this._startTime = new Date();
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
  const startTime = Date.now();

  setInterval(async () => {
    const diff = timeDifference(startTime, Date.now());

    console.log(
      `[Request Counts] [${diff}] - overallRequestCount: ${counts.overallRequestCount}, customRouteCount: ${counts.customRouteCount}`,
    );

    try {
      await flushRouteStatsSnapshot(counts.pathCounts);
    } catch (err) {
      logError('Error flushing route stats snapshot', { error: err });
    }

    try {
      await flushUserAgentStatsSnapshot(counts.userAgentCounts);
    } catch (err) {
      logError('Error flushing user-agent stats snapshot', { error: err });
    }

    counts.pathCounts = {};
    counts.userAgentCounts = {};
  }, 60 * 1000 /* 1 minute */);
}

startCountLogger();
