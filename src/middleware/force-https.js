const utils = require('../utils/util');

async function forceHTTPS(req, res, next) {
  const { originalUrl, secure } = req;

  if (!secure && !utils.isDev) {
    res.redirect(`https://${req.headers.host}${originalUrl}`);
    return;
  }

  next();
}

module.exports = forceHTTPS;
