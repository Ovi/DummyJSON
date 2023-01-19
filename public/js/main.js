/* eslint-disable no-undef */
runHero();

const tryItButton = document.getElementById('request');
tryItButton.addEventListener('click', tryIt);

const copyCodeButton = document.getElementById('copy-code');
copyCodeButton.addEventListener('click', copyCode);

function tryIt() {
  const buttonText = tryItButton.innerText;
  tryItButton.innerText = 'Fetching...';

  function fetchTry() {
    fetch('/products/1')
      .then(res => res.json())
      .then(json => {
        const resContainer = document.getElementById('response');

        const formatted = JSON.stringify(json, null, 2);
        const highlighted = hljs.highlightAuto(formatted).value;

        resContainer.innerHTML = highlighted;
        tryItButton.innerText = buttonText;

        document.querySelector('.on-success-text')?.classList.remove('hidden');
      });
  }

  setTimeout(fetchTry, 500);
}

function copyCode() {
  copyCodeButton.innerText = 'Copied!';

  setTimeout(() => {
    copyCodeButton.innerText = 'Copy Code';
  }, 1000);

  const code = document.getElementById('example').innerText;
  navigator.clipboard.writeText(code);
}

function runHero() {
  const itemData = document.getElementById('product-data');
  const productTitle = document.getElementById('product-title');
  const productPrice = document.getElementById('product-price');
  const productCategory = document.getElementById('product-category');
  const productRating = document.getElementById('product-rating');

  const items = [];
  let slide = 0;

  fetch('/products?limit=5&skip=7')
    .then(res => res.json())
    .then(json => items.push(...json.products))
    .then(() => {
      document.querySelector('#products-list').classList.remove('hidden');
      runSlide();
    });

  function runSlide() {
    if (slide > items.length - 1) {
      slide = 0;
      runSlide();
    } else {
      const truncatedDesc = `${items[slide].description.substring(0, 30)}...`;
      items[slide].description = truncatedDesc;

      const formatted = JSON.stringify(items[slide], null, 2);
      const highlighted = hljs.highlightAuto(formatted).value;

      itemData.innerHTML = highlighted;

      productTitle.innerText = items[slide].title;
      productPrice.innerText = `${items[slide].price}$`;
      productCategory.innerText = items[slide].category;
      productRating.innerText = items[slide].rating;

      slide++;

      setTimeout(runSlide, 2500);
    }
  }
}

const header = document.querySelector('header');

window.onscroll = function() {
  if (window.pageYOffset > 65) {
    header.classList.add('sticky');
  } else {
    header.classList.remove('sticky');
  }
};
