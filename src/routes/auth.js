const router = require('express').Router();
const { loginByUsernamePassword } = require('../controllers/auth');
const { generateToken, getUserDataForToken } = require('../utils/jwt');
const authUser = require('../middleware/auth');
const APIError = require('../utils/error');
const { isNumber } = require('../utils/util');

const maxTokenExpireTime = 60 * 24 * 30; // 30 days

// login user
router.post('/login', async (req, res, next) => {
  try {
    const { username = '', password = '' } = req.body;
    let { expiresInMins = 60 } = req.body;

    if (!isNumber(expiresInMins)) expiresInMins = 60;

    // if asking for more than maxTokenExpireTime, deny!
    if (expiresInMins > maxTokenExpireTime) {
      throw new APIError(
        `maximum token expire time can be ${maxTokenExpireTime} minutes`,
      );
    }

    const payload = await loginByUsernamePassword({
      username,
      password,
      expiresInMins,
    });

    res.send(payload);
  } catch (error) {
    next(error);
  }
});

router.get('/me', authUser, (req, res) => {
  res.send(req.user);
});

// refresh user with new expire time
router.post('/refresh', authUser, async (req, res) => {
  let { expiresInMins = 60 } = req.body;

  if (!isNumber(expiresInMins)) expiresInMins = 60;

  const payload = getUserDataForToken(req.user);

  try {
    const token = await generateToken(payload, expiresInMins);
    res.send({ ...payload, token });
  } catch (err) {
    throw new APIError(err.message, 400);
  }
});

module.exports = router;
