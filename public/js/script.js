highlightJSONCodeBlock();
handleHomePageResourcesSelector('.selector-el');
handleSectionScroll();

function highlightJSONCodeBlock() {
  const htmlMarkup = highlightJSON({ '💬': '🤔' });
  document.querySelector('.json-code').innerHTML = htmlMarkup;
}

function handleSectionScroll() {
  document.querySelectorAll('section').forEach(section => {
    section.addEventListener('wheel', e => {
      if (section.classList.contains('last-section') && e.deltaY > 0) {
        return;
      }

      if (e.target.closest('.json-code')) return;

      e.preventDefault();

      window.scrollTo({
        top:
          section[
            e.deltaY > 0 ? 'nextElementSibling' : 'previousElementSibling'
          ].offsetTop,
        behavior: 'smooth',
      });
    });
  });
}

function handleHomePageResourcesSelector(selector) {
  const resourcesData = {};

  document.querySelector(selector).addEventListener('click', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.classList.toggle('expanded');

    const resource = e.target.getAttribute('for');
    if (resource) {
      document.getElementById(resource).checked = true;

      if (resource !== 'none' && !this.classList.contains('expanded')) {
        if (!resourcesData[resource]) {
          const response = await fetch(
            `https://dummyjson.com/${resource}?limit=3`,
          );
          const data = await response.json();
          resourcesData[resource] = data;
        }

        const htmlMarkup = highlightJSON(resourcesData[resource]);
        document.querySelector('.json-code').innerHTML = htmlMarkup;
      }
    }
  });

  document.addEventListener('click', function() {
    document.querySelector(selector).classList.remove('expanded');
  });
}
