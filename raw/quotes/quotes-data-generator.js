const fs = require('node:fs');

function generateData() {
  try {
    const data = fs.readFileSync('./raw/quotes/quotes.json', 'utf8');
    const json = JSON.parse(data);

    const newData = json.map((item, idx) => ({
      id: idx + 1,
      ...item,
    }));

    fs.writeFileSync('./database/quotes.json', JSON.stringify(newData, null, 2), 'utf8');
    console.log('Data Generated Successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

generateData();
