const crypto = require('node:crypto');
const jdenticon = require('jdenticon');
const { isValidNumberInRange } = require('../utils/util');

const controller = {};

// generate icon
controller.generateIcon = ({ hash, size, type }) => {
  const h = crypto
    .createHash('sha256')
    .update(hash)
    .digest('hex');

  let s = size;

  if (!isValidNumberInRange(size, 1, 1000)) {
    s = '100';
  }

  const generatorFn = type === 'svg' ? jdenticon.toSvg : jdenticon.toPng;

  return generatorFn(h, parseInt(s, 10));
};

module.exports = controller;
