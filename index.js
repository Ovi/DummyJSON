const os = require('node:os');
const cluster = require('node:cluster');
const connectDB = require('./src/db/mongoose');
const { log, logError } = require('./src/helpers/logger');
const { handleClusterExit, handleClusterMessage, logCounts } = require('./src/utils/cluster');
const { validateEnvVar } = require('./src/utils/util');
const { setupCRONJobs } = require('./src/utils/cron-jobs');
const { version } = require('./package.json');

const { PORT = 8888, NODE_ENV } = process.env;

const numCPUs = os.cpus().length;

async function setupMasterProcess() {
  try {
    validateEnvVar();

    await connectDB();

    setupCRONJobs();

    logCounts();

    log(`[Master] ${process.pid} running with 4/${numCPUs} workers`);
    log(`[Master][${NODE_ENV}] App v${version} running at http://localhost:${PORT}`);

    forkWorkers(4);
  } catch (error) {
    logError(`[Master] Critical error: ${error.message}`, { error: error.stack });
    process.exit(1);
  }
}

function forkWorkers(numWorkers) {
  for (let i = 0; i < numWorkers; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => handleClusterExit(worker, code, signal));
  cluster.on('message', (worker, message) => handleClusterMessage(worker, message));
}

// Main execution block
if (cluster.isMaster) {
  setupMasterProcess();
} else {
  require('./worker');

  process.on('uncaughtException', err => {
    logError(`[Worker] Error in worker ${process.pid}: ${err.message}`, { error: err.stack });

    // Send the full stack trace to the master process
    process.send({ type: 'error', error: err.stack });

    // After handling the error, let it die naturally
    process.exit(1);
  });
}
