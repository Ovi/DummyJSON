// require node version>=14.0 to run the app,
// because we use optional chaining etc...
const express = require('express');

const { version } = require('./package.json');

const { PORT = 3000 } = process.env;

const app = express();

// routes
app.use('/', (req, res) => {
  res.send('Hello world!')
});

// start listening
app.listen(PORT, () => {
  console.info(`[Service:Node] App v${version} running on port ${PORT}`);
});
