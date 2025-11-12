import { isDev } from '../utils/util.js';

async function forceHTTPS(req, res, next) {
  const { originalUrl, secure } = req;

  if (!secure && !isDev) {
    res.redirect(`https://${req.headers.host}${originalUrl}`);
    return;
  }

  next();
}

export default forceHTTPS;
