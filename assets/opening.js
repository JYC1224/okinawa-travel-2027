(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const preview = new URLSearchParams(window.location.search).get('motion') === 'preview';
  if (reducedMotion.matches && !preview) return;

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
    reducedMotion.removeEventListener('change', handleMotion);
    window.removeEventListener('pagehide', finish);
    window.removeEventListener('beforeprint', finish);
  }

  function handleKey(event) {
    if (event.key === 'Escape' || event.key === 'Tab') finish();
  }

  function handleMotion(event) {
    if (event.matches && !preview) finish();
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
  reducedMotion.addEventListener('change', handleMotion);
  window.addEventListener('pagehide', finish, { once: true });
  window.addEventListener('beforeprint', finish, { once: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
