import { verifyUserHandler } from '../helpers/index.js';
import { dataInMemory as frozenData, getRandomFromArray, isValidNumberInRange } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields, markDeleted, nextId } from '../helpers/resource.js';

// get all todos
export const getAllTodos = _options => {
  return paginateResource(frozenData.todos, 'todos', _options);
};

// get random todo(s)
export const getRandomTodo = ({ length }) => {
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
export const getTodoById = ({ id, select }) => {
  return selectFields(findResourceById('todos', id, 'Todo'), select);
};

// get todos by userId
export const getTodosByUserId = ({ userId, ..._options }) => {
  verifyUserHandler(userId);

  const todos = frozenData.todos.filter(p => p.userId.toString() === userId);

  return paginateResource(todos, 'todos', _options);
};

// add new todo
export const addNewTodo = ({ todo, completed, userId }) => {
  verifyUserHandler(userId);

  const newTodo = {
    id: nextId('todos'),
    todo,
    completed,
    userId,
  };

  return newTodo;
};

// update todo by id
export const updateTodoById = ({ id, ...data }) => {
  const { todo, completed, userId } = data;

  const foundTodo = findResourceById('todos', id, 'Todo');

  const updatedTodo = {
    id: +id, // converting id to number,
    todo: todo ?? foundTodo.todo,
    completed: completed ?? foundTodo.completed,
    userId: userId ?? foundTodo.userId,
  };

  return updatedTodo;
};

// delete todo by id
export const deleteTodoById = ({ id }) => {
  return markDeleted(findResourceById('todos', id, 'Todo'));
};
