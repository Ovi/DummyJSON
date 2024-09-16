const APIError = require('../utils/error');
const { verifyAccessToken } = require('../utils/jwt');
const { findUserWithUsernameAndId } = require('../utils/util');

const authUser = async (req, res, next) => {
  try {
    const accessTokenFromHeader = req.header('Authorization');
    const accessTokenFromCookie = req.cookies.accessToken;

    // Prefer access token from Authorization header if both are present
    const accessToken = accessTokenFromHeader || accessTokenFromCookie;

    if (!accessToken) throw new APIError('Access Token is required', 401);

    const decoded = await verifyAccessToken(accessToken);
    const user = findUserWithUsernameAndId(decoded);

    if (!user) {
      throw new APIError('Invalid access token', 400);
    }

    req.user = user;

    next();
  } catch (e) {
    // If auth fails, clear the tokens from the cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    next(e);
  }
};

module.exports = authUser;
