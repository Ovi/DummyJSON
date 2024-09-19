const httpCodes = require('./http-codes');

const constants = {};

constants.REQUIRED_ENV_VARIABLES = ['JWT_SECRET', 'MONGODB_URI', 'MONGODB_DB_NAME'];
constants.OPTIONAL_ENV_VARIABLES = [
  'GOOGLE_TAG_ID',
  'GOOGLE_PUBLISHER_ID',
  'GOOGLE_ADS_TXT_CONTENT',
  'AWS_ACCESS_KEY',
  'AWS_SECRET_KEY',
  'AWS_BUCKET_NAME',
  'LOG_ENABLED',
  'BANNER_CONTENT',
];

constants.requestWhitelist = ['/favicon.ico', '/static', '/public', '/fav.png'];

constants.httpCodes = httpCodes;

constants.imageMimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

constants.allowedImageTypes = Object.keys(constants.imageMimeTypes);

constants.thirtyDaysInMints = 30 * 24 * 60;

constants.customResponseExpiresInDays = 90;

module.exports = constants;
