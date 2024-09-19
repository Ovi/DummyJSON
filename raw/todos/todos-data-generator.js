const fs = require('node:fs');
const { getRandomFromArray: fromArr } = require('../utils');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/todos/todos.json', 'utf8');
    const json = JSON.parse(data);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = json.map((item, idx) => ({
      id: idx + 1,
      todo: item,
      completed: Math.random() < 0.5,
      userId: fromArr(users).id,
    }));

    fs.writeFileSync('./database/todos.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();
