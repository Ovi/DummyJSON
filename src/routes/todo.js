/**
 * @openapi
 * tags:
 *   name: Todos
 *   description: API endpoints for managing todos
 */

const router = require('express').Router();
const {
  getAllTodos,
  getRandomTodo,
  getTodoById,
  getTodosByUserId,
  addNewTodo,
  updateTodoById,
  deleteTodoById,
} = require('../controllers/todo');

/**
 * @openapi
 * /todos:
 *   get:
 *     summary: Get all todos
 *     tags: [Todos]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of todos to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of todos to skip
 *     responses:
 *       200:
 *         description: List of todos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodosResponse'
 */
router.get('/', (req, res) => {
  res.send(getAllTodos({ ...req._options }));
});

/**
 * @openapi
 * /todos/random/{length}:
 *   get:
 *     summary: Get random todo(s)
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: length
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *         description: Number of random todos to return (max 10)
 *     responses:
 *       200:
 *         description: Random todo(s)
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Todo'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */
router.get('/random/:length?', (req, res) => {
  res.send(getRandomTodo({ ...req.params }));
});

/**
 * @openapi
 * /todos/{id}:
 *   get:
 *     summary: Get a todo by ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: The todo object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 */
router.get('/:id', (req, res) => {
  res.send(getTodoById(req.params));
});

/**
 * @openapi
 * /todos/user/{userId}:
 *   get:
 *     summary: Get todos by user ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to filter todos by
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of todos to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of todos to skip
 *       - in: query
 *         name: select
 *         schema:
 *           type: string
 *         description: Comma-separated list of fields to include
 *     responses:
 *       200:
 *         description: List of todos for the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TodosResponse'
 */
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit, skip, select } = req._options;
  res.send(getTodosByUserId({ userId, limit, skip, select }));
});

/**
 * @openapi
 * /todos/add:
 *   post:
 *     summary: Add a new todo
 *     tags: [Todos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AddTodoRequest'
 *     responses:
 *       201:
 *         description: The created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.post('/add', (req, res) => {
  res.status(201).send(addNewTodo(req.body));
});

/**
 * @openapi
 * /todos/{id}:
 *   put:
 *     summary: Update a todo by ID (replace)
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoRequest'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  res.send(updateTodoById({ id, ...req.body }));
});

/**
 * @openapi
 * /todos/{id}:
 *   patch:
 *     summary: Update a todo by ID (partial)
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTodoRequest'
 *     responses:
 *       200:
 *         description: The updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 */
router.patch('/:id', (req, res) => {
  const { id } = req.params;
  res.send(updateTodoById({ id, ...req.body }));
});

/**
 * @openapi
 * /todos/{id}:
 *   delete:
 *     summary: Delete a todo by ID
 *     tags: [Todos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The todo ID
 *     responses:
 *       200:
 *         description: The deleted todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeletedTodoResponse'
 *       404:
 *         description: Todo not found
 */
router.delete('/:id', (req, res) => {
  res.send(deleteTodoById({ ...req.params }));
});

module.exports = router;
