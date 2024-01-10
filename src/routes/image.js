const router = require('express').Router();
const { imageComposer } = require('../controllers/image');
const APIError = require('../utils/error');
const { generateProperData } = require('../utils/image');

const endpoint = '/:size/:backgroundParam?/:colorParam?/:typeParam?';
router.get(endpoint, async (req, res, next) => {
  try {
    const options = { ...req.params, ...req.query };

    const imageOptions = generateProperData(options);

    if (!imageOptions) {
      next();
      return;
    }

    const composedImaged = await imageComposer(imageOptions);
    const { imageBuffer, contentType, cacheUrl } = composedImaged || {};

    if (cacheUrl) {
      res.redirect(cacheUrl);
      return;
    }

    if (!imageBuffer) {
      throw new APIError('Failed to generate image');
    }

    const headers = {
      'Content-Type': contentType,
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'public, max-age=31536000', // 1 year
    };

    res.header(headers).send(imageBuffer);
  } catch (error) {
    console.info('*** Image Processing Error! ***');
    console.error(error);
    next(error);
  }
});

module.exports = router;
