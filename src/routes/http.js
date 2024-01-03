const router = require('express').Router();
const { getHttpStatus } = require('../controllers/http');

router.use('/:httpCode/:message?', (req, res) => {
  const data = getHttpStatus(req.params);

  res.setHeader('Content-Type', getHttpCodeContentType(data.status));
  res.status(data.status).send(data.message ? data : undefined);
});

module.exports = router;

function getHttpCodeContentType(status) {
  return status >= 400 ? 'application/problem+json' : 'application/json';
}
