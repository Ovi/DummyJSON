import APIError from '../utils/error.js';
import {
  dataInMemory as frozenData,
  getMultiObjectSubset,
  getNestedValue,
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

// keep items whose `dateKey` (ISO string) falls within [after, before]; bounds are epoch ms or undefined
export const filterByDateRange = (items, dateKey, { after, before } = {}) => {
  if (after === undefined && before === undefined) return items;

  return items.filter(item => {
    const time = Date.parse(getNestedValue(item, dateKey));
    if (Number.isNaN(time)) return false;
    if (after !== undefined && time < after) return false;
    if (before !== undefined && time > before) return false;
    return true;
  });
};

export const markDeleted = item => ({ ...item, isDeleted: true, deletedOn: new Date().toISOString() });

export const nextId = collection => frozenData[collection].length + 1;
