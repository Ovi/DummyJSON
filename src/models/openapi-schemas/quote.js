/**
 * @openapi
 * components:
 *   schemas:
 *     Quote:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the quote
 *           example: 1
 *         quote:
 *           type: string
 *           description: The quote text
 *           example: "Your heart is the size of an ocean. Go find yourself in its hidden depths."
 *         author:
 *           type: string
 *           description: Author of the quote
 *           example: "Rumi"
 *       required:
 *         - id
 *         - quote
 *         - author
 *
 *     QuotesResponse:
 *       type: object
 *       properties:
 *         quotes:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Quote'
 *         total:
 *           type: integer
 *           description: Total number of quotes
 *           example: 100
 *         skip:
 *           type: integer
 *           description: Number of quotes skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of quotes returned
 *           example: 30
 *
 *     SingleQuoteResponse:
 *       $ref: '#/components/schemas/Quote'
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
