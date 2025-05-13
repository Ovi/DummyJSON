/**
 * @openapi
 * components:
 *   schemas:
 *     PostReactions:
 *       type: object
 *       properties:
 *         likes:
 *           type: integer
 *           description: Number of likes
 *           example: 192
 *         dislikes:
 *           type: integer
 *           description: Number of dislikes
 *           example: 25
 *       required:
 *         - likes
 *         - dislikes
 *
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the post
 *           example: 1
 *         title:
 *           type: string
 *           description: Title of the post
 *           example: "His mother had always taught him"
 *         body:
 *           type: string
 *           description: Content of the post
 *           example: "His mother had always taught him not to ever think of himself as better than others..."
 *         tags:
 *           type: array
 *           description: Tags associated with the post
 *           items:
 *             type: string
 *           example: ["history", "american", "crime"]
 *         reactions:
 *           $ref: '#/components/schemas/PostReactions'
 *         views:
 *           type: integer
 *           description: Number of views
 *           example: 305
 *         userId:
 *           type: integer
 *           description: ID of the user who created the post
 *           example: 121
 *       required:
 *         - id
 *         - title
 *         - body
 *         - tags
 *         - reactions
 *         - views
 *         - userId
 *
 *     PostsResponse:
 *       type: object
 *       properties:
 *         posts:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Post'
 *         total:
 *           type: integer
 *           description: Total number of posts
 *           example: 100
 *         skip:
 *           type: integer
 *           description: Number of posts skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of posts returned
 *           example: 30
 *
 *     AddPostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "His mother had always taught him"
 *         body:
 *           type: string
 *           example: "His mother had always taught him not to ever think of himself as better than others..."
 *         userId:
 *           type: integer
 *           example: 121
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["history", "american", "crime"]
 *         reactions:
 *           $ref: '#/components/schemas/PostReactions'
 *       required:
 *         - title
 *         - body
 *         - userId
 *         - tags
 *         - reactions
 *
 *     UpdatePostRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Updated title"
 *         body:
 *           type: string
 *           example: "Updated body content."
 *         userId:
 *           type: integer
 *           example: 121
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["history", "american", "crime"]
 *         reactions:
 *           $ref: '#/components/schemas/PostReactions'
 *
 *     DeletedPostResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Post'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the post is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the post was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
