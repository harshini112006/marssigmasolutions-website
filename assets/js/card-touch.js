/**
 * Light-section text cards: on touch screens there is no hover, so a tap
 * toggles the same red-to-blue fill (.is-touched); tapping elsewhere clears it.
 */
(function () {
  const SEL = '.ink-light :is(.why__pillar, .bt-offer, .bt-challenge__card, .cs-std, .cs-step, .tp-benefit, .tp-stage)';
  document.addEventListener('touchstart', e => {
    const card = e.target.closest(SEL);
    document.querySelectorAll(SEL + '.is-touched').forEach(c => { if (c !== card) c.classList.remove('is-touched'); });
    if (card) card.classList.add('is-touched');
  }, { passive: true });
})();
