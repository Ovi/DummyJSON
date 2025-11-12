import { Router } from 'express';
import { getHttpStatus } from '../controllers/http.js';

const router = Router();

router.use('/:httpCode/:message?', (req, res) => {
  const data = getHttpStatus(req.params);

  res.setHeader('Content-Type', getHttpCodeContentType(data.status));
  res.status(data.status).send(data.message ? data : undefined);
});

export default router;

function getHttpCodeContentType(status) {
  return status >= 400 ? 'application/problem+json' : 'application/json';
}
