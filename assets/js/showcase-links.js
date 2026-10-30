/**
 * Home capability cards: each card scrolls to its numbered service panel
 * further down (data-target holds the panel id). A drag of the card row is
 * not a click, so the slider keeps working with mouse and touch; Enter or
 * Space activates a focused card.
 */
(function () {
  const cards = document.querySelectorAll('.showcase__card[data-target]');
  if (!cards.length) return;

  function go(card) {
    const target = document.getElementById(card.dataset.target);
    if (!target) return;
    // leave room for the fixed navbar above the panel
    const offset = 100;
    if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(target, { offset: -offset, duration: 1.4 });
    else window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
  }

  cards.forEach(card => {
    // only movement while the pointer is pressed counts as a drag (hover moves don't)
    let startX = 0, startY = 0, down = false, moved = false;
    card.addEventListener('pointerdown', e => { startX = e.clientX; startY = e.clientY; down = true; moved = false; });
    card.addEventListener('pointermove', e => {
      if (down && (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8)) moved = true;
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(type =>
      card.addEventListener(type, () => { down = false; }));
    card.addEventListener('click', e => {
      if (moved) { e.preventDefault(); return; }
      go(card);
    });
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(card); }
    });
  });
})();
