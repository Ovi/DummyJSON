const APIError = require('../utils/error');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const {
  dataInMemory: frozenData,
  getUserPayload,
  isValidNumberInRange,
  findUserWithUsernameAndId,
} = require('../utils/util');
const { thirtyDaysInMints: maxAccessTokenExpireTime } = require('../constants');

const controller = {};

// login user by username and password
controller.loginByUsernamePassword = async data => {
  const { username, password, expiresInMins = 60 } = data;

  if (!username || !password) {
    throw new APIError(`Username and password required`, 400);
  }

  if (expiresInMins && !isValidNumberInRange(expiresInMins, 1, maxAccessTokenExpireTime)) {
    throw new APIError(`Maximum access token expire time can be ${maxAccessTokenExpireTime} minutes`);
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
        maxAge: expiresInMins * 60 * 1000,
      },
    };
  } catch (err) {
    throw new APIError(err.message, 400);
  }
};

// get new refresh token
controller.getNewRefreshToken = async ({ refreshToken, expiresInMins }) => {
  if (!refreshToken) {
    throw new APIError(`Refresh token required`, 401);
  }

  if (expiresInMins && !isValidNumberInRange(expiresInMins, 1, maxAccessTokenExpireTime)) {
    throw new APIError(`Maximum access token expire time can be ${maxAccessTokenExpireTime} minutes`);
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

  const newAccessToken = await generateAccessToken(payload);
  const newRefreshToken = await generateRefreshToken(payload, maxAccessTokenExpireTime);

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

module.exports = controller;
