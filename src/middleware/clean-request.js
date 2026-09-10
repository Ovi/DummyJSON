import APIError from '../utils/error.js';
import { isNumber, trueTypeOf, isValidString } from '../utils/util.js';
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

    const {
      sortBy,
      order: sortOrder,
      limit = 30,
      skip = 0,
      select: selectedFields,
      q,
      key,
      value,
      delay,
      modifiedAfter,
      modifiedBefore,
    } = query;
    let select = selectedFields;

    let order = 'asc';
    if (isValidString(sortBy) && isValidString(sortOrder)) {
      order = sortOrder.toLowerCase();
      if (!['asc', 'desc'].includes(order)) {
        throw new APIError(`Invalid 'order' - should be either 'asc' or 'desc'`, 400);
      }
    }

    if (!isNumber(limit) || limit < 0) {
      throw new APIError(`Invalid 'limit' - should be a positive number`, 400);
    }

    if (!isNumber(skip) || skip < 0) {
      throw new APIError(`Invalid 'skip' - should be a positive number`, 400);
    }

    // Accept both ?q=phone and ?q[valueSearch]=phone
    let searchQuery = '';
    if (isValidString(q)) {
      searchQuery = q;
    } else if (q && trueTypeOf(q) === 'object' && isValidString(q.valueSearch)) {
      searchQuery = q.valueSearch;
    } else if (q) {
      throw new APIError(`Invalid 'q' - should be a valid string or object with 'valueSearch' string`, 400);
    }
    searchQuery = searchQuery
      .trim()
      .toLowerCase()
      .split('-')
      .join(' ');

    if (select) {
      if (trueTypeOf(select) === 'array') {
        select = ['id', ...select];
      } else if (isValidString(select)) {
        select = ['id', ...select.split(',')];
      } else {
        select = null;
      }
    }

    if (delay) {
      if (!isNumber(delay) || delay < 0) {
        throw new APIError('Delay should be a positive number in milliseconds', 400);
      }

      if (delay > 5000) {
        throw new APIError('Delay should be less than 5 seconds (5000 milliseconds)', 400);
      }
    }

    const parseDateParam = (name, raw) => {
      if (raw === undefined) return undefined;
      const time = isValidString(raw) ? Date.parse(raw) : NaN;
      if (Number.isNaN(time)) {
        throw new APIError(`Invalid '${name}' - should be a valid ISO 8601 date, e.g. 2025-01-01T00:00:00Z`, 400);
      }
      return time;
    };

    const modifiedAfterMs = parseDateParam('modifiedAfter', modifiedAfter);
    const modifiedBeforeMs = parseDateParam('modifiedBefore', modifiedBefore);

    if (modifiedAfterMs !== undefined && modifiedBeforeMs !== undefined && modifiedAfterMs > modifiedBeforeMs) {
      throw new APIError(`'modifiedAfter' must be earlier than 'modifiedBefore'`, 400);
    }

    options.sortBy = sortBy;
    options.order = order;
    options.limit = parseInt(limit, 10);
    options.skip = parseInt(skip, 10);
    options.q = searchQuery;
    options.select = select;
    options.key = key;
    options.value = value;
    options.delay = parseInt(delay, 10);
    options.modifiedAfter = modifiedAfterMs;
    options.modifiedBefore = modifiedBeforeMs;

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
