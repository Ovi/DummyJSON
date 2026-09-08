import APIError from '../utils/error.js';
import {
  dataInMemory as frozenData,
  getMultiObjectSubset,
  getObjectSubset,
  limitArray,
  sortArray,
} from '../utils/util.js';

// sort -> skip -> limit -> select, wrapped in the standard list envelope
export const paginateResource = (items, name, { limit, skip, select, sortBy, order } = {}) => {
  const total = items.length;
  let result = sortArray(items, sortBy, order);

  if (skip > 0) result = result.slice(skip);

  result = limitArray(result, limit);

  if (select) result = getMultiObjectSubset(result, select);

  return { [name]: result, total, skip, limit: result.length };
};

export const findResourceById = (collection, id, label) => {
  const found = frozenData[collection].find(item => item.id.toString() === String(id));

  if (!found) {
    throw new APIError(`${label} with id '${id}' not found`, 404);
  }

  return { ...found };
};

export const selectFields = (item, select) => (select ? getObjectSubset(item, select) : item);

export const markDeleted = item => ({ ...item, isDeleted: true, deletedOn: new Date().toISOString() });

export const nextId = collection => frozenData[collection].length + 1;
