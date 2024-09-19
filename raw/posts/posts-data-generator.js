const fs = require('node:fs');
const { getRandomFromArray: fromArr, getRandomNumberBetween } = require('../utils');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/posts/posts.json', 'utf8');
    const json = JSON.parse(data);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = json.map((item, idx) => {
      const userId = fromArr(users).id;
      const views = getRandomNumberBetween(0, 5000);
      let likes = getRandomNumberBetween(0, 1500);
      let dislikes = getRandomNumberBetween(0, 50);

      if (views < likes) likes = getRandomNumberBetween(0, views);
      if (likes < dislikes) dislikes = getRandomNumberBetween(0, likes);

      return {
        id: idx + 1,
        title: item.title,
        body: item.body,
        tags: item.tags,
        reactions: { likes, dislikes },
        views,
        userId,
      };
    });

    fs.writeFileSync('./database/posts.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();
