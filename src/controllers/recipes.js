const APIError = require('../utils/error');
const {
  dataInMemory: frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  limitArray,
  sortArray,
} = require('../utils/util');

const controller = {};

// get all recipes
controller.getAllRecipes = _options => {
  const { limit, skip, select, sortBy, order } = _options;

  let { recipes } = frozenData;
  const total = recipes.length;

  recipes = sortArray(recipes, sortBy, order);

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
controller.searchRecipes = ({ q: searchQuery, ..._options }) => {
  const { limit, skip, select, sortBy, order } = _options;

  let recipes = frozenData.recipes.filter(r => {
    return r.name.toLowerCase().includes(searchQuery);
  });
  const total = recipes.length;

  recipes = sortArray(recipes, sortBy, order);

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
  const { limit, skip, select, sortBy, order } = _options;

  if (!tag) {
    throw new APIError(`Tag is required`, 400);
  }

  let recipes = frozenData.recipes.filter(r => {
    return r.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  });
  const total = recipes.length;

  recipes = sortArray(recipes, sortBy, order);

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
  const { limit, skip, select, sortBy, order } = _options;

  if (!mealType) {
    throw new APIError(`Meal type is required`, 400);
  }

  let recipes = frozenData.recipes.filter(r => {
    return r.mealType.some(t => t.toLowerCase() === mealType.toLowerCase());
  });
  const total = recipes.length;

  recipes = sortArray(recipes, sortBy, order);

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

controller.addNewRecipe = ({ ...data }) => {
  const {
    name,
    ingredients,
    instructions,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    difficulty,
    cuisine,
    caloriesPerServing,
    tags,
    userId,
    image,
    rating,
    reviewCount,
    mealType,
  } = data;

  const newRecipe = {
    id: frozenData.recipes.length + 1, // Assuming `frozenData.recipes` holds the recipe data
    name,
    ingredients,
    instructions,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    difficulty,
    cuisine,
    caloriesPerServing,
    tags,
    userId,
    image,
    rating,
    reviewCount,
    mealType,
  };

  return newRecipe;
};

controller.updateRecipeById = ({ id, ...data }) => {
  const {
    name,
    ingredients,
    instructions,
    prepTimeMinutes,
    cookTimeMinutes,
    servings,
    difficulty,
    cuisine,
    caloriesPerServing,
    tags,
    userId,
    image,
    rating,
    reviewCount,
    mealType,
  } = data;

  const recipeFrozen = frozenData.recipes.find(r => r.id.toString() === id);

  if (!recipeFrozen) {
    throw new APIError(`Recipe with id '${id}' not found`, 404);
  }

  const updatedRecipe = {
    id: +id, // converting id to number
    name: name || recipeFrozen.name,
    ingredients: ingredients || recipeFrozen.ingredients,
    instructions: instructions || recipeFrozen.instructions,
    prepTimeMinutes: prepTimeMinutes || recipeFrozen.prepTimeMinutes,
    cookTimeMinutes: cookTimeMinutes || recipeFrozen.cookTimeMinutes,
    servings: servings || recipeFrozen.servings,
    difficulty: difficulty || recipeFrozen.difficulty,
    cuisine: cuisine || recipeFrozen.cuisine,
    caloriesPerServing: caloriesPerServing || recipeFrozen.caloriesPerServing,
    tags: tags || recipeFrozen.tags,
    userId: userId || recipeFrozen.userId,
    image: image || recipeFrozen.image,
    rating: rating || recipeFrozen.rating,
    reviewCount: reviewCount || recipeFrozen.reviewCount,
    mealType: mealType || recipeFrozen.mealType,
  };

  return updatedRecipe;
};

controller.deleteRecipeById = ({ id }) => {
  const recipeFrozen = frozenData.recipes.find(p => p.id.toString() === id);

  if (!recipeFrozen) {
    throw new APIError(`Recipe with id '${id}' not found`, 404);
  }

  return {
    ...recipeFrozen,
    isDeleted: true,
    deletedOn: new Date().toISOString(),
  };
};

module.exports = controller;
