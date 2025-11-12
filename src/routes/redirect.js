import { Router } from 'express';

const router = Router();

router.get('/image', (req, res) => {
  res.status(301).redirect('/docs/image');
});

router.get('/c', (req, res) => {
  res.status(301).redirect('/custom-response');
});

export default router;
