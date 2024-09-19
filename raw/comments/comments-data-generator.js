const fs = require('node:fs');
const { getRandomFromArray: fromArr, getRandomNumberBetween } = require('../utils');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/comments/comments.json', 'utf8');
    const json = JSON.parse(data);

    const postsData = fs.readFileSync('./database/posts.json', 'utf8');
    const posts = JSON.parse(postsData);

    const usersData = fs.readFileSync('./database/users.json', 'utf8');
    const users = JSON.parse(usersData);

    const newData = json.map((item, idx) => {
      const postId = fromArr(posts).id;
      const user = fromArr(users);

      return {
        id: idx + 1,
        body: item,
        postId,
        likes: getRandomNumberBetween(0, 10),
        user: {
          id: user.id,
          username: user.username,
          fullName: `${user.firstName} ${user.lastName}`,
        },
      };
    });

    fs.writeFileSync('./database/comments.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();
