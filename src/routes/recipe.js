const router = require('express').Router();
const {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  getRecipeTags,
  getRecipesByTag,
  getRecipesByMealType,
} = require('../controllers/recipes');

// get all recipes
router.get('/', (req, res) => {
  res.send(getAllRecipes({ ...req._options }));
});

// search recipe
router.get('/search', (req, res) => {
  res.send(searchRecipes({ ...req._options }));
});

// get recipe tags
router.get('/tags', (req, res) => {
  res.send(getRecipeTags());
});

// get recipe by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const { select } = req._options;

  res.send(getRecipeById({ id, select }));
});

// get recipes by tag
router.get('/tag/:tag', (req, res) => {
  const { tag } = req.params;

  res.send(getRecipesByTag({ tag, ...req._options }));
});

// get recipes by meal type
router.get('/meal-type/:mealType', (req, res) => {
  const { mealType } = req.params;

  res.send(getRecipesByMealType({ mealType, ...req._options }));
});

module.exports = router;
