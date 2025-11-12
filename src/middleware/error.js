import { log, logError } from '../helpers/logger.js';
import { isEmpty } from '../utils/util.js';

/* eslint-disable no-console */
const commonErrorMessages = [
  'jwt expired',
  'jwt malformed',
  'invalid signature',
  'invalid Token',
  'Invalid access token',
  'Token Expired!',
  'Refresh token required',
  'Invalid refresh token',
  'Refresh token expired',
  'Access Token is required',
  'Username and password required',
  'Username is not valid',
  'Invalid credentials',
  `Order can be: 'asc' or 'desc'`,
  'User id is required',
  'Product id is required',
  'Invalid product id',
  'Invalid user id',
  'Post id is required',
  'Invalid post id',
  `Invalid 'q' - must be a string`,
  `Invalid 'skip' - must be a number`,
  `Invalid 'limit' - must be a number`,
  'Invalid comment body',
  'Maximum access token expire time can be',
  'Delay must be a number in milliseconds',
  'Delay cannot be greater than 5 seconds',
  'Delay cannot be less than 0',
  'Multipart/form-data is not allowed with ',
  'Request payload too large',
  'Malformed multipart/form-data request',
  'Error processing multipart data: ',
];

// Mapping specific error messages to status codes and responses
const errorResponseMap = {
  'jwt expired': { status: 401, message: 'Token Expired!' },
  'jwt malformed': { status: 401, message: 'Invalid/Expired Token!' },
  'invalid Token': { status: 401, message: 'invalid Token!' },
};

const errorMiddleware = (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  const errorMessage = err.message || '';
  let errorLogged = false;

  // Log common errors
  const isCommonError = commonErrorMessages.find(msg => errorMessage.includes(msg));
  if (isCommonError) {
    log('Common Error', { error: errorMessage, requestData: buildRequestMetaData(req) });
    errorLogged = true;
  }

  // Log 404 errors specifically
  if (err.status === 404) {
    log('404 Error', { error: err.message || err });
    errorLogged = true;
  }

  // Log error details if not logged as a common or 404 error
  if (!errorLogged) {
    logError('Error Details', { error: err, requestData: buildRequestMetaData(req) });
  }

  // Check for mapped error responses
  const errorResponse = errorResponseMap[errorMessage];
  if (errorResponse) {
    return res.status(errorResponse.status).send({ message: errorResponse.message });
  }

  // Fallback error handling
  const error = {
    message: err.message || 'Something went wrong.',
    ...(err.errors ? { details: err.errors } : {}),
  };

  res.status(err.status || 500).json(error);
};

export default errorMiddleware;

function buildRequestMetaData(req) {
  const { clientInfo } = req;
  const { ip, userAgent } = clientInfo || {};

  const requestData = {
    timestamp: new Date().toISOString(),
    path: req.path,
    originalUrl: req.originalUrl,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params,
    headers: req.headers,
    ip,
    xhr: req.xhr, // true if AJAX request
    userAgent,
    referer: req.headers.referer || req.headers.referrer,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
  };

  const cleanedData = Object.entries(requestData)
    .filter(([, value]) => !isEmpty(value) || value === false)
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});

  return cleanedData;
}
