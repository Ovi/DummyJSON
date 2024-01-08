const path = require('node:path');
const fs = require('node:fs');

const jsonFilePath = path.join(__dirname, '../', 'data', 'file.json');

fs.readFile(jsonFilePath, 'utf8', (err, stringData) => {
  if (err) {
    console.error(`Error reading file: ${err}`);
    return;
  }

  const data = JSON.parse(stringData);

  const updatedData = data.map(item => {
    return {
      ...item,
      // newField: value
    };
  });

  fs.writeFile(
    jsonFilePath,
    JSON.stringify(updatedData, null, 2),
    'utf8',
    writeErr => {
      if (writeErr) {
        console.error(`Error writing file: ${writeErr}`);
      } else {
        console.log('File updated successfully.');
      }
    },
  );
});
