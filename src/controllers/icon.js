import crypto from 'node:crypto';
import { toSvg, toPng } from 'jdenticon';
import { isValidNumberInRange } from '../utils/util.js';

// generate icon
export const generateIcon = ({ hash, size, type }) => {
  const h = crypto
    .createHash('sha256')
    .update(hash)
    .digest('hex');

  let s = size;

  if (!isValidNumberInRange(size, 1, 1000)) {
    s = '100';
  }

  const generatorFn = type === 'svg' ? toSvg : toPng;

  return generatorFn(h, parseInt(s, 10));
};
