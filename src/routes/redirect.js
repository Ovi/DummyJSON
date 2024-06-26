const router = require('express').Router();

router.get('/image', (req, res) => {
  res.status(301).redirect('/docs/image');
});

router.get('/c', (req, res) => {
  res.status(301).redirect('/custom-response');
});

module.exports = router;
