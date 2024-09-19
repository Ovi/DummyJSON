const delayResponse = (req, res, next) => {
  const { delay } = req._options;

  if (delay) {
    setTimeout(next, delay);
    return;
  }

  next();
};

module.exports = delayResponse;
