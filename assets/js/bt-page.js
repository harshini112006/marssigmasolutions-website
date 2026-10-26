/**
 * Business Transformation page: start chart / cycle animations when they scroll into view,
 * and pause decorative animations while they are off-screen so scrolling stays smooth.
 * Without JS (or with reduced motion) the CSS shows everything in its final state.
 */
(function () {
  const items = document.querySelectorAll('.bt-anim');
  const art = document.querySelectorAll('.bt-art');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-in'));
    return;
  }
  document.documentElement.classList.add('bt-anim-ready');

  // Cycle and charts replay whenever they come back into view; the card grid reveals once.
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const el = entry.target;
      if (el.classList.contains('bt-grid')) {
        if (entry.isIntersecting) { el.classList.add('is-in'); io.unobserve(el); }
      } else {
        el.classList.toggle('is-in', entry.isIntersecting);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px 10% 0px' });
  items.forEach(el => io.observe(el));

  // Only run the drawn card animations (CSS and SVG) while they are on screen.
  const live = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const on = entry.isIntersecting;
      entry.target.classList.toggle('is-live', on);
      const svg = entry.target.querySelector('svg');
      if (svg && svg.pauseAnimations) on ? svg.unpauseAnimations() : svg.pauseAnimations();
    });
  }, { rootMargin: '100px 0px' });
  art.forEach(el => live.observe(el));
})();
