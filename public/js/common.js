/* eslint-disable no-inner-declarations */
/* eslint-disable no-undef */

try {
  hljs.highlightAll();

  [...document.querySelectorAll('a[href*="#"]')].forEach(el => {
    el.addEventListener('click', smoothScroll);
  });

  function smoothScroll(e) {
    if (e.shiftKey || e.ctrlKey) return;

    e.preventDefault();

    const target = this.getAttribute('href');

    const [finalUri, finalHash] = target.split('#');

    if (finalUri && finalUri !== window.location.pathname) {
      window.location.href = target;
      return;
    }

    const el = document.getElementById(finalHash);

    scrollToElement(el);
  }
} catch (error) {
  console.log(error);
}

function scrollToElement(element, parent = window) {
  const position = element.getBoundingClientRect();

  parent.scrollTo(position.left, position.top + window.scrollY - 80);
}
