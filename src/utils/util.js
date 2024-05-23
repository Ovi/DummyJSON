const fs = require('fs/promises');
const path = require('path');
const {
  REQUIRED_ENV_VARIABLES,
  OPTIONAL_ENV_VARIABLES,
  httpCodes,
} = require('../constants');

const utils = {};

const data = {
  products: [],
  carts: [],
  users: [],
  quotes: [],
  todos: [],
  posts: [],
  comments: [],
  httpCodes: {
    codes: Object.keys(httpCodes),
    messages: httpCodes,
  },
};

utils.dataInMemory = data;

utils.isDev = process.env.NODE_ENV !== 'production';

utils.loadDataInMemory = async () => {
  const baseDir = './database';

  const productsPath = path.join(baseDir, 'products.json');
  const cartsPath = path.join(baseDir, 'carts.json');
  const usersPath = path.join(baseDir, 'users.json');
  const quotesPath = path.join(baseDir, 'quotes.json');
  const todosPath = path.join(baseDir, 'todos.json');
  const postsPath = path.join(baseDir, 'posts.json');
  const commentsPath = path.join(baseDir, 'comments.json');
  const recipesPath = path.join(baseDir, 'recipes.json');

  const paths = [
    fs.readFile(productsPath, 'utf-8'),
    fs.readFile(cartsPath, 'utf-8'),
    fs.readFile(usersPath, 'utf-8'),
    fs.readFile(quotesPath, 'utf-8'),
    fs.readFile(todosPath, 'utf-8'),
    fs.readFile(postsPath, 'utf-8'),
    fs.readFile(commentsPath, 'utf-8'),
    fs.readFile(recipesPath, 'utf-8'),
  ];

  const [
    productsStr,
    cartsStr,
    usersStr,
    quotesStr,
    todosStr,
    postsStr,
    commentsStr,
    recipesStr,
  ] = await Promise.all(paths);

  const productsArr = JSON.parse(productsStr);
  const cartsArr = JSON.parse(cartsStr);
  const usersArr = JSON.parse(usersStr);
  const quotesArr = JSON.parse(quotesStr);
  const recipesArr = JSON.parse(recipesStr);
  const todosArr = JSON.parse(todosStr);
  const postsArr = JSON.parse(postsStr);
  const commentsArr = JSON.parse(commentsStr);

  data.products = productsArr;
  data.carts = cartsArr;
  data.users = usersArr;
  data.quotes = quotesArr;
  data.recipes = recipesArr;
  data.todos = todosArr;
  data.posts = postsArr;
  data.comments = commentsArr;

  utils.deepFreeze(data);
};

utils.getObjectSubset = function(obj, keys) {
  return Object.assign({}, ...keys.map(key => ({ [key]: obj[key] })));
};

utils.getMultiObjectSubset = function(arr, keys) {
  return arr.map(p => utils.getObjectSubset(p, keys));
};

utils.isNumber = num => !Number.isNaN(Number(num));

utils.validateEnvVar = () => {
  const requiredUnsetEnv = REQUIRED_ENV_VARIABLES.filter(
    env => !(typeof process.env[env] !== 'undefined'),
  );

  if (requiredUnsetEnv.length) {
    throw new Error(
      `Required ENV variables are not set: [${requiredUnsetEnv.join(', ')}]`,
    );
  }

  const optionalUnsetEnv = OPTIONAL_ENV_VARIABLES.filter(
    env => !(typeof process.env[env] !== 'undefined'),
  );

  if (optionalUnsetEnv.length) {
    console.warn(
      `Optional ENV variables are not set: [${optionalUnsetEnv.join(', ')}]`,
    );
  }
};

utils.trueTypeOf = obj => {
  return Object.prototype.toString
    .call(obj)
    .slice(8, -1)
    .toLowerCase();
};

utils.deepFreeze = function(obj) {
  Object.freeze(obj);

  if (obj === undefined) {
    return obj;
  }

  Object.getOwnPropertyNames(obj).forEach(prop => {
    if (
      obj[prop] !== null &&
      (typeof obj[prop] === 'object' || typeof obj[prop] === 'function') &&
      !Object.isFrozen(obj[prop])
    ) {
      utils.deepFreeze(obj[prop]);
    }
  });

  return obj;
};

utils.getNestedValue = (obj, keys) => {
  return keys.split('.').reduce((o, k) => (o || {})[k], obj);
};

utils.limitArray = (arr, limit) => {
  return limit === 0 || limit > arr.length ? arr : arr.slice(0, limit);
};

utils.capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

utils.isValidNumberInRange = (num, start, end) => {
  const parsedNum = Number(num);
  return !Number.isNaN(parsedNum) && parsedNum >= start && parsedNum <= end;
};

utils.getRandomFromArray = array => {
  return array[Math.floor(Math.random() * array.length)];
};

module.exports = utils;
