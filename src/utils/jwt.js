const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const controller = {};

controller.generateToken = (payload, expiresInMins) => {
  return new Promise((resolve, reject) => {
    let expiresIn = '60m';

    if (expiresInMins) expiresIn = `${expiresInMins}m`;

    jwt.sign(payload, JWT_SECRET, { expiresIn }, (err, token) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(token);
    });
  });
};

controller.verifyToken = Authorization => {
  return new Promise((resolve, reject) => {
    const token = Authorization.replace('Bearer ', '');
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(decoded);
    });
  });
};

module.exports = controller;
