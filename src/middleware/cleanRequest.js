const APIError = require('../utils/error');
const { isNumber } = require('../utils/util');

const cleanRequest = (req, res, next) => {
  try {
    const options = {};
    req._options = options;

    const { limit = 30, skip = 0, q } = req.query;
    let { select } = req.query;

    if (!isNumber(limit)) {
      throw new APIError('Invalid limit', 400);
    }

    if (!isNumber(skip)) {
      throw new APIError('Invalid skip limit', 400);
    }

    if (select) select = ['id', ...select.split(',')];

    let searchQuery = q;

    if (searchQuery) {
      searchQuery = searchQuery
        .toLowerCase()
        .split('-')
        .join(' ');
    }

    options.limit = limit;
    options.skip = skip;
    options.select = select;
    options.q = searchQuery;

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = cleanRequest;
