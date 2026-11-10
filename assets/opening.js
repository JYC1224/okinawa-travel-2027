(() => {
  'use strict';

  const root = document.documentElement;
  let screen = null;
  let finished = false;
  let travelTimer;
  let travellingIsland = null;
  let travelAnimation = null;

  function finish() {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    clearTimeout(travelTimer);
    // Reuse the moving artwork in the header, so the final frame never swaps logos.
    if (travellingIsland) {
      const destination = document.querySelector('.header-island');
      travellingIsland.className = 'header-island';
      travellingIsland.removeAttribute('style');
      if (destination) destination.replaceWith(travellingIsland);
      else travellingIsland.remove();
      travelAnimation?.cancel();
    }
    root.classList.remove('logo-travelling');
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
    const curtain = screen.getAnimations().find(animation => animation.animationName === 'opening-curtain');
    const elapsed = Number(curtain?.currentTime) || 0;
    travelTimer = setTimeout(() => {
      const island = screen.querySelector('.opening-island');
      const destination = document.querySelector('.header-island');
      if (!island || !destination || typeof island.animate !== 'function') return;
      const from = island.getBoundingClientRect();
      const to = destination.getBoundingClientRect();
      travellingIsland = island;
      // Keep the artwork on its own composited layer as the green curtain fades.
      // Only transform is animated; filtered images retain their original layout.
      island.style.cssText = `position:fixed;left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;animation:none;opacity:1;margin:0;z-index:10001`;
      document.body.append(island);
      root.classList.add('logo-travelling');
      travelAnimation = island.animate([
        { transform: 'translate3d(0, 0, 0) scale(1)' },
        { transform: `translate3d(${to.left + to.width / 2 - from.left - from.width / 2}px, ${to.top + to.height / 2 - from.top - from.height / 2}px, 0) scale(${to.width / from.width})` }
      ], { duration: 1300, easing: 'cubic-bezier(.4, 0, .18, 1)', fill: 'forwards' });
    }, Math.max(0, 6100 - elapsed));
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
