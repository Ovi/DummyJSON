import express from 'express';
import { connectDB, disconnectDB } from './src/db/mongoose.js';
import injectMiddleWares from './src/middleware/index.js';
import errorMiddleware from './src/middleware/error.js';
import authUser from './src/middleware/auth.js';
import routes from './src/routes/index.js';
import { loadDataInMemory } from './src/utils/util.js';
import { log, logError } from './src/helpers/logger.js';

const { PORT = 8888 } = process.env;

const app = express();

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

// routes
app.use('/', routes);

// routes with authorization
app.use('/auth/', authUser, routes);

app.get('*', (req, res) => res.status(404).send());

// use custom middleware for errors
app.use(errorMiddleware);

app.listen(PORT, () => log(`[Worker] ${process.pid} started`));
