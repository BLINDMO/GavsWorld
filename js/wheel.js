/* ============================================================
   Gavin's World — Wheel of Fate
   Canvas-based physics spinner with pull-handle mechanic.
   ============================================================ */

const Wheel = (() => {
  /* premium color palette for wheel segments */
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
  let isDraggingHandle = false;
  let handleDragStart = 0;
  let handleY = 0;
  let pullDistance = 0;
  const MAX_PULL = 130;

  /* ---- Physics ---- */
  function tick() {
    if (!spinning) return;
    angle += velocity;
    velocity *= 0.992;
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
    /* pointer is at top (−π/2). Normalise wheel angle. */
    const norm = (((-angle - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    return Math.floor(norm / segAngle) % n;
  }

  /* ---- Draw ---- */
  function drawWheel() {
    if (!canvas || !ctx || !currentWheel) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, W * dpr, W * dpr);
    const cx = W / 2 * dpr, cy = W / 2 * dpr;
    const r = R * dpr;
    const n = currentWheel.entries.length;
    if (!n) return;

    const segAngle = (Math.PI * 2) / n;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    /* outer glow ring */
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.85, 0, 0, r * 1.05);
    glowGrad.addColorStop(0, 'rgba(59,130,246,0)');
    glowGrad.addColorStop(1, spinning ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.08)');
    ctx.beginPath(); ctx.arc(0, 0, r * 1.03, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad; ctx.fill();

    /* segments */
    for (let i = 0; i < n; i++) {
      const startA = i * segAngle - Math.PI / 2;
      const endA = startA + segAngle;
      const color = SEG_COLORS[i % SEG_COLORS.length];
      const isWinner = !spinning && lastWinner === i;

      /* segment fill */
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startA, endA);
      ctx.closePath();
      ctx.fillStyle = isWinner ? '#f5c842' : color;
      ctx.fill();

      /* segment glow on winner */
      if (isWinner) {
        ctx.save();
        ctx.shadowBlur = 24 * dpr;
        ctx.shadowColor = '#f5c842';
        ctx.fillStyle = '#f5c84288';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, startA, endA); ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      /* segment border */
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, startA, endA);
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      /* text */
      const midA = startA + segAngle / 2;
      const textR = r * 0.68;
      const tx = Math.cos(midA) * textR;
      const ty = Math.sin(midA) * textR;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midA + Math.PI / 2);
      ctx.fillStyle = isWinner ? '#1a1200' : '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const entry = currentWheel.entries[i];
      const label = (typeof entry === 'string' ? entry : entry.label || '');
      const maxChars = Math.max(6, Math.floor((r * 0.52 * 2 * Math.PI / n) / (10 * dpr)));
      const displayText = label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label;
      const fontSize = Math.max(9, Math.min(15, (r * segAngle * 0.48) / (displayText.length * 0.7 + 1)));
      ctx.font = `600 ${fontSize * dpr}px "Rajdhani", sans-serif`;
      ctx.fillText(displayText, 0, 0);
      ctx.restore();
    }

    /* inner circle */
    const innerR = r * 0.14;
    const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, innerR);
    hubGrad.addColorStop(0, '#1a2a4a');
    hubGrad.addColorStop(1, '#0d1526');
    ctx.beginPath(); ctx.arc(0, 0, innerR, 0, Math.PI * 2);
    ctx.fillStyle = hubGrad; ctx.fill();
    ctx.strokeStyle = 'rgba(59,130,246,0.4)'; ctx.lineWidth = 2 * dpr; ctx.stroke();

    /* G mark on hub */
    ctx.fillStyle = '#3b82f6';
    ctx.font = `700 ${innerR * 0.9}px "Rajdhani", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('G', 0, 0);

    /* motion-blur ring while spinning */
    if (spinning && Math.abs(velocity) > 0.04) {
      const blur = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r);
      blur.addColorStop(0, 'rgba(0,0,0,0)');
      blur.addColorStop(1, `rgba(0,0,0,${Math.min(0.35, Math.abs(velocity) * 2)})`);
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fillStyle = blur; ctx.fill();
    }

    ctx.restore();

    /* outer ring border */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
    const ringGrad = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
    ringGrad.addColorStop(0, 'rgba(59,130,246,0.5)');
    ringGrad.addColorStop(1, 'rgba(249,115,22,0.5)');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 3 * dpr;
    ctx.stroke();

    /* bevel */
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.99, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 2 * dpr; ctx.stroke();
  }

  function resizeCanvas() {
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    /* Use the canvas's own CSS-computed size (now driven by CSS min()) */
    const rect = canvas.getBoundingClientRect();
    const sz = Math.max(80, Math.min(rect.width || canvas.offsetWidth, 500));
    W = sz; R = sz * 0.47;
    canvas.width = Math.round(sz * dpr);
    canvas.height = Math.round(sz * dpr);
    drawWheel();
  }

  /* ---- Thumbnail SVG for saved wheels (no canvas needed) ---- */
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
      <circle cx="${cx}" cy="${cy}" r="${r * 0.18}" fill="#0d1526"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(59,130,246,0.4)" stroke-width="2"/>
    </svg>`;
  }

  /* ---- Handle drag ---- */
  function handlePointerDown(e, knob, track) {
    isDraggingHandle = true;
    const rect = track.getBoundingClientRect();
    handleDragStart = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    pullDistance = 0;
    e.preventDefault();
  }
  function handlePointerMove(e, knob, track) {
    if (!isDraggingHandle) return;
    const rect = track.getBoundingClientRect();
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    pullDistance = Math.max(0, Math.min(MAX_PULL, y - handleDragStart + pullDistance));
    const pct = pullDistance / MAX_PULL;
    knob.style.top = (pct * (track.offsetHeight - knob.offsetHeight)) + 'px';
    e.preventDefault();
  }
  function handlePointerUp(knob) {
    if (!isDraggingHandle) return;
    isDraggingHandle = false;
    const speed = (pullDistance / MAX_PULL) * 0.25 + 0.02;
    knob.style.top = '0px';
    pullDistance = 0;
    launch(speed);
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
    canvas = canvasEl; ctx = canvas.getContext('2d');
    winnerCb = onWinner;
    lastWinner = -1;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  function load(wheel) {
    currentWheel = wheel;
    angle = 0; velocity = 0; spinning = false; lastWinner = -1;
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
    init, load, destroy, drawWheel, resizeCanvas, launch, thumbSVG,
    handlePointerDown, handlePointerMove, handlePointerUp, burst,
    get spinning() { return spinning; },
  };
})();
