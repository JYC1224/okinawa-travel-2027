(() => {
  const video = document.querySelector('#highlights-clip');
  const button = document.querySelector('button[aria-controls="highlights-clip"]');
  let inView = false;
  let userPaused = false;

  function play() {
    video.play().catch(() => {
      button.textContent = '播放影片';
    });
  }

  function syncPlayback() {
    if (!inView) video.pause();
    else if (!userPaused) play();
  }

  video.addEventListener('play', () => { button.textContent = '暫停影片'; });
  video.addEventListener('pause', () => { button.textContent = '播放影片'; });
  button.addEventListener('click', () => {
    userPaused = !video.paused;
    if (userPaused) video.pause();
    else play();
  });
  button.hidden = false;
  video.controls = false;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.25;
      syncPlayback();
    }, { threshold: 0.25 });
    observer.observe(video);
  }
})();
