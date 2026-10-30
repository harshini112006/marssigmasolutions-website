/**
 * Light sections: make the red-to-blue text gradient restart on every
 * wrapped line of a heading (see .ink-grad in theme-ink.css).
 *  - Plain headings: the content moves into one inline span whose gradient
 *    is cloned per line. Child nodes are moved, not re-created, so scripts
 *    holding references to them keep working.
 *  - Word-split reveal headings: their words are transformed inline-blocks,
 *    which a parent text clip cannot paint, so each word gets the gradient
 *    itself, sized and offset to its line so the line still reads red to blue.
 * Skipped: the "What we do" headline (its particle effect reads its own text
 * nodes) and flex/grid headings; both keep the whole-heading gradient.
 * Runs after load, once the word-splitting reveal has done its work.
 */
(function () {
  const splitHeads = [];

  function placeWords(head) {
    // Layout boxes only (offsets ignore the reveal's transforms); a word starts a
    // new line when it sits more than half a word-height below the current one.
    const box = el => {
      let x = 0, y = 0;
      for (let n = el; n && n !== head; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };
    const lines = [];
    head.querySelectorAll('.reveal-word').forEach(w => {
      const b = box(w);
      const line = lines[lines.length - 1];
      if (line && Math.abs(b.y - line.y) < b.h / 2) line.words.push([w, b]);
      else lines.push({ y: b.y, words: [[w, b]] });
    });
    lines.forEach(({ words }) => {
      const left = Math.min(...words.map(([, b]) => b.x));
      const right = Math.max(...words.map(([, b]) => b.x + b.w));
      words.forEach(([w, b]) => {
        w.style.setProperty('--gw', `${right - left}px`);
        w.style.setProperty('--gx', `${left - b.x}px`);
      });
    });
  }

  function wrap() {
    document.querySelectorAll('.ink-light :is(h1, h2, h3, h4)').forEach(head => {
      if (head.classList.contains('has-ink-grad') || head.classList.contains('has-word-grad') ||
          head.closest('.showcase__card') || head.classList.contains('services__headline')) return;
      if (head.querySelector('.reveal-word')) {
        head.classList.add('has-word-grad');
        splitHeads.push(head);
        placeWords(head);
        return;
      }
      if (/flex|grid/.test(getComputedStyle(head).display)) return;
      const span = document.createElement('span');
      span.className = 'ink-grad';
      while (head.firstChild) span.appendChild(head.firstChild);
      head.appendChild(span);
      head.classList.add('has-ink-grad');
    });
  }

  // Re-measure when the wrap can change: resizes and late-loading fonts.
  let resizeTimer = null;
  const remeasure = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => splitHeads.forEach(placeWords), 150);
  };
  window.addEventListener('resize', remeasure);
  if (document.fonts) document.fonts.ready.then(remeasure);
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(remeasure);
    window.addEventListener('load', () => splitHeads.forEach(h => ro.observe(h)));
  }

  if (document.readyState === 'complete') wrap();
  else window.addEventListener('load', wrap);
})();
