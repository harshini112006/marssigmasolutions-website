/**
 * Training hero: a self-drawn looping background "video".
 * Course modules drift upward while their progress bars fill and tick off,
 * a PDCA wheel draws itself quarter by quarter, a competency chart climbs and
 * a small network of learners links up, all in the page's maroon / dusk-blue
 * palette. Rendered on a canvas, so there is no video file to download;
 * reduced motion shows one still frame.
 */
(function () {
  const bg = document.querySelector('.tr-hero__bg');
  const canvas = bg && bg.querySelector('.tr-hero__video');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ROSE = '255,201,208', BLUSH = '255,232,236', ICE = '207,224,255', BLUE = '120,160,230';
  const TITLES = ['LEAD AUDITOR', 'INTERNAL AUDITOR', 'CORE TOOLS', 'VDA 6.3', 'SIX SIGMA', 'LEAN', 'FMEA', 'SPC', 'MSA'];
  let W = 0, H = 0, dpr = 1, cards = [], people = [];

  function rnd(seed) { // small deterministic PRNG so the layout is the same on every load
    return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  function layout() {
    const r = bg.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const R = rnd(11), narrow = W < 920, s = Math.max(0.75, Math.min(1.2, W / 1440));
    cards = [];
    const n = narrow ? 5 : 8;
    for (let i = 0; i < n; i++) {
      const x0 = narrow ? 0.04 : 0.48; // keep the cards clear of the headline on wide screens
      cards.push({
        x: W * (x0 + (1 - x0 - 0.12) * ((i + R() * 0.5) / n)),
        y: H * R(), w: (150 + R() * 50) * s, h: (92 + R() * 26) * s,
        rot: (R() - 0.5) * 0.22, speed: 7 + R() * 7, sway: R() * 6.28,
        phase: R() * 8, depth: 0.45 + R() * 0.55, title: TITLES[i % TITLES.length]
      });
    }
    cards.sort((a, b) => a.depth - b.depth);
    people = [];
    for (let i = 0; i < (narrow ? 9 : 14); i++) {
      people.push({ x: W * (narrow ? R() : 0.4 + R() * 0.6), y: H * (0.08 + R() * 0.84), a: R() * 6.28, r: 14 + R() * 24 });
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  // learners: small figures linked into a team network
  function drawPeople(t) {
    const pts = people.map(p => ({ x: p.x + Math.cos(t * 0.18 + p.a) * p.r, y: p.y + Math.sin(t * 0.22 + p.a) * p.r }));
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
        if (d < 230) {
          ctx.strokeStyle = 'rgba(' + ICE + ',' + (0.13 * (1 - d / 230)).toFixed(3) + ')';
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
    }
    pts.forEach((p, i) => {
      const glow = 0.35 + 0.3 * Math.sin(t * 0.9 + i);
      ctx.fillStyle = 'rgba(' + (i % 3 ? ICE : ROSE) + ',' + glow.toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y - 5, 3.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(p.x, p.y + 5, 6, Math.PI, 0); ctx.fill();
    });
  }

  // a course module card: title bar, lines of content, a progress bar that fills and ticks off
  function drawCard(c, t) {
    const travel = H + c.h * 2;
    const y = ((c.y - t * c.speed) % travel + travel) % travel - c.h;
    const x = c.x + Math.sin(t * 0.25 + c.sway) * 10;
    ctx.save();
    ctx.translate(x + c.w / 2, y + c.h / 2); ctx.rotate(c.rot + Math.sin(t * 0.2 + c.sway) * 0.03);
    ctx.globalAlpha = (W < 920 ? 0.22 : 0.14) + c.depth * 0.3; // faint, so the hero wheel stays legible
    const x0 = -c.w / 2, y0 = -c.h / 2;

    roundRect(x0, y0, c.w, c.h, 10);
    const g = ctx.createLinearGradient(x0, y0, x0 + c.w, y0 + c.h);
    g.addColorStop(0, 'rgba(125,27,44,0.55)'); g.addColorStop(1, 'rgba(42,79,158,0.45)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(' + BLUSH + ',0.35)'; ctx.lineWidth = 1; ctx.stroke();

    ctx.fillStyle = 'rgba(' + ROSE + ',0.9)';
    ctx.font = '600 ' + Math.round(9 * (c.w / 170)) + 'px Manrope, sans-serif';
    ctx.fillText(c.title, x0 + 14, y0 + 20);
    ctx.fillStyle = 'rgba(' + BLUSH + ',0.28)';
    for (let i = 0; i < 2; i++) { roundRect(x0 + 14, y0 + 32 + i * 11, c.w * (i ? 0.45 : 0.62), 4, 2); ctx.fill(); }

    const cycle = 7, p = ((t + c.phase) % cycle) / cycle, fill = Math.min(1, p / 0.7);
    const bw = c.w - 52, by = y0 + c.h - 22;
    roundRect(x0 + 14, by, bw, 6, 3); ctx.fillStyle = 'rgba(' + ICE + ',0.15)'; ctx.fill();
    if (fill > 0.01) {
      const pg = ctx.createLinearGradient(x0 + 14, 0, x0 + 14 + bw, 0);
      pg.addColorStop(0, 'rgba(' + ROSE + ',0.95)'); pg.addColorStop(1, 'rgba(' + BLUE + ',0.95)');
      roundRect(x0 + 14, by, Math.max(6, bw * fill), 6, 3); ctx.fillStyle = pg; ctx.fill();
    }
    const cx = x0 + c.w - 22, cy = by + 3;
    ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(' + ICE + ',' + (fill >= 1 ? 0.9 : 0.35) + ')'; ctx.lineWidth = 1.4; ctx.stroke();
    if (fill >= 1) {
      ctx.fillStyle = 'rgba(' + ICE + ',0.22)'; ctx.fill();
      const k = Math.min(1, (p - 0.7) / 0.1);
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx - 4 + 3 * Math.min(1, k * 2), cy + 3 * Math.min(1, k * 2));
      if (k > 0.5) ctx.lineTo(cx - 1 + 5 * (k - 0.5) * 2, cy + 3 - 6 * (k - 0.5) * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  // PDCA wheel: each quarter draws in turn, a marker travels round
  function drawWheel(t) {
    const narrow = W < 920;
    // wide screens: tucked under the copy column, clear of the hero wheel
    const cx = W * (narrow ? 0.8 : 0.5), cy = H * (narrow ? 0.14 : 0.84), r = narrow ? 36 : 46;
    const cycle = 8, p = (t % cycle) / cycle;
    const labels = ['P', 'D', 'C', 'A'];
    ctx.save(); ctx.globalAlpha = 0.75;
    ctx.strokeStyle = 'rgba(' + ICE + ',0.14)'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    for (let q = 0; q < 4; q++) {
      const start = -Math.PI / 2 + q * Math.PI / 2 + 0.06;
      const k = Math.max(0, Math.min(1, p * 4 - q));
      if (k > 0) {
        ctx.strokeStyle = 'rgba(' + (q % 2 ? BLUE : ROSE) + ',0.85)'; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, r, start, start + (Math.PI / 2 - 0.12) * k); ctx.stroke();
      }
      const mid = start + Math.PI / 4 - 0.06;
      ctx.fillStyle = 'rgba(' + BLUSH + ',' + (k >= 1 ? 0.95 : 0.4) + ')';
      ctx.font = 'italic 500 ' + (narrow ? 13 : 15) + 'px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(labels[q], cx + Math.cos(mid) * r * 0.58, cy + Math.sin(mid) * r * 0.58);
    }
    const a = -Math.PI / 2 + p * Math.PI * 2;
    ctx.fillStyle = '#fff'; ctx.shadowColor = 'rgba(' + ROSE + ',0.9)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // competency chart: bars climb in sequence, a trend line joins their tops
  function drawChart(t) {
    const narrow = W < 920;
    const w = narrow ? 150 : 190, h = narrow ? 80 : 90;
    const x0 = W * (narrow ? 0.55 : 0.8), y0 = H * 0.93;
    const cycle = 9, p = (t % cycle) / cycle, n = 6;
    ctx.save(); ctx.globalAlpha = 0.7;
    ctx.strokeStyle = 'rgba(' + ICE + ',0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y0 - h); ctx.lineTo(x0, y0); ctx.lineTo(x0 + w, y0); ctx.stroke();
    const bw = w / n * 0.55, tops = [];
    for (let i = 0; i < n; i++) {
      const k = Math.max(0, Math.min(1, p * 1.6 * n / 2 - i * 0.5));
      const bh = h * (0.25 + 0.12 * i) * (1 - Math.pow(1 - k, 3));
      const bx = x0 + (i + 0.3) * (w / n);
      const g = ctx.createLinearGradient(0, y0 - bh, 0, y0);
      g.addColorStop(0, 'rgba(' + ROSE + ',0.75)'); g.addColorStop(1, 'rgba(42,79,158,0.35)');
      ctx.fillStyle = g; roundRect(bx, y0 - bh, bw, Math.max(bh, 0.1), 2); ctx.fill();
      tops.push([bx + bw / 2, y0 - bh - 6]);
    }
    ctx.strokeStyle = 'rgba(' + BLUSH + ',0.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); tops.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    ctx.restore();
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    drawPeople(t);
    cards.forEach(c => drawCard(c, t));
    drawWheel(t);
    drawChart(t);
  }

  layout();
  bg.classList.add('is-live');

  if (reduce) { frame(5.6); window.addEventListener('resize', () => { layout(); frame(5.6); }); return; }

  let visible = true, raf = 0, last = 0, t0 = performance.now();
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (now - last < 33) return; // ~30 fps is plenty for a background
    last = now;
    frame((now - t0) / 1000);
  }
  function setRunning(on) {
    if (on && !raf) raf = requestAnimationFrame(loop);
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; setRunning(visible && !document.hidden); }).observe(bg);
  }
  document.addEventListener('visibilitychange', () => setRunning(visible && !document.hidden));
  let rt;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });
  setRunning(true);
})();
