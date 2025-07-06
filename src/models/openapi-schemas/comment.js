/**
 * @openapi
 * components:
 *   schemas:
 *     CommentUser:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: User ID
 *           example: 105
 *         username:
 *           type: string
 *           description: Username of the commenter
 *           example: "emmac"
 *         fullName:
 *           type: string
 *           description: Full name of the commenter
 *           example: "Emma Wilson"
 *       required:
 *         - id
 *         - username
 *         - fullName
 *
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Comment ID
 *           example: 1
 *         body:
 *           type: string
 *           description: Comment text
 *           example: "This is some awesome thinking!"
 *         postId:
 *           type: integer
 *           description: ID of the post the comment belongs to
 *           example: 242
 *         likes:
 *           type: integer
 *           description: Number of likes for the comment
 *           example: 3
 *         user:
 *           $ref: '#/components/schemas/CommentUser'
 *       required:
 *         - id
 *         - body
 *         - postId
 *         - user
 *
 *     CommentsResponse:
 *       type: object
 *       properties:
 *         comments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         total:
 *           type: integer
 *           description: Total number of comments
 *           example: 340
 *         skip:
 *           type: integer
 *           description: Number of comments skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of comments returned
 *           example: 30
 *
 *     SingleCommentResponse:
 *       $ref: '#/components/schemas/Comment'
 *
 *     AddCommentRequest:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *           description: Comment text
 *           example: "This makes all sense to me!"
 *         postId:
 *           type: integer
 *           description: ID of the post to comment on
 *           example: 3
 *         userId:
 *           type: integer
 *           description: ID of the user making the comment
 *           example: 5
 *       required:
 *         - body
 *         - postId
 *         - userId
 *
 *     UpdateCommentRequest:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *           description: Updated comment text
 *           example: "I think I should shift to the moon"
 *         postId:
 *           type: integer
 *           description: Updated post ID
 *           example: 242
 *         userId:
 *           type: integer
 *           description: Updated user ID
 *           example: 105
 *
 *     DeletedCommentResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Comment'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the comment is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the comment was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
