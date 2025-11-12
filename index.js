import os from 'node:os';
import cluster from 'node:cluster';
import { createRequire } from 'node:module';
import { connectDB } from './src/db/mongoose.js';
import { log, logError } from './src/helpers/logger.js';
import { handleClusterExit, handleClusterMessage, logCounts } from './src/utils/cluster.js';
import { validateEnvVar, isDev } from './src/utils/util.js';
import { setupCRONJobs } from './src/utils/cron-jobs.js';

const require = createRequire(import.meta.url);
const { version } = require('./package.json');

const { PORT = 8888, NUM_WORKERS = 4 } = process.env;

const numCPUs = os.cpus().length;
const maxWorkers = Math.min(NUM_WORKERS, numCPUs);

async function setupMasterProcess() {
  try {
    validateEnvVar();

    await connectDB();

    setupCRONJobs();

    logCounts();

    log(`[Master] ${process.pid} running with ${maxWorkers}/${numCPUs} workers`);
    log(`[Master][${isDev ? 'dev' : 'prod'}] App v${version} running at http://localhost:${PORT}`);

    forkWorkers(maxWorkers);
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
  await import('./worker.js');

  process.on('uncaughtException', err => {
    logError(`[Worker] Error in worker ${process.pid}: ${err.message}`, { error: err.stack });

    // Send the full stack trace to the master process
    process.send({ type: 'error', error: err.stack });

    // After handling the error, let it die naturally
    process.exit(1);
  });
}
