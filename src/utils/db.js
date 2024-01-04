const util = {};

let _isDbConnected = false;

util.isDbConnected = () => _isDbConnected;

util.updatedDbConnectionStatus = bool => (_isDbConnected = bool);

module.exports = util;
