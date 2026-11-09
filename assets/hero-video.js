(() => {
  'use strict';
  const hero = document.querySelector('.hero-cinema');
  const video = document.querySelector('#hero-film');
  const button = document.querySelector('.hero-playback');
  if (!hero || !video) return;

  const label = button?.querySelector('[data-hero-label]');
  let inView = hero.getBoundingClientRect().bottom > 0 && hero.getBoundingClientRect().top < innerHeight;
  let userPaused = false;

  function updateButton() {
    const playing = !video.paused && !video.ended;
    hero.classList.toggle('is-playing', playing);
    if (label) label.textContent = playing ? '暫停影片' : '播放影片';
    button?.setAttribute('aria-label', playing ? '暫停主視覺影片' : '播放主視覺影片');
  }

  function ensureSource() {
    if (video.getAttribute('src')) return;
    video.src = window.matchMedia('(max-width: 767px)').matches ? video.dataset.mobile : video.dataset.desktop;
  }

  function syncPlayback() {
    const opening = document.documentElement.classList.contains('opening-active');
    if (opening || !inView || document.hidden || userPaused) {
      video.pause();
      return;
    }
    ensureSource();
    video.muted = true;
    const pending = video.play();
    if (pending) pending.catch(updateButton);
  }

  button?.addEventListener('click', () => {
    if (!video.paused) {
      userPaused = true;
      video.pause();
    } else {
      userPaused = false;
      syncPlayback();
    }
  });
  video.addEventListener('playing', () => {
    hero.classList.add('has-video-frame');
    updateButton();
  });
  video.addEventListener('pause', updateButton);
  video.addEventListener('error', () => {
    hero.classList.remove('has-video-frame');
    updateButton();
  });
  document.addEventListener('visibilitychange', syncPlayback);

  // Observe the existing intro rather than changing its timing or script.
  const introObserver = new MutationObserver(() => {
    if (!document.documentElement.classList.contains('opening-active')) {
      introObserver.disconnect();
      syncPlayback();
    }
  });
  if (document.documentElement.classList.contains('opening-active')) {
    introObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting && entry.intersectionRatio >= .1;
      syncPlayback();
    }, { threshold: [0, .1] }).observe(hero);
  }
  // Buffer during the existing logo intro, without playing behind it.
  if (inView) {
    ensureSource();
    video.preload = 'auto';
    video.load();
  }
  if (button) button.hidden = false;
  syncPlayback();
})();
