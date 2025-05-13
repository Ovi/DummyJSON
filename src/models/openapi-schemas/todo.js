/**
 * @openapi
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unique identifier for the todo
 *           example: 1
 *         todo:
 *           type: string
 *           description: The todo task description
 *           example: Do something nice for someone you care about
 *         completed:
 *           type: boolean
 *           description: Whether the todo is completed
 *           example: false
 *         userId:
 *           type: integer
 *           description: ID of the user who owns the todo
 *           example: 152
 *       required:
 *         - id
 *         - todo
 *         - completed
 *         - userId
 *       example:
 *         id: 1
 *         todo: Do something nice for someone you care about
 *         completed: false
 *         userId: 152
 *
 *     TodosResponse:
 *       type: object
 *       properties:
 *         todos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Todo'
 *         total:
 *           type: integer
 *           description: Total number of todos
 *           example: 150
 *         skip:
 *           type: integer
 *           description: Number of todos skipped for pagination
 *           example: 0
 *         limit:
 *           type: integer
 *           description: Maximum number of todos returned
 *           example: 30
 *       example:
 *         todos:
 *           - id: 1
 *             todo: Do something nice for someone you care about
 *             completed: false
 *             userId: 152
 *           - id: 2
 *             todo: Memorize a poem
 *             completed: true
 *             userId: 13
 *           - id: 3
 *             todo: Watch a classic movie
 *             completed: true
 *             userId: 68
 *         total: 150
 *         skip: 0
 *         limit: 30
 *
 *     AddTodoRequest:
 *       type: object
 *       properties:
 *         todo:
 *           type: string
 *           example: Use DummyJSON in the project
 *         completed:
 *           type: boolean
 *           example: false
 *         userId:
 *           type: integer
 *           example: 5
 *       required:
 *         - todo
 *         - completed
 *         - userId
 *       example:
 *         todo: Use DummyJSON in the project
 *         completed: false
 *         userId: 5
 *
 *     UpdateTodoRequest:
 *       type: object
 *       properties:
 *         todo:
 *           type: string
 *           example: Bake pastries for yourself and neighbor
 *         completed:
 *           type: boolean
 *           example: true
 *         userId:
 *           type: integer
 *           example: 198
 *       example:
 *         todo: Bake pastries for yourself and neighbor
 *         completed: true
 *         userId: 198
 *
 *     DeletedTodoResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/Todo'
 *         - type: object
 *           properties:
 *             isDeleted:
 *               type: boolean
 *               description: Whether the todo is deleted
 *               example: true
 *             deletedOn:
 *               type: string
 *               format: date-time
 *               description: ISO timestamp when the todo was deleted
 *               example: "2024-05-01T12:34:56.789Z"
 *           required:
 *             - isDeleted
 *             - deletedOn
 *           example:
 *             id: 1
 *             todo: Do something nice for someone you care about
 *             completed: false
 *             userId: 152
 *             isDeleted: true
 *             deletedOn: "2024-05-01T12:34:56.789Z"
 */

// Export the model schema (empty object since we're just using the JSDoc for OpenAPI)
module.exports = {};
