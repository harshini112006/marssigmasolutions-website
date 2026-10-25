/**
 * MARS SIGMA SOLUTIONS — Premium Client Website
 * Stack: GSAP 3.12 + ScrollTrigger + Lenis Smooth Scroll
 * Palette: Maroon Red | White | Ink Blue | Black
 */
'use strict';

let lenis = null;

/* ============================================================
   GSAP — Register Plugins
   ============================================================ */
function initGSAP() {
  if (typeof gsap === 'undefined') return;
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }
}

/* ============================================================
   LENIS — Smooth Scrolling (properly synced with GSAP)
   ============================================================ */
function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.4,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    smoothTouch: false,
  });

  // Sync with GSAP ticker — this is the correct way per Lenis docs
  if (typeof gsap !== 'undefined') {
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Tell ScrollTrigger to use lenis scroll position
  if (typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', () => ScrollTrigger.update());
  }
}

/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
function initCursor() {
  const dot   = document.getElementById('cursorDot');
  const ring  = document.getElementById('cursorRing');
  const label = document.getElementById('cursorLabel');

  if (!dot || !ring || window.matchMedia('(pointer: coarse)').matches) return;

  document.body.style.cursor = 'none';

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  const LERP = 0.12;

  const setDotX  = gsap.quickSetter(dot,  'x', 'px');
  const setDotY  = gsap.quickSetter(dot,  'y', 'px');
  const setRingX = gsap.quickSetter(ring, 'x', 'px');
  const setRingY = gsap.quickSetter(ring, 'y', 'px');
  let setLabelX, setLabelY;
  if (label) {
    setLabelX = gsap.quickSetter(label, 'x', 'px');
    setLabelY = gsap.quickSetter(label, 'y', 'px');
  }

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX; mouseY = e.clientY;
    setDotX(mouseX); setDotY(mouseY);
  }, { passive: true });

  (function animateRing() {
    ringX += (mouseX - ringX) * LERP;
    ringY += (mouseY - ringY) * LERP;
    setRingX(ringX); setRingY(ringY);
    if (setLabelX) { setLabelX(ringX); setLabelY(ringY); }
    requestAnimationFrame(animateRing);
  })();

  // Hover states
  document.querySelectorAll('a, button, .service-panel__img-wrap, .industry-card, .why__pillar, .credential').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor--hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor--hover'));
  });

  document.querySelectorAll('.service-panel__img-wrap').forEach(el => {
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

  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function initNav() {
  const nav        = document.getElementById('nav');
  const menuToggle = document.getElementById('menuToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link');

  if (!nav) return;

  function updateNav() {
    nav.classList.toggle('nav--scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

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
   HERO ANIMATION — Premium GSAP Timeline
   ============================================================ */
function initHeroAnimation() {
  if (typeof gsap === 'undefined') return;

  const eyebrowLine = document.querySelector('.hero__eyebrow-line');
  const eyebrowText = document.querySelector('.hero__eyebrow-text');
  const lines  = document.querySelectorAll('.hero__line span');
  const body   = document.getElementById('heroBody');
  const ctas   = document.getElementById('heroCtas');
  const meta   = document.getElementById('heroMeta');
  const scroll = document.getElementById('heroScroll');
  const heroImg = document.getElementById('heroImg');
  const nav    = document.getElementById('nav');

  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

  // 0. Nav
  tl.from(nav, { opacity: 0, y: -28, duration: 1, ease: 'power3.out' }, 0);

  // 1. Hero image: dramatic slow zoom-in
  if (heroImg) {
    gsap.set(heroImg, { scale: 1.15 });
    tl.to(heroImg, { scale: 1, duration: 3.0, ease: 'power2.out' }, 0);
  }

  // 2. Eyebrow
  if (eyebrowLine) tl.to(eyebrowLine, { scaleX: 1, duration: 0.9, ease: 'expo.out' }, 0.3);
  if (eyebrowText) tl.to(eyebrowText, { x: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.5);

  // 3. Headline: lines slide up from clip
  if (lines.length) {
    gsap.set(lines, { y: '110%' });
    tl.to(lines, { y: '0%', duration: 1.4, stagger: 0.1, ease: 'expo.out' }, 0.55);
  }

  // 4. Body paragraph
  if (body) {
    gsap.set(body, { opacity: 0, y: 28 });
    tl.to(body, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out' }, 1.15);
  }

  // 5. CTAs
  if (ctas) {
    gsap.set(ctas, { opacity: 0, y: 22 });
    tl.to(ctas, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' }, 1.4);
  }

  // 6. Meta bar
  if (meta) {
    gsap.set(meta, { opacity: 0 });
    tl.to(meta, { opacity: 1, duration: 0.8 }, 1.6);
  }

  // 7. Scroll indicator
  if (scroll) {
    gsap.set(scroll, { opacity: 0 });
    tl.to(scroll, { opacity: 1, duration: 0.6 }, 1.9);
  }

  // 8. Parallax: hero image drifts on scroll
  if (typeof ScrollTrigger !== 'undefined' && heroImg) {
    gsap.to(heroImg, {
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
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  const stats = document.querySelectorAll('.stat[data-count]');
  if (!stats.length) return;

  stats.forEach(stat => {
    const counterEl = stat.querySelector('.stat__counter');
    if (!counterEl) return;
    const target = parseInt(stat.dataset.count, 10);
    
    // Create an object to tween
    const counterObj = { val: 0 };
    
    gsap.to(counterObj, {
      val: target,
      duration: 1.8,
      ease: 'power3.out',
      onUpdate: function() {
        const current = Math.floor(counterObj.val);
        counterEl.textContent = target >= 1000 ? current.toLocaleString() : current;
      },
      scrollTrigger: {
        trigger: stat,
        start: 'top 90%',
        toggleActions: 'restart reset restart reset' // Triggers whenever scrolling up OR down into view
      }
    });
  });
}

/* ============================================================
   GSAP SCROLL ANIMATIONS — All Sections
   ============================================================ */
function initScrollAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const ST = { start: 'top 82%', once: true };

  /* Helper: fade-up reveal */
  function fadeUp(selector, opts = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
      y: opts.y || 50,
      opacity: 0,
      duration: opts.dur || 1.1,
      stagger: opts.stagger || 0,
      ease: opts.ease || 'expo.out',
      delay: opts.delay || 0,
      scrollTrigger: { trigger: opts.trigger || els[0], ...ST, ...(opts.st || {}) },
    });
  }

  /* Helper: slide-in from left */
  function slideLeft(selector, opts = {}) {
    const els = document.querySelectorAll(selector);
    if (!els.length) return;
    gsap.from(els, {
      x: opts.x || -50,
      opacity: 0,
      duration: opts.dur || 1.0,
      stagger: opts.stagger || 0,
      ease: 'power3.out',
      scrollTrigger: { trigger: opts.trigger || els[0], ...ST },
    });
  }

  /* ── INTRO ── */
  fadeUp('.intro__headline', { y: 60, dur: 1.3, st: { trigger: '.intro__inner' } });
  fadeUp('.intro__body', { y: 30, dur: 1.0, stagger: 0.12, st: { trigger: '.intro__right' } });
  // Stats stagger
  gsap.from('.stat', {
    y: 40, opacity: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out',
    scrollTrigger: { trigger: '.stats', start: 'top 82%', once: true },
  });
  
  // New Intro Visual Parallax
  const introVisual = document.getElementById('introVisual');
  const introParallax = document.getElementById('introVisualParallax');
  if (introVisual && introParallax) {
    gsap.to(introParallax, {
      yPercent: 15,
      ease: 'none',
      scrollTrigger: {
        trigger: introVisual,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  /* ── SHOWCASE (Floating Cards) ── */
  const showcaseText = document.querySelector('.showcase__massive-text');
  if (showcaseText) {
    gsap.to(showcaseText, {
      y: '-30%', ease: 'none',
      scrollTrigger: { trigger: '.showcase', start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
  const showcaseSlider = document.getElementById('showcaseSlider');
  const showcaseNext = document.querySelector('.showcase__next');
  if (showcaseNext && showcaseSlider) {
    gsap.from(showcaseNext, {
      scale: 0, opacity: 0, duration: 0.8, ease: 'back.out(1.5)',
      scrollTrigger: { trigger: '.showcase', start: 'top center' },
    });
    showcaseNext.addEventListener('click', (e) => {
      e.preventDefault();
      const maxScroll = showcaseSlider.scrollWidth - showcaseSlider.clientWidth;
      
      if (showcaseSlider.scrollLeft >= maxScroll - 10) {
        // Reached the end, loop back to the first slide
        showcaseSlider.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        // Scroll exactly one card width (approx 30vw) + gap
        const scrollAmount = window.innerWidth * 0.3 + 64; 
        showcaseSlider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    });

    const timelineProgress = document.getElementById('showcaseTimelineProgress');
    if (timelineProgress) {
      showcaseSlider.addEventListener('scroll', () => {
        const maxScroll = Math.max(1, showcaseSlider.scrollWidth - showcaseSlider.clientWidth);
        const scrollPercent = (showcaseSlider.scrollLeft / maxScroll) * 100;
        timelineProgress.style.width = `${scrollPercent}%`;
      });
      timelineProgress.style.width = '0%';
    }
  }

  const showcaseCards = gsap.utils.toArray('.showcase__card');
  if (showcaseCards.length) {
    gsap.from(showcaseCards, {
      y: 100, opacity: 0, rotateX: 10, duration: 1.2, stagger: 0.1, ease: 'expo.out',
      scrollTrigger: { trigger: '.showcase', start: 'top 70%', once: true },
    });
  }

  /* ── SERVICES ── */
  fadeUp('.services__headline', { y: 60, dur: 1.3, st: { trigger: '.services__header' } });

  document.querySelectorAll('.service-panel').forEach((panel, i) => {
    const tl = gsap.timeline({
      scrollTrigger: { trigger: panel, start: 'top 82%', once: true },
    });
    tl.from(panel, { opacity: 0, y: 60, duration: 1.2, ease: 'expo.out' })
      .from(panel.querySelector('.service-panel__num'),    { x: -40, opacity: 0, duration: 1.0, ease: 'expo.out' }, '-=0.8')
      .from(panel.querySelector('.service-panel__title'),  { y: 30,  opacity: 0, duration: 0.9, ease: 'power3.out' }, '-=0.75')
      .from(panel.querySelector('.service-panel__body'),   { y: 20,  opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.65')
      .from(panel.querySelector('.service-panel__tags'),   { y: 15,  opacity: 0, duration: 0.7, ease: 'power2.out' }, '-=0.55');

    // Image reveal: scale from 1.2 to 1
    const img = panel.querySelector('.service-panel__img');
    if (img) {
      gsap.from(img, {
        scale: 1.2,
        filter: 'brightness(0.3) saturate(0)',
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: panel, start: 'top 82%', once: true },
      });
    }
  });

  /* ── ISO ── */
  gsap.timeline({ scrollTrigger: { trigger: '.iso-feature__inner', start: 'top 82%', once: true } })
    .from('.iso-feature__headline', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out' })
    .from('.iso-feature__body',     { y: 30, opacity: 0, duration: 1.0, stagger: 0.12, ease: 'power2.out' }, '-=0.8');

  // ISO Timeline progress line
  const isoScroller = document.getElementById('isoScroller');
  const isoLine = document.querySelector('.iso-timeline__line');
  const isoSteps = gsap.utils.toArray('.iso-step');
  
  if (isoScroller && isoLine && isoSteps.length) {
    // Removed GSAP opacity animation here to ensure steps are always visible
    
    isoScroller.addEventListener('scroll', () => {
      const maxScroll = isoScroller.scrollWidth - isoScroller.clientWidth;
      let progress = 1; // Default to fully active if no scrolling needed
      if (maxScroll > 0) {
        progress = isoScroller.scrollLeft / maxScroll;
      }
      isoLine.style.setProperty('--iso-progress', progress);
      
      const idx = Math.min(isoSteps.length - 1, Math.floor(progress * isoSteps.length));
      isoSteps.forEach((s, i) => s.classList.toggle('active', maxScroll <= 0 || i <= idx));
    });
    // Initialize state
    setTimeout(() => { isoScroller.dispatchEvent(new Event('scroll')); }, 100);
  }

  /* ── WHY ── */
  gsap.timeline({ scrollTrigger: { trigger: '.why__inner', start: 'top 82%', once: true } })
    .from('.why__headline', { y: 60, opacity: 0, duration: 1.3, ease: 'expo.out' })
    .from('.why__sub',      { y: 30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8');

  gsap.from('.why__pillar', {
    x: -40, opacity: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out',
    scrollTrigger: { trigger: '.why', start: 'top 70%', once: true },
    onComplete: () => gsap.set('.why__pillar', { opacity: 1, x: 0, clearProps: 'all' }),
  });

  /* ── BUSINESS TRANSFORMATION METHODOLOGIES ── */
  fadeUp('.bt-methodologies__headline', { y: 60, dur: 1.3, st: { trigger: '.bt-methodologies__header' } });
  fadeUp('.bt-methodologies__intro', { y: 40, dur: 1.1, st: { trigger: '.bt-methodologies__header' }, delay: 0.2 });
  gsap.from('.bt-card', {
    y: 60, opacity: 0, duration: 1.0, stagger: 0.15, ease: 'expo.out',
    scrollTrigger: { trigger: '.bt-methodologies__grid', start: 'top 82%', once: true },
  });

  /* ── INDUSTRIES ── */
  fadeUp('.industries__headline', { y: 60, dur: 1.3, st: { trigger: '.industries__header' } });
  gsap.from('.industry-card', {
    y: 50, opacity: 0, scale: 0.97, duration: 0.9, stagger: 0.08, ease: 'expo.out',
    scrollTrigger: { trigger: '.industries__grid', start: 'top 82%', once: true },
  });

  /* ── FOUNDER ── */
  const founderImg = document.querySelector('.founder__img');
  if (founderImg) {
    gsap.from(founderImg.parentElement, {
      opacity: 0, x: -50, duration: 1.4, ease: 'expo.out',
      scrollTrigger: { trigger: '.founder__inner', start: 'top 82%', once: true },
    });
    gsap.from(founderImg, {
      scale: 1.1, duration: 1.4, ease: 'power2.out',
      scrollTrigger: { trigger: '.founder__inner', start: 'top 82%', once: true },
    });
  }
  gsap.timeline({ scrollTrigger: { trigger: '.founder__content-col', start: 'top 82%', once: true } })
    .from('.founder__headline', { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out' })
    .from('.founder__body',     { y: 30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.75')
    .from('.credential',        { y: 20, opacity: 0, duration: 0.6, stagger: 0.07, ease: 'power2.out' }, '-=0.6')
    .from('.founder__stats',    { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.4');

  /* ── PROCESS ── */
  fadeUp('.process__headline', { y: 60, dur: 1.3, st: { trigger: '.process__header' } });
  gsap.from('.process__step', {
    x: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out',
    scrollTrigger: { trigger: '.process__track', start: 'top 82%', once: true },
  });

  const processScroller = document.querySelector('.process__scroller');
  const processConnector = document.querySelector('.process__connector');
  const processSteps = document.querySelectorAll('.process__step');
  
  if (processScroller && processConnector && processSteps.length) {
    processScroller.addEventListener('scroll', () => {
      const maxScroll = processScroller.scrollWidth - processScroller.clientWidth;
      let progress = 0;
      if (maxScroll > 0) {
        progress = processScroller.scrollLeft / maxScroll;
      }
      processConnector.style.setProperty('--process-progress', progress);
      
      const idx = Math.min(processSteps.length - 1, Math.floor(progress * processSteps.length));
      processSteps.forEach((s, i) => s.classList.toggle('active', i <= idx));
    });
    // Trigger once to set initial state
    setTimeout(() => { processScroller.dispatchEvent(new Event('scroll')); }, 100);
  }

  /* ── TESTIMONIALS ── */
  gsap.timeline({ scrollTrigger: { trigger: '.testimonials__inner', start: 'top 82%', once: true } })
    .from('.testimonials__headline', { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out' });

  /* ── CERT STRIP ── */
  gsap.timeline({ scrollTrigger: { trigger: '.cert-strip__inner', start: 'top 82%', once: true } })
    .from('.cert-strip__headline', { y: 50, opacity: 0, duration: 1.2, ease: 'expo.out' })
    .from('.cert-mark', { y: 20, opacity: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out' }, '-=0.6');

  /* ── FINAL CTA ── */
  const ctaBg = document.getElementById('finalCtaBg');
  if (ctaBg) {
    gsap.to(ctaBg, {
      yPercent: 20,
      ease: 'none',
      scrollTrigger: {
        trigger: '.final-cta',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      }
    });
  }

  gsap.timeline({ scrollTrigger: { trigger: '.final-cta', start: 'top 80%', once: true } })
    .from('.final-cta__headline', { y: 80, opacity: 0, duration: 1.4, ease: 'expo.out' })
    .from('.final-cta__body',     { y: 30, opacity: 0, duration: 1.0, ease: 'power2.out' }, '-=0.8')
    .from('.final-cta__actions',  { y: 20, opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.6');

  /* ── FOOTER ── */
  gsap.from('.footer__wordmark', {
    y: 30, opacity: 0, duration: 1.1, ease: 'expo.out',
    scrollTrigger: { trigger: '.footer__inner', start: 'top 88%', once: true },
  });
}

/* ============================================================
   ISO TIMELINE — Interactive hover
   ============================================================ */
function initISOTimeline() {
  const steps = document.querySelectorAll('.iso-step');
  if (!steps.length) return;
  steps[0].classList.add('active');
  steps.forEach(step => {
    step.setAttribute('tabindex', '0');
    step.addEventListener('mouseenter', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });
}

/* ============================================================
   PROCESS — Interactive Steps
   ============================================================ */
function initProcess() {
  const steps    = document.querySelectorAll('.process__step');
  const scroller = document.getElementById('processScroller');
  if (!steps.length) return;

  steps.forEach(step => {
    step.addEventListener('mouseenter', () => {
      steps.forEach(s => s.classList.remove('active'));
      step.classList.add('active');
    });
  });

  if (scroller) {
    scroller.addEventListener('scroll', () => {
      const stepWidth = scroller.scrollWidth / steps.length;
      const activeIdx = Math.min(Math.floor(scroller.scrollLeft / stepWidth), steps.length - 1);
      steps.forEach((s, i) => s.classList.toggle('active', i === activeIdx));
    }, { passive: true });
  }

  if (steps.length) steps[0].classList.add('active');
}

/* ============================================================
   TESTIMONIALS — Carousel
   ============================================================ */
function initTestimonials() {
  const testimonials = document.querySelectorAll('.testimonial');
  const prevBtn      = document.getElementById('testimonialsBack');
  const nextBtn      = document.getElementById('testimonialsNext');
  const counter      = document.getElementById('testimonialsCounter');

  if (!testimonials.length) return;

  let current = 0;
  const total = testimonials.length;

  function goTo(n) {
    testimonials[current].classList.remove('active');
    current = Math.max(0, Math.min(n, total - 1));
    testimonials[current].classList.add('active');
    if (counter) counter.textContent = `${String(current + 1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
  }

  testimonials[0].classList.add('active');
  if (counter) counter.textContent = `01 / ${String(total).padStart(2,'0')}`;
  if (prevBtn) { prevBtn.disabled = true; prevBtn.addEventListener('click', () => goTo(current - 1)); }
  if (nextBtn) nextBtn.addEventListener('click', () => goTo(current + 1));

  // Auto-advance every 6s
  let autoTimer = setInterval(() => {
    if (current < total - 1) goTo(current + 1);
    else goTo(0);
  }, 6000);

  // Pause on interaction
  [prevBtn, nextBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', () => { clearInterval(autoTimer); });
  });
}

/* ============================================================
   MAGNETIC BUTTONS
   ============================================================ */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect  = btn.getBoundingClientRect();
      const dx    = e.clientX - (rect.left + rect.width  / 2);
      const dy    = e.clientY - (rect.top  + rect.height / 2);
      btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });
}

/* ============================================================
   PAGE TRANSITIONS
   ============================================================ */
function initPageTransitions() {
  const overlay = document.getElementById('pageTransition');
  if (!overlay) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:')) return;

    link.addEventListener('click', e => {
      e.preventDefault();
      overlay.style.opacity = '1';
      setTimeout(() => { window.location.href = href; }, 520);
    });
  });
}

/* ============================================================
   SMOOTH HASH SCROLL
   ============================================================ */
function initHashScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.getElementById(anchor.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ============================================================
   CSS REVEAL OBSERVER — guaranteed animations (GSAP-independent)
   ============================================================ */
function initRevealObserver() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => io.observe(el));
}

/* ============================================================
   INIT — fires on window load so all images/fonts are measured
   ============================================================ */
function init() {
  initGSAP();
  initLenis();
  initCursor();
  initNav();
  initHeroAnimation();
  initStatCounters();
  initRevealObserver(); // CSS-based guaranteed animations
  // Delay GSAP scroll animations by one rAF to let Lenis + layout settle
  requestAnimationFrame(() => {
    initScrollAnimations();
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  });
  initISOTimeline();
  initProcess();
  initTestimonials();
  initMagneticButtons();
  initPageTransitions();
  initHashScrolling();
}

// Use 'load' so all images/webfonts are measured before ScrollTrigger calculates positions
if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}
