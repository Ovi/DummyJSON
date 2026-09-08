import APIError from '../utils/error.js';
import { dataInMemory as frozenData } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get all recipes
export const getAllRecipes = _options => {
  return paginateResource(frozenData.recipes, 'recipes', _options);
};

// search recipes
export const searchRecipes = ({ q: searchQuery, ..._options }) => {
  const recipes = frozenData.recipes.filter(r => {
    return r.name.toLowerCase().includes(searchQuery);
  });

  return paginateResource(recipes, 'recipes', _options);
};

// get recipe by id
export const getRecipeById = ({ id, select }) => {
  return selectFields(findResourceById('recipes', id, 'Recipe'), select);
};

// get recipe tags
export const getRecipeTags = () => {
  const allTags = frozenData.recipes.map(r => r.tags);

  const uniqueTags = [...new Set(allTags.flat())];

  return uniqueTags;
};

// get recipes by tag
export const getRecipesByTag = ({ tag, ..._options }) => {
  if (!tag) {
    throw new APIError(`Tag is required`, 400);
  }

  const recipes = frozenData.recipes.filter(r => {
    return r.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  });

  return paginateResource(recipes, 'recipes', _options);
};

// get recipes by meal type
export const getRecipesByMealType = ({ mealType, ..._options }) => {
  if (!mealType) {
    throw new APIError(`Meal type is required`, 400);
  }

  const recipes = frozenData.recipes.filter(r => {
    return r.mealType.some(t => t.toLowerCase() === mealType.toLowerCase());
  });

  return paginateResource(recipes, 'recipes', _options);
};

export const addNewRecipe = ({ ...data }) => {
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
    id: nextId('recipes'),
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

export const updateRecipeById = ({ id, ...data }) => {
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

  const recipeFrozen = findResourceById('recipes', id, 'Recipe');

  const updatedRecipe = {
    id: +id, // converting id to number
    name: name ?? recipeFrozen.name,
    ingredients: ingredients ?? recipeFrozen.ingredients,
    instructions: instructions ?? recipeFrozen.instructions,
    prepTimeMinutes: prepTimeMinutes ?? recipeFrozen.prepTimeMinutes,
    cookTimeMinutes: cookTimeMinutes ?? recipeFrozen.cookTimeMinutes,
    servings: servings ?? recipeFrozen.servings,
    difficulty: difficulty ?? recipeFrozen.difficulty,
    cuisine: cuisine ?? recipeFrozen.cuisine,
    caloriesPerServing: caloriesPerServing ?? recipeFrozen.caloriesPerServing,
    tags: tags ?? recipeFrozen.tags,
    userId: userId ?? recipeFrozen.userId,
    image: image ?? recipeFrozen.image,
    rating: rating ?? recipeFrozen.rating,
    reviewCount: reviewCount ?? recipeFrozen.reviewCount,
    mealType: mealType ?? recipeFrozen.mealType,
  };

  return updatedRecipe;
};

export const deleteRecipeById = ({ id }) => {
  return markDeleted(findResourceById('recipes', id, 'Recipe'));
};
