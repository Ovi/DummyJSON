const TOTP_TIMER_RADIUS = 17;
const TOTP_TIMER_CIRCUMFERENCE = 2 * Math.PI * TOTP_TIMER_RADIUS;

let totpRefreshTimeout = null;
let totpUrgentTimeout = null;
let totpSecondsInterval = null;

const totpKeyInput = document.getElementById('totp-key');
const totpGenerateBtn = document.getElementById('totp-generate-btn');
const totpResult = document.getElementById('totp-result');
const totpCode = document.getElementById('totp-code');
const totpTimer = document.getElementById('totp-timer');
const totpTimerProgress = document.getElementById('totp-timer-progress');
const totpTimerSeconds = document.getElementById('totp-timer-seconds');
const totpError = document.getElementById('totp-error');

if (totpGenerateBtn) {
  totpGenerateBtn.addEventListener('click', generateTotpCode);
}

if (totpKeyInput) {
  totpKeyInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      generateTotpCode();
    }
  });
}

handleTotpCopyClick();

function handleTotpCopyClick() {
  const xCopyEl = document.querySelector('.totp-2fa .x-copy');
  if (!xCopyEl) return;

  xCopyEl.addEventListener('click', async function() {
    const input = this.querySelector('input');

    if (!input.value) return;

    input.select();

    const success = await copyTextToClipboard(input.value);
    if (!success) return;

    this.classList.add('copied');
    setTimeout(() => this.classList.remove('copied'), 1000);
  });
}

async function generateTotpCode() {
  const key = totpKeyInput.value.trim();

  if (!key) {
    showTotpError('Please enter a secret key');
    return;
  }

  totpGenerateBtn.disabled = true;

  try {
    const response = await fetch('/2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    });

    const data = await response.json();

    if (!response.ok) {
      showTotpError(data.message || 'Failed to generate code');
      return;
    }

    hideTotpError();
    showTotpResult(data);
  } catch {
    showTotpError('Failed to generate code. Please try again.');
  } finally {
    totpGenerateBtn.disabled = false;
  }
}

function showTotpResult({ totp, expiresIn, period }) {
  totpCode.value = totp;
  totpResult.hidden = false;
  startTotpCountdown(expiresIn, period);
}

function showTotpError(message) {
  totpError.textContent = message;
  totpError.hidden = false;
  totpResult.hidden = true;
  clearTotpCountdown();
}

function hideTotpError() {
  totpError.hidden = true;
  totpError.textContent = '';
}

function startTotpCountdown(seconds, period = 30) {
  clearTotpCountdown();

  if (!totpTimerProgress || !totpTimer) return;

  const startOffset = TOTP_TIMER_CIRCUMFERENCE * (1 - seconds / period);
  let remaining = seconds;

  totpTimerSeconds.textContent = remaining;
  totpTimerProgress.style.strokeDasharray = `${TOTP_TIMER_CIRCUMFERENCE}`;
  totpTimerProgress.style.transition = 'none';
  totpTimerProgress.style.strokeDashoffset = `${startOffset}`;
  totpTimer.classList.toggle('totp-timer--urgent', seconds <= 5);

  totpTimerProgress.getBoundingClientRect();

  totpTimerProgress.style.transition = `stroke-dashoffset ${seconds}s linear, stroke 0.4s ease`;
  totpTimerProgress.style.strokeDashoffset = `${TOTP_TIMER_CIRCUMFERENCE}`;

  totpSecondsInterval = setInterval(() => {
    remaining -= 1;

    if (remaining <= 0) {
      clearInterval(totpSecondsInterval);
      totpSecondsInterval = null;
      return;
    }

    totpTimerSeconds.textContent = remaining;
    totpTimer.classList.toggle('totp-timer--urgent', remaining <= 5);
  }, 1000);

  if (seconds > 5) {
    totpUrgentTimeout = setTimeout(() => {
      totpTimer.classList.add('totp-timer--urgent');
    }, (seconds - 5) * 1000);
  }

  totpRefreshTimeout = setTimeout(() => {
    clearTotpCountdown();
    generateTotpCode();
  }, seconds * 1000);
}

function clearTotpCountdown() {
  if (totpRefreshTimeout) {
    clearTimeout(totpRefreshTimeout);
    totpRefreshTimeout = null;
  }

  if (totpUrgentTimeout) {
    clearTimeout(totpUrgentTimeout);
    totpUrgentTimeout = null;
  }

  if (totpSecondsInterval) {
    clearInterval(totpSecondsInterval);
    totpSecondsInterval = null;
  }

  totpTimer?.classList.remove('totp-timer--urgent');
}
