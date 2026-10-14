import { createRequire } from 'node:module';
import { logWarn } from '../helpers/logger.js';

// Busboy raises these when a client closes a multipart body early or sends a
// part that never finishes. They are client errors, not process failures.
const TRUNCATED_MULTIPART_ERRORS = ['Unexpected end of form', 'Malformed part header', 'Unexpected end of file'];

export function isTruncatedMultipartError(err) {
  const message = typeof err === 'string' ? err : err?.message;
  if (!message) return false;
  return TRUNCATED_MULTIPART_ERRORS.some(known => message.includes(known));
}

function ignoreLateMultipartError() {}

// Multer removes every busboy listener once parsing finishes. A truncated body
// often emits a second error after that, and Node treats an error event with
// no listeners as an uncaught exception. The first error is already delivered
// to multer's callback; keep one listener so the duplicate cannot crash the process.
function installMultipartParserGuard() {
  try {
    const require = createRequire(import.meta.url);
    // eslint-disable-next-line import/no-extraneous-dependencies
    const Multipart = require('busboy/lib/types/multipart.js');
    const { removeAllListeners } = Multipart.prototype;

    Multipart.prototype.removeAllListeners = function removeMultipartListeners(event) {
      const result = removeAllListeners.call(this, event);
      if (event === undefined || event === 'error') {
        this.on('error', ignoreLateMultipartError);
      }
      return result;
    };
  } catch (err) {
    logWarn('Could not install multipart parser guard', { error: err });
  }
}

installMultipartParserGuard();
