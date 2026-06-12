/* ============================================================
   Gavin's World — Avatar & manikin character system
   Anime-heroic SVG character. Shared rig for homepage avatar
   and Forge poser. 8 hair styles, 6 eye types, 7 skin tones,
   10 costumes, full accessories.
   ============================================================ */

const Avatar = (() => {
  /* ---------- Palettes ---------- */
  const SKIN_TONES = [
    { id: 'tone1', name: 'Porcelain', hex: '#fde8d2', shadow: '#e8b896', lip: '#d4807a' },
    { id: 'tone2', name: 'Fair',      hex: '#f5c98c', shadow: '#d4974e', lip: '#c8706e' },
    { id: 'tone3', name: 'Light',     hex: '#e8a86a', shadow: '#c07838', lip: '#b05c58' },
    { id: 'tone4', name: 'Medium',    hex: '#c47d40', shadow: '#8a5020', lip: '#965050' },
    { id: 'tone5', name: 'Tan',       hex: '#a05c2a', shadow: '#6a3810', lip: '#804040' },
    { id: 'tone6', name: 'Brown',     hex: '#7a3f18', shadow: '#4e2608', lip: '#663030' },
    { id: 'tone7', name: 'Deep',      hex: '#4e2a10', shadow: '#2e1608', lip: '#5a2828' },
  ];

  const HAIR_COLORS = [
    '#111111','#2a1a0a','#5a3010','#8b5e2a','#c8942a','#e8c85a',
    '#f5f5e8','#d4282a','#e85a8a','#7a4ed8','#1a6ad4','#1ac87a',
  ];

  /* ---------- Eye styles (SVG paths, coord-relative, eyes at y=0) ---------- */
  /* Each draws a pair of eyes in a ~64×16 space, centered at origin */
  const EYE_STYLES = {
    default: (c, sclera = '#fff') => `
      <g class="eyes">
        <ellipse cx="-14" cy="0" rx="8" ry="5.5" fill="${sclera}"/>
        <ellipse cx="14"  cy="0" rx="8" ry="5.5" fill="${sclera}"/>
        <ellipse cx="-14" cy="0.5" rx="5" ry="4.5" fill="${c}"/>
        <ellipse cx="14"  cy="0.5" rx="5" ry="4.5" fill="${c}"/>
        <ellipse cx="-13.2" cy="0.2" rx="3" ry="3"   fill="#111"/>
        <ellipse cx="14.8"  cy="0.2" rx="3" ry="3"   fill="#111"/>
        <circle cx="-11.8" cy="-1"  r="1.2" fill="${sclera}" opacity=".9"/>
        <circle cx="16.2"  cy="-1"  r="1.2" fill="${sclera}" opacity=".9"/>
        <path d="M -22 -4.5 Q -14 -8.5 -6 -4.5" fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M 6 -4.5 Q 14 -8.5 22 -4.5"   fill="none" stroke="#111" stroke-width="1.6" stroke-linecap="round"/>
      </g>`,

    sharp: (c) => `
      <g class="eyes">
        <path d="M -22 0 L -14 -6 L -6 0 L -14 4 Z" fill="#fff"/>
        <path d="M 6 0 L 14 -6 L 22 0 L 14 4 Z" fill="#fff"/>
        <ellipse cx="-14" cy="-0.5" rx="4.5" ry="4" fill="${c}"/>
        <ellipse cx="14"  cy="-0.5" rx="4.5" ry="4" fill="${c}"/>
        <ellipse cx="-13.5" cy="-0.5" rx="2.8" ry="2.8" fill="#111"/>
        <ellipse cx="14.5"  cy="-0.5" rx="2.8" ry="2.8" fill="#111"/>
        <circle cx="-12.4" cy="-1.8" r="1" fill="#fff"/>
        <circle cx="15.6"  cy="-1.8" r="1" fill="#fff"/>
        <line x1="-22" y1="-4" x2="-6" y2="-5.5" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="6"  y1="-5.5" x2="22" y2="-4" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
      </g>`,

    sleepy: (c) => `
      <g class="eyes">
        <ellipse cx="-14" cy="1" rx="8" ry="4" fill="#fff"/>
        <ellipse cx="14"  cy="1" rx="8" ry="4" fill="#fff"/>
        <ellipse cx="-14" cy="1.5" rx="5" ry="3" fill="${c}"/>
        <ellipse cx="14"  cy="1.5" rx="5" ry="3" fill="${c}"/>
        <ellipse cx="-14" cy="1.5" rx="3" ry="2.5" fill="#111"/>
        <ellipse cx="14"  cy="1.5" rx="3" ry="2.5" fill="#111"/>
        <circle cx="-12.8" cy=".5" r="1" fill="#fff"/>
        <circle cx="15.2"  cy=".5" r="1" fill="#fff"/>
        <path d="M -22 -2 Q -14 -5.5 -6 -2" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 6 -2 Q 14 -5.5 22 -2"   fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <line x1="-22" y1="2" x2="-6" y2="2.5" stroke="#333" stroke-width="1.5" opacity=".5"/>
        <line x1="6"  y1="2.5" x2="22" y2="2" stroke="#333" stroke-width="1.5" opacity=".5"/>
      </g>`,

    wide: (c) => `
      <g class="eyes">
        <ellipse cx="-14" cy="0" rx="9" ry="7" fill="#fff"/>
        <ellipse cx="14"  cy="0" rx="9" ry="7" fill="#fff"/>
        <ellipse cx="-14" cy="0" rx="6.5" ry="6" fill="${c}"/>
        <ellipse cx="14"  cy="0" rx="6.5" ry="6" fill="${c}"/>
        <ellipse cx="-14" cy="0" rx="4" ry="4" fill="#111"/>
        <ellipse cx="14"  cy="0" rx="4" ry="4" fill="#111"/>
        <circle cx="-12.2" cy="-1.8" r="1.4" fill="#fff"/>
        <circle cx="15.8"  cy="-1.8" r="1.4" fill="#fff"/>
        <path d="M -23 -5 Q -14 -9.5 -5 -5" fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 5 -5 Q 14 -9.5 23 -5"   fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
      </g>`,

    sharingan: (c) => `
      <g class="eyes">
        <ellipse cx="-14" cy="0" rx="8.5" ry="6" fill="#fff"/>
        <ellipse cx="14"  cy="0" rx="8.5" ry="6" fill="#fff"/>
        <circle cx="-14" cy="0" r="5.5" fill="#c80000"/>
        <circle cx="14"  cy="0" r="5.5" fill="#c80000"/>
        <g fill="#111">
          <path d="M -14 -5.5 L -12 -2 L -11 0 L -14 0 L -17 0 L -16 -2 Z" opacity=".9"/>
          <path d="M -14 5.5 L -12 2 L -11 0 L -14 0 L -17 0 L -16 2 Z" opacity=".9"/>
          <path d="M -19.5 0 L -16 -1.5 L -14 0 L -16 1.5 Z" opacity=".9"/>
          <path d="M -8.5 0 L -12 -1.5 L -14 0 L -12 1.5 Z" opacity=".9"/>
          <circle cx="-14" cy="0" r="2.5"/>
        </g>
        <g fill="#111" transform="translate(28 0)">
          <path d="M -14 -5.5 L -12 -2 L -11 0 L -14 0 L -17 0 L -16 -2 Z" opacity=".9"/>
          <path d="M -14 5.5 L -12 2 L -11 0 L -14 0 L -17 0 L -16 2 Z" opacity=".9"/>
          <path d="M -19.5 0 L -16 -1.5 L -14 0 L -16 1.5 Z" opacity=".9"/>
          <path d="M -8.5 0 L -12 -1.5 L -14 0 L -12 1.5 Z" opacity=".9"/>
          <circle cx="-14" cy="0" r="2.5"/>
        </g>
        <circle cx="-14" cy="0" r="1.4" fill="#c80000"/>
        <circle cx="14"  cy="0" r="1.4" fill="#c80000"/>
        <path d="M -22 -4 Q -14 -9 -6 -4"  fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 6 -4 Q 14 -9 22 -4"    fill="none" stroke="#111" stroke-width="1.8" stroke-linecap="round"/>
      </g>`,

    ender: (c) => `
      <g class="eyes">
        <ellipse cx="-14" cy="0" rx="8" ry="5" fill="#0a0a14"/>
        <ellipse cx="14"  cy="0" rx="8" ry="5" fill="#0a0a14"/>
        <rect x="-18.5" y="-3" width="9" height="6" rx="1.5" fill="${c}" opacity=".9">
          <animate attributeName="opacity" values=".9;.3;.9" dur="2.6s" repeatCount="indefinite"/>
        </rect>
        <rect x="9.5" y="-3" width="9" height="6" rx="1.5" fill="${c}" opacity=".9">
          <animate attributeName="opacity" values=".3;.9;.3" dur="2.6s" repeatCount="indefinite"/>
        </rect>
        <rect x="-18.5" y="-3" width="9" height="6" rx="1.5" fill="${c}" filter="url(#eye-glow)" opacity=".6"/>
        <rect x="9.5" y="-3" width="9" height="6" rx="1.5" fill="${c}" filter="url(#eye-glow)" opacity=".6"/>
      </g>`,
  };

  /* ---------- Hair styles (drawn relative to head center, head at y=0) ---------- */
  /* Head top at approx y=-38, chin at y=26, head width ~56 */
  const HAIR_STYLES = {
    spiky: (c) => `
      <g class="hair" fill="${c}">
        <path d="M 0 -38 C -28 -30 -30 -15 -28 5 C -26 -8 -20 -16 -14 -20 C -20 -28 -22 -36 -18 -44 C -12 -40 -8 -38 0 -38 Z"/>
        <path d="M 0 -38 C 28 -30 30 -15 28 5 C 26 -8 20 -16 14 -20 C 20 -28 22 -36 18 -44 C 12 -40 8 -38 0 -38 Z"/>
        <path d="M 0 -38 C -6 -50 -4 -58 0 -62 C 4 -58 6 -50 0 -38 Z"/>
        <path d="M -12 -36 C -16 -48 -14 -56 -10 -58 C -7 -52 -6 -44 -8 -38 Z"/>
        <path d="M 12 -36 C 16 -48 14 -56 10 -58 C 7 -52 6 -44 8 -38 Z"/>
        <path d="M -18 -30 C -24 -42 -20 -50 -16 -50 C -14 -44 -14 -38 -16 -32 Z"/>
        <path d="M 18 -30 C 24 -42 20 -50 16 -50 C 14 -44 14 -38 16 -32 Z"/>
      </g>`,

    long: (c) => `
      <g class="hair" fill="${c}">
        <path d="M -28 -8 C -32 -28 -28 -44 -20 -44 L -18 -10 Z"/>
        <path d="M 28 -8 C 32 -28 28 -44 20 -44 L 18 -10 Z"/>
        <path d="M -28 -8 C -30 20 -26 60 -22 90 C -18 60 -16 20 -18 -8 Z" opacity=".9"/>
        <path d="M 28 -8 C 30 20 26 60 22 90 C 18 60 16 20 18 -8 Z" opacity=".9"/>
        <path d="M -20 -44 C -28 -44 -32 -32 -28 -8 C -24 -36 -16 -42 0 -44 C 16 -42 24 -36 28 -8 C 32 -32 28 -44 20 -44 C 14 -46 8 -48 0 -48 C -8 -48 -14 -46 -20 -44 Z"/>
      </g>`,

    bun: (c) => `
      <g class="hair" fill="${c}">
        <ellipse cx="0" cy="-48" rx="14" ry="12"/>
        <circle cx="14" cy="-48" r="8"/>
        <path d="M -28 -8 C -32 -28 -28 -44 0 -46 C 28 -44 32 -28 28 -8 C 22 -32 10 -42 0 -42 C -10 -42 -22 -32 -28 -8 Z"/>
        <path d="M -22 -10 C -26 8 -24 18 -22 20 C -20 12 -18 4 -22 -10 Z" opacity=".85"/>
        <path d="M 22 -10 C 26 8 24 18 22 20 C 20 12 18 4 22 -10 Z" opacity=".85"/>
      </g>`,

    short: (c) => `
      <g class="hair" fill="${c}">
        <path d="M -28 -8 C -32 -28 -28 -44 0 -48 C 28 -44 32 -28 28 -8 C 22 -22 12 -30 0 -30 C -12 -30 -22 -22 -28 -8 Z"/>
        <path d="M -28 -8 C -34 0 -32 8 -28 10 C -24 2 -24 -4 -28 -8 Z" opacity=".9"/>
        <path d="M 28 -8 C 34 0 32 8 28 10 C 24 2 24 -4 28 -8 Z" opacity=".9"/>
      </g>`,

    ponytail: (c) => `
      <g class="hair" fill="${c}">
        <path d="M -28 -8 C -32 -28 -28 -44 0 -48 C 28 -44 32 -28 28 -8 C 22 -24 10 -32 0 -32 C -10 -32 -22 -24 -28 -8 Z"/>
        <path d="M 20 -26 C 32 -20 36 -8 34 4 C 40 -10 38 -24 28 -30 Z"/>
        <path d="M 28 -8 C 36 4 36 24 30 48 C 26 36 22 18 22 -4 C 24 -4 26 -6 28 -8 Z"/>
        <ellipse cx="26" cy="-24" rx="6" ry="4" transform="rotate(30 26 -24)"/>
      </g>`,

    swept: (c) => `
      <g class="hair" fill="${c}">
        <path d="M -28 -8 C -32 -28 -22 -48 8 -50 C 28 -48 34 -28 28 -8 C 18 -26 4 -34 -4 -32 C -14 -30 -22 -20 -28 -8 Z"/>
        <path d="M 8 -50 C 24 -52 36 -40 34 -22 C 28 -36 18 -40 8 -38 Z" opacity=".85"/>
        <path d="M -30 -6 C -38 4 -36 14 -30 18 C -28 8 -28 0 -30 -6 Z" opacity=".9"/>
        <path d="M 28 -8 C 32 2 30 10 26 12 C 24 4 24 -2 28 -8 Z" opacity=".85"/>
      </g>`,

    twoblock: (c, c2 = '#1a1a1a') => `
      <g class="hair">
        <path d="M -28 -8 C -32 -28 -28 -44 0 -48 C 28 -44 32 -28 28 -8 C 22 -24 10 -32 0 -32 C -10 -32 -22 -24 -28 -8 Z" fill="${c2}"/>
        <path d="M -28 -8 C -30 0 -28 8 -24 12 L -22 -6 Z" fill="${c2}" opacity=".9"/>
        <path d="M 28 -8 C 30 0 28 8 24 12 L 22 -6 Z" fill="${c2}" opacity=".9"/>
        <path d="M -20 -44 C -14 -50 14 -50 20 -44 C 8 -46 -8 -46 -20 -44 Z" fill="${c}"/>
        <path d="M -20 -44 C -28 -32 -28 -18 -26 -8 L -18 -8 C -16 -20 -14 -34 -12 -38 C -6 -44 6 -44 12 -38 C 14 -34 16 -20 18 -8 L 26 -8 C 28 -18 28 -32 20 -44 Z" fill="${c}" opacity=".9"/>
      </g>`,

    warrior: (c) => `
      <g class="hair" fill="${c}">
        <path d="M -28 -8 C -32 -28 -28 -44 0 -48 C 28 -44 32 -28 28 -8 C 22 -22 10 -30 0 -30 C -10 -30 -22 -22 -28 -8 Z"/>
        <path d="M -6 -48 C -4 -60 -2 -70 0 -76 C 2 -70 4 -60 6 -48 Z"/>
        <path d="M -14 -44 C -16 -56 -14 -64 -12 -68 C -10 -62 -8 -54 -8 -46 Z" opacity=".9"/>
        <path d="M 14 -44 C 16 -56 14 -64 12 -68 C 10 -62 8 -54 8 -46 Z" opacity=".9"/>
        <path d="M -30 -6 C -34 8 -30 24 -26 32 C -24 18 -24 4 -28 -8 Z"/>
        <path d="M 30 -6 C 34 8 30 24 26 32 C 24 18 24 4 28 -8 Z"/>
      </g>`,
  };

  /* ---------- Costumes ---------- */
  /* Each costume has: torso, legs, feet, shoulders, details colors;
     plus optional extra paths for armor/collar/etc. */
  const COSTUMES = {
    default: {
      name: 'Casual', icon: '👕',
      colors: { shirt: '#1e3a5f', pants: '#2a1f0a', feet: '#1a1a1a', belt: '#6b4c2a' },
    },
    samurai: {
      name: 'Samurai', icon: '⚔️',
      colors: { shirt: '#c8282a', pants: '#1a1a2e', feet: '#1a1a1a', belt: '#2a2a1a', armor: '#c8a240', armordark: '#8a6a18' },
    },
    ninja: {
      name: 'Ninja', icon: '🥷',
      colors: { shirt: '#0a0a0a', pants: '#0a0a0a', feet: '#1a1a1a', belt: '#444', armor: '#222', mask: '#0a0a0a' },
    },
    slayer: {
      name: 'Demon Slayer', icon: '🌊',
      colors: { shirt: '#1a6040', pants: '#e8e4d0', feet: '#2a1a0a', belt: '#8a5a2a', stripe: '#d4282a' },
    },
    hero: {
      name: 'Hero Academy', icon: '🦸',
      colors: { shirt: '#1a2a6e', pants: '#1a2a6e', feet: '#1a1a1a', belt: '#c8c820', accent: '#8a8aff' },
    },
    sorcerer: {
      name: 'Dark Sorcerer', icon: '🔮',
      colors: { shirt: '#18082a', pants: '#140620', feet: '#0a0814', belt: '#6a20a0', robe: '#1e0e36', accent: '#9a40e0' },
    },
    diamondarmor: {
      name: 'Diamond Armor', icon: '💎',
      colors: { shirt: '#2ae4e4', pants: '#1ad4d4', feet: '#14b4b4', belt: '#1ad4d4', armor: '#2ae4e4', armordark: '#14a4a4' },
      pixel: true,
    },
    netherarmor: {
      name: 'Netherite', icon: '⚫',
      colors: { shirt: '#3a3438', pants: '#2e282c', feet: '#1e1820', belt: '#2a2428', armor: '#3a3438', armordark: '#1e181c' },
      pixel: true,
    },
    trainer: {
      name: 'Pokémon Trainer', icon: '🎒',
      colors: { shirt: '#2a60c8', pants: '#1a1a1a', feet: '#e8e8e8', belt: '#f5d020', cap: '#2a60c8' },
    },
    teamrocket: {
      name: 'Team Rocket', icon: '🚀',
      colors: { shirt: '#e8e8e8', pants: '#e8e8e8', feet: '#1a1a1a', belt: '#e8e8e8', logo: '#c82828' },
    },
  };

  const ACCESSORIES = {
    none:   { name: 'None', icon: '—' },
    cape:   { name: 'Cape', icon: '🦸' },
    wings:  { name: 'Wings', icon: '🪶' },
    mask:   { name: 'Half Mask', icon: '😷' },
    onimask:{ name: 'Oni Mask', icon: '👹' },
    crown:  { name: 'Crown', icon: '👑' },
    helmet: { name: 'Helmet', icon: '⛑️' },
    aura:   { name: 'Power Aura', icon: '✨' },
  };

  /* ---------- Pose definitions (joint angles in degrees) ---------- */
  /* joints: lShoulder, rShoulder, lElbow, rElbow, lHip, rHip, lKnee, rKnee */
  /* angle=0 → limb straight down; negative → swings outward for both sides (mx handles mirror) */
  const POSES = {
    idle:    { name: 'Idle',      a: { lSh:-8,  rSh:-8,  lEl: 5, rEl: 5,  lHp:-3, rHp:-3, lKn:0,  rKn:0  } },
    battle:  { name: 'Battle',    a: { lSh:-30, rSh: 20, lEl:20, rEl:15,  lHp:-14,rHp:-14,lKn:20, rKn:35 } },
    slash:   { name: 'Mid-Slash', a: { lSh:-85, rSh:110, lEl:55, rEl:10,  lHp:-14,rHp:-18,lKn:24, rKn:10 } },
    guard:   { name: 'Guard',     a: { lSh: 50, rSh: 50, lEl:65, rEl:65,  lHp:-8, rHp:-8, lKn:12, rKn:12 } },
    victory: { name: 'Victory',   a: { lSh:-140,rSh:-5,  lEl:50, rEl: 5,  lHp:-2, rHp:-2, lKn:0,  rKn:0  } },
    kneel:   { name: 'Kneel',     a: { lSh:-10, rSh:-10, lEl: 8, rEl: 8,  lHp:12, rHp:-3, lKn:80, rKn:5  } },
  };

  /* ---------- Core SVG body builder ---------- */
  function buildCharacterSVG(cfg, showJointHandles = false) {
    const {
      skinTone = 'tone1',
      hairStyle = 'spiky',
      hairColor = '#111111',
      hairColor2 = '#1a1a1a',
      eyeStyle = 'default',
      eyeColor = '#2a5fc8',
      costume = 'default',
      accessory = 'none',
      capeColor = '#1a2a6e',
      auraColor = '#3b82f6',
      poses = { ...POSES.idle.a },
    } = cfg;

    const skin = SKIN_TONES.find(t => t.id === skinTone) || SKIN_TONES[0];
    const cos = COSTUMES[costume] || COSTUMES.default;
    const s = skin.hex, ss = skin.shadow, sl = skin.lip;
    const a = poses;

    /* ---- Body geometry (origin = mid-pelvis) ---- */
    /* Torso */
    const torso = `
      <g class="torso">
        ${cos.pixel ? pixelArmor(cos.colors, 'torso') : `
        <path d="M -20 -72 Q -22 -40 -20 -16 L 20 -16 Q 22 -40 20 -72 Q 10 -78 0 -78 Q -10 -78 -20 -72 Z" fill="${cos.colors.shirt}"/>
        ${cos.colors.robe ? `<path d="M -22 -70 Q -24 -38 -22 -14 L 22 -14 Q 24 -38 22 -70 Q 10 -76 0 -76 Q -10 -76 -22 -70 Z" fill="${cos.colors.robe}" opacity=".7"/>` : ''}
        ${cos.colors.stripe ? `<path d="M -4 -78 L -4 -18 M 4 -78 L 4 -18" stroke="${cos.colors.stripe}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
        ${cos.colors.logo ? `<text x="0" y="-44" font-size="16" font-weight="700" text-anchor="middle" fill="${cos.colors.logo}" font-family="sans-serif">R</text>` : ''}
        <rect x="-20" y="-18" width="40" height="5" rx="2" fill="${cos.colors.belt}"/>
        `}
      </g>`;

    /* Pelvis / hips */
    const pelvis = `<path d="M -20 -16 Q -22 -4 -16 0 L 16 0 Q 22 -4 20 -16 Z" fill="${cos.colors.pants}"/>`;

    /* Left leg (upper+lower, positive angle = forward) */
    const lLeg = makeJointedLimb('lLeg', -8, 0, 0, 58, 52, cos.colors.pants, cos.colors.feet, s, a.lHp, a.lKn, false, cos.pixel);
    const rLeg = makeJointedLimb('rLeg', 8, 0, 0, 58, 52, cos.colors.pants, cos.colors.feet, s, a.rHp, a.rKn, false, cos.pixel);

    /* Neck + head */
    const neck = `<rect x="-7" y="-88" width="14" height="16" rx="6" fill="${s}"/>`;

    /* Head */
    const headY = -116;
    const headGroup = buildHead(s, ss, sl, hairStyle, hairColor, hairColor2, eyeStyle, eyeColor, accessory, cos);

    /* Arms */
    const lArm = makeJointedLimb('lArm', -20, -72, 0, 50, 44, cos.colors.shirt, s, s, a.lSh, a.lEl, true, cos.pixel);
    const rArm = makeJointedLimb('rArm',  20, -72, 0, 50, 44, cos.colors.shirt, s, s, a.rSh, a.rEl, true, cos.pixel, true);

    /* Accessories */
    const accLayer = buildAccessory(accessory, capeColor, auraColor, cos);

    /* Defs */
    const defs = `<defs>
      <filter id="eye-glow" x="-80%" y="-80%" width="360%" height="360%">
        <feGaussianBlur stdDeviation="3"/>
      </filter>
      <filter id="aura-blur">
        <feGaussianBlur stdDeviation="8"/>
      </filter>
    </defs>`;

    /* Joint handles overlay */
    const jointHandles = showJointHandles ? buildJointHandles(a) : '';

    return `<g class="character" transform="translate(0 0)">
      ${defs}
      ${accLayer.behind}
      ${rLeg}
      ${lLeg}
      ${pelvis}
      ${torso}
      ${rArm}
      ${lArm}
      ${neck}
      <g transform="translate(0 ${headY})">${headGroup}</g>
      ${accLayer.front}
      ${jointHandles}
    </g>`;
  }

  function buildHead(s, ss, sl, hairStyle, hairColor, hairColor2, eyeStyle, eyeColor, accessory, cos) {
    const hair = (HAIR_STYLES[hairStyle] || HAIR_STYLES.spiky)(hairColor, hairColor2);
    const eyes = (EYE_STYLES[eyeStyle] || EYE_STYLES.default)(eyeColor);
    /* cap */
    const hasCap = (accessory === 'none' || accessory === 'cape' || accessory === 'wings' || accessory === 'aura') && cos.colors.cap;
    const capEl = hasCap ? `<g>
      <path d="M -30 -12 Q -28 -34 0 -36 Q 28 -34 30 -12 Z" fill="${cos.colors.cap}"/>
      <rect x="-32" y="-14" width="64" height="7" rx="3" fill="${cos.colors.cap}"/>
      <rect x="-32" y="-14" width="64" height="3" rx="1.5" fill="${GWColor.shade(cos.colors.cap, 0.25)}"/>
    </g>` : '';

    return `
      ${hair}
      <path d="M -26 -8 Q -28 -34 -20 -44 Q -10 -52 0 -52 Q 10 -52 20 -44 Q 28 -34 26 -8 Q 20 8 0 12 Q -20 8 -26 -8 Z" fill="${s}"/>
      <path d="M -26 -8 Q -28 -30 -22 -42 Q -14 -50 0 -50 L 0 12 Q -20 8 -26 -8 Z" fill="${ss}" opacity=".25"/>
      <path d="M -10 6 Q 0 9 10 6 Q 5 10 0 10 Q -5 10 -10 6 Z" fill="${sl}"/>
      <path d="M -4 8 Q 0 10 4 8" fill="none" stroke="${sl}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M -1.5 0 L 0.5 3.5 L -1.5 3.5" fill="${ss}" opacity=".7"/>
      <path d="M -28 -4 Q -30 8 -26 14 L -24 6 Z" fill="${ss}" opacity=".5"/>
      <path d="M 28 -4 Q 30 8 26 14 L 24 6 Z" fill="${ss}" opacity=".5"/>
      <g transform="translate(0 -20)">${eyes}</g>
      ${capEl}
    `;
  }

  function buildAccessory(accessory, capeColor, auraColor, cos) {
    switch (accessory) {
      case 'cape': return {
        behind: `<path d="M -18 -76 Q -40 -40 -36 40 Q -24 60 0 64 Q 24 60 36 40 Q 40 -40 18 -76 Z"
          fill="${capeColor}" opacity=".9"/>
          <path d="M -18 -76 Q -40 -40 -36 40 Q -24 60 0 64 L 0 -76 Z" fill="${GWColor.shade(capeColor, -0.2)}" opacity=".7"/>`,
        front: '',
      };
      case 'wings': return {
        behind: `<g>
          <path d="M -18 -70 C -60 -80 -90 -40 -80 10 C -60 -10 -40 -30 -18 -50 Z" fill="${GWColor.shade(capeColor, 0.1)}"/>
          <path d="M -18 -70 C -60 -60 -80 -10 -70 30 C -52 10 -36 -10 -18 -50 Z" fill="${capeColor}"/>
          <path d="M 18 -70 C 60 -80 90 -40 80 10 C 60 -10 40 -30 18 -50 Z" fill="${GWColor.shade(capeColor, 0.1)}"/>
          <path d="M 18 -70 C 60 -60 80 -10 70 30 C 52 10 36 -10 18 -50 Z" fill="${capeColor}"/>
        </g>`,
        front: '',
      };
      case 'mask': return {
        behind: '',
        front: `<g transform="translate(0 -116)">
          <path d="M -24 -8 Q -26 8 -20 18 Q -10 22 0 22 Q 10 22 20 18 Q 26 8 24 -8 Z"
            fill="#111" opacity=".85"/>
          <path d="M -22 -8 Q -24 6 -18 16 Q -10 20 0 20 L 0 -8 Z" fill="#222" opacity=".5"/>
        </g>`,
      };
      case 'onimask': return {
        behind: '',
        front: `<g transform="translate(0 -116)">
          <path d="M -28 -14 Q -32 10 -20 24 Q -10 30 0 30 Q 10 30 20 24 Q 32 10 28 -14 Z"
            fill="#c82828"/>
          <path d="M -28 -14 Q -32 8 -22 22 L 0 -14 Z" fill="#a01818" opacity=".7"/>
          <path d="M -16 -6 L -20 6 L -12 10 L -8 0 Z M 16 -6 L 20 6 L 12 10 L 8 0 Z" fill="#fff" opacity=".9"/>
          <path d="M -28 -14 C -32 -22 -24 -26 -18 -22 L -22 -12 Z" fill="#fde8c8"/>
          <path d="M 28 -14 C 32 -22 24 -26 18 -22 L 22 -12 Z" fill="#fde8c8"/>
          <path d="M -16 -6 Q -10 -12 0 -10 Q 10 -12 16 -6" fill="none" stroke="#600" stroke-width="2"/>
        </g>`,
      };
      case 'crown': return {
        behind: '',
        front: `<g transform="translate(0 -166)">
          <path d="M -20 0 L -20 -18 L -10 -8 L 0 -22 L 10 -8 L 20 -18 L 20 0 Z"
            fill="${GWColor.shade('#f5c842', 0)}"/>
          <path d="M -20 0 L -20 -18 L -10 -8 L 0 -22 L 0 0 Z" fill="${GWColor.shade('#f5c842', -0.2)}" opacity=".7"/>
          <circle cx="0" cy="-22" r="4" fill="#e84040"/>
          <circle cx="-20" cy="-18" r="3" fill="#40a0e8"/>
          <circle cx="20" cy="-18" r="3" fill="#40a0e8"/>
          <rect x="-20" y="-2" width="40" height="4" rx="2" fill="#d4a020"/>
        </g>`,
      };
      case 'helmet': return {
        behind: '',
        front: `<g transform="translate(0 -116)">
          <path d="M -28 -8 Q -30 -40 -20 -48 Q -10 -56 0 -56 Q 10 -56 20 -48 Q 30 -40 28 -8 Z"
            fill="#2a3142"/>
          <path d="M -28 -8 Q -30 -36 -22 -46 Q 0 -54 0 -8 Z" fill="#3a4152" opacity=".7"/>
          <path d="M -14 -4 Q 0 -6 14 -4" fill="none" stroke="${auraColor}" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="-14" y="-4" width="28" height="10" rx="5" fill="#1a2132" opacity=".8"/>
          <rect x="-10" y="-3" width="20" height="7" rx="3.5" fill="${auraColor}" opacity=".9"/>
        </g>`,
      };
      case 'aura': return {
        behind: `<g opacity=".55" filter="url(#aura-blur)">
          <ellipse cx="0" cy="-60" rx="50" ry="80" fill="${auraColor}" opacity=".4">
            <animate attributeName="rx" values="50;58;50" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="ry" values="80;90;80" dur="2.4s" repeatCount="indefinite"/>
          </ellipse>
        </g>`,
        front: `<g>
          <circle cx="-30" cy="-90" r="4" fill="${auraColor}" opacity="0">
            <animate attributeName="cy" values="-90;-160;-160" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;.9;0" dur="1.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="25" cy="-80" r="3" fill="${auraColor}" opacity="0">
            <animate attributeName="cy" values="-80;-160;-160" dur="2.2s" begin=".6s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;.8;0" dur="2.2s" begin=".6s" repeatCount="indefinite"/>
          </circle>
          <circle cx="-8" cy="-100" r="2.5" fill="${auraColor}" opacity="0">
            <animate attributeName="cy" values="-100;-160;-160" dur="2s" begin="1.1s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0;.7;0" dur="2s" begin="1.1s" repeatCount="indefinite"/>
          </circle>
        </g>`,
      };
      default: return { behind: '', front: '' };
    }
  }

  /* Build a jointed limb (upper + lower segment).
     isArm: true for arms (flipped axis), mirrorX: flip for right-side. */
  function makeJointedLimb(id, ox, oy, baseAngle, upper, lower, colorA, colorB, skinC, parentAngle, childAngle, isArm, pixel, mirrorX = false) {
    const sw = isArm ? 11 : 14;   /* segment width */
    const lw = isArm ? 9 : 12;
    const mx = mirrorX ? -1 : 1;
    const totalAngle = baseAngle + parentAngle;
    const rad = totalAngle * Math.PI / 180;
    const jx = ox + mx * Math.sin(rad) * upper;
    const jy = oy + Math.cos(rad) * upper;
    const elbowAngle = totalAngle + childAngle;
    const er = elbowAngle * Math.PI / 180;
    const ex = jx + mx * Math.sin(er) * lower;
    const ey = jy + Math.cos(er) * lower;

    const upperPath = `M ${ox - sw / 2} ${oy} L ${jx - sw / 2} ${jy} L ${jx + sw / 2} ${jy} L ${ox + sw / 2} ${oy} Z`;
    const lowerPath = `M ${jx - lw / 2} ${jy} L ${ex - lw / 2} ${ey} L ${ex + lw / 2} ${ey} L ${jx + lw / 2} ${jy} Z`;

    const shadowX = -sw / 6;
    const endPath = isArm
      ? `M ${ex - 9} ${ey} Q ${ex - 2} ${ey + 6} ${ex + 2} ${ey + 8} Q ${ex + 6} ${ey + 6} ${ex + 8} ${ey} Z`
      : `M ${ex - 14} ${ey} Q ${ex - 12} ${ey + 10} ${ex} ${ey + 14} Q ${ex + 12} ${ey + 10} ${ex + 14} ${ey} Z`;

    return `<g class="${id}">
      <path d="${upperPath}" fill="${colorA}" rx="4"/>
      <path d="${upperPath}" fill="${GWColor.shade(colorA, -0.25)}" opacity=".35" clip-path=""/>
      <circle cx="${ox}" cy="${oy}" r="${sw / 2}" fill="${colorA}"/>
      <path d="${lowerPath}" fill="${colorA}"/>
      <circle cx="${jx}" cy="${jy}" r="${lw / 2}" fill="${GWColor.shade(colorA, -0.1)}"/>
      <path d="${endPath}" fill="${colorB}"/>
      <circle cx="${ex}" cy="${ey}" r="${lw / 2.2}" fill="${colorB}"/>
    </g>`;
  }

  function pixelArmor(colors, part) {
    if (part !== 'torso') return '';
    return `<g>
      <rect x="-22" y="-80" width="44" height="66" rx="4" fill="${colors.armor}"/>
      <rect x="-22" y="-80" width="10" height="66" rx="2" fill="${colors.armordark}" opacity=".6"/>
      <rect x="-20" y="-78" width="40" height="6" fill="${colors.armordark}" opacity=".5"/>
      <rect x="-20" y="-66" width="40" height="5" fill="${colors.armordark}" opacity=".4"/>
      <rect x="-20" y="-52" width="40" height="5" fill="${colors.armordark}" opacity=".4"/>
      <rect x="-20" y="-38" width="40" height="5" fill="${colors.armordark}" opacity=".4"/>
      <rect x="-20" y="-18" width="40" height="5" fill="${colors.armordark}" opacity=".5"/>
    </g>`;
  }

  function buildJointHandles(a) {
    const joints = [
      { id: 'lSh', x: -20, y: -72, label: 'L.Sh' },
      { id: 'rSh', x: 20,  y: -72, label: 'R.Sh' },
      { id: 'lHp', x: -8,  y: 0,   label: 'L.Hi' },
      { id: 'rHp', x: 8,   y: 0,   label: 'R.Hi' },
    ];
    return `<g class="joint-handles" opacity=".8">
      ${joints.map(j => `
        <g class="joint-handle" data-joint="${j.id}" style="cursor:grab">
          <circle cx="${j.x}" cy="${j.y}" r="6" fill="rgba(59,130,246,0.25)" stroke="#60a5fa" stroke-width="1.5"/>
          <text x="${j.x}" y="${j.y + 16}" font-size="7" fill="#8fa3c0" text-anchor="middle" font-family="Inter,sans-serif">${j.label}</text>
        </g>`).join('')}
    </g>`;
  }

  /* ---------- Public API ---------- */

  const DEFAULTS = {
    skinTone: 'tone1', hairStyle: 'spiky', hairColor: '#111111', hairColor2: '#1a1a1a',
    eyeStyle: 'default', eyeColor: '#2a5fc8',
    costume: 'default', accessory: 'none',
    capeColor: '#1a2a6e', auraColor: '#3b82f6',
    equippedSword: null, equippedSwordConfig: null,
    poses: { ...POSES.idle.a },
  };

  /* Render the character into an <svg> string with given viewBox */
  function render(cfg = {}, showHandles = false) {
    const c = { ...DEFAULTS, ...cfg };
    c.poses = { ...POSES.idle.a, ...(cfg.poses || {}) };
    const inner = buildCharacterSVG(c, showHandles);
    /* add sword if equipped */
    let swordSVG = '';
    if (c.equippedSwordConfig) {
      const { g } = Swords.buildGroup(c.equippedSwordConfig);
      /* position sword at right hand based on pose */
      const rSh = c.poses.rSh || 0;
      const rEl = c.poses.rEl || 0;
      const upper = 50, lower = 44;
      const rad = rSh * Math.PI / 180;
      const jx = 20 + (-1) * Math.sin(rad) * upper;
      const jy = -72  + Math.cos(rad) * upper;
      const elbowAngle = rSh + rEl;
      const er = elbowAngle * Math.PI / 180;
      const ex = jx + (-1) * Math.sin(er) * lower;
      const ey = jy + Math.cos(er) * lower;
      const handAngle = elbowAngle;
      swordSVG = `<g transform="translate(${ex} ${ey}) rotate(${handAngle})">${g}</g>`;
    }
    return `${inner}${swordSVG}`;
  }

  /* Return a full standalone <svg> */
  function svg(cfg = {}, showHandles = false) {
    const inner = render(cfg, showHandles);
    return `<svg viewBox="-80 -240 160 380" xmlns="http://www.w3.org/2000/svg" class="avatar-svg">${inner}</svg>`;
  }

  /* Inject a re-rendered character into an existing <svg> element */
  function update(svgEl, cfg = {}, showHandles = false) {
    svgEl.innerHTML = render(cfg, showHandles);
    svgEl.setAttribute('viewBox', '-80 -240 160 380');
  }

  return {
    SKIN_TONES, HAIR_COLORS, HAIR_STYLES: Object.keys(HAIR_STYLES),
    EYE_STYLES: Object.keys(EYE_STYLES),
    COSTUMES, ACCESSORIES, POSES,
    DEFAULTS, render, svg, update,
  };
})();
