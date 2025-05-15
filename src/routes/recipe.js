/**
 * @openapi
 * tags:
 *   name: Recipes
 *   description: API endpoints for managing recipes
 */

const router = require('express').Router();
const {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  getRecipeTags,
  getRecipesByTag,
  getRecipesByMealType,
  addNewRecipe,
  updateRecipeById,
  deleteRecipeById,
} = require('../controllers/recipes');

/**
 * @openapi
 * /recipes:
 *   get:
 *     summary: Get all recipes
 *     tags: [Recipes]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of recipes to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of recipes to skip
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
 *         description: List of recipes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipesResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllRecipes({ ...req._options }));
});

/**
 * @openapi
 * /recipes/search:
 *   get:
 *     summary: Search recipes
 *     tags: [Recipes]
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
 *         description: Maximum number of recipes to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of recipes to skip
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
 *         description: List of recipes matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipesResponse'
 */
router.get('/search', (req, res) => {
  res.send(searchRecipes({ ...req._options }));
});

/**
 * @openapi
 * /recipes/tags:
 *   get:
 *     summary: Get all recipe tags
 *     tags: [Recipes]
 *     responses:
 *       200:
 *         description: List of unique tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 */
router.get('/tags', (req, res) => {
  res.send(getRecipeTags());
});

/**
 * @openapi
 * /recipes/{id}:
 *   get:
 *     summary: Get a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *     responses:
 *       200:
 *         description: The recipe object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getRecipeById({ id, select }));
});

/**
 * @openapi
 * /recipes/tag/{tag}:
 *   get:
 *     summary: Get recipes by tag
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag to filter recipes by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of recipes to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of recipes to skip
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
 *         description: List of recipes with the given tag
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipesResponse'
 */
router.get('/tag/:tag', (req, res) => {
  const { tag } = req.params;

  res.send(getRecipesByTag({ tag, ...req._options }));
});

/**
 * @openapi
 * /recipes/meal-type/{mealType}:
 *   get:
 *     summary: Get recipes by meal type
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: mealType
 *         required: true
 *         schema:
 *           type: string
 *         description: Meal type to filter recipes by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of recipes to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of recipes to skip
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
 *         description: List of recipes for the given meal type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecipesResponse'
 */
router.get('/meal-type/:mealType', (req, res) => {
  const { mealType } = req.params;

  res.send(getRecipesByMealType({ mealType, ...req._options }));
});

/**
 * @openapi
 * /recipes/add:
 *   post:
 *     summary: Add a new recipe
 *     tags: [Recipes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddRecipeRequest'
 *     responses:
 *       201:
 *         description: The created recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewRecipe({ ...req.body }));
});

/**
 * @openapi
 * /recipes/{id}:
 *   put:
 *     summary: Update a recipe by ID (replace)
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecipeRequest'
 *     responses:
 *       200:
 *         description: The updated recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateRecipeById({ id, ...req.body }));
});

/**
 * @openapi
 * /recipes/{id}:
 *   patch:
 *     summary: Update a recipe by ID (partial)
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRecipeRequest'
 *     responses:
 *       200:
 *         description: The updated recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       404:
 *         description: Recipe not found
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateRecipeById({ id, ...req.body }));
});

/**
 * @openapi
 * /recipes/{id}:
 *   delete:
 *     summary: Delete a recipe by ID
 *     tags: [Recipes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The recipe ID
 *     responses:
 *       200:
 *         description: The deleted recipe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedRecipeResponse'
 *       404:
 *         description: Recipe not found
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  res.send(deleteRecipeById({ id }));
});

module.exports = router;
