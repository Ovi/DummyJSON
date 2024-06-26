const router = require('express').Router();

router.use('/', (req, res) => {
  res.status(200).send({ status: 'ok', method: req.method });
});

module.exports = router;
