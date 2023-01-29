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

utils.doTheHeck = async () => {
  const shouldDoAnything = false;
  if (!shouldDoAnything) return;

  const theUser = path.join(__dirname, '../', 'data', 'users.json');

  const [theUserString] = await Promise.all([fs.readFile(theUser, 'utf-8')]);

  const theUserData = JSON.parse(theUserString);

  const users = theUserData.map(u => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    maidenName: u.maidenName,
    age: utils.getRandomInt(18, 50),
    ...u,
  }));

  await fs.writeFile(
    path.join(__dirname, '../', 'data', `users-updated.json`),
    JSON.stringify(users),
  );

  return null;
};

utils.getRandomInt = (min = 0, max = 100) => {
  const _min = Math.ceil(min);
  const _max = Math.floor(max);
  return Math.floor(Math.random() * (_max - _min + 1)) + _min;
};

utils.loadDataInMemory = async () => {
  const baseDir = path.join(__dirname, '../', 'data');

  const productsPath = path.join(baseDir, 'products.json');
  const cartsPath = path.join(baseDir, 'carts.json');
  const usersPath = path.join(baseDir, 'users.json');
  const quotesPath = path.join(baseDir, 'quotes.json');
  const todosPath = path.join(baseDir, 'todos.json');
  const postsPath = path.join(baseDir, 'posts.json');
  const commentsPath = path.join(baseDir, 'comments.json');

  const paths = [
    fs.readFile(productsPath, 'utf-8'),
    fs.readFile(cartsPath, 'utf-8'),
    fs.readFile(usersPath, 'utf-8'),
    fs.readFile(quotesPath, 'utf-8'),
    fs.readFile(todosPath, 'utf-8'),
    fs.readFile(postsPath, 'utf-8'),
    fs.readFile(commentsPath, 'utf-8'),
  ];

  const [
    productsStr,
    cartsStr,
    usersStr,
    quotesStr,
    todosStr,
    postsStr,
    commentsStr,
  ] = await Promise.all(paths);

  const productsArr = JSON.parse(productsStr);
  const cartsArr = JSON.parse(cartsStr);
  const usersArr = JSON.parse(usersStr);
  const quotesArr = JSON.parse(quotesStr);
  const todosArr = JSON.parse(todosStr);
  const postsArr = JSON.parse(postsStr);
  const commentsArr = JSON.parse(commentsStr);

  data.products = productsArr;
  data.carts = cartsArr;
  data.users = usersArr;
  data.quotes = quotesArr;
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

utils.usernameRegex = /^[a-zA-Z0-9]*$/;

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

utils.getRandomElementsFromArray = (arr, numberOfElementsRequired) => {
  let n = numberOfElementsRequired;
  let len = arr.length;

  const result = new Array(n);
  const taken = new Array(len);

  if (n > len) {
    throw new RangeError(
      'getRandomElementsFromArray: more elements taken than available',
    );
  }

  while (n--) {
    const randomIdx = Math.floor(Math.random() * len);
    result[n] = arr[randomIdx in taken ? taken[randomIdx] : randomIdx];
    taken[randomIdx] = --len in taken ? taken[len] : len;
  }
  return result;
};

utils.mongooseOptions = {
  regexFinder: something => ({ $options: 'i', $regex: something }),
  updateMerge: { new: true, setDefaultsOnInsert: true, upsert: true },
};

utils.truncateString = (string = '', length = 30) => {
  if (string.length <= length + 3) return string;

  return string.length < length ? string : `${string.slice(0, length - 3)}...`;
};

utils.truncateStringMiddle = (string, length = 30, start = 10, end = 10) => {
  if (string.length < length) return string;
  return `${string.slice(0, start)}...${string.slice(string.length - end)}`;
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

module.exports = utils;
