import { dataInMemory as frozenData, isValidNumberInRange, getRandomFromArray } from '../utils/util.js';
import { paginateResource, findResourceById, selectFields } from '../helpers/resource.js';

// get all quotes
export const getAllQuotes = _options => {
  return paginateResource(frozenData.quotes, 'quotes', _options);
};

// get random quote(s)
export const getRandomQuote = ({ length }) => {
  const { quotes } = frozenData;

  if (!length) {
    return getRandomFromArray(quotes);
  }

  if (!isValidNumberInRange(length, 1, 10)) {
    return [];
  }

  const uniqueRandomQuotes = [];
  const quoteIds = [];

  while (uniqueRandomQuotes.length < length) {
    const randomQuote = getRandomFromArray(quotes);
    if (!quoteIds.includes(randomQuote.id)) {
      uniqueRandomQuotes.push(randomQuote);
      quoteIds.push(randomQuote.id);
    }
  }

  return uniqueRandomQuotes;
};

// get quote by id
export const getQuoteById = ({ id, select }) => {
  return selectFields(findResourceById('quotes', id, 'Quote'), select);
};
