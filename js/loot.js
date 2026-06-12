/* ============================================================
   Gavin's World — Loot Drop
   Collectible card game: anime, swords, Minecraft, Pokémon vibes.
   Mystery pack opening with flip animations and a collection grid.
   ============================================================ */

const Loot = (() => {
  'use strict';

  /* ---- Storage keys ---- */
  const KEY_LAST_PACK  = 'gw_loot_last_pack';
  const KEY_COLLECTION = 'gw_loot_collection';

  /* ---- Card definitions (18 total) ---- */
  const CARDS = [
    /* LEGENDARY */
    { id: 'shadow_fang',     name: 'Shadow Fang',     rarity: 'legendary', color1: '#f5c842', color2: '#d4960a', symbol: '⚔' },
    { id: 'dragon_slayer',   name: 'Dragon Slayer',   rarity: 'legendary', color1: '#f5c842', color2: '#d4960a', symbol: '◈' },
    { id: 'void_walker',     name: 'Void Walker',     rarity: 'legendary', color1: '#f5c842', color2: '#d4960a', symbol: '✦' },
    /* EPIC */
    { id: 'crystal_blade',   name: 'Crystal Blade',   rarity: 'epic',      color1: '#a855f7', color2: '#7e22ce', symbol: '◇' },
    { id: 'ender_champion',  name: 'Ender Champion',  rarity: 'epic',      color1: '#a855f7', color2: '#7e22ce', symbol: '⬡' },
    { id: 'samurai_soul',    name: 'Samurai Soul',    rarity: 'epic',      color1: '#a855f7', color2: '#7e22ce', symbol: '▲' },
    { id: 'netherite_axe',   name: 'Netherite Axe',   rarity: 'epic',      color1: '#a855f7', color2: '#7e22ce', symbol: '⬟' },
    /* RARE */
    { id: 'katana_master',   name: 'Katana Master',   rarity: 'rare',      color1: '#3b82f6', color2: '#1d4ed8', symbol: '⚔' },
    { id: 'storm_blade',     name: 'Storm Blade',     rarity: 'rare',      color1: '#3b82f6', color2: '#1d4ed8', symbol: '≋' },
    { id: 'diamond_sword',   name: 'Diamond Sword',   rarity: 'rare',      color1: '#3b82f6', color2: '#1d4ed8', symbol: '◆' },
    { id: 'ninja_scroll',    name: 'Ninja Scroll',    rarity: 'rare',      color1: '#3b82f6', color2: '#1d4ed8', symbol: '⊕' },
    { id: 'phoenix_feather', name: 'Phoenix Feather', rarity: 'rare',      color1: '#3b82f6', color2: '#1d4ed8', symbol: '✦' },
    /* COMMON */
    { id: 'iron_sword',      name: 'Iron Sword',      rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '⚔' },
    { id: 'wooden_shield',   name: 'Wooden Shield',   rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '⬡' },
    { id: 'training_bow',    name: 'Training Bow',    rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '▷' },
    { id: 'potion',          name: 'Potion',          rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '⊗' },
    { id: 'bomb',            name: 'Bomb',            rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '●' },
    { id: 'throwing_star',   name: 'Throwing Star',   rarity: 'common',    color1: '#6b8ab4', color2: '#3e5e8a', symbol: '✦' },
  ];

  /* ---- Rarity pools ---- */
  const BY_RARITY = {
    legendary: CARDS.filter(c => c.rarity === 'legendary'),
    epic:      CARDS.filter(c => c.rarity === 'epic'),
    rare:      CARDS.filter(c => c.rarity === 'rare'),
    common:    CARDS.filter(c => c.rarity === 'common'),
  };

  /* ---- Rarity display config ---- */
  const RARITY_CFG = {
    legendary: { label: 'LEGENDARY', glow: '#f5c842' },
    epic:      { label: 'EPIC',      glow: '#a855f7' },
    rare:      { label: 'RARE',      glow: '#3b82f6' },
    common:    { label: 'COMMON',    glow: null },
  };

  /* ---- Pack odds ---- */
  const ODDS = { legendary: 0.03, epic: 0.12, rare: 0.30, common: 0.55 };

  /* ---- Module state ---- */
  let container    = null;
  let currentPack  = [];
  let flippedCount = 0;
  let countdownTid = null;

  /* ============================================================
     Storage helpers
  ============================================================ */
  function todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
  }
  function getLastPackDate()  { try { return localStorage.getItem(KEY_LAST_PACK) || null; } catch { return null; } }
  function setLastPackDate(s) { try { localStorage.setItem(KEY_LAST_PACK, s); } catch {} }
  function hasOpenedToday()   { return getLastPackDate() === todayStr(); }

  function getCollection() {
    try { return JSON.parse(localStorage.getItem(KEY_COLLECTION)) || []; } catch { return []; }
  }
  function addToCollection(ids) {
    const col = getCollection();
    ids.forEach(id => { if (!col.includes(id)) col.push(id); });
    try { localStorage.setItem(KEY_COLLECTION, JSON.stringify(col)); } catch {}
  }

  /* ============================================================
     Pack generation
  ============================================================ */
  function pickRarity() {
    const r = Math.random();
    if (r < ODDS.legendary)                                    return 'legendary';
    if (r < ODDS.legendary + ODDS.epic)                       return 'epic';
    if (r < ODDS.legendary + ODDS.epic + ODDS.rare)           return 'rare';
    return 'common';
  }

  function pickCard(rarity) {
    const pool = BY_RARITY[rarity];
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function generatePack() {
    const cards = [];

    /* Slot 0: guaranteed rare-or-better */
    const rTotal = ODDS.legendary + ODDS.epic + ODDS.rare;
    const r0 = Math.random() * rTotal;
    let guaranteedRarity;
    if (r0 < ODDS.legendary)                    guaranteedRarity = 'legendary';
    else if (r0 < ODDS.legendary + ODDS.epic)   guaranteedRarity = 'epic';
    else                                         guaranteedRarity = 'rare';
    cards.push(pickCard(guaranteedRarity));

    /* Slots 1-4: normal odds */
    for (let i = 1; i < 5; i++) cards.push(pickCard(pickRarity()));

    /* Shuffle */
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }

  /* ============================================================
     Countdown helpers
  ============================================================ */
  function msUntilMidnight() {
    const now = new Date(), next = new Date(now);
    next.setHours(24, 0, 0, 0);
    return Math.max(0, next - now);
  }
  function fmtCountdown(ms) {
    const t = Math.floor(ms / 1000);
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  function startCountdown(el) {
    stopCountdown();
    const tick = () => { if (el && el.isConnected) el.textContent = fmtCountdown(msUntilMidnight()); else stopCountdown(); };
    tick();
    countdownTid = setInterval(tick, 1000);
  }
  function stopCountdown() {
    if (countdownTid !== null) { clearInterval(countdownTid); countdownTid = null; }
  }

  /* ============================================================
     CSS injection (once per page load)
  ============================================================ */
  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    const s = document.createElement('style');
    s.id = 'loot-styles';
    s.textContent = `
/* ---- Loot root ---- */
.loot-root {
  display: flex; flex-direction: column; height: 100%; overflow: hidden; position: relative;
}

/* ---- Generic screen ---- */
.loot-screen {
  display: none; flex-direction: column; flex: 1; overflow: hidden;
}
.loot-screen.active { display: flex; }

/* ============================================================
   HUB
============================================================ */
.loot-hub {
  align-items: center; justify-content: flex-start; overflow-y: auto;
  padding: 0 20px 32px;
}

.loot-title {
  font-family: 'Rajdhani','Inter',sans-serif;
  font-size: 2rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
  color: var(--text1); text-align: center; margin-top: 28px;
  text-shadow: 0 0 32px rgba(59,130,246,.5);
}
.loot-subtitle {
  font-size: .72rem; color: var(--text3); letter-spacing: .2em; text-transform: uppercase;
  text-align: center; margin-top: 4px; margin-bottom: 22px;
}

/* Mystery box */
.loot-box-wrap {
  display: flex; align-items: center; justify-content: center;
  width: 180px; height: 180px; margin: 0 auto 24px; position: relative; flex-shrink: 0;
}
.loot-box {
  width: 130px; height: 130px; border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #0b1a35, #162340);
  border: 2px solid rgba(59,130,246,.38);
  box-shadow: 0 0 36px rgba(59,130,246,.22), inset 0 0 20px rgba(0,0,0,.55);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  animation: loot-box-pulse 2.8s ease-in-out infinite;
}
.loot-box::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit;
  background: linear-gradient(120deg,
    transparent 0%, rgba(59,130,246,.07) 40%,
    rgba(168,85,247,.1) 60%, transparent 100%);
  animation: loot-box-shimmer 3.4s linear infinite;
}
.loot-box-g {
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 3.4rem; font-weight: 900;
  color: rgba(59,130,246,.65); z-index: 1; user-select: none;
  text-shadow: 0 0 24px rgba(59,130,246,.7);
}
.loot-box-lid {
  position: absolute; bottom: 100%; left: 50%; transform: translateX(-50%);
  width: 86px; height: 24px; border-radius: 6px 6px 0 0;
  background: linear-gradient(135deg, #0e1f3d, #1a2f52);
  border: 1.5px solid rgba(59,130,246,.28); border-bottom: none;
  transform-origin: center bottom;
  animation: loot-lid-rock 2.8s ease-in-out infinite;
}
@keyframes loot-box-pulse {
  0%,100% { box-shadow: 0 0 36px rgba(59,130,246,.22), inset 0 0 20px rgba(0,0,0,.55); }
  50%      { box-shadow: 0 0 56px rgba(59,130,246,.44), inset 0 0 20px rgba(0,0,0,.55); }
}
@keyframes loot-box-shimmer {
  0%   { transform: translateX(-100%) rotate(25deg); }
  100% { transform: translateX(200%)  rotate(25deg); }
}
@keyframes loot-lid-rock {
  0%,100% { transform: translateX(-50%) rotate(0deg); }
  25%     { transform: translateX(-50%) rotate(-7deg); }
  75%     { transform: translateX(-50%) rotate(7deg); }
}

/* Hub action area */
.loot-hub-actions {
  display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%;
}

.loot-open-btn {
  width: 210px; padding: 13px 0;
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 1.05rem; font-weight: 800;
  letter-spacing: .12em; text-transform: uppercase;
  background: linear-gradient(135deg, #1d4ed8, #3b82f6);
  color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer;
  box-shadow: 0 4px 20px rgba(59,130,246,.35);
  transition: transform .12s, box-shadow .15s; position: relative; overflow: hidden;
}
.loot-open-btn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(120deg, transparent 30%, rgba(255,255,255,.12) 50%, transparent 70%);
  transform: translateX(-100%); transition: transform .4s;
}
.loot-open-btn:hover::after  { transform: translateX(100%); }
.loot-open-btn:hover         { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(59,130,246,.5); }
.loot-open-btn:active        { transform: scale(.97); }
.loot-open-btn:disabled      { background: var(--bg3); color: var(--text3); cursor: not-allowed; box-shadow: none; transform: none; }
.loot-open-btn:disabled::after { display: none; }

.loot-countdown-wrap  { text-align: center; }
.loot-countdown-label { font-size: .7rem; color: var(--text3); letter-spacing: .12em; text-transform: uppercase; margin-bottom: 4px; }
.loot-countdown       { font-family: 'Rajdhani','Inter',sans-serif; font-size: 1.55rem; font-weight: 700; color: var(--text2); letter-spacing: .08em; }

.loot-collection-btn {
  background: var(--bg3); border: 1px solid var(--border); color: var(--text2);
  border-radius: var(--radius-sm); padding: 10px 22px;
  font-family: 'Rajdhani','Inter',sans-serif; font-size: .85rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background .15s, border-color .15s, color .15s;
}
.loot-collection-btn:hover  { background: var(--bg4); border-color: var(--border-hi); color: var(--text1); }

.loot-badge {
  background: var(--blue); color: #fff;
  font-size: .68rem; font-weight: 800; padding: 2px 8px; border-radius: 999px;
}

/* ============================================================
   OPENING SCREEN
============================================================ */
.loot-opening-header {
  display: flex; align-items: center; padding: 10px 14px;
  border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.loot-opening-body {
  flex: 1; overflow-y: auto; display: flex; flex-direction: column;
  align-items: center; padding: 18px 14px 28px; gap: 0;
}
.loot-opening-title {
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 1.1rem; font-weight: 700;
  letter-spacing: .1em; color: var(--text2); text-transform: uppercase;
  text-align: center; margin-bottom: 4px;
}
.loot-opening-hint {
  font-size: .72rem; color: var(--text3); letter-spacing: .08em; text-transform: uppercase;
  text-align: center; margin-bottom: 18px;
}

/* Cards row */
.loot-cards-row {
  display: flex; gap: 10px; justify-content: center; align-items: flex-start;
  flex-wrap: wrap; width: 100%; margin-bottom: 22px;
}

/* ---- Card anatomy ---- */
.loot-card {
  width: 88px; height: 128px; perspective: 600px; cursor: pointer; flex-shrink: 0;
  transition: transform .15s;
}
.loot-card:hover:not(.flipped) { transform: translateY(-5px) scale(1.04); }
.loot-card.flipped { cursor: default; }

.loot-card-inner {
  width: 100%; height: 100%; position: relative;
  transform-style: preserve-3d;
  transition: transform .5s cubic-bezier(.4,0,.2,1);
}
.loot-card.flipped .loot-card-inner { transform: rotateY(180deg); }

.loot-card-front,
.loot-card-back {
  position: absolute; inset: 0; border-radius: 10px;
  backface-visibility: hidden; -webkit-backface-visibility: hidden; overflow: hidden;
}

/* Back */
.loot-card-back {
  background: linear-gradient(135deg, #0b1628 0%, #162340 100%);
  border: 1.5px solid rgba(59,130,246,.22);
  display: flex; align-items: center; justify-content: center;
}
.loot-card-back-pattern {
  position: absolute; inset: 0;
  background-image: repeating-linear-gradient(
    45deg, transparent 0px, transparent 6px,
    rgba(59,130,246,.05) 6px, rgba(59,130,246,.05) 7px
  );
}
.loot-card-back-g {
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 2.5rem; font-weight: 900;
  color: rgba(59,130,246,.26); z-index: 1; user-select: none;
}

/* Front */
.loot-card-front {
  transform: rotateY(180deg);
  display: flex; flex-direction: column;
  align-items: center; justify-content: space-between;
  padding: 8px 5px 6px; border: 1.5px solid transparent;
}
.loot-card[data-rarity="legendary"] .loot-card-front {
  border-color: rgba(245,200,66,.55); box-shadow: 0 0 16px rgba(245,200,66,.32);
}
.loot-card[data-rarity="epic"] .loot-card-front {
  border-color: rgba(168,85,247,.55); box-shadow: 0 0 14px rgba(168,85,247,.3);
}
.loot-card[data-rarity="rare"] .loot-card-front {
  border-color: rgba(59,130,246,.55); box-shadow: 0 0 10px rgba(59,130,246,.25);
}
.loot-card[data-rarity="common"] .loot-card-front {
  border-color: rgba(107,138,180,.32);
}

/* Shimmer overlay */
.loot-card-front::after {
  content: ''; position: absolute; inset: 0; border-radius: 9px;
  background: linear-gradient(135deg, rgba(255,255,255,.07) 0%, transparent 50%, rgba(255,255,255,.03) 100%);
  pointer-events: none;
}

/* Legendary / epic sweep */
.loot-card[data-rarity="legendary"] .loot-card-front::before,
.loot-card[data-rarity="epic"]      .loot-card-front::before {
  content: ''; position: absolute; inset: 0; border-radius: 9px;
  pointer-events: none; z-index: 2;
  animation: loot-card-shine 3.2s ease-in-out infinite;
}
.loot-card[data-rarity="legendary"] .loot-card-front::before {
  background: linear-gradient(115deg, transparent 20%, rgba(245,200,66,.22) 50%, transparent 80%);
}
.loot-card[data-rarity="epic"] .loot-card-front::before {
  background: linear-gradient(115deg, transparent 20%, rgba(168,85,247,.22) 50%, transparent 80%);
}
@keyframes loot-card-shine {
  0%,100% { transform: translateX(-120%) skewX(-20deg); }
  50%     { transform: translateX(220%)  skewX(-20deg); }
}

/* Card content */
.loot-card-symbol {
  font-size: 2.4rem; line-height: 1; flex: 1;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,.88); z-index: 1;
  filter: drop-shadow(0 0 6px rgba(255,255,255,.28));
}
.loot-card-name {
  font-family: 'Rajdhani','Inter',sans-serif; font-size: .64rem; font-weight: 700;
  letter-spacing: .06em; text-transform: uppercase; color: rgba(255,255,255,.9);
  text-align: center; z-index: 1; line-height: 1.2;
  text-shadow: 0 1px 4px rgba(0,0,0,.9);
}
.loot-card-badge {
  font-size: .52rem; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  padding: 2px 6px; border-radius: 4px; z-index: 1; margin-top: 4px;
  background: rgba(0,0,0,.45);
}
.loot-card[data-rarity="legendary"] .loot-card-badge { color: #f5c842; }
.loot-card[data-rarity="epic"]      .loot-card-badge { color: #c084fc; }
.loot-card[data-rarity="rare"]      .loot-card-badge { color: #60a5fa; }
.loot-card[data-rarity="common"]    .loot-card-badge { color: #6b8ab4; }

/* Particle bursts */
.loot-burst { position: fixed; pointer-events: none; z-index: 9999; }
.loot-particle {
  position: absolute; border-radius: 50%;
  animation: loot-pfx .7s ease-out forwards;
}
@keyframes loot-pfx {
  0%   { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--tx),var(--ty)) scale(0); opacity: 0; }
}

/* Collect button */
.loot-collect-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%; }
.loot-collect-btn {
  width: 210px; padding: 12px 0;
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 1rem; font-weight: 800;
  letter-spacing: .1em; text-transform: uppercase;
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: #fff; border: none; border-radius: var(--radius-sm); cursor: pointer;
  box-shadow: 0 4px 18px rgba(34,197,94,.3);
  animation: loot-fadein .32s ease both;
  transition: transform .12s, box-shadow .15s;
}
.loot-collect-btn:hover  { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(34,197,94,.45); }
.loot-collect-btn:active { transform: scale(.97); }
@keyframes loot-fadein {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ============================================================
   COLLECTION SCREEN
============================================================ */
.loot-col-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0;
  gap: 10px;
}
.loot-col-nav   { display: flex; align-items: center; gap: 6px; }
.loot-col-title {
  font-family: 'Rajdhani','Inter',sans-serif; font-size: 1rem; font-weight: 700;
  letter-spacing: .1em; text-transform: uppercase; color: var(--text1);
}
.loot-col-count { font-size: .75rem; color: var(--text3); font-weight: 600; flex-shrink: 0; }

.loot-col-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 10px; padding: 14px; overflow-y: auto; flex: 1;
}

/* Collection card */
.loot-col-card {
  aspect-ratio: 88 / 128; border-radius: 9px; position: relative; overflow: hidden;
  display: flex; flex-direction: column; align-items: center; justify-content: space-between;
  padding: 6px 4px 5px;
  transition: transform .15s, box-shadow .15s;
}
.loot-col-card.owned { cursor: default; }
.loot-col-card.owned:hover { transform: translateY(-3px); }
.loot-col-card.locked {
  background: var(--bg2); border: 1.5px solid rgba(255,255,255,.06); cursor: default;
}
.loot-col-card[data-rarity="legendary"].owned { border: 1.5px solid rgba(245,200,66,.42); box-shadow: 0 0 10px rgba(245,200,66,.22); }
.loot-col-card[data-rarity="epic"].owned      { border: 1.5px solid rgba(168,85,247,.42); box-shadow: 0 0 10px rgba(168,85,247,.2);  }
.loot-col-card[data-rarity="rare"].owned      { border: 1.5px solid rgba(59,130,246,.42);  box-shadow: 0 0  8px rgba(59,130,246,.18); }
.loot-col-card[data-rarity="common"].owned    { border: 1.5px solid rgba(107,138,180,.3);  }

.loot-col-card .loot-card-symbol { font-size: 1.9rem; }
.loot-col-card.locked .loot-card-symbol { color: rgba(255,255,255,.1); filter: none; }
.loot-col-card.locked .loot-card-name   { color: rgba(255,255,255,.16); }
.loot-col-card.locked .loot-card-badge  { color: rgba(255,255,255,.13); background: rgba(0,0,0,.2); }

.loot-lock-icon {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; color: rgba(255,255,255,.1); pointer-events: none;
}
`;
    document.head.appendChild(s);
  }

  /* ============================================================
     Particle burst
  ============================================================ */
  function spawnBurst(x, y, color) {
    const COUNT  = 18;
    const wrap   = document.createElement('div');
    wrap.className = 'loot-burst';
    document.body.appendChild(wrap);

    for (let i = 0; i < COUNT; i++) {
      const p   = document.createElement('div');
      p.className = 'loot-particle';
      const ang = (i / COUNT) * Math.PI * 2 + (Math.random() - .5) * .9;
      const d   = 28 + Math.random() * 60;
      const sz  = 3 + Math.random() * 5;
      p.style.cssText = [
        `left:${x}px`, `top:${y}px`,
        `width:${sz}px`, `height:${sz}px`,
        `background:${color}`,
        `--tx:${Math.cos(ang) * d}px`,
        `--ty:${Math.sin(ang) * d}px`,
        `animation-duration:${.48 + Math.random() * .36}s`,
        `animation-delay:${Math.random() * .08}s`,
      ].join(';');
      wrap.appendChild(p);
    }

    setTimeout(() => { if (wrap.parentNode) wrap.remove(); }, 1000);
  }

  /* ============================================================
     Card HTML builder (shared between opening + collection)
  ============================================================ */
  function cardFaceInner(card) {
    const rc = RARITY_CFG[card.rarity];
    return `
      <div class="loot-card-symbol">${card.symbol}</div>
      <div>
        <div class="loot-card-name">${card.name}</div>
        <div class="loot-card-badge">${rc.label}</div>
      </div>`;
  }

  /* ============================================================
     Screen helpers
  ============================================================ */
  function getScreenEl(id) {
    return container && container.querySelector('#loot-screen-' + id);
  }
  function showScreen(name) {
    stopCountdown();
    ['hub', 'opening', 'collection'].forEach(id => {
      const el = getScreenEl(id);
      if (el) el.classList.toggle('active', id === name);
    });
  }

  /* ============================================================
     HUB
  ============================================================ */
  function buildHub() {
    const screen  = getScreenEl('hub');
    if (!screen) return;
    const canOpen = !hasOpenedToday();
    const owned   = getCollection().length;

    screen.innerHTML = `
      <div class="loot-title">Loot Drop</div>
      <div class="loot-subtitle">Mystery Pack Opening</div>

      <div class="loot-box-wrap">
        <div class="loot-box">
          <div class="loot-box-lid"></div>
          <div class="loot-box-g">G</div>
        </div>
      </div>

      <div class="loot-hub-actions">
        <button class="loot-open-btn" id="loot-open-btn"${canOpen ? '' : ' disabled'}>
          ${canOpen ? '&#9889; Open Pack' : 'Next Pack In'}
        </button>
        ${!canOpen ? `
        <div class="loot-countdown-wrap">
          <div class="loot-countdown-label">Resets at midnight</div>
          <div class="loot-countdown" id="loot-countdown">00:00:00</div>
        </div>` : ''}
        <button class="loot-collection-btn" id="loot-col-btn">
          <span>Collection</span>
          <span class="loot-badge">${owned}&nbsp;/&nbsp;${CARDS.length}</span>
        </button>
      </div>
    `;

    if (!canOpen) {
      const cdEl = screen.querySelector('#loot-countdown');
      if (cdEl) startCountdown(cdEl);
    }

    if (canOpen) {
      screen.querySelector('#loot-open-btn').addEventListener('click', doOpenPack);
    }
    screen.querySelector('#loot-col-btn').addEventListener('click', doShowCollection);
  }

  /* ============================================================
     OPENING
  ============================================================ */
  function buildOpening() {
    const screen = getScreenEl('opening');
    if (!screen) return;
    flippedCount = 0;

    /* Header already in static HTML; find the body div */
    const body = screen.querySelector('.loot-opening-body');
    if (!body) return;

    body.innerHTML = `
      <div class="loot-opening-title">Pack Opening</div>
      <div class="loot-opening-hint" id="loot-hint">Tap each card to reveal</div>
      <div class="loot-cards-row" id="loot-cards-row"></div>
      <div class="loot-collect-wrap" id="loot-collect-wrap" style="display:none"></div>
    `;

    const row = body.querySelector('#loot-cards-row');

    currentPack.forEach((card, i) => {
      /* Build card element */
      const el = document.createElement('div');
      el.className = 'loot-card';
      el.dataset.rarity = card.rarity;
      el.dataset.index  = String(i);
      el.innerHTML = `
        <div class="loot-card-inner">
          <div class="loot-card-front"
               style="background:linear-gradient(135deg,${card.color1},${card.color2})">
            ${cardFaceInner(card)}
          </div>
          <div class="loot-card-back">
            <div class="loot-card-back-pattern"></div>
            <div class="loot-card-back-g">G</div>
          </div>
        </div>`;

      el.addEventListener('click', () => {
        if (el.classList.contains('flipped')) return;
        el.classList.add('flipped');
        flippedCount++;

        /* Particle burst */
        const glow = RARITY_CFG[card.rarity].glow;
        if (glow) {
          const rect = el.getBoundingClientRect();
          spawnBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, glow);
        }

        /* Update hint */
        const hint      = body.querySelector('#loot-hint');
        const remaining = currentPack.length - flippedCount;
        if (hint) hint.textContent = remaining > 0
          ? `${remaining} card${remaining !== 1 ? 's' : ''} remaining`
          : 'All cards revealed!';

        /* Show collect button once all flipped */
        if (flippedCount >= currentPack.length) {
          const wrap = body.querySelector('#loot-collect-wrap');
          if (wrap) {
            wrap.style.display = 'flex';
            wrap.innerHTML = `<button class="loot-collect-btn" id="loot-collect-btn">Collect Cards</button>`;
            wrap.querySelector('#loot-collect-btn').addEventListener('click', doCollect);
          }
        }
      });

      row.appendChild(el);
    });
  }

  /* ============================================================
     COLLECTION
  ============================================================ */
  function buildCollection() {
    const screen = getScreenEl('collection');
    if (!screen) return;
    const body = screen.querySelector('.loot-collection-body');
    if (!body) return;

    const owned = new Set(getCollection());

    body.innerHTML = `
      <div class="loot-col-header">
        <div class="loot-col-title">Collection</div>
        <div class="loot-col-count">${owned.size} / ${CARDS.length} cards</div>
      </div>
      <div class="loot-col-grid" id="loot-col-grid"></div>
    `;

    const grid = body.querySelector('#loot-col-grid');
    const ORDER = ['legendary', 'epic', 'rare', 'common'];
    const sorted = [...CARDS].sort((a, b) => ORDER.indexOf(a.rarity) - ORDER.indexOf(b.rarity));

    sorted.forEach(card => {
      const isOwned = owned.has(card.id);
      const el = document.createElement('div');
      el.className = `loot-col-card ${isOwned ? 'owned' : 'locked'}`;
      el.dataset.rarity = card.rarity;

      if (isOwned) {
        el.style.background = `linear-gradient(135deg,${card.color1},${card.color2})`;
        el.innerHTML = cardFaceInner(card);
      } else {
        el.innerHTML = `
          <div class="loot-card-symbol" style="color:rgba(255,255,255,.08)">${card.symbol}</div>
          <div>
            <div class="loot-card-name" style="color:rgba(255,255,255,.15)">???</div>
            <div class="loot-card-badge">${RARITY_CFG[card.rarity].label}</div>
          </div>
          <div class="loot-lock-icon">&#8856;</div>`;
      }

      grid.appendChild(el);
    });
  }

  /* ============================================================
     Flow actions
  ============================================================ */
  function doOpenPack() {
    currentPack = generatePack();
    setLastPackDate(todayStr());
    buildOpening();
    showScreen('opening');
  }

  function doCollect() {
    addToCollection(currentPack.map(c => c.id));
    currentPack  = [];
    flippedCount = 0;
    buildHub();
    showScreen('hub');
  }

  function doShowCollection() {
    buildCollection();
    showScreen('collection');
  }

  function doShowHub() {
    buildHub();
    showScreen('hub');
  }

  /* ============================================================
     Public: mount(el)
  ============================================================ */
  function mount(el) {
    container = el;
    injectCSS();

    /* Static shell — screen divs; opening + collection have a nav header baked in */
    el.innerHTML = `
      <div class="loot-root">

        <!-- HUB screen (content built dynamically) -->
        <div class="loot-screen loot-hub active" id="loot-screen-hub"></div>

        <!-- OPENING screen -->
        <div class="loot-screen" id="loot-screen-opening">
          <div class="loot-opening-header">
            <button class="btn-back" id="loot-back-opening">
              <svg viewBox="0 0 15 15" fill="none" stroke="currentColor" stroke-width="2"
                   stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 3L4 7.5 9 12"/>
              </svg>
              Back
            </button>
          </div>
          <div class="loot-opening-body"></div>
        </div>

        <!-- COLLECTION screen -->
        <div class="loot-screen" id="loot-screen-collection">
          <div class="loot-collection-body" style="flex:1;overflow:hidden;display:flex;flex-direction:column"></div>
        </div>

      </div>`;

    el.querySelector('#loot-back-opening').addEventListener('click', doShowHub);

    buildHub();
  }

  /* ============================================================
     Public: reset() — return to hub
  ============================================================ */
  function reset() {
    stopCountdown();
    currentPack  = [];
    flippedCount = 0;
    buildHub();
    showScreen('hub');
  }

  /* ============================================================
     Public API
  ============================================================ */
  return { mount, reset };
})();
