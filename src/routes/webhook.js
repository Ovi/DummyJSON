import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import Webhook from '../models/webhook.js';
import { generateWebhookId, buildRequestPayload } from '../utils/webhook.js';
import { webhookCreateLimiter, webhookIngestLimiter } from '../utils/webhook-rate-limit.js';
import { webhookExpiresInDays } from '../constants/index.js';

const { GOOGLE_TAG_ID, BANNER_CONTENT } = process.env;

const router = Router();

const MAX_REQUESTS_PER_WEBHOOK = 100;

const commonVariables = {
  googleTagId: GOOGLE_TAG_ID,
  bannerContent: BANNER_CONTENT,
};

const sendWebhookNotFound = res => {
  res.status(404).send();
};

const setNoStoreHeaders = res => {
  res.set({
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
  });
};

const getWebhookExpiryDate = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + webhookExpiresInDays);
  return expiresAt;
};

const setWebhookExpiryHeaders = (res, expiresAt) => {
  res.set({
    'x-expires-on': expiresAt.toISOString(),
    'x-expires-in-days': webhookExpiresInDays,
  });
};

const shouldRenderWebhookInspector = req => /\btext\/html\b/i.test(req.headers.accept || '');

const findActiveWebhook = async identifier => {
  const webhook = await Webhook.findOne({ identifier });

  if (!webhook || webhook.expiresAt < new Date()) {
    return null;
  }

  return webhook;
};

const captureRequest = async (req, res, next) => {
  const { identifier } = req.params;

  try {
    const webhook = await findActiveWebhook(identifier);

    if (!webhook) {
      sendWebhookNotFound(res);
      return;
    }

    const requestId = uuidv4();
    const payload = buildRequestPayload(req);

    await Webhook.updateOne(
      { identifier },
      {
        $push: {
          requests: {
            $each: [{ requestId, ...payload }],
            $position: 0,
            $slice: MAX_REQUESTS_PER_WEBHOOK,
          },
        },
      },
    );

    setWebhookExpiryHeaders(res, webhook.expiresAt);
    res.json({ received: true, requestId });
  } catch (error) {
    next(error);
  }
};

router.post('/create', webhookCreateLimiter, async (req, res, next) => {
  try {
    const identifier = await generateWebhookId();

    if (!identifier) {
      res.status(500).send('Failed to generate unique identifier');
      return;
    }

    const expiresAt = getWebhookExpiryDate();
    const creatorIP = req.clientInfo?.ip;

    const webhook = new Webhook({ identifier, creatorIP, expiresAt });
    await webhook.save();

    res.json({
      identifier,
      url: `https://dummyjson.com/webhook/${identifier}`,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:identifier/requests', async (req, res, next) => {
  const { identifier } = req.params;

  try {
    const webhook = await findActiveWebhook(identifier);

    if (!webhook) {
      sendWebhookNotFound(res);
      return;
    }

    setNoStoreHeaders(res);
    setWebhookExpiryHeaders(res, webhook.expiresAt);

    res.json({
      identifier: webhook.identifier,
      expiresAt: webhook.expiresAt.toISOString(),
      requests: webhook.requests,
    });
  } catch (error) {
    next(error);
  }
});

router.delete('/:identifier/requests/:requestId', async (req, res, next) => {
  const { identifier, requestId } = req.params;

  try {
    const webhook = await findActiveWebhook(identifier);

    if (!webhook) {
      sendWebhookNotFound(res);
      return;
    }

    const result = await Webhook.updateOne({ identifier }, { $pull: { requests: { requestId } } });

    if (!result.modifiedCount) {
      sendWebhookNotFound(res);
      return;
    }

    setNoStoreHeaders(res);
    setWebhookExpiryHeaders(res, webhook.expiresAt);
    res.json({ deleted: true });
  } catch (error) {
    next(error);
  }
});

router.get('/:identifier', async (req, res, next) => {
  const { identifier } = req.params;

  if (shouldRenderWebhookInspector(req)) {
    try {
      const webhook = await findActiveWebhook(identifier);

      if (!webhook) {
        res.status(404).render('404', commonVariables);
        return;
      }

      res.render('webhook', {
        ...commonVariables,
        identifier,
        expiresAt: webhook.expiresAt.toISOString(),
        requests: webhook.requests,
        canonical: `https://dummyjson.com/webhook/${identifier}`,
      });
    } catch (error) {
      next(error);
    }

    return;
  }

  webhookIngestLimiter(req, res, () => captureRequest(req, res, next));
});

router.all('/:identifier', webhookIngestLimiter, captureRequest);

export default router;
