/**
 * @openapi
 * components:
 *   schemas:
 *     HttpMockResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: HTTP status code
 *           example: 200
 *         message:
 *           type: string
 *           description: Message for the status code
 *           example: OK
 *         title:
 *           type: string
 *           description: Title for error responses (4xx/5xx)
 *           example: Not Found
 *         type:
 *           type: string
 *           description: Error type (for error responses)
 *           example: about:blank
 *         detail:
 *           type: string
 *           description: Error detail (for error responses)
 *           example: Not Found
 *       required:
 *         - status
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
