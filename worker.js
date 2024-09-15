const express = require('express');
const connectDB = require('./src/db/mongoose');
const injectMiddleWares = require('./src/middleware');
const errorMiddleware = require('./src/middleware/error');
const authUser = require('./src/middleware/auth');
const routes = require('./src/routes');
const { loadDataInMemory, isDev, redirectFn } = require('./src/utils/util');
const { log } = require('./src/helpers/logger');

const { PORT = 8888 } = process.env;

const app = express();

setupApp();

async function setupApp() {
  // use database to store logs and custom responses
  await connectDB();

  // load all data in memory
  loadDataInMemory();

  // set up all middleware
  injectMiddleWares(app);

  // set ejs as view engine
  app.set('view engine', 'ejs');

  // serving static files
  app.use('/public', isDev ? express.static('public') : redirectFn);

  // routes
  app.use('/', routes);

  // routes with authorization
  app.use('/auth/', authUser, routes);

  app.get('*', (req, res) => {
    res.status(404).send();
  });

  // use custom middleware for errors
  app.use(errorMiddleware);

  app.listen(PORT, () => log(`[Worker] ${process.pid} started`));
}
