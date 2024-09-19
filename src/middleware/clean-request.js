const APIError = require('../utils/error');
const { isNumber, trueTypeOf } = require('../utils/util');
const { multerInstance, deleteMulterTemporayFiles } = require('../helpers');
const { logError } = require('../helpers/logger');

const cleanRequest = (req, res, next) => {
  try {
    // Remove trailing slash
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
      const query = req.url.slice(req.path.length);
      const safePath = req.path.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, safePath + query);
      return;
    }

    const options = {};
    req._options = options;

    const { limit = 30, skip = 0, q, key, value, delay, sortBy } = req.query;
    let { select, order } = req.query;

    if (!isNumber(limit)) {
      throw new APIError(`Invalid 'limit' - must be a number`, 400);
    }

    if (!isNumber(skip)) {
      throw new APIError(`Invalid 'skip' - must be a number`, 400);
    }

    if (delay) {
      if (!isNumber(delay)) {
        throw new APIError('Delay must be a number in milliseconds', 400);
      }

      if (delay > 5000) {
        throw new APIError('Delay cannot be greater than 5 seconds', 400);
      }

      if (delay < 0) {
        throw new APIError('Delay cannot be less than 0', 400);
      }
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

    let searchQuery = (q || '').trim().toLowerCase();

    if (searchQuery) {
      searchQuery = searchQuery
        .toLowerCase()
        .split('-')
        .join(' ');
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

    // If request is multipart/form-data, allow handling of file uploads
    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      try {
        multerInstance.any()(req, res, err => {
          if (err) {
            next(new APIError(`Error processing multipart data: ${err.message}`, 400));
            return;
          }

          // Delete each uploaded file immediately
          deleteMulterTemporayFiles(req.files);

          // Proceed with processing form data
          next();
        });

        return;
      } catch (error) {
        logError('multipart/form-data error', {
          error,
          headers: req.headers,
          body: req.body,
          files: req.files,
          params: req.params,
          query: req.query,
        });
        next(new APIError(`Could not process multipart data: ${error.message}`, 500));
        return;
      }
    }

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = cleanRequest;
