/**
 * @openapi
 * tags:
 *   - name: Quote
 *     description: Famous quotes from various authors
 */

const router = require('express').Router();
const { getAllQuotes, getRandomQuote, getQuoteById } = require('../controllers/quote');

/**
 * @openapi
 * /quotes:
 *   get:
 *     summary: Get all quotes
 *     tags: [Quote]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of quotes to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of quotes to skip
 *     responses:
 *       200:
 *         description: List of quotes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuotesResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllQuotes({ ...req._options }));
});

/**
 * @openapi
 * /quotes/random/{length}:
 *   get:
 *     summary: Get random quote(s)
 *     tags: [Quote]
 *     parameters:
 *       - in: path
 *         name: length
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of random quotes to return (1-10, optional)
 *     responses:
 *       200:
 *         description: A random quote or array of random quotes
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Quote'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Quote'
 */
router.get('/random/:length?', (req, res) => {
  res.send(getRandomQuote({ ...req.params }));
});

/**
 * @openapi
 * /quotes/{id}:
 *   get:
 *     summary: Get a quote by ID
 *     tags: [Quote]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The quote ID
 *     responses:
 *       200:
 *         description: The quote object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quote'
 *       404:
 *         description: Quote not found
 */
router.get('/:id', (req, res) => {
  res.send(getQuoteById({ ...req.params }));
});

module.exports = router;
