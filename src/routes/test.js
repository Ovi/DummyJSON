const router = require('express').Router();

router.use('/', (req, res) => {
  res.send({ status: 'ok', method: req.method });
});

module.exports = router;
