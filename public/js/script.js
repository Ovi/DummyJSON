highlightTryItJSONCodeBlock();
handleHomePageResourcesSelector('.resource-selector-el');
handleSectionScroll();

function highlightTryItJSONCodeBlock() {
  const el = document.querySelector('.try-yourself .json-code');
  if (!el) return;

  const htmlMarkup = highlightJSON({ '💬': '🤔' });
  el.innerHTML = htmlMarkup;
}

function handleSectionScroll() {
  const sections = document.querySelectorAll('section');
  if (!sections || sections.length < 2) return;

  let isScrolling = false;
  const scrollCooldown = 1000;

  sections.forEach(section => {
    section.addEventListener('wheel', e => {
      if (isScrolling) return;
      if (section.classList.contains('last-section') && e.deltaY > 0) return;
      if (e.target.closest('.json-code')) return;

      e.preventDefault();

      let targetSection;
      if (e.deltaY > 0) {
        targetSection = section.nextElementSibling;
      } else {
        targetSection = section.previousElementSibling;
      }

      if (!targetSection) return;

      // Check if target section is visible (for responsive layouts)
      if (window.innerWidth < 576 || window.innerHeight < 600) {
        while (targetSection && targetSection.offsetHeight === 0) {
          targetSection = e.deltaY > 0 ? targetSection.nextElementSibling : targetSection.previousElementSibling;
        }
        if (!targetSection) return;
      }

      isScrolling = true;
      targetSection.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        isScrolling = false;
      }, scrollCooldown);
    });
  });
}

function handleHomePageResourcesSelector(selector) {
  const selectorEl = document.querySelector(selector);
  if (!selectorEl) return;

  const resourcesData = {};

  selectorEl.addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.toggle('expanded');

    const resource = e.target.getAttribute('for');
    if (resource) {
      document.getElementById(resource).checked = true;

      if (resource !== 'none' && !this.classList.contains('expanded')) {
        if (!resourcesData[resource]) {
          const response = await fetch(`https://dummyjson.com/${resource}?limit=3`);
          const data = await response.json();
          resourcesData[resource] = data;
        }

        const htmlMarkup = highlightJSON(resourcesData[resource]);
        document.querySelector('.json-code').innerHTML = htmlMarkup;
      }
    }
  });

  document.addEventListener('click', function() {
    const expandedEl = document.querySelector(selector);
    if (expandedEl) expandedEl.classList.remove('expanded');
  });
}
