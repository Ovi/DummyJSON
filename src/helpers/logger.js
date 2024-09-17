const { createLogger, format, transports } = require('winston');

const { NODE_ENV } = process.env;

// Custom log format with JSON output
const customJsonLogFormat = format.printf(({ timestamp, level, message, meta }) => {
  const { method, status, error, ...rest } = meta || {};

  // Create a log object to output as JSON
  const logObject = {
    timestamp,
    level,
    message,
    method,
    status,
    error: error instanceof Error ? { message: error.message, stack: error.stack } : error,
    meta: rest,
  };

  // Remove any undefined values before logging
  Object.keys(logObject).forEach(key => logObject[key] === undefined && delete logObject[key]);

  // Convert log object to JSON string
  return JSON.stringify(logObject);
});

// Create the logger with JSON format
const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }), // ISO timestamp
    format(info => {
      info.meta = info.meta || {}; // Ensure meta is present
      return info;
    })(),
    NODE_ENV === 'development' ? format.prettyPrint() : customJsonLogFormat,
  ),
  transports: [new transports.Console()],
});

const basicLog = (message, meta = {}, level = 'info') => {
  const logObject = {
    timestamp: new Date().toISOString(),
    level,
    message,
    meta,
  };

  logger.log(logObject);
};

const log = basicLog;
const logError = (message, meta = {}) => basicLog(message, meta, 'error');
const logWarn = (message, meta = {}) => basicLog(message, meta, 'warn');
const logVerbose = (message, meta = {}) => basicLog(message, meta, 'verbose');

module.exports = {
  log,
  logger,
  logError,
  logWarn,
  logVerbose,
};
