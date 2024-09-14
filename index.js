const os = require('node:os');
const cluster = require('node:cluster');
const { validateEnvVar } = require('./src/utils/util');
const { setupCRONJobs } = require('./src/utils/cron-jobs');
const { handleClusterExit, handleClusterMessage, logCounts } = require('./src/utils/cluster');
const { version } = require('./package.json');

const { PORT = 8888, NODE_ENV } = process.env;

const numCPUs = os.cpus().length;

async function setupMasterProcess() {
  try {
    validateEnvVar();

    setupCRONJobs();

    logCounts();

    console.info(`[Master] ${process.pid} running with 4/${numCPUs} workers`);
    console.info(`[Master][${NODE_ENV}] App v${version} running at http://localhost:${PORT}`);

    forkWorkers(4);
  } catch (error) {
    console.error(`[Master] Critical error: ${error.message}`);
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
    console.error(`[Worker] Error in worker ${process.pid}:`, err);

    // Send the full stack trace to the master process
    process.send({ type: 'error', error: err.stack });

    // After handling the error, let it die naturally
    process.exit(1);
  });
}
