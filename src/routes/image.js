/**
 * @openapi
 * tags:
 *   - name: Image
 *     description: Generate customizable placeholder images with various sizes, colors, and text options
 */

const router = require('express').Router();
const { imageComposer } = require('../controllers/image');
const { logError } = require('../helpers/logger');
const APIError = require('../utils/error');
const { generateProperData } = require('../utils/image');

/**
 * @openapi
 * /image/{size}/{backgroundParam}/{colorParam}/{typeParam}:
 *   get:
 *     summary: Generate a placeholder image
 *     description: Creates a customizable placeholder image with options for size, background color, text color, and content.
 *     tags:
 *       - Image
 *     parameters:
 *       - name: size
 *         in: path
 *         required: true
 *         description: Size of the image. Can be a single number for square (e.g., 150) or width x height (e.g., 200x100)
 *         schema:
 *           type: string
 *       - name: backgroundParam
 *         in: path
 *         required: false
 *         description: Background color in hex (without #) or color name
 *         schema:
 *           type: string
 *       - name: colorParam
 *         in: path
 *         required: false
 *         description: Text color in hex (without #) or color name
 *         schema:
 *           type: string
 *       - name: typeParam
 *         in: path
 *         required: false
 *         description: Image format (png, jpg/jpeg, webp)
 *         schema:
 *           type: string
 *           enum: [png, jpg, jpeg, webp]
 *       - name: background
 *         in: query
 *         required: false
 *         description: Background color in hex (without #) or color name (alternative to path parameter)
 *         schema:
 *           type: string
 *       - name: color
 *         in: query
 *         required: false
 *         description: Text color in hex (without #) or color name (alternative to path parameter)
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         required: false
 *         description: Image format (alternative to path parameter)
 *         schema:
 *           type: string
 *           enum: [png, jpg, jpeg, webp]
 *       - name: text
 *         in: query
 *         required: false
 *         description: Custom text to display on the image (defaults to image dimensions)
 *         schema:
 *           type: string
 *       - name: fontFamily
 *         in: query
 *         required: false
 *         description: Font family for the text
 *         schema:
 *           type: string
 *           enum: [bitter, cairo, comfortaa, cookie, dosis, gotham, lobster, marhey, pacifico, poppins, quicksand, qwigley, satisfy, ubuntu]
 *           default: bitter
 *       - name: fontSize
 *         in: query
 *         required: false
 *         description: Font size in pixels (defaults to dynamic sizing based on text and image width)
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Image generated successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           image/webp:
 *             schema:
 *               type: string
 *               format: binary
 *       302:
 *         description: Redirect to cached image
 *       400:
 *         description: Invalid parameters
 *       500:
 *         description: Server error while generating image
 */
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

module.exports = router;
