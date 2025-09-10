const router = require('express').Router();
const extractClientInfo = require('../utils/client-info');

router.get('/', (req, res) => {
  res.send(extractClientInfo(req).ip);
});

router.get('/ua', (req, res) => {
  res.send(extractClientInfo(req).userAgent);
});

module.exports = router;
