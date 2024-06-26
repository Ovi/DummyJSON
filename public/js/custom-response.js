let creatingCustomAPI = false;
let customRequestMode = 'GET';

handleHomePageMethodSelector('.method-selector-el');
handlePreCodeInput();
handleCopyURLOnInputClick();
handlePrettifyJSONCode();

function handleHomePageMethodSelector(selector) {
  const selectorEl = document.querySelector(selector);
  if (!selectorEl) return;

  selectorEl.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.toggle('expanded');

    const method = e.target.getAttribute('for');

    if (method) {
      document.getElementById(method).checked = true;
      customRequestMode = method;
    }
  });

  document.addEventListener('click', function() {
    const expandedEl = document.querySelector(selector);
    if (expandedEl) expandedEl.classList.remove('expanded');
  });
}

function handlePreCodeInput() {
  const customCodeEl = document.querySelector('.custom-response .json-code');
  if (!customCodeEl) return;

  const htmlMarkup = highlightJSON({ foo: 'bar' });
  customCodeEl.innerHTML = htmlMarkup;
  customCodeEl.querySelector('code').setAttribute('contentEditable', 'true');

  customCodeEl.addEventListener('keydown', function(event) {
    // if tab key is pressed, insert 2 spaces
    if (event.keyCode === 9) {
      event.preventDefault();

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode('  ');
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);

      selection.removeAllRanges();
      selection.addRange(range);
    }

    // if enter key is pressed, insert newline and add 2 spaces
    if (event.keyCode === 13) {
      event.preventDefault();

      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const textNode = document.createTextNode('\n  ');
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);

      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  // on paste, paste as plain text
  customCodeEl.addEventListener('paste', function(event) {
    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, text);
  });
}

function handlePrettifyJSONCode() {
  const prettifyBtn = document.querySelector('.prettify-btn');
  if (!prettifyBtn) return;

  prettifyBtn.addEventListener('click', function(e) {
    try {
      const customCodeEl = document.querySelector('.custom-response .json-code');

      const htmlMarkup = highlightJSON(JSON.parse(customCodeEl.textContent));
      customCodeEl.innerHTML = htmlMarkup;
      customCodeEl.querySelector('code').setAttribute('contentEditable', 'true');
    } catch (error) {
      alert('Invalid JSON code');
    }
  });
}

async function handleCopyURLOnInputClick() {
  const xCopyEl = document.querySelector('.x-copy');
  if (!xCopyEl) return;

  xCopyEl.addEventListener('click', async function() {
    const input = this.querySelector('input');

    if (!input.value) return;

    input.select();

    const success = await copyTextToClipboard(input.value);
    if (!success) return;

    input.parentElement.classList.add('copied');
    setTimeout(() => input.parentElement.classList.remove('copied'), 1000);
  });
}

async function generateCustomAPI() {
  if (creatingCustomAPI) return;

  creatingCustomAPI = true;

  const customCodeEl = document.querySelector('.custom-response .json-code');
  const btn = document.querySelector('.custom-response .btn');
  const btnContent = btn.innerHTML;

  try {
    const parsed = JSON.parse(customCodeEl.textContent);

    // replace button with text "Generating..." and keep the image
    btn.innerHTML = btnContent.replace('Generate Now', 'Generating...');

    const payload = {
      json: parsed,
      method: customRequestMode,
    };

    const payloadSize = new Blob([JSON.stringify(payload)]).size;
    const maxSize = 300 * 1024; // 300 KB

    if (payloadSize > maxSize) {
      alert('Payload Too Large.');
      return;
    }

    const response = await fetch('/c/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    document.querySelector('.custom-response .x-copy input').value = data.url;
    customRequestMode = 'GET';
  } catch (err) {
    alert('Invalid JSON code');
  } finally {
    setTimeout(() => {
      btn.innerHTML = btnContent;
      creatingCustomAPI = false;
    }, 100);
  }
}
