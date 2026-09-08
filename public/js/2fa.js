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
const totpSection = document.querySelector('.totp-2fa');
const totpQrFileInput = document.getElementById('totp-qr-file');
const totpQrUploadBtn = document.getElementById('totp-qr-upload-btn');

const JSQR_SRC = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js';
const JSQR_INTEGRITY = 'sha384-b5Ya4Bq3qCyz39m2ISh+4DxjAIljdeFwK/BsXLuj9gugaNwAcj/ia15fxNZL9Nlx';
let jsQrLoadPromise = null;

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
handleTotpQrInputs();

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

function handleTotpQrInputs() {
  if (!totpSection || !totpQrFileInput) return;

  totpQrUploadBtn.addEventListener('click', () => totpQrFileInput.click());

  totpQrFileInput.addEventListener('change', () => {
    const [file] = totpQrFileInput.files;
    totpQrFileInput.value = '';
    if (file) decodeTotpQrImage(file);
  });

  // Ctrl/Cmd+V anywhere on the page with an image in the clipboard
  document.addEventListener('paste', event => {
    const file = getImageFromDataTransfer(event.clipboardData);
    if (!file) return;

    event.preventDefault();
    decodeTotpQrImage(file);
  });

  document.addEventListener('dragover', event => {
    if (!hasFilesInDataTransfer(event.dataTransfer)) return;

    event.preventDefault();
    totpSection.classList.add('totp-dragover');
  });

  document.addEventListener('dragleave', event => {
    if (event.relatedTarget === null) totpSection.classList.remove('totp-dragover');
  });

  document.addEventListener('drop', event => {
    totpSection.classList.remove('totp-dragover');
    if (!hasFilesInDataTransfer(event.dataTransfer)) return;

    event.preventDefault();

    const file = getImageFromDataTransfer(event.dataTransfer);
    if (file) {
      decodeTotpQrImage(file);
    } else {
      showTotpError('Please drop an image file containing a QR code');
    }
  });
}

function hasFilesInDataTransfer(dataTransfer) {
  return Boolean(dataTransfer && Array.from(dataTransfer.types || []).includes('Files'));
}

function getImageFromDataTransfer(dataTransfer) {
  if (!dataTransfer) return null;

  const items = Array.from(dataTransfer.items || []);
  const imageItem = items.find(item => item.kind === 'file' && item.type.startsWith('image/'));
  if (imageItem) return imageItem.getAsFile();

  const files = Array.from(dataTransfer.files || []);
  return files.find(file => file.type.startsWith('image/')) || null;
}

async function decodeTotpQrImage(blob) {
  setTotpQrBusy(true);

  try {
    const image = await loadImageFromBlob(blob);
    const decoded = await readQrCode(image);

    if (!decoded) {
      showTotpError('No QR code found in the image. Try a clearer or larger image.');
      return;
    }

    const value = decoded.trim();
    if (!/^otpauth:\/\//i.test(value) && !/^[a-z2-7\s-]+=*$/i.test(value)) {
      showTotpError('QR code does not contain a TOTP secret');
      return;
    }

    totpKeyInput.value = value;
    hideTotpError();
    await generateTotpCode();
  } catch {
    showTotpError('Could not read the image. Please try another file.');
  } finally {
    setTotpQrBusy(false);
  }
}

function setTotpQrBusy(busy) {
  totpQrUploadBtn.disabled = busy;
}

function loadImageFromBlob(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Invalid image'));
    };
    image.src = url;
  });
}

async function readQrCode(image) {
  if ('BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const codes = await detector.detect(image);
      if (codes.length) return codes[0].rawValue;
    } catch {
      // fall through to jsQR
    }
  }

  const jsQR = await loadJsQR();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;

  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  const result = jsQR(data, width, height);

  return result?.data || null;
}

function loadJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);

  if (!jsQrLoadPromise) {
    jsQrLoadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = JSQR_SRC;
      script.integrity = JSQR_INTEGRITY;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(window.jsQR);
      script.onerror = () => {
        jsQrLoadPromise = null;
        reject(new Error('Failed to load QR decoder'));
      };
      document.head.appendChild(script);
    });
  }

  return jsQrLoadPromise;
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
