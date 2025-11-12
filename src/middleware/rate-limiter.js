import rateLimit from 'express-rate-limit';

const { NODE_ENV } = process.env;

const rateLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 Seconds
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    message: `request limit exceeded, please wait a few seconds`,
  },
  skip: () => NODE_ENV === 'development',
});

export default rateLimiter;
