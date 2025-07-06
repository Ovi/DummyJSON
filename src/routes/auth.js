/**
 * @openapi
 * tags:
 *   name: Auth
 *   description: API endpoints for authentication and authorization
 */

const router = require('express').Router();
const { loginByUsernamePassword, getNewRefreshToken } = require('../controllers/auth');
const authUser = require('../middleware/auth');

/**
 * @openapi
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           description: Username for authentication
 *           example: "emilys"
 *         password:
 *           type: string
 *           description: Password for authentication
 *           example: "0lelplR"
 *         expiresInMins:
 *           type: integer
 *           description: Token expiration time in minutes
 *           default: 60
 *           example: 60
 *       required:
 *         - username
 *         - password
 *
 *     RefreshTokenRequest:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: Refresh token obtained from login or previous token refresh
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         expiresInMins:
 *           type: integer
 *           description: Token expiration time in minutes
 *           default: 60
 *           example: 60
 *       required:
 *         - refreshToken
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 15
 *         username:
 *           type: string
 *           description: Username of authenticated user
 *           example: "kminchelle"
 *         email:
 *           type: string
 *           description: Email of authenticated user
 *           example: "emily.johnson@x.dummyjson.com"
 *         firstName:
 *           type: string
 *           description: First name of user
 *           example: "Jeanne"
 *         lastName:
 *           type: string
 *           description: Last name of user
 *           example: "Halvorson"
 *         gender:
 *           type: string
 *           description: Gender of user
 *           example: "female"
 *         image:
 *           type: string
 *           description: Profile image URL
 *           example: "https://robohash.org/autquiaut.png"
 *         token:
 *           type: string
 *           description: JWT Access Token
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or missing required fields
 */
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

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Log out user by clearing auth cookies
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Successfully logged out
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 */
router.post('/logout', (req, res) => {
  res.clearCookie('auth', {
    httpOnly: true,
    secure: true,
  });

  res.status(200).json({ message: 'Logged out successfully' });
});

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAuth'
 *       401:
 *         description: Unauthorized - Access token is missing or invalid
 */
router.get('/me', authUser, (req, res) => {
  res.send(req.user);
});

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: New access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Refresh token required
 *       403:
 *         description: Invalid or expired refresh token
 */
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
