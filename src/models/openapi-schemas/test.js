/**
 * @openapi
 * components:
 *   schemas:
 *     TestStatusResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           description: Status of the server
 *           example: ok
 *         method:
 *           type: string
 *           description: HTTP method used for the request
 *           example: GET
 *       required:
 *         - status
 *         - method
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
