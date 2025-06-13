const extractClientInfo = require('../utils/client-info');

async function setClientInfo(req, res, next) {
  req.clientInfo = extractClientInfo(req) || {};
  next();
}

module.exports = setClientInfo;
