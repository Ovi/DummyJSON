const router = require('express').Router();
const CustomResponse = require('../models/custom-response');
const { isDbConnected } = require('../utils/db');
const { generateUniqueIdentifier, generateHash } = require('../utils/custom-response');

router.post('/generate', async (req, res, next) => {
  if (!isDbConnected()) {
    next();
    return;
  }

  const { json, method } = req.body;

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

router.use('/:identifier', async (req, res, next) => {
  if (!isDbConnected()) {
    next();
    return;
  }

  const { identifier } = req.params;

  try {
    const record = await CustomResponse.findOne({ identifier });

    if (record && record.method === req.method) {
      // set header x-expires-on, should be 90 days from createdAt
      const expiresOn = new Date(record.createdAt);
      expiresOn.setDate(expiresOn.getDate() + 90);
      res.set('x-expires-on', expiresOn.toISOString());

      return res.json(record.json);
    }

    res.status(404).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
