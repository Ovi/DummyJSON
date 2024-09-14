/* eslint-disable no-console */
const commonErrorMessages = [
  'jwt expired',
  'jwt malformed',
  'invalid signature',
  'invalid Token',
  'Token Expired!',
  'Refresh token required',
  'Invalid refresh token',
  'Refresh token expired',
  'Authentication Problem',
  'Username and password required',
  'Invalid credentials',
  'User id is required',
  'Product id is required',
  'Invalid product id',
  'Invalid user id',
  'Post id is required',
  'Invalid post id',
  'Invalid "skip" - must be a number',
  'Invalid "limit" - must be a number',
  'Invalid comment body',
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
    console.info('*** Common Error ***', errorMessage);
    errorLogged = true;
  }

  // Log 404 errors specifically
  if (err.status === 404) {
    console.info('*** 404 Error ***', err.message || err);
    errorLogged = true;
  }

  // Log error details if not logged as a common or 404 error
  if (!errorLogged) {
    console.error('*** Error Details ***', err);
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
