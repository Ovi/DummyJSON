function wwwRedirect(req, res, next) {
  if (req.headers.host && req.headers.host.startsWith('www.')) {
    const newHost = req.headers.host.slice(4);
    res.redirect(301, `${req.protocol}://${newHost}${req.originalUrl}`);
    return;
  }

  next();
}

export default wwwRedirect;
