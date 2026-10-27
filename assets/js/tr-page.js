/**
 * Training page: the programme timeline rail fills as the visitor scrolls
 * and each step lights up when the fill reaches it. Reveals come from
 * cs-page.js. Without JS (or with reduced motion) every step shows lit.
 */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = document.querySelector('.tr-path');
  if (!path || reduce) return;
  document.documentElement.classList.add('tr-js');

  const rail = path.querySelector('.tr-path__rail');
  const nodes = [...path.querySelectorAll('.tr-node')];
  let ticking = false;

  function update() {
    ticking = false;
    const vertical = window.matchMedia('(max-width: 920px)').matches;
    const r = path.getBoundingClientRect();
    const mark = window.innerHeight * (vertical ? 0.6 : 0.72);
    // Desktop: the rail runs left to right, so progress follows how far the row has scrolled past the mark.
    const span = vertical ? r.height : Math.max(r.height, window.innerHeight * 0.35);
    const p = Math.min(1, Math.max(0, (mark - r.top) / span));
    rail.style.setProperty('--p', p.toFixed(3));
    nodes.forEach((li, i) => {
      const on = vertical ? li.getBoundingClientRect().top < mark : p >= i / (nodes.length - 1) - 0.001;
      li.classList.toggle('is-on', on);
    });
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
