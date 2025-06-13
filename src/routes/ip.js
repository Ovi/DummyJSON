const router = require('express').Router();
const extractClientInfo = require('../utils/client-info');

router.get('/', (req, res) => {
  res.send(extractClientInfo(req));
});

module.exports = router;
