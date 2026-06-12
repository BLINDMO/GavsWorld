/* ============================================================
   Gavin's World — Wheel of Fate
   Canvas-based physics spinner with notch (Wheel of Fortune) mechanic.
   ============================================================ */

const Wheel = (() => {
  const SEG_COLORS = [
    '#3b82f6','#f97316','#a855f7','#22c55e','#eab308',
    '#ec4899','#14b8a6','#f43f5e','#8b5cf6','#06b6d4',
    '#84cc16','#f59e0b','#6366f1','#10b981','#e879f9',
  ];

  /* ---- State ---- */
  let currentWheel = null;
  let angle = 0;
  let velocity = 0;
  let spinning = false;
  let rafId = null;
  let canvas = null, ctx = null;
  let W = 0, R = 0;
  let winnerCb = null;
  let lastWinner = -1;

  /* Notch flash state */
  let notchFlashFrames = 0;

  /* ---- Physics ---- */
  function tick() {
    if (!spinning) return;

    const prevAngle = angle;
    angle += velocity;
    velocity *= 0.992;

    /* Notch braking — Wheel of Fortune feel */
    if (currentWheel && currentWheel.entries.length > 1) {
      const n = currentWheel.entries.length;
      const segA = (Math.PI * 2) / n;
      const prevNotch = Math.floor(Math.abs(prevAngle) / segA);
      const currNotch = Math.floor(Math.abs(angle) / segA);
      if (prevNotch !== currNotch) {
        notchFlashFrames = 4;
        const spd = Math.abs(velocity);
        if (spd < 0.025)      velocity *= 0.68;
        else if (spd < 0.055) velocity *= 0.84;
        else if (spd < 0.10)  velocity *= 0.94;
      }
    }
    if (notchFlashFrames > 0) notchFlashFrames--;

    if (Math.abs(velocity) < 0.0012) {
      velocity = 0;
      spinning = false;
      const winner = getWinnerIndex();
      if (winnerCb && winner !== -1) winnerCb(winner, currentWheel.entries[winner]);
      lastWinner = winner;
    }
    drawWheel();
    rafId = requestAnimationFrame(tick);
  }

  function launch(speed) {
    if (!currentWheel || currentWheel.entries.length < 2) return;
    if (spinning) return;
    velocity = speed * (Math.random() > 0.5 ? 1 : -1);
    spinning = true;
    tick();
  }

  function getWinnerIndex() {
    if (!currentWheel || !currentWheel.entries.length) return -1;
    const n = currentWheel.entries.length;
    const segAngle = (Math.PI * 2) / n;
    const norm = (((-angle - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(norm / segAngle) % n;
  }

  /* ---- Draw ---- */
  function drawWheel() {
    if (!canvas || !ctx || !currentWheel) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const cx = W / 2 * dpr, cy = W / 2 * dpr;
    const r = R * dpr;
    const n = currentWheel.entries.length;
    if (!n) return;

    const segAngle = (Math.PI * 2) / n;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    /* outer glow */
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 1.1);
    glowGrad.addColorStop(0, 'rgba(59,130,246,0)');
    glowGrad.addColorStop(1, spinning ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.06)');
    ctx.beginPath(); ctx.arc(0, 0, r * 1.08, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad; ctx.fill();

    /* segments */
    for (let i = 0; i < n; i++) {
      const startA = i * segAngle - Math.PI / 2;
      const endA   = startA + segAngle;
      const color  = SEG_COLORS[i % SEG_COLORS.length];
      const isWinner = !spinning && lastWinner === i;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = isWinner ? '#f5c842' : color;
      ctx.fill();

      if (isWinner) {
        ctx.save();
        ctx.shadowBlur = 28 * dpr; ctx.shadowColor = '#f5c842';
        ctx.fillStyle = '#f5c84266';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, startA, endA); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startA, endA);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.28)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      /* text */
      const midA  = startA + segAngle / 2;
      const textR = r * 0.66;
      ctx.save();
      ctx.translate(Math.cos(midA) * textR, Math.sin(midA) * textR);
      ctx.rotate(midA + Math.PI / 2);
      ctx.fillStyle = isWinner ? '#1a1200' : '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const entry = currentWheel.entries[i];
      const label = typeof entry === 'string' ? entry : (entry.label || '');
      const maxCh = Math.max(6, Math.floor((r * 0.52 * 2 * Math.PI / n) / (10 * dpr)));
      const disp  = label.length > maxCh ? label.slice(0, maxCh - 1) + '…' : label;
      const fSize = Math.max(9, Math.min(15, (r * segAngle * 0.46) / (disp.length * 0.7 + 1)));
      ctx.font = `700 ${fSize * dpr}px "Rajdhani", sans-serif`;
      ctx.fillText(disp, 0, 0);
      ctx.restore();
    }

    /* notch pegs around the rim — rotate with wheel */
    const pegTipH  = Math.max(7, Math.min(13, r * 0.085));
    const pegHalfW = Math.max(3, Math.min(7,  r * 0.05));
    const flashing = notchFlashFrames > 0;

    for (let i = 0; i < n; i++) {
      const a    = i * segAngle - Math.PI / 2;
      const cosA = Math.cos(a), sinA = Math.sin(a);
      const perpC = Math.cos(a + Math.PI / 2), perpS = Math.sin(a + Math.PI / 2);

      ctx.beginPath();
      ctx.moveTo((cosA * r) - (perpC * pegHalfW), (sinA * r) - (perpS * pegHalfW));
      ctx.lineTo((cosA * r) + (perpC * pegHalfW), (sinA * r) + (perpS * pegHalfW));
      ctx.lineTo(cosA * (r + pegTipH), sinA * (r + pegTipH));
      ctx.closePath();

      ctx.fillStyle = flashing ? '#ffffff' : 'rgba(255,255,255,0.82)';
      if (flashing) { ctx.shadowBlur = 10 * dpr; ctx.shadowColor = '#fff'; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    /* hub */
    const innerR = r * 0.13;
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR);
    hubGrad.addColorStop(0, '#1a2a4a');
    hubGrad.addColorStop(1, '#0d1526');
    ctx.beginPath(); ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad; ctx.fill();
    ctx.strokeStyle = 'rgba(59,130,246,0.5)'; ctx.lineWidth = 2 * dpr; ctx.stroke();

    ctx.fillStyle = '#3b82f6';
    ctx.font = `800 ${innerR * 0.95}px "Rajdhani", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('G', 0, 0);

    /* motion-blur overlay while fast */
    if (spinning && Math.abs(velocity) > 0.04) {
      const blur = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
      blur.addColorStop(0, 'rgba(0,0,0,0)');
      blur.addColorStop(1, `rgba(0,0,0,${Math.min(0.32, Math.abs(velocity) * 1.8)})`);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = blur; ctx.fill();
    }

    ctx.restore();

    /* outer ring */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, 'rgba(59,130,246,0.55)');
    ringGrad.addColorStop(1, 'rgba(249,115,22,0.55)');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 2.5 * dpr;
    ctx.stroke();

    /* bevel */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.99, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1.5 * dpr; ctx.stroke();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const sz = Math.max(80, Math.min(rect.width || canvas.offsetWidth, 380));
    W = sz;
    R = sz * 0.41; /* smaller radius leaves room for peg tips inside canvas circle */
    canvas.width  = Math.round(sz * dpr);
    canvas.height = Math.round(sz * dpr);
    drawWheel();
  }

  /* ---- Thumbnail SVG ---- */
  function thumbSVG(wheel) {
    const n = wheel.entries.length;
    if (!n) return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="45" fill="#1a2a4a"/></svg>`;
    const r = 44, cx = 50, cy = 50;
    const segAngle = (Math.PI * 2) / n;
    let segs = '';
    for (let i = 0; i < n; i++) {
      const s = i * segAngle - Math.PI / 2;
      const e = s + segAngle;
      const x1 = cx + r * Math.cos(s), y1 = cy + r * Math.sin(s);
      const x2 = cx + r * Math.cos(e), y2 = cy + r * Math.sin(e);
      const large = segAngle > Math.PI ? 1 : 0;
      const color = SEG_COLORS[i % SEG_COLORS.length];
      segs += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z" fill="${color}" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>`;
    }
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${segs}
      <circle cx="${cx}" cy="${cy}" r="${r * 0.16}" fill="#0d1526"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(59,130,246,0.4)" stroke-width="2"/>
    </svg>`;
  }

  /* ---- Confetti burst ---- */
  function burst(container) {
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      const sz = 4 + Math.random() * 6;
      p.style.cssText = `
        width:${sz}px; height:${sz}px;
        background:${SEG_COLORS[Math.floor(Math.random() * SEG_COLORS.length)]};
        left:${20 + Math.random() * 60}%;
        top:${30 + Math.random() * 20}%;
        animation-duration:${0.8 + Math.random() * 0.9}s;
        animation-delay:${Math.random() * 0.2}s;
      `;
      container.appendChild(p);
      setTimeout(() => p.remove(), 2000);
    }
  }

  /* ---- Public API ---- */
  function init(canvasEl, onWinner) {
    canvas = canvasEl;
    ctx = canvas.getContext('2d');
    winnerCb = onWinner;
    lastWinner = -1;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function load(wheel) {
    currentWheel = wheel;
    angle = 0; velocity = 0; spinning = false; lastWinner = -1; notchFlashFrames = 0;
    cancelAnimationFrame(rafId);
    drawWheel();
  }

  function destroy() {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', resizeCanvas);
    canvas = null; ctx = null;
  }

  return {
    SEG_COLORS,
    init, load, destroy, drawWheel, resizeCanvas, launch, thumbSVG, burst,
    get spinning() { return spinning; },
  };
})();
