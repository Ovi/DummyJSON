const APIError = require('../utils/error');
const { verifyAccessToken } = require('../utils/jwt');
const { findUserWithUsernameAndId } = require('../utils/util');

const authUser = async (req, res, next) => {
  try {
    const tokenFromHeader = req.header('Authorization');
    const tokenFromCookie = req.cookies.accessToken;

    // Prefer token from Authorization header if both are present
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) throw new APIError('Authentication Problem', 403);

    const decoded = await verifyAccessToken(token);
    const user = findUserWithUsernameAndId(decoded);

    if (!user) {
      throw new APIError(`Invalid token`, 400);
    }

    req.user = user;

    next();
  } catch (e) {
    next(e);
  }
};

module.exports = authUser;
