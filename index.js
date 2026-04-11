import express from 'express';
import { connectDB, disconnectDB } from './src/db/mongoose.js';
import injectMiddleWares from './src/middleware/index.js';
import errorMiddleware from './src/middleware/error.js';
import authUser from './src/middleware/auth.js';
import routes from './src/routes/index.js';
import { validateEnvVar, loadDataInMemory } from './src/utils/util.js';
import { setupCRONJobs } from './src/utils/cron-jobs.js';
import { registerFatalHandlers, registerShutdownHandlers } from './src/utils/fatal-handler.js';

const { PORT = 8888, NODE_ENV, GOOGLE_TAG_ID, BANNER_CONTENT } = process.env;

validateEnvVar();

const app = express();

injectMiddleWares(app);

await connectDB();

setupCRONJobs();

loadDataInMemory();

app.set('view engine', 'ejs');

// serving static files
app.use('/public', express.static('public'));

// routes
app.use('/', routes);

// routes with authorization
app.use('/auth/', authUser, routes);

app.get('*', (req, res) => {
  res.status(404).render('404', {
    googleTagId: GOOGLE_TAG_ID,
    bannerContent: BANNER_CONTENT,
  });
});

app.use(errorMiddleware);

// Keep a reference to server so we can close it on SIGINT/SIGTERM
export const server = app.listen(PORT, () => {
  console.log(`[${NODE_ENV}] App running at http://localhost:${PORT}`);
});

// Process-level handlers
registerFatalHandlers();
registerShutdownHandlers({ disconnectDB, server });
