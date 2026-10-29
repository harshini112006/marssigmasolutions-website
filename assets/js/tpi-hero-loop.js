/**
 * Third-Party Inspection hero: a self-drawn looping "video" of an inspection line.
 * Parts ride a conveyor through a scanning gate, a magnifier hovers over the gate,
 * each part is stamped pass (mustard tick) or hold (maroon cross, lifted off the
 * line), a tolerance gauge needle settles and a readings chart ticks along.
 * Rendered on a canvas in the page's maroon / dusk-blue / pale-mustard palette,
 * so there is no video file. Reduced motion shows one still frame.
 */
(function () {
  const canvas = document.querySelector('.tp-hero__video');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const MUSTARD = '244,226,166', GOLD = '230,193,95', ICE = '207,224,255', ROSE = '255,214,220';
  const SPACING = 120, SPEED = 52; // px between parts, px per second
  let W = 0, H = 0, dpr = 1;

  function layout() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rr(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  const ease = p => p < 0 ? 0 : p > 1 ? 1 : 1 - Math.pow(1 - p, 3);
  const isHold = n => n % 7 === 4; // one part in seven is held, the rest pass

  function backdrop() {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, '#13294b'); g.addColorStop(0.55, '#0b1f3a'); g.addColorStop(1, '#081833');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W * 0.5, H * 0.6, 10, W * 0.5, H * 0.6, W * 0.7);
    glow.addColorStop(0, 'rgba(42,79,158,0.35)'); glow.addColorStop(1, 'rgba(42,79,158,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.045)'; ctx.lineWidth = 1;
    for (let x = 24; x < W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 24; y < H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  }

  function label(text, x, y, align, alpha) {
    ctx.font = '600 9px Manrope, sans-serif';
    ctx.textAlign = align || 'left';
    ctx.fillStyle = `rgba(${MUSTARD},${alpha || 0.8})`;
    ctx.fillText(text.split('').join(String.fromCharCode(8202)), x, y);
  }

  // tolerance gauge: the needle hunts, then settles in the band
  function gauge(t) {
    const cx = W * 0.25, cy = H * 0.3, r = Math.min(W, H) * 0.15;
    ctx.lineCap = 'round';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI, 2 * Math.PI); ctx.stroke();
    ctx.strokeStyle = `rgba(${GOLD},0.85)`;
    ctx.beginPath(); ctx.arc(cx, cy, r, Math.PI * 1.38, Math.PI * 1.62); ctx.stroke();
    ctx.lineWidth = 1; ctx.strokeStyle = `rgba(${ICE},0.35)`;
    for (let i = 0; i <= 10; i++) {
      const a = Math.PI + (i / 10) * Math.PI;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (r - 14), cy + Math.sin(a) * (r - 14));
      ctx.lineTo(cx + Math.cos(a) * (r - (i % 5 ? 19 : 24)), cy + Math.sin(a) * (r - (i % 5 ? 19 : 24))); ctx.stroke();
    }
    const cycle = (t % 5) / 5;
    const settle = Math.PI * 1.5 + Math.sin(t * 2.2) * 0.04;
    const a = cycle < 0.45 ? Math.PI * 1.15 + Math.sin(cycle * 14) * 0.35 * (1 - cycle * 2) + cycle * 0.75 : settle;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 10), cy + Math.sin(a) * (r - 10)); ctx.stroke();
    ctx.fillStyle = `rgb(${MUSTARD})`; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 6.29); ctx.fill();
    label('TOLERANCE', cx, cy + 20, 'center');
    ctx.font = 'italic 500 15px "Playfair Display", Georgia, serif'; ctx.fillStyle = cycle < 0.45 ? `rgba(${ICE},0.6)` : `rgb(${MUSTARD})`;
    ctx.textAlign = 'center'; ctx.fillText(cycle < 0.45 ? 'measuring' : 'within limits', cx, cy + 40);
  }

  // readings chart: bars scroll left, one new reading every half second
  function readings(t) {
    const x0 = W * 0.56, y0 = H * 0.08, w = W * 0.36, h = H * 0.27;
    rr(x0, y0, w, h, 12); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill();
    ctx.strokeStyle = `rgba(${MUSTARD},0.22)`; ctx.lineWidth = 1; ctx.stroke();
    label('READINGS', x0 + 14, y0 + 20);
    const n = 12, bw = (w - 28) / n, base = y0 + h - 14, maxH = h - 46;
    const lim = base - maxH * 0.78;
    ctx.setLineDash([3, 4]); ctx.strokeStyle = `rgba(${GOLD},0.6)`;
    ctx.beginPath(); ctx.moveTo(x0 + 14, lim); ctx.lineTo(x0 + w - 14, lim); ctx.stroke(); ctx.setLineDash([]);
    const step = Math.floor(t * 2), frac = (t * 2) % 1;
    for (let i = 0; i < n; i++) {
      const k = step + i, v = 0.45 + 0.28 * Math.abs(Math.sin(k * 1.7)) + (isHold(k) ? 0.3 : 0);
      const grow = i === n - 1 ? ease(frac * 2) : 1;
      const bh = maxH * v * grow, bx = x0 + 14 + i * bw + 2;
      const g = ctx.createLinearGradient(0, base - bh, 0, base);
      if (v > 0.78) { g.addColorStop(0, 'rgba(255,170,180,0.95)'); g.addColorStop(1, 'rgba(125,27,44,0.9)'); }
      else { g.addColorStop(0, `rgba(${ICE},0.9)`); g.addColorStop(1, 'rgba(42,79,158,0.75)'); }
      ctx.fillStyle = g; rr(bx, base - bh, bw - 4, bh, 2); ctx.fill();
    }
  }

  // conveyor, gate, parts, verdict badges
  function line(t) {
    const beltY = H * 0.72, gateX = W * 0.5;
    // belt
    ctx.fillStyle = 'rgba(15,20,48,0.35)'; rr(-10, beltY, W + 20, 16, 8); ctx.fill();
    ctx.strokeStyle = `rgba(${ICE},0.3)`; ctx.lineWidth = 1; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    const off = (t * SPEED) % 24;
    for (let x = -24 + off; x < W + 24; x += 24) { ctx.beginPath(); ctx.moveTo(x, beltY + 4); ctx.lineTo(x - 6, beltY + 12); ctx.stroke(); }
    for (let x = 18; x < W; x += 56) { ctx.fillStyle = 'rgba(207,224,255,0.25)'; ctx.beginPath(); ctx.arc(x, beltY + 24, 5, 0, 6.29); ctx.fill(); }

    // hold bin under the right end of the line
    const binX = W * 0.76, binY = H * 0.84;
    ctx.strokeStyle = 'rgba(255,170,180,0.5)'; ctx.setLineDash([4, 4]);
    rr(binX, binY, W * 0.18, H * 0.11, 8); ctx.stroke(); ctx.setLineDash([]);
    label('HOLD', binX + W * 0.09, binY + H * 0.055 + 3, 'center', 0.55);

    // parts
    const first = Math.floor((t * SPEED - W - 60) / SPACING), last = Math.floor((t * SPEED + 60) / SPACING);
    for (let n = first; n <= last; n++) {
      const x = t * SPEED - n * SPACING; // centre x of part n
      if (x < -60 || x > W + 60) continue;
      const pw = 46, ph = 30;
      let px = x, py = beltY - ph, rot = 0;
      const past = x - gateX;
      if (isHold(n) && past > W * 0.32) { // lifted off the line into the hold bin
        const p = Math.min(1, (past - W * 0.32) / 70);
        py = beltY - ph + ease(p) * (binY - beltY + 8); px = Math.min(x, binX + W * 0.09); rot = p * 0.25;
      }
      ctx.save(); ctx.translate(px, py + ph / 2); ctx.rotate(rot);
      const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2);
      g.addColorStop(0, '#fbf7ec'); g.addColorStop(1, '#d9dfee');
      ctx.fillStyle = g; rr(-pw / 2, -ph / 2, pw, ph, 6); ctx.fill();
      ctx.strokeStyle = 'rgba(44,62,110,0.5)'; ctx.stroke();
      ctx.fillStyle = 'rgba(44,62,110,0.55)';
      ctx.beginPath(); ctx.arc(-pw / 2 + 12, 0, 5, 0, 6.29); ctx.fill();
      ctx.fillRect(-2, -5, pw / 2 - 6, 3); ctx.fillRect(-2, 2, pw / 2 - 12, 3);
      ctx.restore();

      if (past > 0 && past < W * 0.5) { // verdict badge pops after the gate
        const s = ease(past / 26), hold = isHold(n);
        const bx = px + pw / 2 - 2, by = py - 4, br = 11 * s;
        ctx.fillStyle = hold ? '#7d1b2c' : `rgb(${MUSTARD})`;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.29); ctx.fill();
        ctx.strokeStyle = hold ? '#ffffff' : '#5a1422'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath();
        if (hold) { ctx.moveTo(bx - 4 * s, by - 4 * s); ctx.lineTo(bx + 4 * s, by + 4 * s); ctx.moveTo(bx + 4 * s, by - 4 * s); ctx.lineTo(bx - 4 * s, by + 4 * s); }
        else { ctx.moveTo(bx - 4.5 * s, by); ctx.lineTo(bx - 1 * s, by + 3.5 * s); ctx.lineTo(bx + 5 * s, by - 3.5 * s); }
        ctx.stroke();
      }
    }

    // gate arch + scanning beam
    const gh = H * 0.22, gw = 78, top = beltY - gh;
    const nearest = Math.abs(((t * SPEED - gateX) % SPACING + SPACING) % SPACING - SPACING / 2);
    const scanning = nearest > SPACING / 2 - 26; // a part is inside the gate
    const beam = ctx.createLinearGradient(0, top, 0, beltY);
    beam.addColorStop(0, `rgba(${MUSTARD},${scanning ? 0.5 : 0.14})`); beam.addColorStop(1, `rgba(${MUSTARD},0)`);
    ctx.fillStyle = beam;
    ctx.beginPath(); ctx.moveTo(gateX - 6, top + 10); ctx.lineTo(gateX + 6, top + 10); ctx.lineTo(gateX + gw / 2 - 6, beltY); ctx.lineTo(gateX - gw / 2 + 6, beltY); ctx.fill();
    const sy = top + 14 + ((t * 1.6) % 1) * (gh - 18);
    ctx.strokeStyle = `rgba(${MUSTARD},${scanning ? 0.95 : 0.4})`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(gateX - gw / 2 + 8, sy); ctx.lineTo(gateX + gw / 2 - 8, sy); ctx.stroke();
    ctx.strokeStyle = `rgba(${ICE},0.7)`; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gateX - gw / 2, beltY + 2); ctx.lineTo(gateX - gw / 2, top + 12);
    ctx.quadraticCurveTo(gateX - gw / 2, top, gateX - gw / 2 + 12, top);
    ctx.lineTo(gateX + gw / 2 - 12, top); ctx.quadraticCurveTo(gateX + gw / 2, top, gateX + gw / 2, top + 12);
    ctx.lineTo(gateX + gw / 2, beltY + 2); ctx.stroke();
    ctx.fillStyle = scanning ? `rgb(${MUSTARD})` : `rgba(${ROSE},0.7)`;
    ctx.beginPath(); ctx.arc(gateX, top, 4, 0, 6.29); ctx.fill();

    // magnifier hovering over the gate
    const mx = gateX + 46 + Math.sin(t * 0.9) * 8, my = top - 30 + Math.cos(t * 1.3) * 6;
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(mx, my, 16, 0, 6.29); ctx.stroke();
    ctx.fillStyle = `rgba(${ICE},0.15)`; ctx.fill();
    ctx.strokeStyle = `rgb(${MUSTARD})`; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(mx + 12, my + 12); ctx.lineTo(mx + 24, my + 24); ctx.stroke();

    // running tally
    const done = Math.max(0, Math.floor((t * SPEED - gateX) / SPACING));
    let held = 0; for (let k = 0; k <= done; k++) if (isHold(k)) held++;
    label('PASS ' + String(done + 1 - held).padStart(3, '0'), 16, H - 16, 'left', 0.9);
    label('HOLD ' + String(held).padStart(2, '0'), 96, H - 16, 'left', 0.6);
  }

  let start = performance.now(), raf = 0, visible = true;
  function frame(now) {
    const t = (now - start) / 1000 + 6; // start mid-flow so the belt is already busy
    backdrop(); gauge(t); readings(t); line(t);
    if (!reduce && visible) raf = requestAnimationFrame(frame);
  }
  function run() { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }

  layout(); run();
  new ResizeObserver(() => { layout(); if (reduce || !visible) frame(performance.now()); }).observe(canvas);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !reduce) run(); }).observe(canvas);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => frame(performance.now()));
})();
