let creatingWebhook = false;
let pollInterval = null;
let lastRenderedRequestIds = '';

const webhookTool = document.querySelector('.webhook-tool');

if (webhookTool) {
  const identifier = webhookTool.dataset.identifier;
  const expiresAt = webhookTool.dataset.expiresAt;

  if (!identifier) {
    handleCreateWebhook();
  } else {
    initInspector(identifier, expiresAt);
  }
}

function initInspector(identifier, expiresAt) {
  handleCopyURLOnInputClick();
  updateExpiryBadge(expiresAt);
  renderInitialRequests(identifier);

  const syncPollingWithVisibility = () => {
    if (document.visibilityState === 'visible') {
      startPolling(identifier, expiresAt);
    } else {
      stopPolling();
    }
  };

  syncPollingWithVisibility();
  document.addEventListener('visibilitychange', syncPollingWithVisibility);
}

function renderInitialRequests(identifier) {
  const initialRequestsEl = document.getElementById('webhook-initial-requests');
  if (!initialRequestsEl) return;

  try {
    const requests = JSON.parse(initialRequestsEl.textContent);
    renderRequests(identifier, requests);
  } catch (error) {
    // ignore malformed bootstrap payload
  }
}

function handleCreateWebhook() {
  const createBtn = document.getElementById('create-webhook-btn');
  if (!createBtn) return;

  createBtn.addEventListener('click', async () => {
    if (creatingWebhook) return;

    creatingWebhook = true;
    const btnContent = createBtn.innerHTML;

    try {
      createBtn.innerHTML = btnContent.replace('Create Webhook', 'Creating...');

      const response = await fetch('/webhook/create', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        alert('Failed to create webhook. Please try again.');
        return;
      }

      window.location.href = `/webhook/${data.identifier}`;
    } catch (error) {
      alert('Failed to create webhook. Please try again.');
    } finally {
      setTimeout(() => {
        createBtn.innerHTML = btnContent;
        creatingWebhook = false;
      }, 100);
    }
  });
}

function handleCopyURLOnInputClick() {
  const xCopyEl = document.querySelector('.x-copy');
  if (!xCopyEl) return;

  xCopyEl.addEventListener('click', async () => {
    const input = xCopyEl.querySelector('input');
    if (!input.value) return;

    input.select();

    const success = await copyTextToClipboard(input.value);
    if (!success) return;

    xCopyEl.classList.add('copied');
    setTimeout(() => xCopyEl.classList.remove('copied'), 1000);
  });
}

function updateExpiryBadge(expiresAtISO) {
  const expiryEl = document.getElementById('webhook-expiry');
  if (!expiryEl || !expiresAtISO) return;

  const expiresAt = new Date(expiresAtISO);
  const now = new Date();

  if (expiresAt <= now) {
    expiryEl.textContent = 'This webhook has expired.';
    expiryEl.classList.add('webhook-expiry--expired');
    return;
  }

  const hoursLeft = Math.max(1, Math.ceil((expiresAt - now) / (1000 * 60 * 60)));
  expiryEl.textContent = `Expires in ${hoursLeft} hour${hoursLeft === 1 ? '' : 's'}`;
}

function startPolling(identifier, expiresAtISO) {
  stopPolling();

  if (document.visibilityState === 'hidden') {
    return;
  }

  if (new Date(expiresAtISO) <= new Date()) {
    updateExpiryBadge(expiresAtISO);
    return;
  }

  fetchRequests(identifier);
  pollInterval = setInterval(() => fetchRequests(identifier), 2000);
}

function stopPolling() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
  }
}

async function fetchRequests(identifier) {
  try {
    const response = await fetch(`/webhook/${identifier}/requests`);
    if (!response.ok) {
      stopPolling();
      updateExpiryBadge(new Date(0).toISOString());
      return;
    }

    const data = await response.json();
    updateExpiryBadge(data.expiresAt);
    renderRequests(identifier, data.requests || []);
  } catch (error) {
    // ignore transient network errors during polling
  }
}

