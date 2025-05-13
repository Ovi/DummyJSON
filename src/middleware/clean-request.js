const APIError = require('../utils/error');
const { isNumber, trueTypeOf } = require('../utils/util');
const { multerInstance, deleteMulterTemporaryFiles } = require('../helpers');
const { logError, log } = require('../helpers/logger');

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_PAYLOAD = MAX_FILE_SIZE * 5; // 25MB

const cleanRequest = (req, res, next) => {
  try {
    const { method: reqMethod, path, headers, url, query, ip } = req;
    const method = reqMethod.toLowerCase();

    // Remove trailing slash from route
    if (path.substr(-1) === '/' && path.length > 1) {
      const requestQuery = url.slice(path.length);
      const safePath = path.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, safePath + requestQuery);
      return;
    }

    const options = {};
    req._options = options;

    const { limit = 30, skip = 0, q, key, value, delay, sortBy } = query;
    let { select, order } = query;
    let searchQuery = '';

    if (!isNumber(limit)) throw new APIError(`Invalid 'limit' - must be a number`, 400);
    if (!isNumber(skip)) throw new APIError(`Invalid 'skip' - must be a number`, 400);

    // Accept both ?q=phone and ?q[valueSearch]=phone
    if (trueTypeOf(q) === 'string') {
      searchQuery = q
        .trim()
        .toLowerCase()
        .split('-')
        .join(' ');
    } else if (q && trueTypeOf(q) === 'object' && typeof q.valueSearch === 'string') {
      searchQuery = q.valueSearch
        .trim()
        .toLowerCase()
        .split('-')
        .join(' ');
    } else if (q) {
      logError('Malformed "q" param', { query: q });
      throw new APIError(`Invalid 'q' - must be a string`, 400);
    }

    if (delay) {
      if (!isNumber(delay)) throw new APIError('Delay must be a number in milliseconds', 400);
      if (delay > 5000) throw new APIError('Delay cannot be greater than 5 seconds', 400);
      if (delay < 0) throw new APIError('Delay cannot be less than 0', 400);
    }

    if (select) {
      if (trueTypeOf(select) === 'array') {
        select = ['id', ...select];
      } else if (trueTypeOf(select) === 'string') {
        select = ['id', ...select.split(',')];
      } else {
        select = null;
      }
    }

    if (order && sortBy) {
      order = order.toLowerCase();
      if (order !== 'asc' && order !== 'desc') {
        throw new APIError(`Order can be: 'asc' or 'desc'`, 400);
      }
    }

    if (sortBy && !order) {
      order = 'asc';
    }

    options.limit = parseInt(limit, 10);
    options.skip = parseInt(skip, 10);
    options.delay = parseInt(delay, 10);
    options.select = select;
    options.q = searchQuery;
    options.key = key;
    options.value = value;
    options.sortBy = sortBy;
    options.order = order;

    // Multipart handling
    const contentType = (headers['content-type'] || '').toLowerCase();
    const isMultipart = contentType.startsWith('multipart/form-data');

    if (isMultipart && !['post', 'put'].includes(method)) {
      logError('Multipart/form-data detected on disallowed HTTP method', {
        method,
        path,
        headers,
      });
      return next(new APIError(`Multipart/form-data is not allowed with ${method} requests`, 400));
    }

    if (isMultipart) {
      const contentLength = parseInt(headers['content-length'] || '0', 10);

      // Empty multipart body – allow, but skip parsing
      if (contentLength === 0) {
        log('[Info] Empty multipart/form-data body received');
        return next();
      }

      // Reject large requests early
      if (contentLength > MAX_TOTAL_PAYLOAD) {
        return next(new APIError('Request payload too large', 413));
      }

      try {
        multerInstance.any()(req, res, err => {
          if (err) {
            logError('Processing multipart data error', {
              error: err.message,
              headers,
            });
            return next(new APIError(`Error processing multipart data: ${err.message}`, 400));
          }

          const { files } = req;

          if (files && files.length) {
            // eslint-disable-next-line no-restricted-syntax
            for (const file of files) {
              if (file.size > MAX_FILE_SIZE) {
                logError('File too large', {
                  file: {
                    name: file.originalname,
                    mimetype: file.mimetype,
                    size: file.size,
                  },
                  userAgent: headers['user-agent'],
                  ip,
                });

                return next(
                  new APIError('File too large', 413, {
                    file: file.originalname,
                    size: file.size,
                    maxAllowed: MAX_FILE_SIZE,
                  }),
                );
              }

              log(`[File] ${file.originalname} - ${file.size} bytes`);
            }

            deleteMulterTemporaryFiles(files);
          }

          return next();
        });

        return;
      } catch (err) {
        logError('multipart/form-data parsing failed', {
          error: err.message,
          headers,
        });
        return next(new APIError(`Could not process multipart data: ${err.message}`, 500));
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = cleanRequest;
