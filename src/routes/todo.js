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

// get all todos
router.get('/', (req, res) => {
  res.send(getAllTodos({ ...req._options }));
});

// get random todo
router.get('/random', (req, res) => {
  res.send(getRandomTodo());
});

// get todo by id
router.get('/:id', (req, res) => {
  res.send(getTodoById(req.params));
});

// get todo by userId
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { limit, skip, select } = req._options;

  res.send(getTodosByUserId({ userId, limit, skip, select }));
});

// add new todo
router.post('/add', (req, res) => {
  res.send(addNewTodo(req.body));
});

// update todo by id (PUT)
router.put('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateTodoById({ id, ...req.body }));
});

// update todo by id (PATCH)
router.patch('/:id', (req, res) => {
  const { id } = req.params;

  res.send(updateTodoById({ id, ...req.body }));
});

// delete todo
router.delete('/:id', (req, res) => {
  res.send(deleteTodoById({ ...req.params }));
});

module.exports = router;
