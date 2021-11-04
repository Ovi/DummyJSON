/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

// store the hash right away before the browser can start scrolling!
const { hash } = window.location;

// delete hash so the page won't scroll to it
window.history.replaceState(null, null, ' ');

window.onload = function() {
  // now scroll to element manually
  manualScroll();

  // scroll sidenav to section
  // scrollSidebar();
};

function manualScroll(selector = hash, parent = window) {
  if (selector) {
    const el = document.querySelector(selector);

    if (!el) return;

    scrollToElement(el, parent);
  }
}

const sidenavSections = [
  'products',
  'carts',
  'users',
  'posts',
  'comments',
  'todos',
  'quotes',
  'auth',
];

function scrollSidebar() {
  let { pathname } = window.location;

  if (pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  const currentPage = pathname.split('/').pop();

  if (sidenavSections.includes(currentPage)) {
    manualScroll(`#nav_${currentPage}`, document.querySelector('aside'));
  }
}

function toggleOutput(event) {
  const btn = event.target;
  const parent = btn.parentElement;

  parent.querySelector('pre.result').classList.toggle('hidden');

  if (btn.innerText === 'Show output') {
    btn.innerText = 'Hide output';
  } else {
    btn.innerText = 'Show output';
  }
}

// nav handler
const opener = document.querySelector('#nav-opener');
const aside = document.querySelector('aside');
const main = document.querySelector('main');

opener.addEventListener('click', toggleNav);

main.addEventListener('click', e => {
  if (main.classList.contains('nav-expand')) {
    toggleNav();
  }
});

function toggleNav() {
  aside.classList.toggle('nav-expand');
  main.classList.toggle('nav-expand');
}
