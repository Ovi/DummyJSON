import { log, logError } from '../helpers/logger.js';

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;

export const purgeCloudflareCache = async () => {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) return false;

  try {
    const response = await fetch(`https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ purge_everything: true }),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success !== true) {
      logError('Cloudflare cache purge failed', { status: response.status, errors: data.errors });
      return false;
    }

    log('Cloudflare cache purged');
    return true;
  } catch (error) {
    logError('Cloudflare cache purge request errored', { error: error.message });
    return false;
  }
};

// Purge shortly after boot so the new container is already receiving traffic
export const schedulePurgeCloudflareCacheOnBoot = () => {
  if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) return;

  const delay = 15000;
  log(`Cloudflare cache purge scheduled in ${delay}ms`);

  setTimeout(purgeCloudflareCache, delay).unref();
};
