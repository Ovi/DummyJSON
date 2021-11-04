const errorMiddleware = (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  console.log('*-*-* [start] error *-*-*');
  console.log(err);
  console.log('*-*-* [end] error *-*-*');

  if (err.message === 'jwt expired') {
    return res.status(401).send({ ...err, message: 'Token Expired!' });
  }

  if (err.message === 'jwt malformed') {
    return res.status(401).send({ ...err, message: 'Invalid/Expired Token!' });
  }

  if (err.message === 'Invalid Token') {
    return res.status(401).send({ ...err, message: 'Invalid Token!' });
  }

  const error = {
    message: err.message,
  };

  res.status(err.status || 500);

  if (!error.message) {
    error.message = `Something went wrong.`;
  }

  res.json(error);
};

module.exports = errorMiddleware;
