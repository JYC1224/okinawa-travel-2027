(() => {
  'use strict';

  const root = document.documentElement;
  let screen = null;
  let finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    root.classList.remove('opening-active');
    (screen || document.getElementById('opening-screen'))?.remove();
    document.removeEventListener('DOMContentLoaded', start);
    document.removeEventListener('keydown', handleKey);
    window.removeEventListener('pagehide', finish);
    window.removeEventListener('beforeprint', finish);
  }

  function handleKey(event) {
    if (event.key === 'Escape' || event.key === 'Tab') finish();
  }

  function start() {
    if (finished) return;
    screen = document.getElementById('opening-screen');
    if (!screen) {
      finish();
      return;
    }
    screen.hidden = false;
    if (getComputedStyle(screen).animationName !== 'opening-curtain') {
      finish();
      return;
    }
    screen.addEventListener('click', finish);
    screen.addEventListener('animationend', event => {
      if (event.target === screen && event.animationName === 'opening-curtain') finish();
    });
  }

  // Open the page even if an animation is interrupted or its stylesheet fails.
  const safetyTimer = setTimeout(finish, 10000);
  root.classList.add('opening-active');
  document.addEventListener('keydown', handleKey);
  window.addEventListener('pagehide', finish, { once: true });
  window.addEventListener('beforeprint', finish, { once: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
