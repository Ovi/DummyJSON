import { Router } from 'express';
import { generateTotp } from '../controllers/totp.js';

const { GOOGLE_TAG_ID, BANNER_CONTENT } = process.env;

const router = Router();

const commonVariables = {
  googleTagId: GOOGLE_TAG_ID,
  bannerContent: BANNER_CONTENT,
};

router.get('/', (req, res, next) => {
  try {
    const { key } = req.query;

    if (key) {
      res.send(generateTotp({ key }));
      return;
    }

    res.render('2fa', commonVariables);
  } catch (error) {
    next(error);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { key } = req.body;
    res.send(generateTotp({ key }));
  } catch (error) {
    next(error);
  }
});

export default router;
