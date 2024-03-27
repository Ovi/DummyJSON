const jwt = require('jsonwebtoken');

const { JWT_SECRET } = process.env;

const util = {};

util.generateToken = (payload, expiresInMins) => {
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

util.verifyToken = Authorization => {
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

util.getUserDataForToken = user => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  gender: user.gender,
  image: user.image,
});

module.exports = util;
