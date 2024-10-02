highlightTryItJSONCodeBlock();
handleHomePageResourcesSelector('.resource-selector-el');
handleSectionScrollViaArrowIcons();

function highlightTryItJSONCodeBlock() {
  const el = document.querySelector('.try-yourself .json-code');
  if (!el) return;

  const htmlMarkup = highlightJSON({ '💬': '🤔' });
  el.innerHTML = htmlMarkup;
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

function handleSectionScrollViaArrowIcons() {
  const arrowIcons = document.querySelectorAll('.arrow-down');

  arrowIcons.forEach(icon => {
    icon.addEventListener('click', function() {
      const section = this.closest('section');
      if (!section) return;

      let targetSection = section.nextElementSibling;

      // Check if target section is visible (for responsive layouts)
      if (window.innerWidth < 576 || window.innerHeight < 600) {
        while (targetSection && targetSection.offsetHeight === 0) {
          targetSection = targetSection.nextElementSibling;
        }
        if (!targetSection) return;
      }

      targetSection.scrollIntoView({ behavior: 'smooth' });
    });
  });
}
