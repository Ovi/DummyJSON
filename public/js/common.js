handleNavMenuClickOnMobile();

function handleNavMenuClickOnMobile() {
  const navBurgerMenu = document.querySelector('.nav-burger-menu img');
  const navItems = document.querySelector('.nav-items');
  const mainMenu = document.querySelector('.app-navbar');
  const docsMenu = document.querySelector('.docs-nav');

  // to show and hide menus using burger menu (for mobile)
  navBurgerMenu.addEventListener('click', () => {
    navItems?.classList.toggle('active');
    mainMenu?.classList.toggle('active');
    docsMenu?.classList.toggle('active');
  });

  // to hide menus when clicked outside (for mobile)
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.app-navbar') && !e.target.closest('.docs-nav')) {
      navItems?.classList.remove('active');
      mainMenu?.classList.remove('active');
      docsMenu?.classList.remove('active');
    }
  });
}

async function copyTextToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy: ', err);
    return false;
  }
}
