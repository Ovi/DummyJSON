const APIError = require('../utils/error');
const { dataInMemory: frozenData, limitArray } = require('../utils/util');

const controller = {};

// get all quotes
controller.getAllQuotes = ({ limit, skip }) => {
  let [...quotes] = frozenData.quotes;
  const total = quotes.length;

  if (skip > 0) {
    quotes = quotes.slice(skip);
  }

  quotes = limitArray(quotes, limit);

  const result = { quotes, total, skip, limit: quotes.length };

  return result;
};

// get random quote
controller.getRandomQuote = () => {
  const { quotes } = frozenData;

  const randomIdx = Math.floor(Math.random() * quotes.length);

  return quotes[randomIdx];
};

// get quote by id
controller.getQuoteById = ({ id }) => {
  const quoteFrozen = frozenData.quotes.find(u => u.id.toString() === id);

  if (!quoteFrozen) {
    throw new APIError(`Quote with id '${id}' not found`, 404);
  }

  return quoteFrozen;
};

module.exports = controller;
