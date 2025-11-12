export { default as httpCodes } from './http-codes.js';

export const REQUIRED_ENV_VARIABLES = ['JWT_SECRET', 'MONGODB_URI'];
export const OPTIONAL_ENV_VARIABLES = [
  'MONGODB_DB_NAME',
  'GOOGLE_TAG_ID',
  'GOOGLE_ADS_TXT_CONTENT',
  'AWS_ACCESS_KEY',
  'AWS_SECRET_KEY',
  'AWS_BUCKET_NAME',
  'LOG_ENABLED',
  'BANNER_CONTENT',
  'NUM_WORKERS',
  'STATS',
];

export const requestWhitelist = ['/favicon.ico', '/static', '/public', '/fav.png'];

export const imageMimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

export const allowedImageTypes = Object.keys(imageMimeTypes);

// 30 days in minutes
export const maxTokenExpireMins = 30 * 24 * 60;

export const customResponseExpiresInDays = 90;
