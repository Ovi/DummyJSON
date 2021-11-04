const router = require('express').Router();
const {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductCategories,
  getProductsByCategoryName,
  addNewProduct,
  updateProductById,
  deleteProductById,
} = require('../controllers/product');

// get all products
router.get('/', (req, res) => {
  res.send(getAllProducts({ ...req._options }));
});

// search product
router.get('/search', (req, res) => {
  res.send(searchProducts({ ...req._options }));
});

// get product categories
router.get('/categories', (req, res) => {
  res.send(getProductCategories());
});

// get product by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getProductById({ id, select }));
});

// get products by categoryName
router.get('/category/:categoryName', (req, res) => {
  const { categoryName } = req.params;

  res.send(getProductsByCategoryName({ categoryName, ...req._options }));
});

// add new product
router.post('/add', (req, res) => {
  res.send(addNewProduct({ ...req.body }));
});

// update product by id (PUT)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateProductById({ id, ...req.body }));
});

// update product by id (PATCH)
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateProductById({ id, ...req.body }));
});

// delete product by id
router.delete('/:id', (req, res) => {
  res.send(deleteProductById({ ...req.params }));
});

module.exports = router;
