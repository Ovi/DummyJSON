const NodeCache = require('node-cache');

// NodeCache instance with a default TTL of 1 hour
const cache = new NodeCache({ stdTTL: 3600 });

// Middleware to cache both headers and body
const cacheMiddleware = () => (req, res, next) => {
  const cacheKey = req.originalUrl;

  const cachedResponse = cache.get(cacheKey);

  if (cachedResponse) {
    // If cached, restore both headers and body from cache
    const { headers, body } = cachedResponse;
    res.set(headers);
    res.set('X-Cache', 'HIT');
    return res.send(body);
  }

  // If not cached, proceed with request and cache the response
  const originalSend = res.send;
  res.send = body => {
    const headers = res.getHeaders(); // Capture response headers
    // Cache both headers and body
    cache.set(cacheKey, { headers, body });
    originalSend.call(res, body); // Proceed with original response
  };

  next();
};

module.exports = cacheMiddleware();
