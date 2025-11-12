import { Router } from 'express';
import {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  getRecipeTags,
  getRecipesByTag,
  getRecipesByMealType,
  addNewRecipe,
  updateRecipeById,
  deleteRecipeById,
} from '../controllers/recipes.js';

const router = Router();

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

router.post('/add', (req, res) => {
  res.send(addNewRecipe({ ...req.body }));
});

router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateRecipeById({ id, ...req.body }));
});

router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateRecipeById({ id, ...req.body }));
});

router.delete('/:id', (req, res) => {
  const { id } = req.params;

  res.send(deleteRecipeById({ id }));
});

export default router;
