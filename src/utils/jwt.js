const jwt = require('jsonwebtoken');
const { thirtyDaysInMints } = require('../constants');

const { JWT_SECRET } = process.env;

const util = {};

util.generateAccessToken = generateToken;

util.verifyAccessToken = authorization => {
  const accessToken = authorization.replace('Bearer ', '');
  return verifyToken(accessToken);
};

util.generateRefreshToken = generateToken;

util.verifyRefreshToken = verifyToken;

module.exports = util;

function generateToken(payload, expiresInMins) {
  return new Promise((resolve, reject) => {
    let expiresIn = `${thirtyDaysInMints}m`;

    if (expiresInMins) expiresIn = `${expiresInMins}m`;

    jwt.sign(payload, JWT_SECRET, { expiresIn }, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(token);
    });
  });
}

function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(decoded);
    });
  });
}
