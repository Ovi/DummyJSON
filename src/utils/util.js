import fs from 'node:fs';
import path from 'node:path';
import v8 from 'node:v8';
import { v4 } from 'uuid';
import { REQUIRED_ENV_VARIABLES, OPTIONAL_ENV_VARIABLES, httpCodes } from '../constants/index.js';
import { logWarn, logError } from '../helpers/logger.js';

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

export const dataInMemory = data;

export const isDev = process.env.NODE_ENV === 'development';

export const deepFreeze = obj => {
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
      deepFreeze(obj[prop]);
    }
  });

  return obj;
};

export const loadDataInMemory = async () => {
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
  data.categories = getSluggedData(data.categoryList, 'products', 'category');

  data.tagList = [...new Set(data.posts.flatMap(p => p.tags))];
  data.tags = getSluggedData(data.tagList, 'posts', 'tag');

  deepFreeze(data);
};

export const getObjectSubset = (obj, keys) => {
  return Object.assign({}, ...keys.map(key => ({ [key]: obj[key] })));
};

export const getMultiObjectSubset = (arr, keys) => {
  return arr.map(p => getObjectSubset(p, keys));
};

export const isNumber = num => !Number.isNaN(Number(num));

export const validateEnvVar = () => {
  const requiredUnsetEnv = REQUIRED_ENV_VARIABLES.filter(env => !(typeof process.env[env] !== 'undefined'));

  if (requiredUnsetEnv.length) {
    logError(`Required ENV variables are not set: [${requiredUnsetEnv.join(', ')}]`);
    process.exit(1);
  }

  const optionalUnsetEnv = OPTIONAL_ENV_VARIABLES.filter(env => !(typeof process.env[env] !== 'undefined'));

  if (optionalUnsetEnv.length) {
    logWarn(`Optional ENV variables are not set: [${optionalUnsetEnv.join(', ')}]`);
  }
};

export const trueTypeOf = obj => {
  return Object.prototype.toString
    .call(obj)
    .slice(8, -1)
    .toLowerCase();
};

export const isEmpty = value => {
  const type = trueTypeOf(value);

  if (value === null || value === undefined) return true;
  if (type === 'string' && value.trim() === '') return true;
  if (type === 'array' && value.length === 0) return true;
  if (type === 'object' && Object.keys(value).length === 0) return true;

  return false;
};

export const deepCopy = obj => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const copy = Array.isArray(obj) ? [] : {};
  Object.keys(obj).forEach(key => {
    copy[key] = deepCopy(obj[key]);
  });
  return copy;
};

export const getNestedValue = (obj, keys) => {
  if (!keys) {
    return null;
  }

  return keys.split('.').reduce((o, k) => (o || {})[k], obj);
};

export const limitArray = (arr, limit) => {
  return limit === 0 || limit > arr.length ? arr : arr.slice(0, limit);
};

export const sortArray = (arr, sortBy, order) => {
  const arrCopy = deepCopy(arr);

  const sortedArray = arrCopy.sort((a, b) => {
    if (a[sortBy] === b[sortBy]) return 0;
    if (order === 'asc') {
      return a[sortBy] > b[sortBy] ? 1 : -1;
    }
    return a[sortBy] < b[sortBy] ? 1 : -1;
  });

  return sortedArray;
};

export const capitalize = str => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const isValidNumberInRange = (num, start, end) => {
  const parsedNum = Number(num);
  return !Number.isNaN(parsedNum) && parsedNum >= start && parsedNum <= end;
};

export const getRandomFromArray = array => {
  return array[Math.floor(Math.random() * array.length)];
};

export const capitalizeWords = str => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const getSluggedData = (arr, resource, type) => {
  return arr.map(item => ({
    slug: item,
    name: capitalizeWords(item),
    url: `https://dummyjson.com/${resource}/${type}/${item}`,
  }));
};

export const findUserWithUsernameAndId = ({ username, id }) => {
  const user = dataInMemory.users.find(u => {
    const validUsername = u.username.toLowerCase() === username.toLowerCase();
    const validId = id.toString() === u.id.toString();

    return validUsername && validId;
  });

  return user;
};

export const getUserPayload = user => ({
  id: user.id,
  username: user.username,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  gender: user.gender,
  image: user.image,
});

export const generateRandomId = () => {
  const uuid = v4();
  const parts = uuid.split('-');
  return `${parts[0].slice(0, 4)}-${parts[1]}-${parts[2].slice(0, 4)}-${parts[3]}`;
};

export const timeDifference = (startDateMS, endDateMS) => {
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
