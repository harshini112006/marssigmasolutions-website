/**
 * MARS SIGMA SOLUTIONS — Premium Industrial Website
 * JavaScript: GSAP Animations, Lenis Smooth Scroll,
 * Custom Cursor, Testimonials, Process Scroll
 */

'use strict';

/* ============================================================
   LENIS — Smooth Scrolling
   ============================================================ */
let lenis = null;

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    smoothTouch: false,
    touchMultiplier: 2,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}


/* ============================================================
   GSAP — Register Plugins
   ============================================================ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }
}


/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const dot    = document.getElementById('cursorDot');
  const ring   = document.getElementById('cursorRing');
  const label  = document.getElementById('cursorLabel');

  if (!cursor || window.matchMedia('(pointer: coarse)').matches) return;

  let mouseX = 0, mouseY = 0;
  let ringX  = 0, ringY  = 0;
  let raf;

  function moveCursor(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
  }

  function animateRing() {
    ringX += (mouseX - ringX) * 0.1;
    ringY += (mouseY - ringY) * 0.1;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    if (label) {
      label.style.left = ringX + 'px';
      label.style.top  = ringY + 'px';
    }
    raf = requestAnimationFrame(animateRing);
  }

  document.addEventListener('mousemove', moveCursor);
  animateRing();

  // Hover states
  const interactiveEls = document.querySelectorAll(
    'a, button, .service-panel__img-wrap, .industry-card, .why__pillar, .credential'
  );
  const imageEls = document.querySelectorAll('.service-panel__img-wrap');

  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor--hover');
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor--hover');
    });
  });

  imageEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor--text');
      document.body.classList.remove('cursor--hover');
      if (label) label.textContent = 'VIEW';
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor--text');
      if (label) label.textContent = '';
    });
  });

  // Hide cursor when leaving window
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
  });
}


/* ============================================================
   NAVIGATION — Scroll Behaviour
   ============================================================ */
function initNav() {
  const nav        = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!nav) return;

  // Scroll state
  const threshold = 80;
  function updateNav() {
    if (window.scrollY > threshold) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // Mobile menu toggle
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('open');
      mobileMenu.classList.toggle('open');
      menuToggle.classList.toggle('active');
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      mobileMenu.setAttribute('aria-hidden', String(isOpen));
      document.body.style.overflow = isOpen ? '' : 'hidden';
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }
}


/* ============================================================
   HERO — GSAP Entry Animation
   ============================================================ */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') {
    // Fallback: show everything immediately
    document.querySelectorAll(
      '.hero__eyebrow span, .hero__line span, .hero__body, .hero__ctas, .hero__meta, .hero__scroll'
    ).forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // Hero image scale in
  tl.from('#heroImg', {
    scale: 1.08,
    duration: 2.0,
    ease: 'power2.out',
  }, 0);

  // Eyebrow
  tl.to('#heroEyebrow span', {
    y: 0,
    duration: 1.0,
    ease: 'expo.out',
  }, 0.3);

  // Headline lines stagger
  tl.to('.hero__line span', {
    y: 0,
    duration: 1.0,
    stagger: 0.10,
    ease: 'expo.out',
  }, 0.5);

  // Body text
  tl.to('#heroBody', {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'power3.out',
  }, 0.95);

  // CTAs
  tl.to('#heroCtas', {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: 'power2.out',
  }, 1.1);

  // Meta bottom
  tl.to('#heroMeta', {
    opacity: 1,
    duration: 0.7,
    ease: 'power2.out',
  }, 1.25);

  // Scroll indicator
  tl.to('#heroScroll', {
    opacity: 1,
    duration: 0.5,
    ease: 'power2.out',
  }, 1.4);

  // Nav fade in
  tl.from('#nav', {
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out',
  }, 0.1);

  // Hero parallax on scroll
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.to('#heroImg', {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '#hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  }
}


/* ============================================================
   STAT COUNTERS
   ============================================================ */
function initStatCounters() {
  const stats = document.querySelectorAll('.stat');
  if (!stats.length) return;

  const DURATION = 1800; // ms

  function animateCounter(el, target) {
    const counterEl = el.querySelector('.stat__counter');
    if (!counterEl) return;

    const start    = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      const current  = Math.floor(startVal + (target - startVal) * eased);

      if (target >= 1000) {
        counterEl.textContent = current.toLocaleString();
      } else {
        counterEl.textContent = current;
      }

      if (progress < 1) requestAnimationFrame(update);
      else {
        if (target >= 1000) {
          counterEl.textContent = target.toLocaleString();
        } else {
          counterEl.textContent = target;
        }
      }
    }

    requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count, 10);
          animateCounter(entry.target, target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    stats.forEach(stat => io.observe(stat));
  }
}


