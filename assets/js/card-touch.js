/**
 * Text cards (light sections) and numbered process rows (dark sections): on touch screens there is no hover, so a tap
 * toggles the same red-to-blue fill (.is-touched); tapping elsewhere clears it.
 */
(function () {
  const SEL = '.ink-light :is(.why__pillar, .bt-offer, .bt-challenge__card, .cs-std, .cs-step, .tp-benefit, .tp-stage, .ct-card), .ink-dark :is(.why__pillar, .cs-phase, .bt-steps li)';
  document.addEventListener('touchend', e => { document.querySelectorAll('.ink-dark .is-touched').forEach(c => c.classList.remove('is-touched')); }, { passive: true });
  document.addEventListener('touchstart', e => {
    const card = e.target.closest(SEL);
    document.querySelectorAll('.is-touched').forEach(c => { if (c !== card) c.classList.remove('is-touched'); });
    if (card) card.classList.add('is-touched');
  }, { passive: true });
})();
