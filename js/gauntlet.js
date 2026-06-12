/* ============================================================
   Gavin's World — The Gauntlet (Quick-Draw Reflex Game)
   Anime-themed reaction-time duel. Press when you see DRAW!
   ============================================================ */

const Gauntlet = (() => {
  const RANKS = [
    { max: 150,  grade: 'S', label: 'LEGENDARY', color: '#f5c842' },
    { max: 250,  grade: 'A', label: 'ELITE',     color: '#3b82f6' },
    { max: 380,  grade: 'B', label: 'SKILLED',   color: '#22c55e' },
    { max: 560,  grade: 'C', label: 'FIGHTER',   color: '#f97316' },
    { max: Infinity, grade: 'D', label: 'ROOKIE', color: '#6b8ab4' },
  ];
  const EARLY_RANK = { grade: 'early', label: 'TOO EARLY!', color: '#ef4444' };

  const BEST_SCORES_KEY = 'gw_gauntlet_scores';
  const MAX_SCORES = 5;

  let container = null;
  let state = 'idle'; // idle | waiting | draw | result
  let drawTimer = null;
  let drawStart = 0;
  let animRaf = null;

  /* ---- Storage ---- */
  function getScores() {
    try { return JSON.parse(localStorage.getItem(BEST_SCORES_KEY)) || []; }
    catch { return []; }
  }
  function saveScore(ms, grade) {
    const scores = getScores();
    scores.push({ ms, grade, ts: Date.now() });
    scores.sort((a, b) => a.ms - b.ms);
    scores.splice(MAX_SCORES);
    localStorage.setItem(BEST_SCORES_KEY, JSON.stringify(scores));
  }
  function bestScore() {
    const s = getScores();
    return s.length ? s[0].ms : null;
  }

  function getRank(ms) {
    return RANKS.find(r => ms < r.max) || RANKS[RANKS.length - 1];
  }

  /* ---- SVG fighter silhouette ---- */
  function fighterSVG(glowColor = '#ef4444', intensity = 0) {
    const glow = intensity > 0 ? `filter: drop-shadow(0 0 ${8 + intensity * 18}px ${glowColor});` : '';
    return `<svg class="gauntlet-fighter-svg" viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" style="${glow}">
      <!-- body silhouette — anime samurai stance -->
      <defs>
        <linearGradient id="fg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1a2a4a"/>
          <stop offset="100%" stop-color="#0b1628"/>
        </linearGradient>
      </defs>
      <!-- Head -->
      <ellipse cx="50" cy="22" rx="14" ry="16" fill="url(#fg1)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      <!-- Hair spike -->
      <polygon points="36,14 42,2 50,12 58,0 64,14 56,10 50,18 44,10" fill="#1a2a4a"/>
      <!-- Neck -->
      <rect x="44" y="36" width="12" height="8" rx="3" fill="url(#fg1)"/>
      <!-- Torso -->
      <path d="M32 44 Q28 62 30 80 L70 80 Q72 62 68 44 Q60 40 50 40 Q40 40 32 44Z" fill="url(#fg1)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
      <!-- Belt -->
      <rect x="31" y="76" width="38" height="6" rx="2" fill="#0d1526" stroke="rgba(59,130,246,0.3)" stroke-width="1"/>
      <!-- Left arm raised (attack stance) -->
      <path d="M32 48 Q18 54 10 44 Q6 38 12 35 Q20 40 30 46Z" fill="url(#fg1)"/>
      <!-- Right arm at side -->
      <path d="M68 48 Q80 58 84 70 Q86 76 80 78 Q74 72 70 62Z" fill="url(#fg1)"/>
      <!-- Sword (right hand) -->
      <rect x="78" y="48" width="4" height="50" rx="2" fill="#c8d6e8" transform="rotate(-12,80,70)"/>
      <rect x="74" y="94" width="12" height="4" rx="1" fill="#b9a45c" transform="rotate(-12,80,96)"/>
      <!-- Left leg -->
      <path d="M36 80 Q32 110 30 140 Q28 148 34 149 Q40 148 42 140 L44 80Z" fill="url(#fg1)"/>
      <!-- Right leg (forward) -->
      <path d="M56 80 Q60 110 64 138 Q66 148 72 147 Q78 146 76 138 L68 80Z" fill="url(#fg1)"/>
      <!-- Feet -->
      <ellipse cx="32" cy="150" rx="10" ry="5" fill="#0d1526"/>
      <ellipse cx="72" cy="148" rx="10" ry="5" fill="#0d1526"/>
      <!-- Haori shoulder mark -->
      <path d="M32 44 Q28 52 32 56 Q38 52 40 46Z" fill="rgba(239,68,68,0.35)"/>
      <path d="M68 44 Q72 52 68 56 Q62 52 60 46Z" fill="rgba(239,68,68,0.35)"/>
    </svg>`;
  }

  /* ---- Build the arena ---- */
  function buildArena() {
    return `
      <div class="gauntlet-arena-bg" id="g-arena-bg"></div>
      <div class="gauntlet-fighters" id="g-fighters">
        <div id="g-fighter-l">${fighterSVG('#3b82f6', 0)}</div>
        <div class="gauntlet-vs">VS</div>
        <div id="g-fighter-r" style="transform:scaleX(-1)">${fighterSVG('#ef4444', 0)}</div>
      </div>
    `;
  }

  /* ---- Screens ---- */
  function renderIdle() {
    const best = bestScore();
    const bestTxt = best !== null
      ? `Best: <span>${best}ms</span> ${getRank(best).label}`
      : 'No record yet';
    setStateHTML(`
      <div class="gauntlet-title" style="color:var(--red)">The Gauntlet</div>
      <div class="gauntlet-sub">A flash of red. One chance to strike.<br>How fast are your reflexes?</div>
      <button class="btn-primary" style="background:var(--red);box-shadow:0 4px 22px rgba(239,68,68,.4);font-size:1rem;padding:13px 40px;letter-spacing:.14em;font-family:'Rajdhani','Inter',sans-serif;" id="g-btn-start">
        ENTER THE GAUNTLET
      </button>
      <div class="gauntlet-best">${bestTxt}</div>
      ${renderScoreboard()}
    `);
    document.getElementById('g-btn-start').addEventListener('click', startWaiting);
    setFighterGlow('#3b82f6', 0.1, '#ef4444', 0.1);
  }

  function renderWaiting() {
    setStateHTML(`
      <div class="gauntlet-countdown" id="g-countdown">Get ready…</div>
      <div style="font-size:.75rem;color:var(--text3);letter-spacing:.06em;">Wait for the signal</div>
    `);
    /* Tap during wait = early trigger */
    const tapZone = document.getElementById('g-tap-zone');
    if (tapZone) {
      tapZone.style.display = 'flex';
      tapZone.onclick = () => handleEarlyPress();
    }
    setFighterGlow('#f5c842', 0.3, '#f5c842', 0.3);

    /* Pulse fighters */
    let pulse = 0;
    animRaf = requestAnimationFrame(function pulseFighters() {
      pulse += 0.06;
      const intensity = 0.2 + Math.sin(pulse) * 0.15;
      setFighterGlow('#f5c842', intensity, '#f5c842', intensity);
      if (state === 'waiting') animRaf = requestAnimationFrame(pulseFighters);
    });
  }

  function triggerDraw() {
    state = 'draw';
    cancelAnimationFrame(animRaf);

    /* flash background */
    const bg = document.getElementById('g-arena-bg');
    if (bg) { bg.classList.add('flash'); setTimeout(() => bg.classList.remove('flash'), 400); }

    setStateHTML(`
      <div class="gauntlet-cue">DRAW!</div>
    `);

    /* Fighters glow red hot */
    setFighterGlow('#ef4444', 1, '#ef4444', 1);

    /* Tap zone */
    const tapZone = document.getElementById('g-tap-zone');
    if (tapZone) {
      tapZone.style.display = 'flex';
      tapZone.onclick = () => handleHit();
    }

    drawStart = performance.now();
  }

  function handleEarlyPress() {
    if (state !== 'waiting') return;
    clearTimeout(drawTimer);
    cancelAnimationFrame(animRaf);
    state = 'result';
    hideTapZone();
    setFighterGlow('#ef4444', 0.6, '#ef4444', 0.6);

    setStateHTML(`
      <div class="gauntlet-rank early">TOO EARLY!</div>
      <div class="gauntlet-sub">You must wait for DRAW!<br>Patience, warrior.</div>
      ${playAgainBtn()}
    `);
    bindPlayAgain();
  }

  function handleHit() {
    if (state !== 'draw') return;
    state = 'result';
    hideTapZone();

    const elapsed = Math.round(performance.now() - drawStart);
    const rank = getRank(elapsed);
    saveScore(elapsed, rank.grade);
    const best = bestScore();
    const isNewBest = best === elapsed;

    setFighterGlow(rank.color, 0.8, rank.color, 0.8);

    setStateHTML(`
      ${isNewBest ? `<div style="font-size:.7rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#f5c842;text-shadow:0 0 14px #f5c84288;">★ NEW BEST ★</div>` : ''}
      <div class="gauntlet-result-time">${elapsed}<span class="gauntlet-result-ms">ms</span></div>
      <div class="gauntlet-rank ${rank.grade}">${rank.grade}-RANK · ${rank.label}</div>
      ${renderScoreboard()}
      ${playAgainBtn()}
    `);
    bindPlayAgain();
  }

  function startWaiting() {
    state = 'waiting';
    renderWaiting();
    const delay = 1400 + Math.random() * 3200;
    drawTimer = setTimeout(triggerDraw, delay);
  }

  /* ---- Helpers ---- */
  function setStateHTML(html) {
    const el = document.getElementById('g-state');
    if (el) el.innerHTML = html;
  }

  function setFighterGlow(colorL, intensityL, colorR, intensityR) {
    const l = document.querySelector('#g-fighter-l .gauntlet-fighter-svg');
    const r = document.querySelector('#g-fighter-r .gauntlet-fighter-svg');
    if (l) l.style.filter = intensityL > 0 ? `drop-shadow(0 0 ${8 + intensityL * 20}px ${colorL})` : 'none';
    if (r) r.style.filter = intensityR > 0 ? `drop-shadow(0 0 ${8 + intensityR * 20}px ${colorR})` : 'none';
  }

  function hideTapZone() {
    const tz = document.getElementById('g-tap-zone');
    if (tz) { tz.style.display = 'none'; tz.onclick = null; }
  }

  function playAgainBtn() {
    return `<button class="btn-primary" style="background:var(--red);box-shadow:0 4px 18px rgba(239,68,68,.35);font-family:'Rajdhani','Inter',sans-serif;letter-spacing:.14em;" id="g-btn-again">PLAY AGAIN</button>`;
  }

  function bindPlayAgain() {
    const btn = document.getElementById('g-btn-again');
    if (btn) btn.addEventListener('click', () => { state = 'idle'; renderIdle(); });
  }

  function renderScoreboard() {
    const scores = getScores();
    if (!scores.length) return '';
    const rows = scores.map((s, i) => {
      const r = getRank(s.ms);
      return `<div class="gauntlet-score-row">
        <span class="gauntlet-score-num">${i + 1}</span>
        <span class="gauntlet-score-time">${s.ms}ms</span>
        <span class="gauntlet-score-rank" style="color:${r.color}">${r.grade}</span>
      </div>`;
    }).join('');
    return `<div class="gauntlet-scores"><div class="field-label" style="margin-bottom:6px">Top Scores</div>${rows}</div>`;
  }

  /* ---- Public API ---- */
  function mount(el) {
    container = el;
    container.innerHTML = `
      <div class="gauntlet-wrap">
        ${buildArena()}
        <div class="gauntlet-state" id="g-state"></div>
        <div class="gauntlet-tap-zone" id="g-tap-zone" style="display:none;"></div>
      </div>
    `;
    state = 'idle';
    renderIdle();
  }

  function reset() {
    clearTimeout(drawTimer);
    cancelAnimationFrame(animRaf);
    state = 'idle';
    hideTapZone();
    renderIdle();
    setFighterGlow('#3b82f6', 0.1, '#ef4444', 0.1);
  }

  return { mount, reset };
})();