/* ============================================================
   SCROLL REVEAL
   ============================================================ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) return;

  // Generic reveal
  const revealEls = document.querySelectorAll([
    '.intro__headline', '.intro__body',
    '.services__headline', '.service-panel__title', '.service-panel__body',
    '.iso-feature__headline', '.iso-feature__body', '.iso-step',
    '.why__headline', '.why__sub', '.why__pillar',
    '.industries__headline', '.industry-card',
    '.founder__headline', '.founder__body', '.credential',
    '.process__headline', '.process__step',
    '.testimonials__headline', '.cert-strip__headline',
    '.final-cta__headline', '.final-cta__body',
    '.footer__wordmark',
  ].join(', '));

  revealEls.forEach(el => el.classList.add('js-reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // stagger siblings
        const siblings = entry.target.parentElement
          ? Array.from(entry.target.parentElement.children).filter(
              c => c.classList.contains('js-reveal')
            )
          : [];
        const idx = siblings.indexOf(entry.target);

        setTimeout(() => {
          entry.target.classList.add('is-visible');
        }, Math.min(idx * 80, 240));

        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => io.observe(el));
}


/* ============================================================
   GSAP SCROLL ANIMATIONS (if GSAP is available)
   ============================================================ */
function initGSAPScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  // Services section: panel text reveal
  document.querySelectorAll('.service-panel').forEach(panel => {
    gsap.from(panel.querySelector('.service-panel__num'), {
      x: -30,
      opacity: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 80%',
        once: true,
      },
    });

    gsap.from(panel.querySelector('.service-panel__title'), {
      y: 30,
      opacity: 0,
      duration: 1.0,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: panel,
        start: 'top 75%',
        once: true,
      },
    });
  });

  // ISO Timeline step-by-step reveal
  gsap.utils.toArray('.iso-step').forEach((step, i) => {
    gsap.from(step, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: i * 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.iso-timeline',
        start: 'top 80%',
        once: true,
      },
    });
  });

  // ISO timeline: draw the progress line as the section moves through view.
  const isoTimeline = document.querySelector('.iso-timeline');
  const isoLine = document.querySelector('.iso-timeline__line');
  const isoSteps = gsap.utils.toArray('.iso-step');
  if (isoTimeline && isoLine && isoSteps.length) {
    gsap.to(isoLine, {
      '--iso-progress': 1,
      ease: 'none',
      scrollTrigger: {
        trigger: isoTimeline,
        start: 'top 82%',
        end: 'bottom 55%',
        scrub: 0.35,
        onUpdate: self => {
          const activeIndex = Math.min(
            isoSteps.length - 1,
            Math.floor(self.progress * isoSteps.length)
          );
          isoSteps.forEach((step, index) => {
            step.classList.toggle('active', index <= activeIndex);
          });
        },
      },
    });
  }

  // Why pillars stagger
  gsap.from('.why__pillar', {
    x: -30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.why__pillars',
      start: 'top 80%',
      once: true,
    },
  });

  // Industry cards
  gsap.from('.industry-card', {
    y: 40,
    opacity: 0,
    duration: 0.7,
    stagger: 0.07,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.industries__grid',
      start: 'top 80%',
      once: true,
    },
  });

  // Final CTA headline big reveal
  gsap.from('.final-cta__headline', {
    y: 60,
    opacity: 0,
    duration: 1.2,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: '.final-cta',
      start: 'top 75%',
      once: true,
    },
  });
}


