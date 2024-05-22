const router = require('express').Router();
const { generateIcon } = require('../controllers/icon');

// generate icon
router.get('/:hash?/:size?', (req, res) => {
  const { hash = 'DummyJSON', size = '100' } = req.params;
  const { type } = req.query;

  const icon = generateIcon({ hash, size, type });
  res.set({
    'Content-Type': `image/${type || 'png'}`,
    'Content-Disposition': 'inline',
    'Cache-Control': 'public, max-age=31557600',
  });

  res.send(icon);
});

module.exports = router;
