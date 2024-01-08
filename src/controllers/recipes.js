const APIError = require('../utils/error');
const {
  dataInMemory: frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  limitArray,
} = require('../utils/util');

const controller = {};

// get all recipes
controller.getAllRecipes = ({ limit, skip, select }) => {
  let [...recipes] = frozenData.recipes;
  const total = recipes.length;

  if (skip > 0) {
    recipes = recipes.slice(skip);
  }

  recipes = limitArray(recipes, limit);

  if (select) {
    recipes = getMultiObjectSubset(recipes, select);
  }

  const result = { recipes, total, skip, limit: recipes.length };

  return result;
};

// search recipes
controller.searchRecipes = ({ limit, skip, select, q: searchQuery }) => {
  let [...recipes] = frozenData.recipes.filter(r => {
    return r.name.toLowerCase().includes(searchQuery);
  });
  const total = recipes.length;

  if (skip > 0) {
    recipes = recipes.slice(skip);
  }

  recipes = limitArray(recipes, limit);

  if (select) {
    recipes = getMultiObjectSubset(recipes, select);
  }

  const result = { recipes, total, skip, limit: recipes.length };

  return result;
};

// get recipe by id
controller.getRecipeById = ({ id, select }) => {
  const recipeFrozen = frozenData.recipes.find(r => r.id.toString() === id);

  if (!recipeFrozen) {
    throw new APIError(`Recipe with id '${id}' not found`, 404);
  }

  let { ...recipe } = recipeFrozen;

  if (select) {
    recipe = getObjectSubset(recipe, select);
  }

  return recipe;
};

// get recipe tags
controller.getRecipeTags = () => {
  const allTags = frozenData.recipes.map(r => r.tags);

  const uniqueTags = [...new Set(allTags.flat())];

  return uniqueTags;
};

// get recipes by tag
controller.getRecipesByTag = ({ tag, ..._options }) => {
  const { limit, skip, select } = _options;

  if (!tag) {
    throw new APIError(`Tag is required`, 400);
  }

  let recipes = frozenData.recipes.filter(r => {
    return r.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  });

  const total = recipes.length;

  if (skip > 0) {
    recipes = recipes.slice(skip);
  }

  recipes = limitArray(recipes, limit);

  if (select) {
    recipes = getMultiObjectSubset(recipes, select);
  }

  const result = { recipes, total, skip, limit: recipes.length };

  return result;
};

// get recipes by meal type
controller.getRecipesByMealType = ({ mealType, ..._options }) => {
  const { limit, skip, select } = _options;

  if (!mealType) {
    throw new APIError(`Meal type is required`, 400);
  }

  let recipes = frozenData.recipes.filter(r => {
    return r.mealType.some(t => t.toLowerCase() === mealType.toLowerCase());
  });

  const total = recipes.length;

  if (skip > 0) {
    recipes = recipes.slice(skip);
  }

  recipes = limitArray(recipes, limit);

  if (select) {
    recipes = getMultiObjectSubset(recipes, select);
  }

  const result = { recipes, total, skip, limit: recipes.length };

  return result;
};

module.exports = controller;
