const constants = {};

constants.ENV_VARIABLES = ['FRONTEND_URL', 'MONGODB_URI', 'JWT_SECRET'];

constants.requestWhitelist = ['/favicon.ico', '/static', '/image/i/'];

module.exports = constants;
