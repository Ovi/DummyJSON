import APIError from '../utils/error.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import {
  dataInMemory as frozenData,
  getUserPayload,
  isValidNumberInRange,
  findUserWithUsernameAndId,
  trueTypeOf,
} from '../utils/util.js';
import { maxTokenExpireMins } from '../constants/index.js';

// login user by username and password
export const loginByUsernamePassword = async data => {
  const { username, password, expiresInMins = 60 } = data;

  if (!username || !password) {
    throw new APIError(`Username and password required`, 400);
  }

  if (trueTypeOf(username) !== 'string') {
    throw new APIError('Username is not valid', 400);
  }

  if (expiresInMins && !isValidNumberInRange(expiresInMins, 1, maxTokenExpireMins)) {
    throw new APIError(`Maximum access token expire time can be ${maxTokenExpireMins} minutes`);
  }

  const user = frozenData.users.find(u => {
    const validUsername = u.username.toLowerCase() === username.toLowerCase();
    const validPassword = u.password === password;

    return validUsername && validPassword;
  });

  if (!user) {
    throw new APIError(`Invalid credentials`, 400);
  }

  try {
    const payload = getUserPayload(user);

    const accessToken = await generateAccessToken(payload, expiresInMins);
    const refreshToken = await generateRefreshToken(payload);

    return {
      ...payload,
      accessToken,
      refreshToken,
      cookieData: {
        httpOnly: true,
        secure: true,
        maxAge: expiresInMins * 60 * 1000, // convert minutes to milliseconds
      },
    };
  } catch (err) {
    throw new APIError(err.message, 400);
  }
};

// get new refresh token
export const getNewRefreshToken = async ({ refreshToken, expiresInMins = maxTokenExpireMins }) => {
  if (!refreshToken) {
    throw new APIError(`Refresh token required`, 401);
  }

  if (!isValidNumberInRange(expiresInMins, 1, maxTokenExpireMins)) {
    throw new APIError(`Maximum access token expire time can be ${maxTokenExpireMins} minutes`);
  }

  let user;

  try {
    const decoded = await verifyRefreshToken(refreshToken);
    user = findUserWithUsernameAndId(decoded);
  } catch (error) {
    throw new APIError(`Invalid refresh token`, 403);
  }

  if (!user) {
    throw new APIError(`Refresh token expired`, 403);
  }

  const payload = getUserPayload(user);

  const newAccessToken = await generateAccessToken(payload, expiresInMins);
  const newRefreshToken = await generateRefreshToken(payload);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
