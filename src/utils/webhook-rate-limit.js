import rateLimit from 'express-rate-limit';

const getClientKey = req => req.clientInfo?.ip || req.ip || 'unknown';

export const webhookCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  keyGenerator: getClientKey,
  message: { message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const webhookIngestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  keyGenerator: req => req.params.identifier || 'unknown',
  message: { message: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});
