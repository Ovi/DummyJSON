const router = require('express').Router();
const { loginByUsernamePassword } = require('../controllers/auth');
const APIError = require('../utils/error');
const { isNumber } = require('../utils/util');

const maxTokenExpireTime = 60 * 24; // 1 day

// login user
router.post('/login', async (req, res, next) => {
  try {
    const { username = '', password = '' } = req.body;
    let { expiresInMins = 60 } = req.body;

    if (!isNumber(expiresInMins)) expiresInMins = 60;

    // if asking for more than 1 day of token expiry, deny!
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

module.exports = router;
