/* No framework, network request, tracking or storage required. Works with file://. */
(() => {
  'use strict';
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-menu');
  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', '開啟旅程導覽');
    menu.hidden = true;
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '關閉旅程導覽' : '開啟旅程導覽');
    menu.hidden = !open;
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header') && !menu.hidden) closeMenu();
  });
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  mobileQuery.addEventListener('change', closeMenu);

  // Day navigation expands automatically only when real day articles are added.
  const days = [...document.querySelectorAll('.itinerary-day[data-day]')];
  const dayNavigation = document.querySelector('.day-navigation');
  if (days.length > 1) {
    dayNavigation.replaceChildren(...days.map((day, index) => {
      const link = document.createElement('a');
      link.href = '#' + day.id;
      link.textContent = 'Day ' + day.dataset.day + ' ';
      const date = document.createElement('span');
      date.textContent = day.dataset.date;
      link.append(date);
      if (index === 0) link.setAttribute('aria-current', 'page');
      return link;
    }));
  }

  // Native touch/keyboard scrolling, with explicit previous/next controls.
  document.querySelectorAll('.daily-scenes').forEach(gallery => {
    const strip = gallery.querySelector('.scene-strip');
    const scenes = [...strip.querySelectorAll('.daily-scene')];
    const counter = gallery.querySelector('.scene-count');
    const previous = gallery.querySelector('[data-slide="prev"]');
    const next = gallery.querySelector('[data-slide="next"]');
    let current = 0;
    function updateCounter() {
      const first = scenes[0].offsetLeft;
      current = scenes.reduce((best, item, index) =>
        Math.abs(item.offsetLeft - first - strip.scrollLeft) < Math.abs(scenes[best].offsetLeft - first - strip.scrollLeft) ? index : best, 0);
      counter.textContent = `${current + 1} / ${scenes.length}`;
      previous.disabled = strip.scrollLeft <= 2;
      next.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 2;
    }
    function move(direction) {
      const index = Math.max(0, Math.min(scenes.length - 1, current + direction));
      strip.scrollTo({left: scenes[index].offsetLeft - scenes[0].offsetLeft,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    }
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    strip.addEventListener('scroll', updateCounter, {passive: true});
    strip.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1);
      }
    });
    window.addEventListener('resize', updateCounter, {passive: true});
    updateCounter();
  });

  const sectionLinks = [...document.querySelectorAll('.section-nav a')];
  const sections = sectionLinks.map(link => document.querySelector(link.hash));
  function selectSection(current) {
    sectionLinks.forEach((link, index) => {
      if (index === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const index = sectionLinks.findIndex(item => item.hash === link.hash);
    if (index >= 0) link.addEventListener('click', () => selectSection(index));
  });
  function updateSectionNavigation() {
    const readingEdge = mobileQuery.matches ? 80 : 102;
    let current = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= readingEdge) current = index;
    });
    selectSection(current);
    if (days.length > 1) {
      let currentDay = days[0];
      days.forEach(day => { if (day.getBoundingClientRect().top <= readingEdge) currentDay = day; });
      dayNavigation.querySelectorAll('a').forEach(link => {
        if (link.hash === '#' + currentDay.id) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }
  }
  window.addEventListener('scroll', updateSectionNavigation, {passive: true});
  window.addEventListener('resize', updateSectionNavigation, {passive: true});
  window.addEventListener('hashchange', updateSectionNavigation);
  window.addEventListener('load', updateSectionNavigation);
  updateSectionNavigation();
})();
