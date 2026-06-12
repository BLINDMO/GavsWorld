/* Ambient ember/firefly particle field behind the whole app. */
const Particles = (() => {
  let canvas, ctx, parts = [], raf = null, W = 0, H = 0;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
  }

  function spawn() {
    const hue = Math.random() < 0.65 ? 215 + Math.random() * 30 : 22 + Math.random() * 14;
    return {
      x: Math.random() * W,
      y: H + 20 * devicePixelRatio,
      r: (0.8 + Math.random() * 2.2) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.18 * devicePixelRatio,
      vy: -(0.12 + Math.random() * 0.4) * devicePixelRatio,
      hue,
      life: 0,
      max: 700 + Math.random() * 900,
      tw: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    if (parts.length < 46 && Math.random() < 0.35) parts.push(spawn());
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life++; p.x += p.vx; p.y += p.vy; p.tw += 0.02;
      p.vx += Math.sin(p.life * 0.01 + p.tw) * 0.003 * devicePixelRatio;
      const fade = Math.min(p.life / 90, 1, (p.max - p.life) / 180);
      if (p.life > p.max || p.y < -30) { parts.splice(i, 1); continue; }
      const a = Math.max(0, fade * (0.35 + 0.3 * Math.sin(p.tw * 2)));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${a})`;
      ctx.shadowBlur = 8 * devicePixelRatio;
      ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, ${a})`;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(tick);
  }

  function start() {
    canvas = document.getElementById('bg-particles');
    if (!canvas || reduced) return;
    ctx = canvas.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = null; }
      else if (!raf) raf = requestAnimationFrame(tick);
    });
    raf = requestAnimationFrame(tick);
  }

  return { start };
})();
