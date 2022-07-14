const router = require('express').Router();
const { getHttpStatus } = require('../controllers/http');

router.use('/:httpCode/:message?', (req, res) => {
  const data = getHttpStatus(req.params);
  res.status(data.status).send(data);
});

module.exports = router;
