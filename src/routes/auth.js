const router = require('express').Router();
const { loginByUsernamePassword, getNewRefreshToken } = require('../controllers/auth');
const authUser = require('../middleware/auth');

// login user
router.post('/login', async (req, res, next) => {
  try {
    const payload = await loginByUsernamePassword(req.body);
    const { accessToken, refreshToken, cookieData, ...payloadData } = payload;

    res.cookie('accessToken', accessToken, cookieData);
    res.cookie('refreshToken', refreshToken, cookieData);

    res.send({ accessToken, refreshToken, ...payloadData });
  } catch (error) {
    next(error);
  }
});

// logout user
router.post('/logout', (req, res) => {
  res.clearCookie('auth', {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

// get current authenticated user
router.get('/me', authUser, (req, res) => {
  res.send(req.user);
});

// get new refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { expiresInMins = 60 } = req.body;

    // Get refreshToken from body or cookies
    let { refreshToken } = req.body;
    if (!refreshToken) {
      refreshToken = req.cookies.refreshToken;
    }

    const tokens = await getNewRefreshToken({ refreshToken, expiresInMins });

    const { accessToken, refreshToken: newRefreshToken } = tokens;

    const cookieData = {
      httpOnly: true,
      secure: true,
      maxAge: expiresInMins * 60 * 1000,
    };

    // Set new tokens in cookies
    res.cookie('accessToken', accessToken, cookieData);
    res.cookie('refreshToken', newRefreshToken, cookieData);

    res.send({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
