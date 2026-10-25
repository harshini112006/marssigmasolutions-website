/**
 * Scroll-linked word reveal for headlines marked [data-split-reveal]:
 * each word rises, sharpens and brightens in sequence as the visitor scrolls.
 * Reduced-motion visitors get the headline as-is.
 */
(function () {
  const heads = document.querySelectorAll('[data-split-reveal]');
  if (!heads.length || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  // Wrap every word in a span, keeping <em> and <br> in place.
  function split(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span');
          w.className = 'reveal-word';
          w.textContent = part;
          frag.appendChild(w);
        });
        node.replaceChild(frag, child);
      } else if (child.nodeType === 1 && child.tagName !== 'BR') {
        split(child);
      }
    });
  }

  function init() {
    heads.forEach(head => {
      split(head);
      head.classList.add('is-split');
      const words = head.querySelectorAll('.reveal-word');
      gsap.fromTo(words,
        { opacity: 0.12, y: 26, filter: 'blur(8px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          ease: 'power2.out',
          stagger: 0.12,
          scrollTrigger: {
            trigger: head,
            start: 'top 85%',
            end: 'bottom 45%',
            scrub: 0.8,
            onLeave: () => head.classList.add('is-revealed'),
            onEnterBack: () => head.classList.remove('is-revealed'),
          },
        });
    });
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);
})();
