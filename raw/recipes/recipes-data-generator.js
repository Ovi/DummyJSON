const fs = require('node:fs');
const { getRandomFromArray: fromArr, getRandomNumberBetween } = require('../utils');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/recipes/recipes.json', 'utf8');
    const json = JSON.parse(data);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = json.map((item, idx) => ({
      id: idx + 1,
      name: item.name,
      ingredients: item.ingredients,
      instructions: item.instructions,
      prepTimeMinutes: item.prepTimeMinutes,
      cookTimeMinutes: item.cookTimeMinutes,
      servings: item.servings,
      difficulty: item.difficulty,
      cuisine: item.cuisine,
      caloriesPerServing: item.caloriesPerServing,
      tags: item.tags,
      userId: fromArr(users).id,
      image: item.image,
      rating: item.rating,
      reviewCount: getRandomNumberBetween(0, 100),
      mealType: item.mealType,
    }));

    fs.writeFileSync('./database/recipes.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();
