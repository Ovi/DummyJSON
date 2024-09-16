const { log, logError } = require('../helpers/logger');

/* eslint-disable no-console */
const commonErrorMessages = [
  'jwt expired',
  'jwt malformed',
  'invalid signature',
  'invalid Token', // need to verify
  'Invalid access token',
  'Token Expired!',
  'Refresh token required',
  'Invalid refresh token',
  'Refresh token expired',
  'Access Token is required',
  'Username and password required',
  'Invalid credentials',
  'User id is required',
  'Product id is required',
  'Invalid product id',
  'Invalid user id',
  'Post id is required',
  'Invalid post id',
  `Invalid 'skip' - must be a number`,
  `Invalid 'limit' - must be a number`,
  'Invalid comment body',
  'Maximum access token expire time can be',
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
    log('Common Error', { error: errorMessage });
    errorLogged = true;
  }

  // Log 404 errors specifically
  if (err.status === 404) {
    log('404 Error', { error: err.message || err });
    errorLogged = true;
  }

  // Log error details if not logged as a common or 404 error
  if (!errorLogged) {
    logError('Error Details', { error: err });
  }

  // Check for mapped error responses
  const errorResponse = errorResponseMap[errorMessage];
  if (errorResponse) {
    return res.status(errorResponse.status).send({ message: errorResponse.message });
  }

  // Fallback error handling
  const error = {
    message: err.message || 'Something went wrong.',
  };

  res.status(err.status || 500).json(error);
};

module.exports = errorMiddleware;
