import crypto from 'node:crypto';
import CustomResponse from '../models/custom-response.js';
import { generateRandomId } from './util.js';

export const generateUniqueIdentifier = async () => {
  let MAX_ATTEMPTS = 5;
  let identifier;
  let isUnique = false;

  while (!isUnique && MAX_ATTEMPTS > 0) {
    identifier = generateRandomId();
    // eslint-disable-next-line no-await-in-loop
    const existingRecord = await CustomResponse.findOne({ identifier });
    if (!existingRecord) isUnique = true;

    MAX_ATTEMPTS -= 1;
  }

  return identifier;
};

export const generateHash = (json, method) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(json) + method);
  return hash.digest('hex');
};
