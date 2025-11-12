import chalk from 'chalk';
import { createLogger, format, transports } from 'winston';

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

// one liner
// [level] message - method:status:error:meta
const customJsonLogFormatOneLiner = format.printf(({ level, message, meta }) => {
  const { method, status, error, ...rest } = meta || {};

  const getColor = (() => {
    switch (level) {
      case 'error':
        return chalk.red;
      case 'warn':
        return chalk.yellow;
      case 'info':
        return chalk.gray;
      case 'debug':
        return chalk.green;
      default:
        return chalk.blue;
    }
  })();

  let logString = `${message}`;

  if (method) logString += ` - ${method}`;
  if (status) logString += `:${status}`;
  if (error) logString += `:${error}`;
  if (rest) {
    try {
      if (Object.keys(rest).length > 0) {
        logString += `:${JSON.stringify(rest)}`;
      }
    } catch (e) {
      logString += `:${JSON.stringify(rest)}`;
    }
  }

  return getColor(logString);
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
    NODE_ENV === 'development' ? customJsonLogFormatOneLiner : customJsonLogFormat,
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

export { log, logger, logError, logWarn, logVerbose };
