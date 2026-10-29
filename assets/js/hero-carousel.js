/**
 * Home hero background carousel: crossfades between the slides every few
 * seconds, with dot indicators. Pauses while the visitor hovers or touches
 * the hero, and while the tab is hidden.
 */
(function () {
  const hero = document.getElementById('hero');
  const slides = hero ? [...hero.querySelectorAll('.hero-slide')] : [];
  const dots = hero ? [...hero.querySelectorAll('.hero-carousel__dot')] : [];
  if (slides.length < 2) return;

  const DELAY = 4000;
  let current = 0;
  let timer = null;
  let paused = false;

  function show(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => {
      d.classList.toggle('is-active', i === current);
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  }

  function stop() { clearInterval(timer); timer = null; }
  function start() {
    stop();
    if (paused || document.hidden) return;
    timer = setInterval(() => show(current + 1), DELAY);
  }
  function setPaused(value) {
    paused = value;
    hero.classList.toggle('is-paused', value);
    start();
  }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));

  hero.addEventListener('mouseenter', () => setPaused(true));
  hero.addEventListener('mouseleave', () => setPaused(false));
  // touch: hold while the finger is down, then resume shortly after
  let resumeTimer = null;
  hero.addEventListener('touchstart', () => { clearTimeout(resumeTimer); setPaused(true); }, { passive: true });
  hero.addEventListener('touchend', () => { resumeTimer = setTimeout(() => setPaused(false), 2500); }, { passive: true });

  document.addEventListener('visibilitychange', start);

  show(0);
  start();
})();
