(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // An explicit preview link lets the reader compare the effect in a reduced-motion browser.
  const preview = new URLSearchParams(window.location.search).get('motion') === 'preview';
  if ((!preview && reducedMotion.matches) || !('IntersectionObserver' in window)) return;

  const pending = 'scroll-reveal-pending';
  const entering = 'scroll-reveal-enter';
  const sections = document.querySelectorAll(
    '.group-overview, .flights-layout, .journey-selections, .feature-figure, ' +
    '.feature-copy, .hotel-layout, .hotel-gallery, .day-heading, .daily-scenes, ' +
    '.daily-summary, .route-distance-body'
  );

  function resetIfOutside(section) {
    const rect = section.getBoundingClientRect();
    // The entrance translation can move the observed box across the viewport edge.
    const offset = section.classList.contains(entering)
      ? new DOMMatrixReadOnly(getComputedStyle(section).transform).m42
      : 0;
    if (rect.bottom - offset > 0 && rect.top - offset < window.innerHeight) return;
    section.classList.remove(entering);
    section.classList.add(pending);
  }

  const observer = new IntersectionObserver(entries => {
    if (!preview && reducedMotion.matches) return;
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) {
        resetIfOutside(target);
        continue;
      }
      if (!target.classList.contains(pending)) continue;
      if (!target.matches(':focus-within')) {
        target.classList.add(entering);
      }
      target.classList.remove(pending);
    }
  });

  // Leave content already in view visible when loading or following a deep link.
  for (const section of sections) {
    resetIfOutside(section);
    section.addEventListener('animationend', event => {
      if (event.target === section && event.animationName === 'scroll-reveal') {
        section.classList.remove(entering);
        if (preview || !reducedMotion.matches) resetIfOutside(section);
      }
    });
    observer.observe(section);
  }

  reducedMotion.addEventListener('change', event => {
    if (preview || !event.matches) return;
    for (const section of sections) section.classList.remove(pending, entering);
  });
})();
