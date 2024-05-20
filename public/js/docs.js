formatCode('code');
highlightJSCodeBlocks();
addListenerOnShowOutputButton('.show-output.btn');
handleDocLinksClick('.docs-nav');
handleResourcesTitleClick('.res-title');
replaceInlineCode('.res-tip');
enableClickToSelect();

function formatCode(selector) {
  document.querySelectorAll(selector).forEach(codeElement => {
    const lines = codeElement.textContent.split('\n');

    // Find the minimum leading whitespace characters in each line
    const minIndent = lines.reduce((min, line) => {
      if (line.trim().length === 0) return min; // Skip empty lines
      const leadingWhitespace = line.match(/^\s*/)[0].length;
      return Math.min(min, leadingWhitespace);
    }, Infinity);

    // Remove the minimum leading whitespace characters from each line
    const formattedLines = lines.map(line => line.substring(minIndent));

    // Skip the first empty line if present
    if (formattedLines[0].trim() === '') {
      formattedLines.shift();
    }

    codeElement.textContent = formattedLines.join('\n');
  });
}

function highlightJSCodeBlocks() {
  // manually highlight code blocks if Prism.js is not loaded yet
  let tries = 0;
  const interval = setInterval(() => {
    const codeBlocks = [...document.querySelectorAll('pre')];
    const everyCodeblockIsHighlighted = codeBlocks.every(codeBlock => {
      if (!codeBlock.querySelector('[class^="language-"]')) return true;

      return [...codeBlock.classList].find(className =>
        className.startsWith('language-'),
      );
    });

    if (everyCodeblockIsHighlighted) return clearInterval(interval);

    if (window.Prism && !everyCodeblockIsHighlighted) {
      window.Prism.highlightAll();
      clearInterval(interval);
    }

    if (tries++ > 30) {
      console.debug('Can not load Prism.js or code blocks are not found.');
      clearInterval(interval);
    }
  }, 100);
}

function addListenerOnShowOutputButton(selector) {
  document.querySelectorAll(selector).forEach(btn => {
    btn.addEventListener('click', function() {
      const output = this.parentElement?.querySelector('.output');
      output.classList.toggle('active');
      this.textContent = output.classList.contains('active')
        ? 'Hide Output'
        : 'Show Output';
    });
  });
}

function handleDocLinksClick(selector) {
  // prevent href redirect of any a tag in docs menu
  document
    .querySelector(selector)
    ?.querySelectorAll('a')
    .forEach(a => {
      a.addEventListener('click', function(e) {
        // e.preventDefault();

        // if has child menu
        if (!this.nextElementSibling?.classList?.contains('child-menu')) {
          return;
        }

        if (this.classList?.contains('parent-menu-item')) {
          const url = new URL(this.href);
          const thisPathName = url.pathname.endsWith('/')
            ? this.pathname.slice(0, -1)
            : this.pathname;

          const windowPathName = window.location.pathname.endsWith('/')
            ? window.location.pathname.slice(0, -1)
            : window.location.pathname;

          if (windowPathName === thisPathName) {
            e.preventDefault();
          }

          const hasClass = this.classList.contains('active');

          document
            .querySelectorAll('a')
            .forEach(a => a.classList.remove('active'));
          if (!hasClass) this.classList.add('active');
        } else {
          document
            .querySelectorAll('.child-menu a')
            .forEach(a => a.classList.remove('active'));

          _markParentAndChildActive(this);
        }
      });
    });
}

function handleResourcesTitleClick(selector) {
  document.querySelectorAll(selector).forEach(a => {
    a.addEventListener('click', function() {
      const hash = this.href.split('#')[1];
      selectNavItem(`#${hash}`);
    });
  });
}

function replaceInlineCode(selector) {
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    // Use a regular expression to match text within backticks
    const regex = /`([^`]+)`/g;

    // Replace the matched text with a span element having the class 'inline-code'
    element.innerHTML = element.innerHTML.replace(regex, (match, p1) => {
      return `<span class="inline-code">${p1}</span>`;
    });
  });
}

function enableClickToSelect() {
  function handleSelect(event) {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(event.target);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  document.querySelectorAll('.inline-code').forEach(codeElement => {
    codeElement.addEventListener('click', handleSelect);
  });

  document.querySelectorAll('code').forEach(codeElement => {
    codeElement.addEventListener('click', handleSelect);
  });
}

function selectNavItem(hash) {
  if (!hash) return;

  const [resource] = hash.replace('#', '')?.split('-') || [];

  const selectorText1 = `.docs-nav a[href="/docs/${hash}"]`;
  const selectorText2 = `.docs-nav a[href="/docs/${resource}/${hash}"]`;

  const selector1 = document.querySelector(selectorText1);
  const selector2 = document.querySelector(selectorText2);

  if (!selector1 && !selector2) return;

  const element = selector1 || selector2;

  document
    .querySelectorAll('.child-menu a')
    .forEach(a => a.classList.remove('active'));

  element.classList.add('active');

  element
    .closest('li')
    .closest('.child-menu')
    .closest('li')
    .querySelector('.parent-menu-item')
    .classList.add('active');
}
