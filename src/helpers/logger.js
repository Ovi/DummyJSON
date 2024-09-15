const { createLogger, format, transports } = require('winston');

// Custom log format with key-value pairs
// const customLogFormat = format.printf(({ timestamp, level, message, meta }) => {
//   const keyValuePairs = [
//     `timestamp=${timestamp}`,
//     `level=${level}`,
//     `message=${message}`,
//     meta.method && `method=${meta.method}`,
//     meta.status_code && `status=${meta.status_code}`,
//     meta.total_time_ms && `time=${meta.total_time_ms}ms`,
//     meta.response_time_ms && `response_time=${meta.response_time_ms}ms`,
//     meta.ip && `ip=${meta.ip}`,
//     meta.url && `url=${meta.url}`,
//     meta.referrer && `referrer=${meta.referrer}`,
//     meta.user_agent && `user_agent=${meta.user_agent}`,
//     meta.error && `error="${meta.error}"`,
//   ]
//     .filter(Boolean)
//     .join(' ');

//   return keyValuePairs;
// });

// Custom log format with JSON output
const customJsonLogFormat = format.printf(({ timestamp, level, message, meta }) => {
  // Create a log object to output as JSON
  const logObject = {
    timestamp,
    level,
    message,
    method: meta.method || undefined,
    status: meta.status_code || undefined,
    time: meta.total_time_ms ? `${meta.total_time_ms}ms` : undefined,
    response_time: meta.response_time_ms ? `${meta.response_time_ms}ms` : undefined,
    ip: meta.ip || undefined,
    url: meta.url || undefined,
    referrer: meta.referrer || undefined,
    user_agent: meta.user_agent || undefined,
    error: meta.error || undefined,
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
      // eslint-disable-next-line no-param-reassign
      info.meta = info.meta || {}; // Ensure meta is present
      return info;
    })(),
    customJsonLogFormat, // Use only the JSON log format
  ),
  transports: [
    new transports.Console(), // Log to console
  ],
});

module.exports = logger;
