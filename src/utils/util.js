const fs = require('node:fs');
const path = require('node:path');
const v8 = require('node:v8');
const { v4 } = require('uuid');
const { REQUIRED_ENV_VARIABLES, OPTIONAL_ENV_VARIABLES, httpCodes } = require('../constants');
const { logWarn } = require('../helpers/logger');

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

utils.isDev = process.env.NODE_ENV === 'development';

utils.loadDataInMemory = async () => {
  const baseDir = './cache';

  function loadV8(name) {
    const filePath = path.join(baseDir, `${name}.v8`);
    const buffer = fs.readFileSync(filePath);
    return v8.deserialize(buffer);
  }

  // Load each resource
  data.products = loadV8('products');
  data.carts = loadV8('carts');
  data.users = loadV8('users');
  data.quotes = loadV8('quotes');
  data.todos = loadV8('todos');
  data.posts = loadV8('posts');
  data.comments = loadV8('comments');
  data.recipes = loadV8('recipes');

  data.categoryList = [...new Set(data.products.map(p => p.category))];
  data.categories = utils.getSluggedData(data.categoryList, 'products', 'category');

  data.tagList = [...new Set(data.posts.flatMap(p => p.tags))];
  data.tags = utils.getSluggedData(data.tagList, 'posts', 'tag');

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
  const requiredUnsetEnv = REQUIRED_ENV_VARIABLES.filter(env => !(typeof process.env[env] !== 'undefined'));

  if (requiredUnsetEnv.length) {
    throw new Error(`Required ENV variables are not set: [${requiredUnsetEnv.join(', ')}]`);
  }

  const optionalUnsetEnv = OPTIONAL_ENV_VARIABLES.filter(env => !(typeof process.env[env] !== 'undefined'));

  if (optionalUnsetEnv.length) {
    logWarn(`Optional ENV variables are not set: [${optionalUnsetEnv.join(', ')}]`);
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

utils.deepCopy = obj => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const copy = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    copy[key] = utils.deepCopy(obj[key]);
  });
  return copy;
};

utils.getNestedValue = (obj, keys) => {
  if (!keys) {
    return null;
  }

  return keys.split('.').reduce((o, k) => (o || {})[k], obj);
};

utils.limitArray = (arr, limit) => {
  return limit === 0 || limit > arr.length ? arr : arr.slice(0, limit);
};

utils.sortArray = (arr, sortBy, order) => {
  const arrCopy = utils.deepCopy(arr);

  const sortedArray = arrCopy.sort((a, b) => {
    if (a[sortBy] === b[sortBy]) return 0;
    if (order === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  return sortedArray;
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

utils.getSluggedData = (arr, resource, type) => {
  return arr.map(item => ({
    slug: item,
    name: utils.capitalizeWords(item),
    url: `https://dummyjson.com/${resource}/${type}/${item}`,
  }));
};

utils.capitalizeWords = str => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

utils.findUserWithUsernameAndId = ({ username, id }) => {
  const user = utils.dataInMemory.users.find(u => {
    const validUsername = u.username.toLowerCase() === username.toLowerCase();
    const validId = id.toString() === u.id.toString();

    return validUsername && validId;
  });

  return user;
};

utils.getUserPayload = user => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  gender: user.gender,
  image: user.image,
});

utils.generateRandomId = () => {
  const uuid = v4();
  const parts = uuid.split('-');
  return `${parts[0].slice(0, 4)}-${parts[1]}-${parts[2].slice(0, 4)}-${parts[3]}`;
};

utils.timeDifference = (startDateMS, endDateMS) => {
  const difference = endDateMS - startDateMS;
  const minutes = Math.floor(difference / 1000 / 60);
  const hours = Math.floor(difference / 1000 / 60 / 60);
  const days = Math.floor(difference / 1000 / 60 / 60 / 24);
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;

  let result = '';
  if (days > 0) result += `${days} days, `;
  if (remainingHours > 0) result += `${remainingHours} hours, `;
  if (remainingMinutes >= 0) result += `${remainingMinutes} minutes`;

  return result;
};

module.exports = utils;
