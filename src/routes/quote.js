const router = require('express').Router();
const { getAllQuotes, getRandomQuote, getQuoteById } = require('../controllers/quote');

// get all quotes
router.get('/', (req, res) => {
  res.send(getAllQuotes({ ...req._options }));
});

// get random quote(s)
router.get('/random/:length?', (req, res) => {
  res.send(getRandomQuote({ ...req.params }));
});

// get quote by id
router.get('/:id', (req, res) => {
  res.send(getQuoteById({ ...req.params }));
});

module.exports = router;
