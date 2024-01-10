const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 10 * 1000, // 10 Seconds
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: `request limit exceeded, please wait a few seconds`,
  },
  skip: () => false,
});

const applyRateLimit = app => {
  app.set('trust proxy', 1); // for express-rate-limit
  app.use(limiter);
};

module.exports = applyRateLimit;
