const router = require('express').Router();
const CustomResponse = require('../models/custom-response');
const { isDbConnected } = require('../utils/db');
const { generateUniqueIdentifier, generateHash } = require('../utils/custom-response');
const { customResponseExpiresInDays } = require('../constants');
const cacheMiddleware = require('../middleware/cache');

router.post('/generate', async (req, res, next) => {
  if (!isDbConnected()) {
    next();
    return;
  }

  const { json, method } = req.body;

  if (!json) {
    return res.status(400).send('Missing JSON');
  }

  const jsonSize = Buffer.byteLength(JSON.stringify(json));
  const maxSize = 300 * 1024; // 300kb

  if (jsonSize > maxSize) {
    return res.status(413).send('Payload Too Large');
  }

  const hash = generateHash(json, method);

  try {
    const existingResponse = await CustomResponse.findOne({ hash });

    if (existingResponse) {
      // Return existing URL if found
      return res.json({ url: `https://dummyjson.com/c/${existingResponse.identifier}` });
    }

    const identifier = await generateUniqueIdentifier();

    if (!identifier) {
      res.status(500).send('Failed to generate unique identifier');
      return;
    }

    const newResponse = new CustomResponse({ hash, json, method, identifier });
    await newResponse.save();
    res.json({ url: `https://dummyjson.com/c/${newResponse.identifier}` });
  } catch (error) {
    next(error);
  }
});

router.use('/:identifier', cacheMiddleware, async (req, res, next) => {
  if (!isDbConnected()) {
    next();
    return;
  }

  const { identifier } = req.params;

  try {
    const record = await CustomResponse.findOne({ identifier });

    if (record && record.method === req.method) {
      // set header x-expires-on, should be 'customResponseExpiresInDays' days from now
      const expiresOn = new Date();
      expiresOn.setDate(expiresOn.getDate() + customResponseExpiresInDays);
      expiresOn.setHours(0, 0, 0, 0);

      res.set({
        'x-expires-on': expiresOn.toISOString(),
        'x-expires-in-days': customResponseExpiresInDays,
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${24 * 60 * 60}`, // 1 day
      });

      // update last accessed time (but don't wait for it to finish)
      CustomResponse.updateOne({ identifier }, { $set: { lastAccessedAt: new Date() } }, { new: true }).exec();

      return res.json(record.json);
    }

    res.status(404).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
