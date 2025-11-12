import APIError from '../utils/error.js';
import { isNumber, trueTypeOf } from '../utils/util.js';
import { multerInstance, deleteMulterTemporaryFiles } from '../helpers/index.js';
import { logError, log } from '../helpers/logger.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_TOTAL_PAYLOAD = MAX_FILE_SIZE * 5; // 25MB

const cleanRequest = async (req, res, next) => {
  try {
    const { method: reqMethod, path, headers, url, query, clientInfo } = req;
    const { ip, userAgent } = clientInfo;
    const method = reqMethod.toLowerCase();

    // Remove trailing slash from route
    if (path.endsWith('/') && path.length > 1) {
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
      if (!['asc', 'desc'].includes(order)) {
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
      throw new APIError(`Multipart/form-data is not allowed with ${method} requests`, 400);
    }

    if (isMultipart) {
      const boundaryMatch = contentType.match(/boundary="?([^\s";]+)"?$/);
      if (!boundaryMatch) {
        throw new APIError('Malformed multipart/form-data header: missing boundary', 400);
      }

      // Empty multipart body – allow, but skip parsing
      const contentLength = parseInt(headers['content-length'] || '0', 10);
      if (contentLength === 0) {
        log('[Info] Empty multipart/form-data body received');
        next();
        return;
      }

      // Reject large requests early
      if (contentLength > MAX_TOTAL_PAYLOAD) {
        throw new APIError('Request payload too large', 413);
      }

      try {
        await new Promise((resolve, reject) => {
          multerInstance.any()(req, res, err => {
            if (err) return reject(err);
            return resolve();
          });
        });

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
                userAgent,
                ip,
              });

              throw new APIError('File too large', 413, {
                file: file.originalname,
                size: file.size,
                maxAllowed: MAX_FILE_SIZE,
              });
            }

            log(`[File] ${file.originalname} - ${file.size} bytes`);
          }

          deleteMulterTemporaryFiles(files);
        }

        next();
      } catch (err) {
        const isMalformed = /unexpected end of form|malformed part header/i.test(err.message);
        if (isMalformed) {
          throw new APIError('Malformed multipart/form-data request', 400);
        }

        throw new APIError(`Error processing multipart data: ${err.message}`, 400);
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

export default cleanRequest;
