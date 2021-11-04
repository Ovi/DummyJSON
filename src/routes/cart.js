const router = require('express').Router();
const {
  getAllCarts,
  getCartsByUserId,
  getCartById,
  addNewCart,
  updateCartById,
  deleteCartById,
} = require('../controllers/cart');

// get all carts
router.get('/', (req, res) => {
  res.send(getAllCarts({ ...req._options }));
});

// get cart by user
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit, skip } = req._options;

  res.send(getCartsByUserId({ userId, limit, skip }));
});

// get cart by id
router.get('/:id', (req, res) => {
  res.send(getCartById({ ...req.params }));
});

// add new cart
router.post('/add', (req, res) => {
  res.send(addNewCart({ ...req.body }));
});

// update cart by id (PUT)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCartById({ id, ...req.body }));
});

// update cart by id (PATCH)
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateCartById({ id, ...req.body }));
});

// delete cart
router.delete('/:id', (req, res) => {
  res.send(deleteCartById({ ...req.params }));
});

module.exports = router;
