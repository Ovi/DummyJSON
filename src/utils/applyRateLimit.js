const rateLimit = require('express-rate-limit');
const { isRequestInWhitelist } = require('../helpers');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minutes
  max: 120, // limit each IP to 120 requests per windowMs
  message: {
    message: `request limit exceeded, please try again in 1 mint`,
  },
  skip: isRequestInWhitelist,
});

const applyRateLimit = app => {
  app.set('trust proxy', 1); // for express-rate-limit
  app.use(limiter);
};

module.exports = applyRateLimit;