/* ============================================================
   ISO TIMELINE — Interactive
   ============================================================ */
function initISOTimeline() {
  const steps = document.querySelectorAll('.iso-step');
  if (!steps.length) return;

  steps[0].classList.add('active');

  steps.forEach(step => {
    step.addEventListener('mouseenter', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
    step.addEventListener('focus', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
    step.setAttribute('tabindex', '0');
  });
}


/* ============================================================
   PROCESS — Interactive Steps
   ============================================================ */
function initProcess() {
  const steps   = document.querySelectorAll('.process__step');
  const scroller = document.getElementById('processScroller');

  if (!steps.length) return;

  steps.forEach((step, i) => {
    step.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
    step.addEventListener('mouseenter', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  // Auto-advance on scroll position in scroller
  if (scroller) {
    scroller.addEventListener('scroll', () => {
      const scrollLeft = scroller.scrollLeft;
      const stepWidth  = scroller.scrollWidth / steps.length;
      const activeIdx  = Math.min(
        Math.floor(scrollLeft / stepWidth),
        steps.length - 1
      );
      steps.forEach((s, i) => {
        s.classList.toggle('active', i === activeIdx);
      });
    }, { passive: true });
  }
}


/* ============================================================
   TESTIMONIALS
   ============================================================ */
function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  const counter      = document.getElementById('testimonialCounter');
  const prevBtn      = document.getElementById('testimonialPrev');
  const nextBtn      = document.getElementById('testimonialNext');

  if (!testimonials.length) return;

  let current = 0;
  const total = testimonials.length;

  function goTo(idx) {
    testimonials[current].classList.remove('active');
    testimonials[current].setAttribute('aria-hidden', 'true');
    current = (idx + total) % total;
    testimonials[current].classList.add('active');
    testimonials[current].removeAttribute('aria-hidden');

    if (counter) {
      const num = String(current + 1).padStart(2, '0');
      const tot = String(total).padStart(2, '0');
      counter.textContent = `${num} / ${tot}`;
    }

    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => goTo(current - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (document.activeElement === prevBtn || document.activeElement === nextBtn) {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    }
  });

  // Init state
  if (prevBtn) prevBtn.disabled = true;
}


/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const btns = document.querySelectorAll('.btn, .nav__cta');

  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect  = btn.getBoundingClientRect();
      const cx    = rect.left + rect.width  / 2;
      const cy    = rect.top  + rect.height / 2;
      const dx    = e.clientX - cx;
      const dy    = e.clientY - cy;
      const force = 0.25;
      btn.style.transform = `translate(${dx * force}px, ${dy * force}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
}


/* ============================================================
   PAGE TRANSITIONS (anchor clicks)
   ============================================================ */
function initPageTransitions() {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    // Only apply to internal pages (not hash, not external)
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.opacity    = '1';
      overlay.style.transform  = 'translateY(0)';
      const bar = overlay.querySelector('.page-transition__bar');
      if (bar) bar.style.width = '100%';

      setTimeout(() => {
        window.location.href = href;
      }, 550);
    });
  });
}


/* ============================================================
   SMOOTH HASH SCROLL
   ============================================================ */
function initHashScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const targetId = anchor.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;
      e.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}


/* ============================================================
   PERFORMANCE — Lazy Background Images
   ============================================================ */
function initLazyImages() {
  if (!('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const src = el.dataset.bgSrc;
        if (src) {
          el.style.backgroundImage = `url(${src})`;
          el.removeAttribute('data-bg-src');
        }
        io.unobserve(el);
      }
    });
  }, { rootMargin: '200px' });

  document.querySelectorAll('[data-bg-src]').forEach(el => io.observe(el));
}


/* ============================================================
   INIT
   ============================================================ */
function init() {
  initGSAP();
  initLenis();
  initCursor();
  initNav();
  initHeroAnimation();
  initStatCounters();
  initScrollReveal();
  initGSAPScrollAnimations();
  initISOTimeline();
  initProcess();
  initTestimonials();
  initMagneticButtons();
  initPageTransitions();
  initHashScrolling();
  initLazyImages();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
