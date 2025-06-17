/**
 * @openapi
 * tags:
 *   name: Users
 *   description: API endpoints for managing users
 */

const router = require('express').Router();
const { getCartsByUserId } = require('../controllers/cart');
const { getPostsByUserId } = require('../controllers/post');
const { getTodosByUserId } = require('../controllers/todo');
const {
  getAllUsers,
  getUserById,
  searchUsers,
  addNewUser,
  updateUserById,
  deleteUserById,
  filterUsers,
} = require('../controllers/user');
const authUser = require('../middleware/auth');
const { verifyUserHandler } = require('../helpers');
const { loginByUsernamePassword } = require('../controllers/auth');

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of users to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of users to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllUsers({ ...req._options }));
});

/**
 * @openapi
 * /users/login:
 *   post:
 *     summary: Login user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: kminchelle
 *               password:
 *                 type: string
 *                 example: 0lelplR
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLoginResponse'
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
 * /users/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.get('/me', authUser, (req, res) => {
  res.send(req.user);
});

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Search users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersResponse'
 */
router.get('/search', (req, res) => {
  res.send(searchUsers({ ...req._options }));
});

/**
 * @openapi
 * /users/filter:
 *   get:
 *     summary: Filter users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *         description: Field to filter by (e.g. gender)
 *       - in: query
 *         name: value
 *         schema:
 *           type: string
 *         required: true
 *         description: Value to filter by (e.g. male)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Filtered users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UsersResponse'
 */
router.get('/filter', (req, res) => {
  res.send(filterUsers({ ...req._options }));
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *     responses:
 *       200:
 *         description: The user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getUserById({ id, select }));
});

/**
 * @openapi
 * /users/{userId}/carts:
 *   get:
 *     summary: Get carts by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of carts for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartsResponse'
 */
router.get('/:userId/carts', (req, res) => {
  const { userId } = req.params;
  const { limit, skip } = req._options;

  verifyUserHandler(userId);

  res.send(getCartsByUserId({ userId, limit, skip }));
});

/**
 * @openapi
 * /users/{userId}/posts:
 *   get:
 *     summary: Get posts by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostsResponse'
 */
router.get('/:userId/posts', (req, res) => {
  const { userId } = req.params;
  const { limit, skip, select } = req._options;

  verifyUserHandler(userId);

  res.send(getPostsByUserId({ userId, limit, skip, select }));
});

// get products by userId
// * products are independent from users

/**
 * @openapi
 * /users/{userId}/todos:
 *   get:
 *     summary: Get todos by user ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of todos for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodosResponse'
 */
router.get('/:userId/todos', (req, res) => {
  const { userId } = req.params;
  const { limit, skip, select } = req._options;

  verifyUserHandler(userId);

  res.send(getTodosByUserId({ userId, limit, skip, select }));
});

/**
 * @openapi
 * /users/add:
 *   post:
 *     summary: Add a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddUserRequest'
 *     responses:
 *       201:
 *         description: The created user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewUser({ ...req.body }));
});

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     summary: Update a user by ID (replace)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateUserById({ id, ...req.body }));
});

/**
 * @openapi
 * /users/{id}:
 *   patch:
 *     summary: Update a user by ID (partial)
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateUserById({ id, ...req.body }));
});

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: The deleted user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedUserResponse'
 *       404:
 *         description: User not found
 */
router.delete('/:id', (req, res) => {
  res.send(deleteUserById({ ...req.params }));
});

module.exports = router;
