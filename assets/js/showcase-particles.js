/**
 * Home "capability" card row: a soft maroon and ink-blue particle field
 * drifting behind the cards, with faint links between nearby particles.
 * Runs only while the section is on screen; reduced-motion visitors get a
 * single still frame.
 */
(function () {
  const section = document.getElementById('showcase');
  const bg = section && section.querySelector('.showcase__bg');
  if (!bg) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'showcase__particles';
  canvas.setAttribute('aria-hidden', 'true');
  bg.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const COLORS = ['125,27,44', '148,35,58', '30,58,138', '42,79,158', '19,41,75'];
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, dpr = 1, particles = [], running = false, raf = 0;

  function resize() {
    const box = section.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = box.width; H = box.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(120, Math.max(36, (W * H) / 9000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.4 + Math.random() * 2.6,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: 0.45 + Math.random() * 0.4,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const link = W < 768 ? 90 : 130;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dx = p.x - q.x, dy = p.y - q.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < link) {
          ctx.strokeStyle = `rgba(${p.c},${(1 - d / link) * 0.26})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }
    }
    for (const p of particles) {
      ctx.fillStyle = `rgba(${p.c},${p.a})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function step() {
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10; else if (p.y > H + 10) p.y = -10;
    }
    draw();
    if (running) raf = requestAnimationFrame(step);
  }

  function play() { if (!running && !still) { running = true; raf = requestAnimationFrame(step); } }
  function pause() { running = false; cancelAnimationFrame(raf); }

  resize();
  draw();
  window.addEventListener('resize', () => { resize(); draw(); });
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? play() : pause())).observe(section);
})();
