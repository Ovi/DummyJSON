import { Router } from 'express';
import extractClientInfo from '../utils/client-info.js';

const router = Router();

router.get('/', (req, res) => {
  res.send(extractClientInfo(req));
});

export default router;
