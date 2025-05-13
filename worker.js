const http = require('http');
const express = require('express');
const connectDB = require('./src/db/mongoose');
const injectMiddleWares = require('./src/middleware');
const errorMiddleware = require('./src/middleware/error');
const authUser = require('./src/middleware/auth');
const routes = require('./src/routes');
const { loadDataInMemory } = require('./src/utils/util');
const { log, logError } = require('./src/helpers/logger');

const { PORT = 8888 } = process.env;

// 25MB max total payload
const MAX_TOTAL_PAYLOAD = 25 * 1024 * 1024;

const lastRequestData = {
  path: '',
  method: '',
  body: {},
  query: {},
  params: {},
  headers: {},
  ip: '',
};

const app = express();
const server = http.createServer();

// 🔁 Handle Expect: 100-continue safely
server.on('checkContinue', (req, res) => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);

  if (contentLength > MAX_TOTAL_PAYLOAD) {
    logError('[Rejected] Payload too large in Expect: 100-continue request', {
      path: req.url,
      ip: req.socket.remoteAddress,
      headers: req.headers,
    });

    res.writeHead(413, { 'Content-Type': 'text/plain' });
    return res.end('Payload Too Large');
  }

  res.writeContinue();
  app(req, res);
});

// 🔁 Handle standard requests
server.on('request', app);

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
  app.use('/public', express.static('public'));

  // on every POST request, save the request data
  app.use((req, res, next) => {
    // ! temporary disable saving request data for get requests
    if (['get', 'head'].includes(req.method.toLowerCase())) {
      next();
      return;
    }

    // ! temporary only save request data for multipart requests
    if ((req.headers['content-type'] || '').toLowerCase() !== 'multipart/form-data') {
      next();
      return;
    }

    lastRequestData.path = req.path;
    lastRequestData.method = req.method;
    lastRequestData.body = req.body;
    lastRequestData.query = req.query;
    lastRequestData.params = req.params;
    lastRequestData.headers = req.headers;
    lastRequestData.ip = req.ip;

    next();
  });

  // routes
  app.use('/', routes);

  // routes with authorization
  app.use('/auth/', authUser, routes);

  app.get('*', (req, res) => res.status(404).send());

  // use custom middleware for errors
  app.use(errorMiddleware);

  server.listen(PORT, () => log(`[Worker] ${process.pid} started on port ${PORT}`));
}

// 🚨 Handle uncaught errors per worker
process.on('uncaughtException', err => {
  logError(`[Worker] [Log] Error in worker ${process.pid}: ${err.message}`, {
    error: err.stack,
    lastRequestData,
  });
});
