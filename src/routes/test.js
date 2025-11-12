import { Router } from 'express';

const router = Router();

router.use('/', (req, res) => {
  res.status(200).send({ status: 'ok', method: req.method });
});

export default router;
