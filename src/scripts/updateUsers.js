const path = require('node:path');
const fs = require('node:fs');

const usersFilePath = path.join(__dirname, '../', 'data', 'users.json');

fs.readFile(usersFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  // Parse the JSON data
  const users = JSON.parse(data);

  // Add a new field to each user (e.g., 'newField')
  const updatedUsers = users.map(user => {
    return {
      ...user,
      // newField: value, // eg: ↴
      // image: `https://robohash.org/${user.firstName}.png?set=set4`,
    };
  });

  // Write the updated users back to the file
  fs.writeFile(
    usersFilePath,
    JSON.stringify(updatedUsers, null, 2),
    'utf8',
    writeErr => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      } else {
        console.log('Users updated successfully.');
      }
    },
  );
});
