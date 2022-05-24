const NodeCache = require('node-cache');
const router = require('express').Router();
const Log = require('../models/log');
const { formatCount } = require('../utils/util');

const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds
const cacheKeyName = 'requestsCountFormatted';

// get total request served count
router.get('/', async (req, res, next) => {
  try {
    if (cache.has(cacheKeyName)) {
      return res.send({ count: cache.get(cacheKeyName) });
    }

    const count = await Log.countDocuments();
    const formattedCount = formatCount(count, true, 2);

    cache.set(cacheKeyName, formattedCount);

    res.send({ count: formattedCount });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
