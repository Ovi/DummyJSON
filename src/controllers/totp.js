import { generateSync, createGuardrails } from 'otplib';
import APIError from '../utils/error.js';

const guardrails = createGuardrails({ MIN_SECRET_BYTES: 1 });
const period = 30;

const BASE32_REGEX = /^[A-Z2-7]+=*$/;

function normalizeSecret(key) {
  if (!key || typeof key !== 'string') return '';

  let secret = key.trim();

  if (secret.toLowerCase().startsWith('otpauth://')) {
    try {
      const url = new URL(secret);
      secret = url.searchParams.get('secret') || '';
    } catch {
      return '';
    }
  }

  return secret.replace(/[\s-]/g, '').toUpperCase();
}

function isValidSecret(secret) {
  return secret.length >= 4 && BASE32_REGEX.test(secret);
}

export const generateTotp = ({ key }) => {
  const secret = normalizeSecret(key);

  if (!secret) {
    throw new APIError('Secret key is required', 400);
  }

  if (!isValidSecret(secret)) {
    throw new APIError('Invalid secret key', 400);
  }

  let totp;

  try {
    totp = generateSync({ secret, guardrails });
  } catch {
    throw new APIError('Invalid secret key', 400);
  }

  const expiresIn = period - (Math.floor(Date.now() / 1000) % period);

  return { totp, expiresIn, period };
};
