/**
 * @openapi
 * tags:
 *   - name: Icon
 *     description: Generate consistent, unique identicon images based on input hash values
 */

const router = require('express').Router();
const { generateIcon } = require('../controllers/icon');

/**
 * @openapi
 * /icon/{hash}/{size}:
 *   get:
 *     summary: Generate a unique identicon based on a hash value
 *     description: Creates deterministic identicon images that are unique to the provided hash value, useful for default user avatars or visual identification.
 *     tags:
 *       - Icon
 *     parameters:
 *       - name: hash
 *         in: path
 *         required: false
 *         description: Hash or string value to generate the identicon from (defaults to 'DummyJSON')
 *         schema:
 *           type: string
 *       - name: size
 *         in: path
 *         required: false
 *         description: Size of the square identicon in pixels (defaults to 100, max 1000)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *       - name: type
 *         in: query
 *         required: false
 *         description: Output format of the identicon
 *         schema:
 *           type: string
 *           enum: [png, svg]
 *           default: png
 *     responses:
 *       200:
 *         description: Identicon generated successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           image/svg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/:hash?/:size?', (req, res) => {
  const { hash = 'DummyJSON', size = '100' } = req.params;
  const { type } = req.query;

  const icon = generateIcon({ hash, size, type });
  res.set({
    'Content-Type': `image/${type || 'png'}`,
    'Content-Disposition': 'inline',
    'Cache-Control': 'public, max-age=31557600',
  });

  res.send(icon);
});

module.exports = router;