function renderRequests(identifier, requests) {
  const container = document.getElementById('webhook-requests');
  const emptyEl = document.getElementById('webhook-empty');
  if (!container) return;

  const requestIds = requests.map(request => request.requestId).join(',');

  if (requestIds === lastRenderedRequestIds) {
    return;
  }

  lastRenderedRequestIds = requestIds;

  container.querySelectorAll('.webhook-card').forEach(card => card.remove());

  if (!requests.length) {
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  requests.forEach(request => {
    try {
      const card = createRequestCard(identifier, request);
      container.insertBefore(card, emptyEl || null);
    } catch (error) {
      // skip cards that fail to render
    }
  });
}

function createRequestCard(identifier, request) {
  const card = document.createElement('article');
  card.className = 'webhook-card';
  card.dataset.requestId = request.requestId;

  const payload = buildCardPayload(request);

  const methodClass = `webhook-card__method--${webhookEscapeHtml((request.method || 'GET').toLowerCase())}`;

  const header = document.createElement('div');
  header.className = 'webhook-card__header';
  header.innerHTML = `
    <span class="webhook-card__method ${methodClass}"></span>
    <div class="webhook-card__meta">
      <time class="webhook-card__time"></time>
      <span class="webhook-card__request-id"></span>
    </div>
    <div class="webhook-card__menu">
      <button class="webhook-card__menu-btn" type="button" aria-label="Request actions">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="5" cy="12" r="1.6" fill="currentColor"></circle>
          <circle cx="12" cy="12" r="1.6" fill="currentColor"></circle>
          <circle cx="19" cy="12" r="1.6" fill="currentColor"></circle>
        </svg>
      </button>
      <div class="webhook-card__dropdown">
        <button type="button" data-action="copy">Copy JSON</button>
        <button type="button" data-action="delete">Delete</button>
      </div>
    </div>
  `;

  header.querySelector('.webhook-card__method').textContent = request.method || 'GET';

  const timeEl = header.querySelector('.webhook-card__time');
  timeEl.dateTime = request.receivedAt;
  timeEl.title = formatAbsoluteTime(request.receivedAt);
  timeEl.textContent = formatRelativeTime(request.receivedAt);

  const requestIdEl = header.querySelector('.webhook-card__request-id');
  requestIdEl.textContent = request.requestId;
  requestIdEl.title = request.requestId;

  const pre = document.createElement('pre');
  pre.className = 'webhook-card__body';
  const code = document.createElement('code');
  code.innerHTML = formatRequestJson(payload);
  pre.appendChild(code);

  card.appendChild(header);
  card.appendChild(pre);

  const menuBtn = card.querySelector('.webhook-card__menu-btn');
  const dropdown = card.querySelector('.webhook-card__dropdown');
  const copyBtn = card.querySelector('[data-action="copy"]');
  const deleteBtn = card.querySelector('[data-action="delete"]');

  menuBtn.addEventListener('click', e => {
    e.stopPropagation();
    document.querySelectorAll('.webhook-card__menu.open').forEach(menu => {
      if (menu !== card.querySelector('.webhook-card__menu')) {
        menu.classList.remove('open');
      }
    });
    card.querySelector('.webhook-card__menu').classList.toggle('open');
  });

  copyBtn.addEventListener('click', async e => {
    e.stopPropagation();
    await copyTextToClipboard(JSON.stringify(payload, null, 2));
    card.querySelector('.webhook-card__menu').classList.remove('open');
  });

  deleteBtn.addEventListener('click', async e => {
    e.stopPropagation();
    await deleteRequest(identifier, request.requestId, card);
    card.querySelector('.webhook-card__menu').classList.remove('open');
  });

  document.addEventListener('click', () => {
    card.querySelector('.webhook-card__menu').classList.remove('open');
  });

  return card;
}

async function deleteRequest(identifier, requestId, cardEl) {
  try {
    const response = await fetch(`/webhook/${identifier}/requests/${requestId}`, {
      method: 'DELETE',
    });

    if (!response.ok) return;

    lastRenderedRequestIds = '';
    cardEl.remove();

    const container = document.getElementById('webhook-requests');
    const emptyEl = document.getElementById('webhook-empty');
    const hasCards = container && container.querySelector('.webhook-card');

    if (!hasCards && emptyEl) {
      emptyEl.style.display = 'block';
    }

    fetchRequests(identifier);
  } catch (error) {
    // ignore delete errors
  }
}

function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
}

function formatAbsoluteTime(dateString) {
  return new Date(dateString).toLocaleString();
}

function isEmptyPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
}

function omitUndefinedDeep(value) {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) {
    const items = value.map(omitUndefinedDeep).filter(item => item !== undefined);
    return items.length ? items : undefined;
  }

  if (value !== null && typeof value === 'object') {
    const compacted = Object.entries(value).reduce((acc, [key, val]) => {
      const next = omitUndefinedDeep(val);
      if (next === undefined || isEmptyPlainObject(next)) return acc;
      acc[key] = next;
      return acc;
    }, {});

    return Object.keys(compacted).length ? compacted : undefined;
  }

  return value;
}

function buildCardPayload(request) {
  return omitUndefinedDeep({
    method: request.method,
    headers: request.headers,
    query: request.query,
    body: request.body,
    receivedAt: request.receivedAt,
    _meta: request._meta,
  }) || {};
}

function formatRequestJson(payload) {
  if (typeof highlightJSON === 'function') {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = highlightJSON(payload);
    return wrapper.querySelector('code')?.innerHTML || webhookEscapeHtml(JSON.stringify(payload, null, 2));
  }

  return webhookEscapeHtml(JSON.stringify(payload, null, 2));
}

function webhookEscapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
