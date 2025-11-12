import APIError from '../utils/error.js';
import { dataInMemory as frozenData, limitArray, isValidNumberInRange, getRandomFromArray } from '../utils/util.js';

// get all quotes
export const getAllQuotes = ({ limit, skip }) => {
  let [...quotes] = frozenData.quotes;
  const total = quotes.length;

  if (skip > 0) {
    quotes = quotes.slice(skip);
  }

  quotes = limitArray(quotes, limit);

  const result = { quotes, total, skip, limit: quotes.length };

  return result;
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
export const getQuoteById = ({ id }) => {
  const quoteFrozen = frozenData.quotes.find(u => u.id.toString() === id);

  if (!quoteFrozen) {
    throw new APIError(`Quote with id '${id}' not found`, 404);
  }

  return quoteFrozen;
};
