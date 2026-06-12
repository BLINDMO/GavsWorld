/* ============================================================
   Gavin's World — Avatar portrait system
   HEAD-ONLY anime portrait for Gavin's World PWA.
   8 hair styles, 6 eye types, 7 skin tones, 5 accessories.
   ViewBox: -85 -110 170 200
   Face center: (0,0)
   ============================================================ */

const Avatar = (() => {

  /* ------------------------------------------------------------------ */
  /*  Color utilities                                                     */
  /* ------------------------------------------------------------------ */

  const GWColor = {
    /**
     * Lighten (amount > 0) or darken (amount < 0) a hex color.
     * amount in range roughly -100..100 (added to each 0-255 channel).
     */
    shade(hex, amount) {
      let c = hex.replace('#', '');
      if (c.length === 3) c = c.split('').map(x => x + x).join('');
      const num = parseInt(c, 16);
      const r = Math.min(255, Math.max(0, (num >> 16) + amount));
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
      const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
      return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
    },
    /** Mix two hex colours at ratio t (0=a, 1=b). */
    mix(a, b, t = 0.5) {
      const ca = parseInt(a.replace('#',''), 16);
      const cb = parseInt(b.replace('#',''), 16);
      const r = Math.round(((ca>>16) & 0xff) * (1-t) + ((cb>>16) & 0xff) * t);
      const g = Math.round(((ca>>8)  & 0xff) * (1-t) + ((cb>>8)  & 0xff) * t);
      const bv= Math.round(( ca      & 0xff) * (1-t) + ( cb      & 0xff) * t);
      return '#' + [r,g,bv].map(v=>v.toString(16).padStart(2,'0')).join('');
    }
  };

  /* ------------------------------------------------------------------ */
  /*  Palettes                                                            */
  /* ------------------------------------------------------------------ */

  const SKIN_TONES = [
    { id:'tone1', name:'Porcelain', hex:'#fde8d2', shadow:'#e8b896', shadow2:'#d49a72', lip:'#d4807a' },
    { id:'tone2', name:'Fair',      hex:'#f5c98c', shadow:'#d4974e', shadow2:'#b87030', lip:'#c8706e' },
    { id:'tone3', name:'Light',     hex:'#e8a86a', shadow:'#c07838', shadow2:'#9e5e20', lip:'#b05c58' },
    { id:'tone4', name:'Medium',    hex:'#c47d40', shadow:'#8a5020', shadow2:'#6a3a10', lip:'#965050' },
    { id:'tone5', name:'Tan',       hex:'#a05c2a', shadow:'#6a3810', shadow2:'#4e2808', lip:'#804040' },
    { id:'tone6', name:'Brown',     hex:'#7a3f18', shadow:'#4e2608', shadow2:'#341604', lip:'#663030' },
    { id:'tone7', name:'Deep',      hex:'#4e2a10', shadow:'#2e1608', shadow2:'#1a0c04', lip:'#5a2828' },
  ];

  const HAIR_COLORS = [
    { hex:'#0d0d0d', name:'Jet Black'   },
    { hex:'#2a1a0a', name:'Dark Brown'  },
    { hex:'#5a3010', name:'Chestnut'    },
    { hex:'#8b5e2a', name:'Light Brown' },
    { hex:'#c8942a', name:'Amber'       },
    { hex:'#e8c85a', name:'Golden'      },
    { hex:'#f5f5e8', name:'Platinum'    },
    { hex:'#d4282a', name:'Red'         },
    { hex:'#e85a8a', name:'Pink'        },
    { hex:'#7a4ed8', name:'Purple'      },
    { hex:'#1a6ad4', name:'Blue'        },
    { hex:'#1ac87a', name:'Green'       },
  ];

  /* ------------------------------------------------------------------ */
  /*  Face path                                                           */
  /* ------------------------------------------------------------------ */

  const FACE_PATH = 'M -44 8 Q -50 -28 -40 -54 Q -24 -68 0 -68 Q 24 -68 40 -54 Q 50 -28 44 8 Q 38 36 0 42 Q -38 36 -44 8 Z';

  /* ------------------------------------------------------------------ */
  /*  Hair styles                                                         */
  /*  Each style: { back(color), front(color) }                          */
  /*  back  = drawn BEHIND face                                           */
  /*  front = drawn OVER face skin but before eyes                       */
  /* ------------------------------------------------------------------ */

  const HAIR_STYLES = {

    spiky: {
      back: () => '',
      front: (c) => {
        const hi = GWColor.shade(c, 42);
        const sh = GWColor.shade(c, -28);
        return `
        <g class="hair-front">
          <!-- base cap -->
          <path d="M -44 8 Q -50 -28 -40 -54 Q -24 -68 0 -68 Q 24 -68 40 -54 Q 50 -28 44 8 Q 20 -20 0 -24 Q -20 -20 -44 8 Z" fill="${sh}"/>
          <!-- spikes -->
          <path d="M -36 -48 Q -44 -80 -30 -100 Q -22 -78 -28 -56 Z" fill="${c}"/>
          <path d="M -18 -60 Q -14 -95 0 -108 Q 8 -88 2 -64 Z" fill="${c}"/>
          <path d="M 0 -62 Q 10 -98 26 -105 Q 28 -82 18 -60 Z" fill="${c}"/>
          <path d="M 18 -52 Q 32 -84 46 -88 Q 42 -66 36 -48 Z" fill="${c}"/>
          <!-- cap fill over face top -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -28 -66 0 -68 Q 28 -66 40 -54 Q 52 -30 44 8 Q 20 -18 0 -22 Q -20 -18 -44 8 Z" fill="${c}"/>
          <!-- highlight streaks -->
          <path d="M -10 -64 Q -6 -96 4 -104" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
          <path d="M 8 -60 Q 16 -90 22 -100" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".45"/>
          <path d="M -28 -52 Q -34 -76 -26 -96" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

    long: {
      back: (c) => {
        const sh = GWColor.shade(c, -30);
        return `
        <g class="hair-back">
          <!-- long side strands behind head -->
          <path d="M -40 -54 Q -62 -30 -58 20 Q -56 50 -48 70 Q -36 80 -30 70 Q -26 50 -30 20 Q -36 -10 -44 8" fill="${sh}"/>
          <path d="M 40 -54 Q 62 -30 58 20 Q 56 50 48 70 Q 36 80 30 70 Q 26 50 30 20 Q 36 -10 44 8" fill="${sh}"/>
          <!-- center back flow -->
          <path d="M -20 -68 Q 0 -72 20 -68 Q 14 0 10 40 Q 4 72 0 80 Q -4 72 -10 40 Q -14 0 -20 -68 Z" fill="${c}"/>
        </g>`;
      },
      front: (c) => {
        const hi = GWColor.shade(c, 40);
        const sh = GWColor.shade(c, -25);
        return `
        <g class="hair-front">
          <!-- scalp cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- fringe sweeping left -->
          <path d="M -6 -68 Q -30 -72 -48 -58 Q -54 -44 -50 -30" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round"/>
          <path d="M 4 -68 Q 20 -74 38 -62 Q 46 -50 44 -36" fill="none" stroke="${sh}" stroke-width="8" stroke-linecap="round"/>
          <!-- highlight -->
          <path d="M -22 -64 Q -10 -70 6 -68" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
        </g>`;
      }
    },

    bun: {
      back: () => '',
      front: (c) => {
        const hi = GWColor.shade(c, 44);
        const sh = GWColor.shade(c, -30);
        return `
        <g class="hair-front">
          <!-- scalp cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- bun circle on top -->
          <circle cx="0" cy="-82" r="20" fill="${c}"/>
          <circle cx="0" cy="-82" r="20" fill="none" stroke="${sh}" stroke-width="2"/>
          <!-- bun wrap lines -->
          <path d="M -12 -92 Q 0 -96 12 -92" fill="none" stroke="${sh}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <path d="M -16 -84 Q 0 -88 16 -84" fill="none" stroke="${sh}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <path d="M -18 -76 Q 0 -80 18 -76" fill="none" stroke="${sh}" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>
          <!-- highlight on bun -->
          <ellipse cx="-6" cy="-90" rx="6" ry="4" fill="${hi}" opacity=".45" transform="rotate(-20,-6,-90)"/>
          <!-- fringe -->
          <path d="M -40 -54 Q -46 -38 -42 -24" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
          <path d="M 40 -54 Q 46 -38 42 -24" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
          <!-- highlight streaks on cap -->
          <path d="M -14 -62 Q -6 -68 8 -66" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/>
        </g>`;
      }
    },

    short: {
      back: () => '',
      front: (c) => {
        const hi = GWColor.shade(c, 40);
        const sh = GWColor.shade(c, -25);
        return `
        <g class="hair-front">
          <!-- tight cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- slightly domed top -->
          <path d="M -40 -54 Q -30 -84 0 -82 Q 30 -84 40 -54" fill="${c}"/>
          <!-- side coverage -->
          <path d="M -44 8 Q -54 -10 -50 -34 Q -46 -52 -40 -54" fill="${sh}"/>
          <path d="M 44 8 Q 54 -10 50 -34 Q 46 -52 40 -54" fill="${sh}"/>
          <!-- texture lines -->
          <path d="M -22 -66 Q -10 -80 8 -78" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
          <path d="M -30 -58 Q -18 -74 -4 -74" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
          <path d="M 8 -76 Q 20 -80 32 -70" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

    ponytail: {
      back: (c) => {
        const sh = GWColor.shade(c, -28);
        const mid = GWColor.shade(c, -14);
        return `
        <g class="hair-back">
          <!-- ponytail extending to the right and down -->
          <path d="M 36 -48 Q 68 -20 72 14 Q 74 38 66 56 Q 60 68 52 60 Q 46 50 50 30 Q 54 10 50 -10 Q 44 -32 36 -48 Z" fill="${mid}"/>
          <path d="M 38 -44 Q 60 -14 62 14 Q 63 32 58 50" fill="none" stroke="${sh}" stroke-width="2" stroke-linecap="round" opacity=".5"/>
          <path d="M 44 -36 Q 64 -8 65 20 Q 65 40 60 56" fill="none" stroke="${GWColor.shade(c,30)}" stroke-width="1.5" stroke-linecap="round" opacity=".4"/>
        </g>`;
      },
      front: (c) => {
        const hi = GWColor.shade(c, 42);
        const sh = GWColor.shade(c, -28);
        return `
        <g class="hair-front">
          <!-- cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- domed top -->
          <path d="M -38 -54 Q -26 -80 0 -80 Q 26 -80 38 -54" fill="${c}"/>
          <!-- tie/band area on right -->
          <ellipse cx="42" cy="-30" rx="7" ry="5" fill="${sh}" transform="rotate(20 42 -30)"/>
          <!-- fringe pieces -->
          <path d="M -40 -54 Q -48 -38 -44 -20" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/>
          <!-- highlight -->
          <path d="M -18 -66 Q -4 -78 12 -74" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
          <path d="M 10 -72 Q 24 -78 34 -64" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

    swept: {
      back: () => '',
      front: (c) => {
        const hi = GWColor.shade(c, 44);
        const sh = GWColor.shade(c, -26);
        return `
        <g class="hair-front">
          <!-- cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- top sweep to the right -->
          <path d="M -30 -70 Q -10 -90 20 -88 Q 42 -86 50 -68 Q 38 -58 18 -60 Q -4 -62 -22 -68 Z" fill="${c}"/>
          <path d="M -22 -70 Q -2 -92 24 -90 Q 44 -88 52 -70" fill="none" stroke="${sh}" stroke-width="2" stroke-linecap="round" opacity=".5"/>
          <!-- side coverage left -->
          <path d="M -44 8 Q -56 -8 -52 -32 Q -48 -52 -40 -54" fill="${sh}"/>
          <!-- highlight -->
          <path d="M -14 -72 Q 8 -90 30 -86" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
          <path d="M -26 -64 Q -8 -82 14 -80" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

    twoblock: {
      back: () => '',
      front: (c) => {
        const hi = GWColor.shade(c, 40);
        const sh = GWColor.shade(c, -28);
        const undercut = GWColor.shade(c, -50);
        return `
        <g class="hair-front">
          <!-- undercut sides (very dark/shaved look) -->
          <path d="M -44 8 Q -54 -10 -50 -34 Q -46 -50 -40 -54 Q -42 -38 -38 -20 Q -36 -8 -38 8 Z" fill="${undercut}"/>
          <path d="M 44 8 Q 54 -10 50 -34 Q 46 -50 40 -54 Q 42 -38 38 -20 Q 36 -8 38 8 Z" fill="${undercut}"/>
          <!-- top block — thick, slightly forward-tilted -->
          <path d="M -38 -54 Q -28 -82 0 -84 Q 28 -82 38 -54 Q 20 -50 0 -50 Q -20 -50 -38 -54 Z" fill="${c}"/>
          <!-- top block sides with slight overhang -->
          <path d="M -38 -54 Q -42 -44 -40 -30 Q -38 -14 -38 -8" fill="none" stroke="${sh}" stroke-width="8" stroke-linecap="round"/>
          <path d="M 38 -54 Q 42 -44 40 -30 Q 38 -14 38 -8" fill="none" stroke="${sh}" stroke-width="8" stroke-linecap="round"/>
          <!-- fringe hang-down center -->
          <path d="M -20 -52 Q -10 -40 0 -38 Q 10 -40 20 -52" fill="${sh}" opacity=".7"/>
          <!-- highlights on top block -->
          <path d="M -18 -76 Q -2 -84 16 -78" fill="none" stroke="${hi}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
          <path d="M -26 -66 Q -8 -76 10 -72" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

    warrior: {
      back: (c) => {
        const sh = GWColor.shade(c, -30);
        return `
        <g class="hair-back">
          <!-- long flowing strands left and right -->
          <path d="M -38 -56 Q -66 -30 -64 10 Q -62 46 -50 68 Q -40 80 -32 68 Q -26 50 -30 20 Q -34 -10 -44 8" fill="${sh}"/>
          <path d="M 38 -56 Q 66 -30 64 10 Q 62 46 50 68 Q 40 80 32 68 Q 26 50 30 20 Q 34 -10 44 8" fill="${sh}"/>
          <!-- center back flow -->
          <path d="M -16 -70 Q 0 -76 16 -70 Q 10 -10 8 36 Q 4 68 0 78 Q -4 68 -8 36 Q -10 -10 -16 -70 Z" fill="${c}"/>
        </g>`;
      },
      front: (c) => {
        const hi = GWColor.shade(c, 44);
        const sh = GWColor.shade(c, -28);
        return `
        <g class="hair-front">
          <!-- scalp base cap -->
          <path d="M -44 8 Q -52 -30 -40 -54 Q -24 -70 0 -70 Q 24 -70 40 -54 Q 52 -30 44 8 Q 20 -22 0 -26 Q -20 -22 -44 8 Z" fill="${c}"/>
          <!-- central tall spike cluster -->
          <path d="M -14 -60 Q -18 -90 -10 -112 Q -4 -92 -4 -64 Z" fill="${c}"/>
          <path d="M -6 -64 Q -4 -100 0 -112 Q 4 -100 6 -64 Z" fill="${hi}" opacity=".7"/>
          <path d="M 0 -66 Q 8 -98 14 -108 Q 18 -88 16 -62 Z" fill="${c}"/>
          <!-- flanking spikes -->
          <path d="M -28 -56 Q -36 -80 -28 -98 Q -20 -78 -18 -58 Z" fill="${sh}"/>
          <path d="M 24 -58 Q 34 -82 30 -100 Q 22 -80 20 -60 Z" fill="${sh}"/>
          <!-- side coverage -->
          <path d="M -44 8 Q -54 -8 -50 -32 Q -46 -52 -40 -54" fill="${sh}"/>
          <path d="M 44 8 Q 54 -8 50 -32 Q 46 -52 40 -54" fill="${sh}"/>
          <!-- highlight streaks -->
          <path d="M -8 -66 Q -6 -98 0 -110" fill="none" stroke="${hi}" stroke-width="2.5" stroke-linecap="round" opacity=".6"/>
          <path d="M -18 -62 Q -16 -88 -10 -106" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
          <path d="M 6 -64 Q 10 -92 14 -104" fill="none" stroke="${hi}" stroke-width="2" stroke-linecap="round" opacity=".4"/>
        </g>`;
      }
    },

  };

  /* ------------------------------------------------------------------ */
  /*  Eye styles                                                          */
  /*  Each renders a PAIR of eyes.                                        */
  /*  Individual eye group uses transform="translate(±26, -16)"          */
  /*  Sclera: rx=13, ry=9                                                */
  /* ------------------------------------------------------------------ */

  const EYE_STYLES = {

    default: (eyeColor) => `
      <g class="eyes">
        <!-- left eye -->
        <g transform="translate(-26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="7.5" rx="7.5" fill="${eyeColor}"/>
          <ellipse ry="5" rx="5" fill="#111" cy="0.5"/>
          <circle cx="-3" cy="-2.5" r="1.8" fill="#fff" opacity=".9"/>
          <circle cx="2" cy="2.5" r="1" fill="#fff" opacity=".7"/>
          <!-- upper eyelid line -->
          <path d="M -13 0 Q 0 -11 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
          <!-- lower lash line subtle -->
          <path d="M -11 4 Q 0 8 11 4" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".6"/>
          <!-- corner lash hints -->
          <line x1="-13" y1="0" x2="-16" y2="-3" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="13" y1="0" x2="16" y2="-2" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="7.5" rx="7.5" fill="${eyeColor}"/>
          <ellipse ry="5" rx="5" fill="#111" cy="0.5"/>
          <circle cx="-3" cy="-2.5" r="1.8" fill="#fff" opacity=".9"/>
          <circle cx="2" cy="2.5" r="1" fill="#fff" opacity=".7"/>
          <path d="M -13 0 Q 0 -11 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M -11 4 Q 0 8 11 4" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".6"/>
          <line x1="-13" y1="0" x2="-16" y2="-2" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="13" y1="0" x2="16" y2="-3" stroke="#1a1a1a" stroke-width="1.3" stroke-linecap="round"/>
        </g>
      </g>`,

    sharp: (eyeColor) => `
      <g class="eyes">
        <!-- left eye: angular/fox shape -->
        <g transform="translate(-26,-16)">
          <path d="M -13 3 L -8 -9 L 6 -9 L 13 3 Q 0 7 -13 3 Z" fill="#fff"/>
          <ellipse ry="6.5" rx="6.5" fill="${eyeColor}" cy="-1"/>
          <ellipse ry="4.5" rx="4.5" fill="#111" cy="-0.5"/>
          <circle cx="-2" cy="-3" r="1.6" fill="#fff" opacity=".9"/>
          <path d="M -13 3 L -8 -9 L 6 -9 L 13 3" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M -11 3 Q 0 8 11 3" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".5"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <path d="M -13 3 L -6 -9 L 8 -9 L 13 3 Q 0 7 -13 3 Z" fill="#fff"/>
          <ellipse ry="6.5" rx="6.5" fill="${eyeColor}" cy="-1"/>
          <ellipse ry="4.5" rx="4.5" fill="#111" cy="-0.5"/>
          <circle cx="-2" cy="-3" r="1.6" fill="#fff" opacity=".9"/>
          <path d="M -13 3 L -6 -9 L 8 -9 L 13 3" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>
          <path d="M -11 3 Q 0 8 11 3" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".5"/>
        </g>
      </g>`,

    sleepy: (eyeColor) => `
      <g class="eyes">
        <!-- left eye: heavy drooping lid -->
        <g transform="translate(-26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="7" rx="7" fill="${eyeColor}" cy="1"/>
          <ellipse ry="5" rx="5" fill="#111" cy="1.5"/>
          <circle cx="-2.5" cy="-1" r="1.5" fill="#fff" opacity=".85"/>
          <!-- heavy upper lid covering top half -->
          <path d="M -13 0 Q -4 -5 13 0 Q 13 -9 0 -9 Q -13 -9 -13 0 Z" fill="#fde8d2" opacity=".0"/>
          <path d="M -13 0 Q 0 -4 13 0" fill="#e8c0a0" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <!-- drooping top -->
          <path d="M -13 0 Q -4 -3 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M -11 4 Q 0 8.5 11 4" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".5"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="7" rx="7" fill="${eyeColor}" cy="1"/>
          <ellipse ry="5" rx="5" fill="#111" cy="1.5"/>
          <circle cx="-2.5" cy="-1" r="1.5" fill="#fff" opacity=".85"/>
          <path d="M -13 0 Q 0 -4 13 0" fill="#e8c0a0" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <path d="M -13 0 Q -4 -3 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round"/>
          <path d="M -11 4 Q 0 8.5 11 4" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".5"/>
        </g>
      </g>`,

    wide: (eyeColor) => `
      <g class="eyes">
        <!-- left eye: large startled wide eyes with visible white above iris -->
        <g transform="translate(-26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="8" rx="8" fill="${eyeColor}"/>
          <ellipse ry="5.5" rx="5.5" fill="#111"/>
          <circle cx="-3" cy="-3" r="2" fill="#fff" opacity=".95"/>
          <circle cx="3" cy="3" r="1.2" fill="#fff" opacity=".7"/>
          <!-- wide open upper lid -->
          <path d="M -13 -1 Q 0 -13 13 -1" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <path d="M -11 5 Q 0 9 11 5" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
          <!-- lashes -->
          <line x1="-13" y1="-1" x2="-15" y2="-5" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="-8" y1="-8" x2="-9" y2="-12" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="0" y1="-9" x2="0" y2="-13" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="8" y1="-8" x2="9" y2="-12" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="13" y1="-1" x2="16" y2="-4" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="8" rx="8" fill="${eyeColor}"/>
          <ellipse ry="5.5" rx="5.5" fill="#111"/>
          <circle cx="-3" cy="-3" r="2" fill="#fff" opacity=".95"/>
          <circle cx="3" cy="3" r="1.2" fill="#fff" opacity=".7"/>
          <path d="M -13 -1 Q 0 -13 13 -1" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
          <path d="M -11 5 Q 0 9 11 5" fill="none" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round" opacity=".7"/>
          <line x1="-13" y1="-1" x2="-16" y2="-4" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
          <line x1="-8" y1="-8" x2="-9" y2="-12" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="0" y1="-9" x2="0" y2="-13" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="8" y1="-8" x2="9" y2="-12" stroke="#1a1a1a" stroke-width="1.2" stroke-linecap="round"/>
          <line x1="13" y1="-1" x2="15" y2="-5" stroke="#1a1a1a" stroke-width="1.4" stroke-linecap="round"/>
        </g>
      </g>`,

    sharingan: (_eyeColor) => `
      <g class="eyes">
        <!-- left eye: Sharingan — red iris, black tomoe, red pupil -->
        <g transform="translate(-26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <!-- red iris -->
          <ellipse ry="7.5" rx="7.5" fill="#c01010"/>
          <!-- tomoe pattern (3 commas rotated 120°) -->
          <g fill="#111">
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z"/>
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z" transform="rotate(120 0 0)"/>
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z" transform="rotate(240 0 0)"/>
          </g>
          <!-- red pupil -->
          <circle r="1.8" fill="#c01010"/>
          <circle cx="-2.5" cy="-2.5" r="1.2" fill="#fff" opacity=".7"/>
          <path d="M -13 0 Q 0 -10 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M -11 4.5 Q 0 8 11 4.5" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".6"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <ellipse rx="13" ry="9" fill="#fff"/>
          <ellipse ry="7.5" rx="7.5" fill="#c01010"/>
          <g fill="#111">
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z"/>
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z" transform="rotate(120 0 0)"/>
            <path d="M 0 -4.2 Q 2.5 -5.5 4.2 -3.2 Q 5 -0.5 3 1.2 Q 1 2.5 -0.5 1 Q -1 0 0 -2 Q 0.8 -3.2 0 -4.2 Z" transform="rotate(240 0 0)"/>
          </g>
          <circle r="1.8" fill="#c01010"/>
          <circle cx="-2.5" cy="-2.5" r="1.2" fill="#fff" opacity=".7"/>
          <path d="M -13 0 Q 0 -10 13 0" fill="none" stroke="#1a1a1a" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M -11 4.5 Q 0 8 11 4.5" fill="none" stroke="#1a1a1a" stroke-width="1" stroke-linecap="round" opacity=".6"/>
        </g>
      </g>`,

    ender: (_eyeColor) => `
      <g class="eyes">
        <!-- left eye: dark sclera with animated glowing rect -->
        <g transform="translate(-26,-16)">
          <ellipse rx="13" ry="9" fill="#1a1a2e"/>
          <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#7b00ff">
            <animate attributeName="opacity" values="1;0.4;1" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="fill" values="#7b00ff;#a855f7;#7b00ff" dur="1.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="-8" y="-4" width="16" height="8" rx="2" fill="none" stroke="#c084fc" stroke-width="0.8" filter="url(#eye-glow)">
            <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.8s" repeatCount="indefinite"/>
          </rect>
          <path d="M -13 0 Q 0 -10 13 0" fill="none" stroke="#6b00cc" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M -11 4.5 Q 0 8 11 4.5" fill="none" stroke="#6b00cc" stroke-width="1" stroke-linecap="round" opacity=".7"/>
        </g>
        <!-- right eye -->
        <g transform="translate(26,-16)">
          <ellipse rx="13" ry="9" fill="#1a1a2e"/>
          <rect x="-8" y="-4" width="16" height="8" rx="2" fill="#7b00ff">
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite"/>
            <animate attributeName="fill" values="#a855f7;#7b00ff;#a855f7" dur="1.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="-8" y="-4" width="16" height="8" rx="2" fill="none" stroke="#c084fc" stroke-width="0.8" filter="url(#eye-glow)">
            <animate attributeName="opacity" values="0.2;0.8;0.2" dur="1.8s" repeatCount="indefinite"/>
          </rect>
          <path d="M -13 0 Q 0 -10 13 0" fill="none" stroke="#6b00cc" stroke-width="1.8" stroke-linecap="round"/>
          <path d="M -11 4.5 Q 0 8 11 4.5" fill="none" stroke="#6b00cc" stroke-width="1" stroke-linecap="round" opacity=".7"/>
        </g>
      </g>`,

  };

  /* ------------------------------------------------------------------ */
  /*  Accessories                                                         */
  /* ------------------------------------------------------------------ */

  const ACCESSORY_RENDERERS = {

    none: () => '',

    mask: (skin) => {
      const sh = GWColor.shade('#2a2a3a', -20);
      return `
      <g class="accessory-mask">
        <!-- lower-face ninja mask covering nose bottom to chin -->
        <path d="M -40 8 Q -44 24 -38 36 Q -20 46 0 46 Q 20 46 38 36 Q 44 24 40 8 Q 20 14 0 16 Q -20 14 -40 8 Z" fill="#2a2a3a"/>
        <!-- mask fold lines -->
        <path d="M -38 12 Q 0 20 38 12" fill="none" stroke="${sh}" stroke-width="1.2" opacity=".6"/>
        <path d="M -36 20 Q 0 28 36 20" fill="none" stroke="${sh}" stroke-width="1" opacity=".5"/>
        <!-- mask edge at nose area -->
        <path d="M -40 8 Q -20 4 0 4 Q 20 4 40 8" fill="none" stroke="#3a3a4e" stroke-width="1.5" stroke-linecap="round"/>
      </g>`;
    },

    onimask: (skin) => `
      <g class="accessory-onimask">
        <!-- red oni mask covering full face -->
        <path d="${FACE_PATH}" fill="#cc1a1a" opacity=".92"/>
        <!-- eye holes -->
        <ellipse cx="-26" cy="-16" rx="14" ry="10" fill="#1a0a0a"/>
        <ellipse cx="26" cy="-16" rx="14" ry="10" fill="#1a0a0a"/>
        <!-- oni features: brow ridges -->
        <path d="M -38 -26 Q -26 -32 -14 -26" fill="none" stroke="#8a0000" stroke-width="3" stroke-linecap="round"/>
        <path d="M 14 -26 Q 26 -32 38 -26" fill="none" stroke="#8a0000" stroke-width="3" stroke-linecap="round"/>
        <!-- nose bump -->
        <ellipse cx="0" cy="2" rx="6" ry="5" fill="#b01414"/>
        <!-- fangs -->
        <path d="M -10 30 L -12 44 L -6 40 Z" fill="#f5f0e8"/>
        <path d="M 10 30 L 12 44 L 6 40 Z" fill="#f5f0e8"/>
        <!-- cheek marks -->
        <path d="M -36 -4 Q -30 4 -28 12" fill="none" stroke="#8a0000" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M 36 -4 Q 30 4 28 12" fill="none" stroke="#8a0000" stroke-width="2.5" stroke-linecap="round"/>
        <!-- highlight on forehead -->
        <path d="M -10 -52 Q 0 -58 10 -52" fill="none" stroke="#e83a3a" stroke-width="2" stroke-linecap="round" opacity=".6"/>
      </g>`,

    glasses: () => `
      <g class="accessory-glasses">
        <!-- thin circular frames over the eyes -->
        <circle cx="-26" cy="-16" r="14" fill="none" stroke="#2a2a2a" stroke-width="1.8"/>
        <circle cx="26" cy="-16" r="14" fill="none" stroke="#2a2a2a" stroke-width="1.8"/>
        <!-- bridge -->
        <path d="M -12 -16 Q 0 -19 12 -16" fill="none" stroke="#2a2a2a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- left temple arm -->
        <path d="M -40 -16 Q -44 -12 -50 -10" fill="none" stroke="#2a2a2a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- right temple arm -->
        <path d="M 40 -16 Q 44 -12 50 -10" fill="none" stroke="#2a2a2a" stroke-width="1.8" stroke-linecap="round"/>
        <!-- subtle lens tint -->
        <circle cx="-26" cy="-16" r="13.5" fill="#a0c8f8" opacity=".12"/>
        <circle cx="26" cy="-16" r="13.5" fill="#a0c8f8" opacity=".12"/>
        <!-- lens reflection -->
        <path d="M -32 -22 Q -28 -24 -24 -22" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
        <path d="M 20 -22 Q 24 -24 28 -22" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>
      </g>`,

    crown: (skin, hairColor) => {
      const gold1 = '#f5c518';
      const gold2 = '#d4a010';
      const gold3 = '#ffe066';
      return `
      <g class="accessory-crown">
        <!-- crown band sits just above hairline -->
        <rect x="-38" y="-92" width="76" height="12" rx="3" fill="${gold2}"/>
        <!-- five crown points -->
        <path d="M -38 -92 L -38 -108 L -24 -96 L -10 -112 L 0 -98 L 10 -112 L 24 -96 L 38 -108 L 38 -92 Z" fill="${gold1}"/>
        <!-- gem in center point -->
        <ellipse cx="0" cy="-104" rx="4" ry="5" fill="#e0303a"/>
        <ellipse cx="0" cy="-104" rx="2" ry="2.5" fill="#ff7a80" opacity=".7"/>
        <!-- small gems on side points -->
        <circle cx="-32" cy="-102" r="2.5" fill="#3a88e0"/>
        <circle cx="32" cy="-102" r="2.5" fill="#3a88e0"/>
        <!-- highlight on band -->
        <path d="M -36 -88 Q 0 -86 36 -88" fill="none" stroke="${gold3}" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>
        <!-- crown band detail dots -->
        <circle cx="-22" cy="-86" r="2" fill="${gold3}" opacity=".7"/>
        <circle cx="0"   cy="-86" r="2" fill="${gold3}" opacity=".7"/>
        <circle cx="22"  cy="-86" r="2" fill="${gold3}" opacity=".7"/>
      </g>`;
    },

  };

  /* ------------------------------------------------------------------ */
  /*  Main portrait builder                                               */
  /* ------------------------------------------------------------------ */

  function buildPortrait(cfg) {
    const skinId   = cfg.skinTone  || 'tone1';
    const hairStyle = cfg.hairStyle || 'spiky';
    const hairColor = cfg.hairColor || '#0d0d0d';
    const eyeStyle  = cfg.eyeStyle  || 'default';
    const eyeColor  = cfg.eyeColor  || '#2a5fc8';
    const accessory = cfg.accessory || 'none';

    const tone = SKIN_TONES.find(t => t.id === skinId) || SKIN_TONES[0];
    const skin     = tone.hex;
    const shadow   = tone.shadow;
    const shadow2  = tone.shadow2;
    const lip      = tone.lip;

    const hairDef  = HAIR_STYLES[hairStyle] || HAIR_STYLES.spiky;
    const hairBack = hairDef.back(hairColor);
    const hairFront = hairDef.front(hairColor);

    const eyeFn = EYE_STYLES[eyeStyle] || EYE_STYLES.default;
    const eyesSVG = eyeFn(eyeColor);

    const accFn = ACCESSORY_RENDERERS[accessory] || ACCESSORY_RENDERERS.none;
    const accSVG = accFn(skin, hairColor);

    const browColor = '#1a1a1a';

    /* Ear helper */
    const ears = `
      <!-- left ear -->
      <g>
        <ellipse cx="-49" cy="-10" rx="6" ry="9" fill="${skin}"/>
        <ellipse cx="-49" cy="-10" rx="3.5" ry="6" fill="${shadow}"/>
        <path d="M -50 -18 Q -54 -10 -50 -2" fill="none" stroke="${shadow2}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      </g>
      <!-- right ear -->
      <g>
        <ellipse cx="49" cy="-10" rx="6" ry="9" fill="${skin}"/>
        <ellipse cx="49" cy="-10" rx="3.5" ry="6" fill="${shadow}"/>
        <path d="M 50 -18 Q 54 -10 50 -2" fill="none" stroke="${shadow2}" stroke-width="1" stroke-linecap="round" opacity=".6"/>
      </g>`;

    /* Nose */
    const nose = `
      <!-- subtle nose: small shadow ellipses -->
      <ellipse cx="-4" cy="4" rx="3.5" ry="2" fill="${shadow}" opacity=".35" transform="rotate(-8,-4,4)"/>
      <ellipse cx="4" cy="4" rx="3.5" ry="2" fill="${shadow}" opacity=".35" transform="rotate(8,4,4)"/>
      <path d="M -3 2 Q 0 6 3 2" fill="none" stroke="${shadow}" stroke-width="1.2" stroke-linecap="round" opacity=".5"/>`;

    /* Mouth */
    const mouth = `
      <!-- upper lip line -->
      <path d="M -12 21 Q -6 19 0 20 Q 6 19 12 21" fill="none" stroke="${GWColor.mix(lip, shadow, 0.5)}" stroke-width="1.4" stroke-linecap="round"/>
      <!-- lower lip -->
      <path d="M -11 21 Q 0 29 11 21 Q 8 26 0 27.5 Q -8 26 -11 21 Z" fill="${lip}" opacity=".85"/>
      <!-- lip highlight -->
      <path d="M -5 25 Q 0 27 5 25" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".35"/>`;

    /* Eyebrows */
    const brows = `
      <!-- left brow -->
      <path d="M -38 -30 Q -26 -36 -14 -32" fill="none" stroke="${browColor}" stroke-width="2.4" stroke-linecap="round"/>
      <!-- right brow -->
      <path d="M 14 -32 Q 26 -36 38 -30" fill="none" stroke="${browColor}" stroke-width="2.4" stroke-linecap="round"/>`;

    /* Collar / neck */
    const collar = `
      <!-- neck -->
      <rect x="-14" y="42" width="28" height="30" rx="9" fill="${skin}"/>
      <rect x="-8" y="42" width="6" height="30" rx="2" fill="${shadow}" opacity=".3"/>
      <!-- shirt collar at y=70-90 -->
      <path d="M -50 90 Q -30 70 -14 72 L 0 80 L 14 72 Q 30 70 50 90 Z" fill="#1e3a5f"/>
      <!-- collar fold left -->
      <path d="M -14 72 Q -8 76 0 80" fill="none" stroke="#162d4a" stroke-width="1.5" stroke-linecap="round"/>
      <!-- collar fold right -->
      <path d="M 14 72 Q 8 76 0 80" fill="none" stroke="#162d4a" stroke-width="1.5" stroke-linecap="round"/>
      <!-- shirt body hint -->
      <path d="M -50 90 Q -50 95 50 95 Q 50 90 50 90 Z" fill="#1e3a5f"/>
      <!-- collar highlight -->
      <path d="M -28 76 Q -14 72 0 74" fill="none" stroke="#2e5a8f" stroke-width="1.5" stroke-linecap="round" opacity=".5"/>`;

    /* Face shadow for dimensionality (subtle gradient on left side) */
    const faceShadow = `
      <!-- subtle face shadow on right side for dimensionality -->
      <path d="M 44 8 Q 50 -28 40 -54 Q 30 -20 32 8 Q 36 30 36 38" fill="${shadow}" opacity=".22"/>`;

    /* Defs */
    const defs = `
      <defs>
        <filter id="eye-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        <radialGradient id="face-highlight" cx="38%" cy="35%" r="55%">
          <stop offset="0%" stop-color="#fff" stop-opacity="0.18"/>
          <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
      </defs>`;

    return [
      defs,
      collar,
      hairBack,
      /* face fill */
      `<path d="${FACE_PATH}" fill="${skin}"/>`,
      `<path d="${FACE_PATH}" fill="url(#face-highlight)"/>`,
      faceShadow,
      ears,
      nose,
      mouth,
      hairFront,
      brows,
      eyesSVG,
      accSVG,
    ].join('\n');
  }

  /* ------------------------------------------------------------------ */
  /*  Public API                                                          */
  /* ------------------------------------------------------------------ */

  return {
    SKIN_TONES,
    HAIR_COLORS,
    HAIR_STYLES: Object.keys(HAIR_STYLES),
    EYE_STYLES: Object.keys(EYE_STYLES),
    ACCESSORIES: {
      none:    { name: 'None',     icon: '—'  },
      mask:    { name: 'Mask',     icon: '😷' },
      onimask: { name: 'Oni Mask', icon: '👹' },
      glasses: { name: 'Glasses',  icon: '👓' },
      crown:   { name: 'Crown',    icon: '👑' },
    },
    DEFAULTS: {
      skinTone:  'tone1',
      hairStyle: 'spiky',
      hairColor: '#0d0d0d',
      eyeStyle:  'default',
      eyeColor:  '#2a5fc8',
      accessory: 'none',
    },
    svg(cfg, showHandles = false) {
      return `<svg viewBox="-85 -110 170 200" xmlns="http://www.w3.org/2000/svg" class="avatar-svg">${buildPortrait(cfg)}</svg>`;
    },
    update(svgEl, cfg) {
      svgEl.innerHTML = buildPortrait(cfg);
      svgEl.setAttribute('viewBox', '-85 -110 170 200');
    },
  };

})();
