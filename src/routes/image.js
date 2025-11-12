import { Router } from 'express';
import { imageComposer } from '../controllers/image.js';
import { logError } from '../helpers/logger.js';
import APIError from '../utils/error.js';
import { generateProperData } from '../utils/image.js';

const router = Router();

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
    logError('Image Processing Error', { error });
    next(error);
  }
});

export default router;
