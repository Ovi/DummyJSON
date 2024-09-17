const { isDbConnected } = require('../utils/db');

function checkDbConnection(req, res, next) {
  if (!isDbConnected()) {
    return res.status(503).json({ error: 'Database is currently unavailable. Please try again later.' });
  }

  next();
}

module.exports = checkDbConnection;
