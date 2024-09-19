const crypto = require('node:crypto');
const CustomResponse = require('../models/custom-response');
const { generateRandomId } = require('./util');

const util = {};

util.generateUniqueIdentifier = async () => {
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

util.generateHash = (json, method) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(json) + method);
  return hash.digest('hex');
};

module.exports = util;
