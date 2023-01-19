// require node version>=14.0 to run the app,
// because we use optional chaining etc...
const express = require('express');
const injectMiddleWares = require('./src/middleware');
const errorMiddleware = require('./src/middleware/error');
const authUser = require('./src/middleware/auth');
const routes = require('./src/routes');
const { validateEnvVar, loadDataInMemory } = require('./src/utils/util');
const { version } = require('./package.json');

const { PORT = 3123, NODE_ENV } = process.env;

// validate if we have all the env variables setup.
validateEnvVar();

const app = express();

// load all data in memory
loadDataInMemory();

// set up all middleware
injectMiddleWares(app);

// set ejs as view engine
app.set('view engine', 'ejs');

// serving static files
app.use('/static', express.static('./public'));

// serving internal (products) images
app.use('/image/i', (req, res) => {
  res.redirect(`https://i.dummyjson.com/data${req.path}`);
});

// routes
app.use('/', routes);

// routes with authorization
app.use('/auth/', authUser, routes);

app.get('*', (req, res) => {
  res.status(404).send('not found!');
});

// use custom middleware for errors
app.use(errorMiddleware);

// start listening
app.listen(PORT, () => {
  console.info(
    `[Node][${NODE_ENV}] App v${version} running at: http://localhost:${PORT}`,
  );
});
