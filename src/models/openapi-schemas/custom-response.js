/**
 * @openapi
 * components:
 *   schemas:
 *     CustomResponseGenerateRequest:
 *       type: object
 *       properties:
 *         json:
 *           type: object
 *           description: The custom JSON data to be served by the generated endpoint
 *           example:
 *             foo: "bar"
 *         method:
 *           type: string
 *           description: HTTP method for the custom endpoint
 *           enum: [GET, POST, PUT, PATCH, DELETE]
 *           example: "GET"
 *       required:
 *         - json
 *         - method
 *
 *     CustomResponseGenerateResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: The generated URL for the custom response
 *           example: "https://dummyjson.com/c/abcd-1234"
 *       required:
 *         - url
 *
 *     CustomResponseData:
 *       type: object
 *       description: The custom JSON data returned from the generated endpoint
 *       example:
 *         foo: "bar"
 *
 *     CustomResponseError:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Missing JSON"
 *       required:
 *         - message
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
