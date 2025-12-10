// src/utils/process-handlers.js
import { log, logError } from '../helpers/logger.js';
import { buildRequestMetaData } from '../middleware/error.js';
import { getCurrentRequest } from '../utils/request-context.js';
import { sendProcessErrorPushNotification } from '../utils/util.js';
import { server } from '../../index.js';

export function registerFatalHandlers() {
  process.on('uncaughtException', err => {
    try {
      let requestData = null;

      try {
        const currentReq = getCurrentRequest();
        requestData = buildRequestMetaData(currentReq);
      } catch {}

      logError(`Uncaught exception in process ${process.pid}: ${err.message}`, {
        error: err.stack,
        requestData,
      });

      try {
        sendProcessErrorPushNotification(err.stack || err.message, requestData);
      } catch (notifyErr) {
        logError('Failed to send process error push notification', {
          error: notifyErr.stack || notifyErr,
        });
      }
    } catch (handlerErr) {
      console.error('Fatal error in uncaughtException handler:', handlerErr);
    } finally {
      setTimeout(() => {
        process.exit(1);
      }, 300).unref();
    }
  });

  process.on('unhandledRejection', reason => {
    try {
      logError('Unhandled promise rejection', { reason });
      sendProcessErrorPushNotification(typeof reason === 'string' ? reason : JSON.stringify(reason));
    } catch (err) {
      console.error('Fatal error in unhandledRejection handler:', err);
    } finally {
      setTimeout(() => {
        process.exit(1);
      }, 300).unref();
    }
  });
}

// Accept dependencies so this module doesn’t import mongoose directly
export function registerShutdownHandlers({ disconnectDB }) {
  const shutdown = signal => async () => {
    log(`${signal} received: starting graceful shutdown...`, { pid: process.pid });

    try {
      // 1. Stop accepting new connections
      if (server) {
        await new Promise(resolve => server.close(resolve));
        log('HTTP server closed');
      }

      // 2. Close DB
      if (disconnectDB) {
        await disconnectDB();
        log('Mongoose connection closed');
      }

      log('Shutdown complete. Exiting.', { pid: process.pid });
      process.exit(0);
    } catch (error) {
      logError('Error during graceful shutdown', { error });
      process.exit(1);
    }
  };

  process.on('SIGINT', shutdown('SIGINT')); // Ctrl+C
  process.on('SIGTERM', shutdown('SIGTERM')); // kill / container stop
}
