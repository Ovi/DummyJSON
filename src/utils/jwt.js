import jwt from 'jsonwebtoken';
import { maxTokenExpireMins } from '../constants/index.js';

const { JWT_SECRET } = process.env;

export const generateAccessToken = generateToken;

export const verifyAccessToken = authorization => {
  const accessToken = authorization.replace('Bearer ', '');
  return verifyToken(accessToken);
};

// refresh token is always valid for 30 days
export const generateRefreshToken = payload => generateToken(payload, maxTokenExpireMins);

export const verifyRefreshToken = verifyToken;

function generateToken(payload, expiresInMins) {
  return new Promise((resolve, reject) => {
    let expiresIn = `${maxTokenExpireMins}m`;

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
