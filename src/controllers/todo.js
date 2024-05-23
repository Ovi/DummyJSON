const { verifyUserHandler } = require('../helpers');
const APIError = require('../utils/error');
const {
  dataInMemory: frozenData,
  getMultiObjectSubset,
  limitArray,
  getRandomFromArray,
  isValidNumberInRange,
} = require('../utils/util');

const controller = {};

// get all todos
controller.getAllTodos = ({ limit, skip }) => {
  let [...todos] = frozenData.todos;
  const total = todos.length;

  if (skip > 0) {
    todos = todos.slice(skip);
  }

  todos = limitArray(todos, limit);

  const result = { todos, total, skip, limit: todos.length };

  return result;
};

// get random todo(s)
controller.getRandomTodo = ({ length }) => {
  const { todos } = frozenData;

  if (!length) {
    return getRandomFromArray(todos);
  }

  if (!isValidNumberInRange(length, 1, 10)) {
    return [];
  }

  const uniqueRandomTodos = [];
  const todosIds = [];

  while (uniqueRandomTodos.length < length) {
    const randomQuote = getRandomFromArray(todos);
    if (!todosIds.includes(randomQuote.id)) {
      uniqueRandomTodos.push(randomQuote);
      todosIds.push(randomQuote.id);
    }
  }

  return uniqueRandomTodos;
};

// get todo by id
controller.getTodoById = ({ id }) => {
  const todoFrozen = frozenData.todos.find(u => u.id.toString() === id);

  if (!todoFrozen) {
    throw new APIError(`Todo with id '${id}' not found`, 404);
  }

  return todoFrozen;
};

// get todos by userId
controller.getTodosByUserId = ({ userId, limit, skip, select }) => {
  verifyUserHandler(userId);

  let [...todos] = frozenData.todos.filter(p => p.userId.toString() === userId);
  const total = todos.length;

  if (skip > 0) {
    todos = todos.slice(skip);
  }

  todos = limitArray(todos, limit);

  if (select) {
    todos = getMultiObjectSubset(todos, select);
  }

  const result = { todos, total, skip, limit: todos.length };

  return result;
};

// add new todo
controller.addNewTodo = ({ todo, completed, userId }) => {
  verifyUserHandler(userId);

  const newTodo = {
    id: frozenData.todos.length + 1,
    todo,
    completed,
    userId,
  };

  return newTodo;
};

// update todo by id
controller.updateTodoById = ({ id, ...data }) => {
  const { todo, completed, userId } = data;

  const foundTodo = frozenData.todos.find(p => p.id.toString() === id);

  if (!foundTodo) {
    throw new APIError(`Todo with id '${id}' not found`, 404);
  }

  const updatedTodo = {
    id: +id, // converting id to number,
    todo: todo || foundTodo.todo,
    completed: completed !== undefined ? completed : foundTodo.completed,
    userId: userId || foundTodo.userId,
  };

  return updatedTodo;
};

// delete todo by id
controller.deleteTodoById = ({ id }) => {
  const todoFrozen = frozenData.todos.find(p => p.id.toString() === id);

  if (!todoFrozen) {
    throw new APIError(`Todo with id '${id}' not found`, 404);
  }

  const { ...todo } = todoFrozen;

  todo.isDeleted = true;
  todo.deletedOn = new Date().toISOString();

  return todo;
};

module.exports = controller;
