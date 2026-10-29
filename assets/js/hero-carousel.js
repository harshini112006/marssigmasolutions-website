/**
 * Home hero background carousel: crossfades to the next slide every 3 seconds,
 * with dot indicators. It always auto-advances (the hero fills the screen, so
 * pausing on hover would stop it for most visitors); clicking a dot jumps to
 * that slide and restarts the 3s count. The timer only rests while the tab is
 * hidden.
 */
(function () {
  const hero = document.getElementById('hero');
  const slides = hero ? [...hero.querySelectorAll('.hero-slide')] : [];
  const dots = hero ? [...hero.querySelectorAll('.hero-carousel__dot')] : [];
  if (slides.length < 2) return;

  const DELAY = 3000;
  let current = 0;
  let timer = null;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  function start() {
    clearInterval(timer);
    timer = document.hidden ? null : setInterval(() => show(current + 1), DELAY);
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));
  document.addEventListener('visibilitychange', start);

  show(0);
  start();
})();
