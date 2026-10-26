/**
 * ISO Consulting page: reveal blocks as they scroll into view, fill the
 * ISO 9001:2026 timeline rail with scroll, and pause the seal while off-screen.
 * Without JS (or with reduced motion) everything shows in its final state.
 */
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('cs-js');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.cs-reveal').forEach(el => io.observe(el));

  // Pause the rotating seal while it is off-screen.
  const seal = document.querySelector('.cs-seal');
  if (seal) {
    new IntersectionObserver(([entry]) => {
      seal.querySelectorAll('.cs-seal__spin, .cs-seal__pulse').forEach(el => {
        el.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
      });
    }).observe(seal);
  }

  // Timeline: the rail fills as the visitor scrolls, each step lights up as the fill reaches it.
  const steps = document.querySelector('.cs-steps');
  if (!steps) return;
  const rail = steps.querySelector('.cs-steps__rail');
  const items = [...steps.querySelectorAll('.cs-step')];
  let ticking = false;
  function update() {
    ticking = false;
    const r = steps.getBoundingClientRect();
    const mid = window.innerHeight * 0.6;
    const p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    rail.style.setProperty('--p', p.toFixed(3));
    items.forEach(li => li.classList.toggle('is-on', li.getBoundingClientRect().top < mid));
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
