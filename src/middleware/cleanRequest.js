const multer = require('multer');
const APIError = require('../utils/error');
const { isNumber, trueTypeOf } = require('../utils/util');

const upload = multer(); // for parsing multipart/form-data

const cleanRequest = (req, res, next) => {
  try {
    // remove trailing slash
    if (req.path.substr(-1) === '/' && req.path.length > 1) {
      const query = req.url.slice(req.path.length);
      const safePath = req.path.slice(0, -1).replace(/\/+/g, '/');
      res.redirect(301, safePath + query);
      return;
    }

    const options = {};
    req._options = options;

    const { limit = 30, skip = 0, q, key, value } = req.query;
    let { select } = req.query;

    if (!isNumber(limit)) {
      throw new APIError('Invalid limit', 400);
    }

    if (!isNumber(skip)) {
      throw new APIError('Invalid skip limit', 400);
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

    let searchQuery = q;

    if (searchQuery) {
      searchQuery = searchQuery
        .toLowerCase()
        .split('-')
        .join(' ');
    }

    options.limit = parseInt(limit, 10);
    options.skip = parseInt(skip, 10);
    options.select = select;
    options.q = searchQuery;
    options.key = key;
    options.value = value;

    if (req.headers['content-type']?.startsWith('multipart/form-data')) {
      upload.none()(req, res, next);
      return;
    }

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = cleanRequest;
