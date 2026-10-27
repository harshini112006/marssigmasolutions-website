/**
 * ISO Consulting hero: a self-drawn looping background "video".
 * Audit documents drift upward while their checklists tick off, an approval
 * stamp lands, a magnifier sweeps a page and a performance chart draws itself,
 * all in the page's maroon / dusk-blue palette. Rendered on a canvas, so there
 * is no video file to download. The photo underneath stays as the poster
 * fallback (no canvas, reduced motion shows one still frame).
 */
(function () {
  const bg = document.querySelector('.cs-hero__bg');
  const canvas = bg && bg.querySelector('.cs-hero__video');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ROSE = '255,201,208', BLUSH = '255,232,236', ICE = '207,224,255', BLUE = '120,160,230';
  let W = 0, H = 0, dpr = 1, docs = [], nodes = [];

  function rnd(seed) { // small deterministic PRNG so the layout is the same on every load
    return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  }

  function layout() {
    const r = bg.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const R = rnd(7), narrow = W < 920, s = Math.max(0.75, Math.min(1.25, W / 1440));
    docs = [];
    const n = narrow ? 6 : 9;
    for (let i = 0; i < n; i++) {
      const x0 = narrow ? 0.05 : 0.5; // keep the sheets clear of the headline on wide screens
      docs.push({
        x: W * (x0 + (1 - x0 - 0.06) * ((i + R() * 0.6) / n)),
        y: H * R(),
        w: (130 + R() * 70) * s, h: (170 + R() * 80) * s,
        rot: (R() - 0.5) * 0.35, speed: 6 + R() * 8, sway: R() * 6.28,
        lines: 4 + Math.floor(R() * 3), checks: 3, phase: R() * 10,
        depth: 0.45 + R() * 0.55, stamp: i % 3 === 1
      });
    }
    docs.sort((a, b) => a.depth - b.depth);
    nodes = [];
    for (let i = 0; i < (narrow ? 10 : 16); i++) {
      nodes.push({ x: W * (narrow ? R() : 0.35 + R() * 0.65), y: H * R(), a: R() * 6.28, r: 18 + R() * 30 });
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function drawDoc(d, t) {
    const travel = H + d.h * 2;
    const y = ((d.y - t * d.speed) % travel + travel) % travel - d.h;
    const x = d.x + Math.sin(t * 0.25 + d.sway) * 10;
    const a = d.depth;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(d.rot + Math.sin(t * 0.2 + d.sway) * 0.03);
    ctx.globalAlpha = a;

    // sheet
    roundRect(-d.w / 2, -d.h / 2, d.w, d.h, 8);
    const g = ctx.createLinearGradient(-d.w / 2, -d.h / 2, d.w / 2, d.h / 2);
    g.addColorStop(0, 'rgba(' + BLUSH + ',0.10)'); g.addColorStop(1, 'rgba(' + ICE + ',0.06)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = 'rgba(' + ROSE + ',0.32)'; ctx.lineWidth = 1; ctx.stroke();

    const px = -d.w / 2 + 14, pw = d.w - 28;
    let ly = -d.h / 2 + 18;
    // header bar
    ctx.fillStyle = 'rgba(' + ROSE + ',0.45)'; ctx.fillRect(px, ly, pw * 0.45, 5);
    ctx.fillStyle = 'rgba(' + ICE + ',0.25)'; ctx.fillRect(px + pw * 0.7, ly, pw * 0.3, 5);
    ly += 18;
    // body text lines
    ctx.fillStyle = 'rgba(' + BLUSH + ',0.2)';
    for (let i = 0; i < d.lines; i++) { ctx.fillRect(px, ly, pw * (0.55 + ((i * 37) % 40) / 100), 2.5); ly += 9; }
    ly += 6;

    // checklist: boxes tick one after another, then the cycle restarts
    const cycle = 9, local = ((t + d.phase) % cycle) / cycle;
    for (let i = 0; i < d.checks; i++) {
      const bx = px, by = ly + i * 18;
      ctx.strokeStyle = 'rgba(' + ICE + ',0.45)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx, by, 10, 10);
      ctx.fillStyle = 'rgba(' + BLUSH + ',0.16)'; ctx.fillRect(bx + 18, by + 4, pw * 0.55, 2.5);
      const start = 0.12 + i * 0.18, p = Math.max(0, Math.min(1, (local - start) / 0.08));
      if (p > 0 && local < 0.92) {
        ctx.strokeStyle = 'rgba(' + ROSE + ',0.95)'; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(bx + 2, by + 5);
        const k1 = Math.min(1, p * 2), k2 = Math.max(0, p * 2 - 1);
        ctx.lineTo(bx + 2 + 2.5 * k1, by + 5 + 3 * k1);
        if (k2 > 0) ctx.lineTo(bx + 4.5 + 6 * k2, by + 8 - 9 * k2);
        ctx.stroke();
      }
    }

    // approval stamp lands once the list is complete
    if (d.stamp) {
      const sp = (local - 0.7) / 0.06;
      if (sp > 0 && local < 0.92) {
        const k = Math.min(1, sp), sc = 1.5 - 0.5 * k, fade = local > 0.86 ? (0.92 - local) / 0.06 : 1;
        ctx.save();
        ctx.translate(d.w / 2 - 34, d.h / 2 - 34); ctx.rotate(-0.25); ctx.scale(sc, sc);
        ctx.globalAlpha = a * k * fade;
        ctx.strokeStyle = 'rgba(' + ROSE + ',0.9)'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.setLineDash([2, 3]); ctx.stroke(); ctx.setLineDash([]);
        ctx.lineWidth = 2.2; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-2, 5); ctx.lineTo(8, -6); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function drawNetwork(t) {
    const pts = nodes.map(n => ({ x: n.x + Math.cos(t * 0.15 + n.a) * n.r, y: n.y + Math.sin(t * 0.12 + n.a) * n.r }));
    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < 210) { ctx.strokeStyle = 'rgba(' + BLUE + ',' + (0.18 * (1 - dd / 210)).toFixed(3) + ')'; ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
      }
    }
    pts.forEach((p, i) => {
      ctx.fillStyle = 'rgba(' + (i % 2 ? ICE : ROSE) + ',' + (0.35 + 0.25 * Math.sin(t + i)).toFixed(3) + ')';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fill();
    });
  }

  // performance chart that draws itself, holds, fades and redraws
  function drawChart(t) {
    const cw = Math.min(380, W * 0.3), ch = cw * 0.45;
    const x0 = W < 920 ? W * 0.5 - cw / 2 : W - cw - W * 0.06, y0 = H - ch - H * 0.1;
    const cycle = 10, local = (t % cycle) / cycle;
    const draw = Math.min(1, local / 0.45), fade = local > 0.85 ? (1 - local) / 0.15 : 1;
    ctx.save(); ctx.globalAlpha = 0.85 * fade;
    ctx.strokeStyle = 'rgba(' + ICE + ',0.18)'; ctx.lineWidth = 1;
    for (let i = 0; i <= 3; i++) { const gy = y0 + (ch / 3) * i; ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + cw, gy); ctx.stroke(); }
    const vals = [0.2, 0.32, 0.28, 0.45, 0.52, 0.5, 0.66, 0.74, 0.86];
    // bars
    vals.forEach((v, i) => {
      const bw = cw / vals.length * 0.42, bx = x0 + (cw / (vals.length - 1)) * i - bw / 2;
      const k = Math.max(0, Math.min(1, draw * vals.length - i));
      ctx.fillStyle = 'rgba(' + BLUE + ',0.16)';
      ctx.fillRect(bx, y0 + ch - ch * v * 0.8 * k, bw, ch * v * 0.8 * k);
    });
    // line
    const g = ctx.createLinearGradient(x0, 0, x0 + cw, 0);
    g.addColorStop(0, 'rgba(' + ROSE + ',0.9)'); g.addColorStop(1, 'rgba(' + ICE + ',0.95)');
    ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineJoin = 'round';
    ctx.beginPath();
    const segs = (vals.length - 1) * draw;
    let ex = x0, ey = y0 + ch - ch * vals[0];
    ctx.moveTo(ex, ey);
    for (let i = 1; i <= Math.ceil(segs); i++) {
      const f = Math.min(1, segs - (i - 1));
      const ax = x0 + (cw / (vals.length - 1)) * (i - 1), ay = y0 + ch - ch * vals[i - 1];
      const bx = x0 + (cw / (vals.length - 1)) * i, by = y0 + ch - ch * vals[i];
      ex = ax + (bx - ax) * f; ey = ay + (by - ay) * f; ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(' + BLUSH + ',1)'; ctx.shadowColor = 'rgba(' + ROSE + ',0.9)'; ctx.shadowBlur = 12;
    ctx.beginPath(); ctx.arc(ex, ey, 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // magnifier sweeping across the scene, like a reviewer scanning a page
  function drawLens(t) {
    const cx = W * (W < 920 ? 0.5 : 0.66) + Math.sin(t * 0.22) * W * 0.12;
    const cy = H * 0.38 + Math.sin(t * 0.31) * H * 0.12;
    ctx.save(); ctx.globalAlpha = 0.7;
    ctx.strokeStyle = 'rgba(' + BLUSH + ',0.55)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 34, 0, Math.PI * 2); ctx.stroke();
    const lg = ctx.createRadialGradient(cx - 10, cy - 10, 2, cx, cy, 34);
    lg.addColorStop(0, 'rgba(' + ICE + ',0.18)'); lg.addColorStop(1, 'rgba(' + ICE + ',0.02)');
    ctx.fillStyle = lg; ctx.fill();
    ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx + 25, cy + 25); ctx.lineTo(cx + 50, cy + 50); ctx.stroke();
    ctx.restore();
  }

  function frame(t) {
    ctx.clearRect(0, 0, W, H);
    drawNetwork(t);
    docs.forEach(d => drawDoc(d, t));
    drawChart(t);
    drawLens(t);
  }

  layout();
  bg.classList.add('is-live');

  if (reduce) { frame(6.4); window.addEventListener('resize', () => { layout(); frame(6.4); }); return; }

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
