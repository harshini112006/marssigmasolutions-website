/**
 * Scroll-linked word reveal for headlines marked [data-split-reveal]:
 * each word rises, sharpens and brightens in sequence as the visitor scrolls.
 * Reduced-motion visitors get the headline as-is.
 */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Hero "under audit,": tiny twinkling sparkles that appear and fade across the letters.
  const accent = document.querySelector('#hero .hero__line--accent > span');
  if (accent) {
    accent.classList.add('has-sparkles');
    const place = s => {
      s.style.left = (4 + Math.random() * 92) + '%';
      s.style.top = (10 + Math.random() * 80) + '%';
      s.style.setProperty('--s', (0.5 + Math.random() * 0.9).toFixed(2));
    };
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('i');
      s.className = 'hero-sparkle';
      s.setAttribute('aria-hidden', 'true');
      place(s);
      s.style.animationDelay = (Math.random() * 3.2).toFixed(2) + 's';
      s.style.animationDuration = (2.2 + Math.random() * 1.6).toFixed(2) + 's';
      s.addEventListener('animationiteration', () => place(s)); // twinkle somewhere new each time
      accent.appendChild(s);
    }
  }

  // Footer headings: arm the CSS reveal, then trigger it once the footer is in view.
  const footer = document.querySelector('footer.footer');
  if (footer && 'IntersectionObserver' in window) {
    footer.classList.add('fx-ready');
    const reveal = () => { footer.classList.add('is-revealed'); io.disconnect(); };
    const io = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) reveal(); }, { threshold: 0 });
    io.observe(footer);
  }

  const heads = document.querySelectorAll('[data-split-reveal]');
  if (!heads.length || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

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
