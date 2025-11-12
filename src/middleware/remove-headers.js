function removeHeaders(req, res, next) {
  // Remove unwanted headers
  ['Server', 'X-Powered-By'].forEach(header => res.removeHeader(header));

  // Set custom headers
  res.set({
    'X-Powered-By': 'Cats on Keyboards',
    Server: 'BobTheBuilder',
  });

  next();
}

export default removeHeaders;
