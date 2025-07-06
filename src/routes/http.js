/**
 * @openapi
 * tags:
 *   - name: HttpMock
 *     description: Mock and test HTTP responses for any status code
 */

const router = require('express').Router();
const { getHttpStatus } = require('../controllers/http');

/**
 * @openapi
 * /http/{httpCode}/{message}:
 *   get:
 *     summary: Mock an HTTP response with a specific status code and optional message
 *     tags: [HttpMock]
 *     parameters:
 *       - in: path
 *         name: httpCode
 *         required: true
 *         schema:
 *           type: integer
 *         description: HTTP status code to mock (e.g., 200, 404, 500)
 *         example: 200
 *       - in: path
 *         name: message
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional message to include in the response
 *         example: Hello_Peter
 *     responses:
 *       200:
 *         description: Mocked HTTP response (success or error)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HttpMockResponse'
 *           application/problem+json:
 *             schema:
 *               $ref: '#/components/schemas/HttpMockResponse'
 */
router.use('/:httpCode/:message?', (req, res) => {
  const data = getHttpStatus(req.params);

  res.setHeader('Content-Type', getHttpCodeContentType(data.status));
  res.status(data.status).send(data.message ? data : undefined);
});

module.exports = router;

function getHttpCodeContentType(status) {
  return status >= 400 ? 'application/problem+json' : 'application/json';
}
