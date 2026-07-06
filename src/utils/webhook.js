import crypto from 'node:crypto';
import Webhook from '../models/webhook.js';
import { isEmpty } from './util.js';

const SENSITIVE_HEADERS = [
  'authorization',
  'cookie',
  'x-api-key',
  'proxy-authorization',
  'set-cookie',
  'x-auth-token',
  'x-access-token',
];

const WEBHOOK_ID_BYTES = 4;

const LIMITS = {
  MAX_HEADERS: 50,
  MAX_HEADER_KEY_LEN: 128,
  MAX_HEADER_VALUE_LEN: 1024,
  MAX_QUERY_KEYS: 50,
  MAX_QUERY_VALUE_LEN: 1024,
  MAX_BODY_STRING_LEN: 10000,
  MAX_BODY_DEPTH: 5,
  MAX_BODY_KEYS: 100,
  MAX_BODY_ARRAY_LEN: 100,
};

const truncateString = (value, maxLen) => {
  const str = String(value);
  if (str.length <= maxLen) return { value: str, truncated: false };
  return { value: `${str.slice(0, maxLen)}…`, truncated: true };
};

const boundObject = (obj, depth = 0, meta = { truncated: false }) => {
  if (depth > LIMITS.MAX_BODY_DEPTH) {
    meta.truncated = true;
    return '[truncated]';
  }

  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      const result = truncateString(obj, LIMITS.MAX_BODY_STRING_LEN);
      if (result.truncated) meta.truncated = true;
      return result.value;
    }

    return obj;
  }

  if (Array.isArray(obj)) {
    const bounded = obj.slice(0, LIMITS.MAX_BODY_ARRAY_LEN).map(item => boundObject(item, depth + 1, meta));
    if (obj.length > LIMITS.MAX_BODY_ARRAY_LEN) meta.truncated = true;
    return bounded;
  }

  const entries = Object.entries(obj).slice(0, LIMITS.MAX_BODY_KEYS);
  if (Object.keys(obj).length > LIMITS.MAX_BODY_KEYS) meta.truncated = true;

  return entries.reduce((acc, [key, value]) => {
    const boundedKey = truncateString(key, LIMITS.MAX_HEADER_KEY_LEN);
    if (boundedKey.truncated) meta.truncated = true;
    acc[boundedKey.value] = boundObject(value, depth + 1, meta);
    return acc;
  }, {});
};

const boundKeyValueMap = (obj, maxKeys, maxValueLen, meta) => {
  const bounded = {};
  const entries = Object.entries(obj || {}).slice(0, maxKeys);

  if (Object.keys(obj || {}).length > maxKeys) meta.truncated = true;

  entries.forEach(([key, value]) => {
    const boundedKey = truncateString(key, LIMITS.MAX_HEADER_KEY_LEN);
    const boundedValue = truncateString(value, maxValueLen);

    if (boundedKey.truncated || boundedValue.truncated) meta.truncated = true;
    bounded[boundedKey.value] = boundedValue.value;
  });

  return bounded;
};

export const sanitizeHeaders = (headers, meta = { truncated: false }) => {
  const filtered = {};

  Object.entries(headers || {}).forEach(([key, value]) => {
    if (SENSITIVE_HEADERS.includes(key.toLowerCase())) return;
    filtered[key] = value;
  });

  return boundKeyValueMap(filtered, LIMITS.MAX_HEADERS, LIMITS.MAX_HEADER_VALUE_LEN, meta);
};

export const buildRequestPayload = req => {
  let { body } = req;
  const meta = { truncated: false };

  if (body === undefined || body === null || (typeof body === 'string' && body.trim() === '')) {
    body = {};
  } else if (typeof body === 'string') {
    const result = truncateString(body, LIMITS.MAX_BODY_STRING_LEN);
    body = result.value;
    if (result.truncated) meta.truncated = true;
  } else if (typeof body === 'object' && !Array.isArray(body) && isEmpty(body)) {
    body = {};
  } else if (typeof body === 'object') {
    body = boundObject(body, 0, meta);
  }

  const headers = sanitizeHeaders(req.headers, meta);
  const query = boundKeyValueMap(req.query || {}, LIMITS.MAX_QUERY_KEYS, LIMITS.MAX_QUERY_VALUE_LEN, meta);

  const payload = {
    method: req.method,
    headers,
    query,
    body,
    receivedAt: new Date(),
  };

  if (meta.truncated) {
    payload._meta = { truncated: true };
  }

  return payload;
};

export const generateWebhookId = async () => {
  let identifier = '';
  let isUnique = false;
  let attemptsLeft = 5;

  while (!isUnique && attemptsLeft > 0) {
    identifier = crypto.randomBytes(WEBHOOK_ID_BYTES).toString('hex');

    // eslint-disable-next-line no-await-in-loop
    const existing = await Webhook.findOne({ identifier });
    if (!existing) {
      isUnique = true;
      break;
    }

    attemptsLeft -= 1;
  }

  return identifier;
};
