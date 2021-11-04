const APIError = require('../utils/error');
const { verifyToken } = require('../utils/jwt');
const { dataInMemory: frozenData } = require('../utils/util');

const authUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization');
    if (!token) throw new APIError('Authentication Problem', 403);

    const decoded = await verifyToken(token);
    const user = findUserWithUsernameAndId({ ...decoded });

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

const findUserWithUsernameAndId = ({ username, id }) => {
  const user = frozenData.users.find(u => {
    const validUsername = u.username.toLowerCase() === username.toLowerCase();
    const validId = id.toString() === u.id.toString();

    return validUsername && validId;
  });

  return user;
};
