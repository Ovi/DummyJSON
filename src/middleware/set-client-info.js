import extractClientInfo from '../utils/client-info.js';

async function setClientInfo(req, res, next) {
  req.clientInfo = extractClientInfo(req) || {};
  next();
}

export default setClientInfo;
