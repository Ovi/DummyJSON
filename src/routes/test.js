/**
 * @openapi
 * tags:
 *   name: Tests
 *   description: API endpoints for testing server status
 */

const router = require('express').Router();

/**
 * @openapi
 * /test:
 *   get:
 *     summary: Test server status (GET)
 *     tags: [Tests]
 *     responses:
 *       200:
 *         description: Server is up and responding to GET
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestStatusResponse'
 *   post:
 *     summary: Test server status (POST)
 *     tags: [Tests]
 *     responses:
 *       200:
 *         description: Server is up and responding to POST
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestStatusResponse'
 *   put:
 *     summary: Test server status (PUT)
 *     tags: [Tests]
 *     responses:
 *       200:
 *         description: Server is up and responding to PUT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestStatusResponse'
 *   delete:
 *     summary: Test server status (DELETE)
 *     tags: [Tests]
 *     responses:
 *       200:
 *         description: Server is up and responding to DELETE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TestStatusResponse'
 */
router.use('/', (req, res) => {
  res.status(200).send({ status: 'ok', method: req.method });
});

module.exports = router;
