/**
 * @openapi
 * tags:
 *   name: Products
 *   description: API endpoints for managing products
 */
const router = require('express').Router();
const {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductCategoryList,
  getProductCategories,
  getProductsByCategoryName,
  addNewProduct,
  updateProductById,
  deleteProductById,
} = require('../controllers/product');

/**
 * @openapi
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Maximum number of products to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to include in the response (comma separated)
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
 *           default: asc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *             example:
 *               products:
 *                 - id: 1
 *                   title: "Essence Mascara Lash Princess"
 *                   description: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula."
 *                   price: 9.99
 *                   discountPercentage: 7.17
 *                   rating: 4.94
 *                   stock: 5
 *                   brand: "Essence"
 *                   category: "beauty"
 *                   thumbnail: "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png"
 *                   images: ["https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/1.png"]
 *                 - id: 2
 *                   title: "Eyeshadow Palette with Mirror"
 *                   description: "The Eyeshadow Palette with Mirror offers a versatile range of eyeshadow shades for creating stunning eye looks. With a built-in mirror, it's convenient for on-the-go makeup application."
 *                   price: 19.99
 *                   discountPercentage: 5.5
 *                   rating: 3.28
 *                   stock: 44
 *                   brand: "Glamour Beauty"
 *                   category: "beauty"
 *                   thumbnail: "https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/thumbnail.png"
 *                   images: ["https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/1.png"]
 *               total: 100
 *               skip: 0
 *               limit: 30
 */
router.get('/', (req, res) => {
  res.send(getAllProducts({ ...req._options }));
});

/**
 * @openapi
 * /products/search:
 *   get:
 *     summary: Search for products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Maximum number of products to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *             example:
 *               products:
 *                 - id: 1
 *                   title: "Essence Mascara Lash Princess"
 *                   description: "The Essence Mascara Lash Princess is a popular mascara known for its volumizing and lengthening effects. Achieve dramatic lashes with this long-lasting and cruelty-free formula."
 *                   price: 9.99
 *                   discountPercentage: 7.17
 *                   rating: 4.94
 *                   stock: 5
 *                   brand: "Essence"
 *                   category: "beauty"
 *                   thumbnail: "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png"
 *               total: 1
 *               skip: 0
 *               limit: 1
 */
router.get('/search', (req, res) => {
  res.send(searchProducts({ ...req._options }));
});

/**
 * @openapi
 * /products/category-list:
 *   get:
 *     summary: Get product category list
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/category-list', (req, res) => {
  res.send(getProductCategoryList());
});

/**
 * @openapi
 * /products/categories:
 *   get:
 *     summary: Get product categories
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of product categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *             example: ["beauty", "fragrances", "furniture", "groceries", "home-decoration", "kitchen-accessories"]
 */
router.get('/categories', (req, res) => {
  res.send(getProductCategories());
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to include in the response (comma separated)
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SingleProductResponse'
 *             example:
 *               id: 6
 *               title: "Calvin Klein CK One"
 *               description: "CK One by Calvin Klein is a classic unisex fragrance, known for its fresh and clean scent. It's a versatile fragrance suitable for everyday wear."
 *               price: 49.99
 *               discountPercentage: 0.32
 *               rating: 4.85
 *               stock: 17
 *               brand: "Calvin Klein"
 *               category: "fragrances"
 *               thumbnail: "https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/thumbnail.png"
 *               images: ["https://cdn.dummyjson.com/products/images/fragrances/Calvin%20Klein%20CK%20One/3.png"]
 *               tags: ["perfumes"]
 *               sku: "DZM2JQZE"
 *               dimensions:
 *                 depth: 6.81
 *               warrantyInformation: "5 year warranty"
 *               shippingInformation: "Ships overnight"
 *               availabilityStatus: "In Stock"
 *               minimumOrderQuantity: 20
 *       404:
 *         description: Product not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getProductById({ id, select }));
});

/**
 * @openapi
 * /products/category/{categoryName}:
 *   get:
 *     summary: Get products by category name
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: Category name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Maximum number of products to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of products to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Fields to include in the response (comma separated)
 *     responses:
 *       200:
 *         description: A list of products by category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *             example:
 *               products:
 *                 - id: 1
 *                   title: "Essence Mascara Lash Princess"
 *                   price: 9.99
 *                   category: "beauty"
 *                   thumbnail: "https://cdn.dummyjson.com/products/images/beauty/Essence%20Mascara%20Lash%20Princess/thumbnail.png"
 *                 - id: 2
 *                   title: "Eyeshadow Palette with Mirror"
 *                   price: 19.99
 *                   category: "beauty"
 *                   thumbnail: "https://cdn.dummyjson.com/products/images/beauty/Eyeshadow%20Palette%20with%20Mirror/thumbnail.png"
 *               total: 5
 *               skip: 0
 *               limit: 30
 */
router.get('/category/:categoryName', (req, res) => {
  const { categoryName } = req.params;

  res.send(getProductsByCategoryName({ categoryName, ...req._options }));
});

/**
 * @openapi
 * /products/add:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddProductRequest'
 *           example:
 *             title: "New Beauty Product"
 *             description: "High quality beauty product with amazing results"
 *             price: 29.99
 *             discountPercentage: 5.0
 *             rating: 0
 *             stock: 50
 *             brand: "Beauty Co"
 *             category: "beauty"
 *             thumbnail: "https://cdn.dummyjson.com/products/images/beauty/NewProduct/thumbnail.png"
 *             images: ["https://cdn.dummyjson.com/products/images/beauty/NewProduct/1.png"]
 *     responses:
 *       201:
 *         description: The created product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewProduct({ ...req.body }));
});

/**
 * @openapi
 * /products/{id}:
 *   put:
 *     summary: Update product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *           example:
 *             title: "Updated Red Lipstick"
 *             price: 15.99
 *             stock: 75
 *             description: "Premium long-lasting red lipstick with moisturizing formula"
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateProductById({ id, ...req.body }));
});

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     summary: Partially update product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductRequest'
 *           example:
 *             stock: 25
 *             price: 11.99
 *     responses:
 *       200:
 *         description: The updated product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Product not found
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateProductById({ id, ...req.body }));
});

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: The deleted product
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *             example:
 *               id: 4
 *               title: "Red Lipstick"
 *               description: "The Red Lipstick is a classic and bold choice for adding a pop of color to your lips. With a creamy and pigmented formula, it provides a vibrant and long-lasting finish."
 *               price: 12.99
 *               discountPercentage: 19.03
 *               rating: 2.51
 *               stock: 68
 *               brand: "Chic Cosmetics"
 *               category: "beauty"
 *               isDeleted: true
 *               deletedOn: "2025-04-26T12:00:00.000Z"
 *       404:
 *         description: Product not found
 */
router.delete('/:id', (req, res) => {
  res.send(deleteProductById({ ...req.params }));
});

module.exports = router;
