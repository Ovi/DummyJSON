// src/utils/process-handlers.js
import { log, logError, logWarn } from '../helpers/logger.js';
import { buildRequestMetaData } from '../middleware/error.js';
import { getCurrentRequest } from './request-context.js';
import { isTruncatedMultipartError } from './multipart-guard.js';
import { sendProcessErrorPushNotification } from './util.js';

export function registerFatalHandlers() {
  process.on('uncaughtException', err => {
    // A duplicate parser error can still surface after the response was sent.
    // It must not page or take the process down.
    if (isTruncatedMultipartError(err)) {
      logWarn('Ignored truncated multipart request', { error: err.message });
      return;
    }

    try {
      let requestData = null;

      try {
        const currentReq = getCurrentRequest();
        requestData = buildRequestMetaData(currentReq);
      } catch {
        // no request in flight
      }

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
      // logger itself may be broken here; console is the last resort
      // eslint-disable-next-line no-console
      console.error('Fatal error in uncaughtException handler:', handlerErr);
    } finally {
      setTimeout(() => {
        process.exit(1);
      }, 300).unref();
    }
  });

  process.on('unhandledRejection', reason => {
    if (isTruncatedMultipartError(reason)) {
      logWarn('Ignored truncated multipart request', { error: reason?.message || reason });
      return;
    }

    try {
      logError('Unhandled promise rejection', { reason });
      sendProcessErrorPushNotification(typeof reason === 'string' ? reason : JSON.stringify(reason));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Fatal error in unhandledRejection handler:', err);
    } finally {
      setTimeout(() => {
        process.exit(1);
      }, 300).unref();
    }
  });
}

// Accept dependencies so this module doesn’t import mongoose or index.js directly
export function registerShutdownHandlers({ disconnectDB, server }) {
  const shutdown = signal => async () => {
    log(`${signal} received: starting graceful shutdown...`, { pid: process.pid });

    try {
      // 1. Stop accepting new connections
      if (server) {
        await new Promise(resolve => {
          server.close(resolve);
        });
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
