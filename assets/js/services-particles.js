/**
 * "What we do" headline: scattered ink and maroon particles converge
 * into the headline as the visitor scrolls through the services header.
 * Needs GSAP + ScrollTrigger (loaded in index.html). Reduced-motion visitors
 * just see the normal headline.
 */
(function () {
  const header = document.querySelector('.services__header');
  const headline = document.querySelector('.services__headline');
  if (!header || !headline || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  gsap.registerPlugin(ScrollTrigger);

  const canvas = document.createElement('canvas');
  canvas.className = 'services__particles';
  canvas.setAttribute('aria-hidden', 'true');
  header.prepend(canvas);
  header.classList.add('has-particles');

  // The header's own position is locked with !important elsewhere, so pin a wrapper instead.
  const pinWrap = document.createElement('div');
  pinWrap.className = 'services__pin';
  header.parentNode.insertBefore(pinWrap, header);
  pinWrap.appendChild(header);

  const ctx = canvas.getContext('2d');
  const COLORS = ['11,31,58', '19,41,75', '30,58,100', '42,79,158', '125,27,44'];
  let particles = [];
  let W = 0, H = 0, dpr = 1;
  let progress = 0;
  let running = false;

  const isPhone = () => window.innerWidth < 768;

  /* Target points: draw the headline lines offscreen and sample lit pixels. */
  function sampleTargets() {
    const box = header.getBoundingClientRect();
    const cs = getComputedStyle(headline);
    const off = document.createElement('canvas');
    off.width = Math.ceil(W);
    off.height = Math.ceil(H);
    const o = off.getContext('2d');
    o.fillStyle = '#fff';
    o.textAlign = 'center';
    o.textBaseline = 'middle';
    o.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    if ('letterSpacing' in o) o.letterSpacing = cs.letterSpacing;

    // Draw word by word at each word's on-screen box, so it matches however the headline wraps.
    const range = document.createRange();
    headline.childNodes.forEach(node => {
      if (node.nodeType !== 3) return;
      const re = /\S+/g;
      let m;
      while ((m = re.exec(node.textContent))) {
        range.setStart(node, m.index);
        range.setEnd(node, m.index + m[0].length);
        const r = range.getBoundingClientRect();
        o.fillText(m[0], r.left - box.left + r.width / 2, r.top - box.top + r.height / 2);
      }
    });

    const step = isPhone() ? 3 : 5;
    const data = o.getImageData(0, 0, off.width, off.height).data;
    const pts = [];
    for (let y = 0; y < off.height; y += step) {
      for (let x = 0; x < off.width; x += step) {
        if (data[(y * off.width + x) * 4 + 3] > 140) pts.push([x, y]);
      }
    }
    const max = isPhone() ? 1500 : 2600;
    if (pts.length > max) {
      // even thinning keeps letter shapes readable
      const keep = max / pts.length;
      return pts.filter(() => Math.random() < keep);
    }
    return pts;
  }

  function build() {
    const box = header.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width;
    H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const targets = sampleTargets();
    const cx = W / 2, cy = H / 2;
    particles = targets.map(([tx, ty]) => {
      // scatter on a loose swirl around the centre, like a starfield
      const a = Math.random() * Math.PI * 2;
      const rad = (0.35 + Math.random() * 0.85) * Math.max(W, H) * 0.6;
      const orange = Math.random() < 0.22;
      return {
        sx: cx + Math.cos(a) * rad,
        sy: cy + Math.sin(a) * rad * 0.6,
        tx, ty,
        swirl: (Math.random() - 0.5) * 1.4,
        delay: Math.random() * 0.35,
        size: (orange ? 1.6 + Math.random() : 0.8 + Math.random() * 1.3) * (isPhone() ? 0.7 : 1),
        color: orange ? COLORS[4] : COLORS[Math.floor(Math.random() * 4)],
        tw: Math.random() * Math.PI * 2,
      };
    });
    draw(performance.now());
  }

  const easeInOut = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
    const t = now / 1000;
    const cx = W / 2, cy = H / 2;
    for (const p of particles) {
      const local = Math.min(1, Math.max(0, (progress - p.delay) / (1 - 0.35)));
      const e = easeInOut(local);
      // rotate the start point around the centre as it travels, for a spiral feel
      const ang = p.swirl * (1 - e) * Math.PI;
      const dx = p.sx - cx, dy = p.sy - cy;
      const rx = cx + dx * Math.cos(ang) - dy * Math.sin(ang);
      const ry = cy + dx * Math.sin(ang) + dy * Math.cos(ang);
      const x = rx + (p.tx - rx) * e;
      const y = ry + (p.ty - ry) * e;
      const twinkle = 0.55 + 0.45 * Math.sin(t * 2 + p.tw);
      const alpha = (0.35 + 0.65 * e) * (e > 0.98 ? 1 : twinkle);
      const r = p.size * (1.6 - 0.6 * e);
      ctx.fillStyle = `rgba(${p.color},${alpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      if (r > 1.6) { // soft halo on the bigger stars
        ctx.fillStyle = `rgba(${p.color},${(alpha * 0.12).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, r * 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    requestAnimationFrame(loop);
  }

  function setProgress(p) {
    progress = p;
    // crisp headline fades in over the formed particles at the end
    const reveal = Math.min(1, Math.max(0, (p - 0.8) / 0.2));
    header.style.setProperty('--headline-reveal', reveal.toFixed(3));
    canvas.style.opacity = (1 - reveal).toFixed(3);
  }

  function init() {
    build();
    setProgress(0);
    ScrollTrigger.create({
      trigger: pinWrap,
      start: () => (header.offsetHeight < window.innerHeight ? 'center center' : 'top top'),
      end: () => '+=' + Math.round(window.innerHeight * (isPhone() ? 0.6 : 0.9)),
      pin: pinWrap,
      scrub: 0.6,
      onUpdate: self => setProgress(self.progress),
      onToggle: self => {
        running = self.isActive || (self.progress > 0 && self.progress < 1);
        if (running) requestAnimationFrame(loop);
      },
      onRefresh: () => build(),
    });
    // keep twinkling while the header is on screen, even outside the pin
    const io = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
      if (running) requestAnimationFrame(loop);
    });
    io.observe(header);
  }

  const start = () => (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(init);
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start);
})();
