/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: Cart management and shopping cart operations
 */

const router = require('express').Router();
const {
  getAllCarts,
  getCartsByUserId,
  getCartById,
  addNewCart,
  updateCartById,
  deleteCartById,
} = require('../controllers/cart');

/**
 * @openapi
 * /carts:
 *   get:
 *     summary: Get all carts
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of carts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of carts to skip
 *     responses:
 *       200:
 *         description: List of carts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartsResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllCarts({ ...req._options }));
});

/**
 * @openapi
 * /carts/user/{userId}:
 *   get:
 *     summary: Get carts by user ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of carts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of carts to skip
 *     responses:
 *       200:
 *         description: List of carts for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CartsResponse'
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit, skip } = req._options;

  res.send(getCartsByUserId({ userId, limit, skip }));
});

/**
 * @openapi
 * /carts/{id}:
 *   get:
 *     summary: Get a single cart by ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: Cart object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCartResponse'
 *       404:
 *         description: Cart not found
 */
router.get('/:id', (req, res) => {
  res.send(getCartById({ ...req.params }));
});

/**
 * @openapi
 * /carts/add:
 *   post:
 *     summary: Add a new cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddCartRequest'
 *     responses:
 *       201:
 *         description: New cart created (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCartResponse'
 *       400:
 *         description: Invalid input
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewCart({ ...req.body }));
});

/**
 * @openapi
 * /carts/{id}:
 *   put:
 *     summary: Update a cart by ID (replace)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartRequest'
 *     responses:
 *       200:
 *         description: Updated cart (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCartResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Cart not found
 *   patch:
 *     summary: Update a cart by ID (partial)
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCartRequest'
 *     responses:
 *       200:
 *         description: Updated cart (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleCartResponse'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Cart not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCartById({ id, ...req.body }));
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCartById({ id, ...req.body }));
});

/**
 * @openapi
 * /carts/{id}:
 *   delete:
 *     summary: Delete a cart by ID
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Cart ID
 *     responses:
 *       200:
 *         description: Deleted cart (simulated)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedCartResponse'
 *       404:
 *         description: Cart not found
 */
router.delete('/:id', (req, res) => {
  res.send(deleteCartById({ ...req.params }));
});

module.exports = router;
