import { AsyncLocalStorage } from 'node:async_hooks';

// Create an AsyncLocalStorage instance to store request context
const requestContext = new AsyncLocalStorage();

/**
 * Run a function within the request context
 * @param {Object} req - Express request object
 * @param {Function} fn - Function to run within the context
 */
export function runInRequestContext(req, fn) {
  return requestContext.run(req, fn);
}

/**
 * Get the current request from the context
 * @returns {Object|null} - Current Express request object or null
 */
export function getCurrentRequest() {
  return requestContext.getStore() || null;
}

/**
 * Middleware to store request in AsyncLocalStorage context
 */
export function requestContextMiddleware(req, res, next) {
  // Store the request in AsyncLocalStorage for the duration of this request
  requestContext.run(req, () => {
    // Call next() within the context so all subsequent middleware and handlers
    // can access the request via getCurrentRequest()
    next();
  });
}
