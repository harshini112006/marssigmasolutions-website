/**
 * Business Transformation hero: a live-drawn "Earth from orbit" scene.
 * Drawn on a canvas at the screen's pixel density, so it stays sharp at any size.
 * Night-side city lights, a warm gold atmospheric rim and a twinkling starfield.
 * Pauses when off-screen; draws one still frame for reduced-motion visitors.
 */
(function () {
  const canvas = document.querySelector('.bt-hero__space');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = 0, H = 0, dpr = 1;
  let stars = [], lightsLayer = null, planet = null;
  let running = false, raf = 0, t0 = performance.now();

  // seeded random so the scene looks the same on every load
  let seed = 7;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const phone = W < 700;
    // a huge planet centred off the bottom-right corner, so its limb sweeps
    // diagonally from the upper right down to the lower left of the hero
    planet = phone
      ? { x: W * 1.15, y: H * 1.3, r: H * 0.72 }
      : { x: W * 1.05, y: H * 1.55, r: H * 1.25 };

    seed = 7;
    stars = Array.from({ length: Math.round((W * H) / 2600) }, () => ({
      x: rnd() * W, y: rnd() * H,
      s: rnd() < 0.08 ? 1.3 + rnd() * 0.9 : 0.4 + rnd() * 0.7,
      a: 0.25 + rnd() * 0.6, f: 0.6 + rnd() * 1.8, p: rnd() * Math.PI * 2,
    }));
    buildLights();
  }

  // city lights: clustered warm dots, pre-rendered once on a layer twice the planet's visible width
  function buildLights() {
    const lw = Math.round(W * 2 * dpr), lh = Math.round(H * dpr);
    lightsLayer = document.createElement('canvas');
    lightsLayer.width = lw; lightsLayer.height = lh;
    const l = lightsLayer.getContext('2d');
    l.scale(dpr, dpr);
    seed = 41;
    const clusters = Array.from({ length: 240 }, () => ({
      x: rnd() * W * 2, y: H * (0.2 + rnd() * 0.8),
      n: 30 + Math.floor(rnd() * 120), spread: 18 + rnd() * 80,
    }));
    for (const c of clusters) {
      for (let i = 0; i < c.n; i++) {
        const ang = rnd() * Math.PI * 2, d = Math.pow(rnd(), 1.8) * c.spread;
        const x = c.x + Math.cos(ang) * d * 1.6, y = c.y + Math.sin(ang) * d * 0.7;
        const s = rnd() < 0.12 ? 1.6 : 0.9;
        l.fillStyle = `rgba(255,${195 + Math.floor(rnd() * 40)},${120 + Math.floor(rnd() * 60)},${0.55 + rnd() * 0.45})`;
        l.beginPath(); l.arc(x, y, s, 0, Math.PI * 2); l.fill();
      }
      // soft glow under each cluster
      const g = l.createRadialGradient(c.x, c.y, 0, c.x, c.y, c.spread * 1.4);
      g.addColorStop(0, 'rgba(255,190,110,0.10)'); g.addColorStop(1, 'rgba(255,190,110,0)');
      l.fillStyle = g; l.fillRect(c.x - c.spread * 2, c.y - c.spread * 2, c.spread * 4, c.spread * 4);
    }
  }

  function draw(now) {
    const t = (now - t0) / 1000;
    ctx.clearRect(0, 0, W, H);

    // deep space
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#01030a'); sky.addColorStop(1, '#030a1c');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);

    // stars (twinkle)
    for (const s of stars) {
      const a = s.a * (reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.f + s.p));
      ctx.fillStyle = `rgba(220,232,255,${a.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, Math.PI * 2); ctx.fill();
    }

    const { x, y, r } = planet;

    // outer atmosphere: warm gold rim fading into a cool blue haze
    const atm = ctx.createRadialGradient(x, y, r * 0.99, x, y, r * 1.12);
    atm.addColorStop(0, 'rgba(255,232,170,1)');
    atm.addColorStop(0.12, 'rgba(250,180,70,0.75)');
    atm.addColorStop(0.35, 'rgba(140,170,255,0.3)');
    atm.addColorStop(1, 'rgba(40,80,200,0)');
    ctx.fillStyle = atm;
    ctx.beginPath(); ctx.arc(x, y, r * 1.12, 0, Math.PI * 2); ctx.fill();

    // planet body
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.clip();
    const body = ctx.createRadialGradient(x - r * 0.25, y - r * 0.9, r * 0.1, x, y, r);
    body.addColorStop(0, '#0d1d3d'); body.addColorStop(0.55, '#050d22'); body.addColorStop(1, '#02050e');
    ctx.fillStyle = body; ctx.fillRect(x - r, y - r, r * 2, r * 2);

    // city lights drift slowly to suggest rotation
    if (lightsLayer) {
      const drift = reduce ? 0 : (t * 6) % W;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(lightsLayer, -drift, 0, W * 2, H);
      if (drift > W) ctx.drawImage(lightsLayer, W * 2 - drift, 0, W * 2, H);
      ctx.globalAlpha = 1;
    }
    // darken toward the planet's centre so lights fade with depth
    const shade = ctx.createRadialGradient(x, y, r * 0.75, x, y, r);
    shade.addColorStop(0, 'rgba(1,3,10,0.55)'); shade.addColorStop(1, 'rgba(1,3,10,0)');
    ctx.fillStyle = shade; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    // atmosphere seen from inside the limb: a warm haze just under the edge
    const haze = ctx.createRadialGradient(x, y, r * 0.95, x, y, r);
    haze.addColorStop(0, 'rgba(250,180,80,0)'); haze.addColorStop(1, 'rgba(255,200,110,0.55)');
    ctx.fillStyle = haze; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();

    // thin bright limb line
    ctx.strokeStyle = 'rgba(255,232,175,0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  }

  function loop(now) {
    if (!running) return;
    draw(now);
    raf = requestAnimationFrame(loop);
  }

  layout();
  draw(performance.now());
  canvas.classList.add('is-ready');

  if (reduce) {
    window.addEventListener('resize', () => { layout(); draw(performance.now()); });
    return;
  }
  const io = new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    cancelAnimationFrame(raf);
    if (running) raf = requestAnimationFrame(loop);
  });
  io.observe(canvas);
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { layout(); draw(performance.now()); }, 150); });
})();
