/* ============================================================
   Gavin's World — Sword library
   15 illustrated SVG sword archetypes, fully customizable:
   blade color, blade effect, handle wrap, guard style, inscription.
   Coordinate system: origin = grip center, +Y down, blade tip at -Y.
   ============================================================ */

const GWColor = (() => {
  const hexToRgb = (hex) => {
    const h = hex.replace('#', '');
    const v = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
  };
  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  /* shade: amt -1..1  (negative darkens, positive lightens) */
  const shade = (hex, amt) => {
    const [r, g, b] = hexToRgb(hex);
    if (amt >= 0) return rgbToHex(r + (255 - r) * amt, g + (255 - g) * amt, b + (255 - b) * amt);
    return rgbToHex(r * (1 + amt), g * (1 + amt), b * (1 + amt));
  };
  const alpha = (hex, a) => {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  };
  return { hexToRgb, rgbToHex, shade, alpha };
})();

const Swords = (() => {
  const { shade, alpha } = GWColor;

  /* ---------- shared parts ---------- */

  function wrapGrip(c, x, y0, y1, w) {
    /* wrapped grip with diagonal cord pattern */
    const dark = shade(c, -0.45), lite = shade(c, 0.25);
    let lines = '';
    for (let y = y0 + 3; y < y1 - 1; y += 5) {
      lines += `<line x1="${x - w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + 3.4}" stroke="${dark}" stroke-width="1.6"/>`;
      lines += `<line x1="${x - w / 2}" y1="${y + 3.4}" x2="${x + w / 2}" y2="${y}" stroke="${dark}" stroke-width="1.6" opacity=".55"/>`;
    }
    return `<g>
      <rect x="${x - w / 2}" y="${y0}" width="${w}" height="${y1 - y0}" rx="${w / 2.6}" fill="${c}"/>
      <rect x="${x - w / 2}" y="${y0}" width="${w * 0.38}" height="${y1 - y0}" rx="${w / 3}" fill="${lite}" opacity=".35"/>
      ${lines}
    </g>`;
  }

  function pommel(c, y, r = 4.6) {
    return `<g>
      <circle cx="0" cy="${y}" r="${r}" fill="${shade(c, -0.25)}"/>
      <circle cx="-1.2" cy="${y - 1.2}" r="${r * 0.45}" fill="${shade(c, 0.45)}" opacity=".8"/>
    </g>`;
  }

  /* guard override library — drawn at y = -4 */
  const GUARDS = {
    cross: (c) => `<g>
      <rect x="-16" y="-7.4" width="32" height="5.2" rx="2.4" fill="${c}"/>
      <rect x="-16" y="-7.4" width="32" height="2" rx="1" fill="${shade(c, 0.4)}" opacity=".7"/>
      <circle cx="-15" cy="-4.8" r="2.6" fill="${shade(c, -0.25)}"/>
      <circle cx="15" cy="-4.8" r="2.6" fill="${shade(c, -0.25)}"/>
    </g>`,
    ornate: (c) => `<g>
      <path d="M 0 -10.5 C -7 -10.5 -11 -4 -19 -1.5 C -12 -5.5 -9 -3.5 -7.5 -1.8 L 0 -3.4 L 7.5 -1.8 C 9 -3.5 12 -5.5 19 -1.5 C 11 -4 7 -10.5 0 -10.5 Z"
        fill="${c}" stroke="${shade(c, -0.35)}" stroke-width=".8"/>
      <circle cx="0" cy="-6.2" r="2.6" fill="${shade(c, 0.5)}"/>
      <circle cx="0" cy="-6.2" r="1.3" fill="#fff" opacity=".85"/>
    </g>`,
    round: (c) => `<g>
      <ellipse cx="0" cy="-4.6" rx="13" ry="4.6" fill="${c}"/>
      <ellipse cx="0" cy="-5.4" rx="13" ry="3.6" fill="${shade(c, 0.28)}"/>
      <ellipse cx="0" cy="-4.9" rx="9" ry="2.5" fill="${shade(c, -0.3)}"/>
    </g>`,
    minimal: (c) => `<g>
      <rect x="-7.5" y="-6.6" width="15" height="3.6" rx="1.8" fill="${c}"/>
      <rect x="-7.5" y="-6.6" width="15" height="1.4" rx="0.7" fill="${shade(c, 0.4)}" opacity=".7"/>
    </g>`,
    none: () => '',
  };

  /* ---------- blade effect layers ---------- */

  function effectDefs(uid, color, len) {
    return `
      <filter id="fxblur-${uid}" x="-80%" y="-50%" width="260%" height="200%">
        <feGaussianBlur stdDeviation="3.2"/>
      </filter>
      <filter id="fxblur2-${uid}" x="-120%" y="-60%" width="340%" height="220%">
        <feGaussianBlur stdDeviation="6.5"/>
      </filter>
      <linearGradient id="fxrainbow-${uid}" gradientUnits="userSpaceOnUse"
        x1="0" y1="0" x2="0" y2="${-len}" spreadMethod="repeat">
        <stop offset="0" stop-color="#ff5b5b"/><stop offset=".18" stop-color="#ffb13d"/>
        <stop offset=".36" stop-color="#ffe85b"/><stop offset=".54" stop-color="#5bff8a"/>
        <stop offset=".72" stop-color="#5bb8ff"/><stop offset=".9" stop-color="#b45bff"/>
        <stop offset="1" stop-color="#ff5b5b"/>
        <animateTransform attributeName="gradientTransform" type="translate"
          from="0 0" to="0 ${-len}" dur="2.6s" repeatCount="indefinite"/>
      </linearGradient>`;
  }

  function flame(x, y, s, dur, delay, c1, c2) {
    return `<g transform="translate(${x} ${y}) scale(${s})" opacity="0">
      <path d="M 0 6 C -5 2 -4.5 -3 -1.6 -7 C -2.6 -2.6 0 -2.2 0.6 -6.5 C 3.4 -3 4.6 1.5 0 6 Z" fill="${c1}"/>
      <path d="M 0 4.4 C -2.6 1.6 -2.2 -1.4 -0.6 -3.8 C -1 -1.2 0.6 -1 0.8 -3 C 2.2 -1 2.4 1.6 0 4.4 Z" fill="${c2}"/>
      <animate attributeName="opacity" values="0;.95;.75;.95;0" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      <animateTransform attributeName="transform" type="translate" additive="sum"
        values="0 0; 0 -10; 0 -22" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
    </g>`;
  }

  function effectLayers(effect, uid, bladeD, color, len) {
    if (!effect || effect === 'none') return { behind: '', front: '', fill: null };
    const E = {
      glow: () => ({
        behind: `<path d="${bladeD}" fill="${color}" filter="url(#fxblur2-${uid})" opacity=".85"/>
                 <path d="${bladeD}" fill="${shade(color, 0.5)}" filter="url(#fxblur-${uid})" opacity=".7"/>`,
        front: '', fill: null,
      }),
      fire: () => ({
        behind: `<path d="${bladeD}" fill="#ff6a1f" filter="url(#fxblur2-${uid})" opacity=".75"/>`,
        front: `<g>
          ${flame(3, -len * 0.22, 1.1, 1.6, 0, '#ff7a26', '#ffd23d')}
          ${flame(-2.5, -len * 0.45, 0.9, 1.9, 0.5, '#ff6018', '#ffc22e')}
          ${flame(3.5, -len * 0.68, 1.0, 1.4, 0.9, '#ff8a30', '#ffe066')}
          ${flame(-1.5, -len * 0.88, 0.7, 1.7, 0.3, '#ff7a26', '#ffd23d')}
        </g>`, fill: null,
      }),
      ice: () => ({
        behind: `<path d="${bladeD}" fill="#9fe0ff" filter="url(#fxblur2-${uid})" opacity=".8"/>`,
        front: `<g fill="#e6f8ff">
          <path d="M -4 ${-len * 0.3} l -5 -2.4 l 2 4.6 Z" opacity=".9"/>
          <path d="M 4 ${-len * 0.52} l 5.6 -1.6 l -2.4 4.4 Z" opacity=".85"/>
          <path d="M -3.4 ${-len * 0.72} l -4.6 -3 l 1.4 5 Z" opacity=".8"/>
          <circle cx="5" cy="${-len * 0.2}" r="1.1" opacity=".9">
            <animate attributeName="opacity" values=".9;.2;.9" dur="2.2s" repeatCount="indefinite"/></circle>
          <circle cx="-5.4" cy="${-len * 0.55}" r="0.9" opacity=".7">
            <animate attributeName="opacity" values=".3;1;.3" dur="1.8s" repeatCount="indefinite"/></circle>
          <circle cx="4.2" cy="${-len * 0.82}" r="1" opacity=".8">
            <animate attributeName="opacity" values=".8;.15;.8" dur="2.6s" repeatCount="indefinite"/></circle>
        </g>`, fill: null,
      }),
      lightning: () => ({
        behind: `<path d="${bladeD}" fill="#7fd8ff" filter="url(#fxblur2-${uid})" opacity=".7"/>`,
        front: `<g stroke-linecap="round" fill="none">
          <polyline points="-6,${-len * 0.12} 2,${-len * 0.26} -4,${-len * 0.38} 5,${-len * 0.55}"
            stroke="#bdf0ff" stroke-width="1.7">
            <animate attributeName="opacity" values="1;0;0;1;0;1" dur=".9s" repeatCount="indefinite"/></polyline>
          <polyline points="6,${-len * 0.4} -3,${-len * 0.58} 4,${-len * 0.72} -5,${-len * 0.9}"
            stroke="#e8fbff" stroke-width="1.4">
            <animate attributeName="opacity" values="0;1;0;1;0;0" dur=".7s" repeatCount="indefinite"/></polyline>
        </g>`, fill: null,
      }),
      shadow: () => ({
        behind: `<path d="${bladeD}" fill="#3b1d63" filter="url(#fxblur2-${uid})" opacity=".95"/>
                 <path d="${bladeD}" fill="#120822" filter="url(#fxblur-${uid})" opacity=".8"/>`,
        front: `<g fill="#5b2d96">
          <circle cx="-5" cy="${-len * 0.3}" r="3.4" opacity=".5" filter="url(#fxblur-${uid})">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -16" dur="2.4s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".5;0" dur="2.4s" repeatCount="indefinite"/></circle>
          <circle cx="5" cy="${-len * 0.6}" r="2.8" opacity=".45" filter="url(#fxblur-${uid})">
            <animateTransform attributeName="transform" type="translate" values="0 0;0 -14" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".45;0" dur="3s" repeatCount="indefinite"/></circle>
        </g>`, fill: null,
      }),
      rainbow: () => ({
        behind: `<path d="${bladeD}" fill="url(#fxrainbow-${uid})" filter="url(#fxblur2-${uid})" opacity=".8"/>`,
        front: '', fill: `url(#fxrainbow-${uid})`,
      }),
    };
    return (E[effect] || E.glow)();
  }

  /* ---------- pixel sword builder (Minecraft style) ---------- */

  function pixelSword(palette, u = 4.6) {
    /* grid map: B blade, E edge-light, D edge-dark, G guard, H handle  — column x from -3..3 */
    const rows = [
      '...B...',
      '..EBB..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '..EBD..',
      '.GGBGG.',
      '..GHG..',
      '...H...',
      '...H...',
      '...H...',
      '..HHH..',
    ];
    let out = '';
    const topY = -rows.length * u + 5 * u;  /* grip sits near origin */
    rows.forEach((row, ry) => {
      [...row].forEach((cell, cx) => {
        if (cell === '.') return;
        const x = (cx - 3) * u - u / 2;
        const y = topY + ry * u;
        const c = palette[cell];
        if (!c) return;
        out += `<rect x="${x}" y="${y}" width="${u + 0.35}" height="${u + 0.35}" fill="${c}"/>`;
      });
    });
    const bladeLen = 10 * u;
    /* simplified outline for aura/effects */
    const d = `M ${-1.5 * u} ${topY + 10 * u} L ${-1.5 * u} ${topY + u} L 0 ${topY} L ${1.5 * u} ${topY + u} L ${1.5 * u} ${topY + 10 * u} Z`;
    return { svg: out, bladeD: d, len: bladeLen + Math.abs(topY + 10 * u) };
  }

  /* ---------- the 15 archetypes ----------
     Each def: { id, name, two (two-handed), box [x y w h],
       build(c) -> { blade, bladeD, guard, handle, len, noGuardSwap, noHandle } }
     c = { blade, handle, guard } colors */

  const DEFS = [
    {
      id: 'katana', name: 'Katana', box: [-46, -136, 92, 180],
      build(c, uid) {
        const d = 'M -3 -6 C -5 -38 -3.6 -72 3.4 -103 L 7.2 -110 C 8.2 -104 5.6 -68 2.6 -6 Z';
        return {
          bladeD: d, len: 104,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -3 -6 C -5 -38 -3.6 -72 3.4 -103 L 4.6 -100 C -0.4 -70 -1.8 -38 -0.6 -6 Z" fill="${shade(c.blade, -0.28)}" opacity=".8"/>
            <path d="M 5.9 -104 C 6.9 -98 4.8 -70 2.4 -20 L 1.4 -20 C 3.6 -68 5 -96 4.9 -103 Z" fill="#fff" opacity=".75"/>`,
          guard: `<ellipse cx="0" cy="-4.4" rx="9.5" ry="3.4" fill="${c.guard}"/>
            <ellipse cx="0" cy="-5" rx="9.5" ry="2.6" fill="${shade(c.guard, 0.3)}"/>`,
          handle: wrapGrip(c.handle, 0, -2, 26, 6.4) + pommel(c.guard, 26, 4),
        };
      },
    },
    {
      id: 'nodachi', name: 'Nodachi', two: true, box: [-50, -168, 100, 218],
      build(c, uid) {
        const d = 'M -3.4 -6 C -7 -46 -4.6 -96 5.4 -136 L 10 -144 C 11 -136 7 -90 3 -6 Z';
        return {
          bladeD: d, len: 138,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -3.4 -6 C -7 -46 -4.6 -96 5.4 -136 L 6.8 -132 C -1 -94 -3.2 -46 -0.8 -6 Z" fill="${shade(c.blade, -0.28)}" opacity=".8"/>
            <path d="M 8.4 -138 C 9.2 -130 6 -88 2.8 -24 L 1.6 -24 C 4.8 -86 7.4 -128 7.2 -136 Z" fill="#fff" opacity=".75"/>`,
          guard: `<ellipse cx="0" cy="-4.4" rx="10.5" ry="3.6" fill="${c.guard}"/>
            <ellipse cx="0" cy="-5" rx="10.5" ry="2.8" fill="${shade(c.guard, 0.3)}"/>`,
          handle: wrapGrip(c.handle, 0, -2, 40, 7) + pommel(c.guard, 40, 4.4),
        };
      },
    },
    {
      id: 'broadsword', name: 'Broadsword', box: [-48, -130, 96, 176],
      build(c, uid) {
        const d = 'M -7.5 -6 L -5 -88 L 0 -103 L 5 -88 L 7.5 -6 Z';
        return {
          bladeD: d, len: 97,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -7.5 -6 L -5 -88 L 0 -103 L 0 -6 Z" fill="${shade(c.blade, -0.22)}" opacity=".7"/>
            <path d="M -1.4 -12 L -0.9 -86 L 0 -92 L 0.9 -86 L 1.4 -12 Z" fill="${shade(c.blade, -0.45)}" opacity=".8"/>
            <path d="M 4.4 -86 L 6.4 -16 L 5.2 -16 L 3.4 -84 Z" fill="#fff" opacity=".6"/>`,
          guard: GUARDS.cross(c.guard),
          handle: wrapGrip(c.handle, 0, -2, 24, 7) + pommel(c.guard, 25, 5),
        };
      },
    },
    {
      id: 'excalibur', name: 'Excalibur', box: [-50, -140, 100, 190],
      build(c, uid) {
        const d = 'M -6 -8 L -6 -86 L 0 -112 L 6 -86 L 6 -8 Z';
        return {
          bladeD: d, len: 104,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -6 -8 L -6 -86 L 0 -112 L 0 -8 Z" fill="${shade(c.blade, -0.2)}" opacity=".65"/>
            <path d="M -1 -14 L -1 -84 L 0 -96 L 1 -84 L 1 -14 Z" fill="${shade(c.blade, 0.5)}" opacity=".9"/>
            <path d="M 0 -106 L 3.6 -86 L 3.6 -60 L 2.4 -60 L 2.4 -84 Z" fill="#fff" opacity=".7"/>
            <g fill="${shade(c.guard, 0.2)}" opacity=".9">
              <circle cx="0" cy="-46" r="1.6"/><circle cx="0" cy="-58" r="1.3"/><circle cx="0" cy="-34" r="1.3"/>
            </g>`,
          guard: `<g>
            <path d="M 0 -12 C -8 -12 -12 -8 -21 -10 C -14 -5 -10 -6.5 -8 -4 L 0 -5.6 L 8 -4 C 10 -6.5 14 -5 21 -10 C 12 -8 8 -12 0 -12 Z"
              fill="${c.guard}" stroke="${shade(c.guard, -0.35)}" stroke-width=".8"/>
            <circle cx="0" cy="-8" r="3" fill="#5bb8ff"/>
            <circle cx="-0.9" cy="-8.9" r="1.1" fill="#fff" opacity=".9"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -2, 25, 7) +
            `<circle cx="0" cy="27" r="5.4" fill="${shade(c.guard, -0.15)}"/>
             <circle cx="0" cy="27" r="3" fill="#5bb8ff"/>
             <circle cx="-1" cy="26" r="1.2" fill="#fff" opacity=".9"/>`,
        };
      },
    },
    {
      id: 'diamond', name: 'Diamond Sword', pixel: true, box: [-44, -120, 88, 170], defaultBlade: '#4aedd9',
      build(c) {
        const b = c.blade;
        const px = pixelSword({
          B: b, E: shade(b, 0.45), D: shade(b, -0.35),
          G: '#8a6f4d', H: '#6b5436',
        });
        return { bladeD: px.bladeD, len: 70, blade: px.svg, guard: '', handle: '', noGuardSwap: true };
      },
    },
    {
      id: 'netherite', name: 'Netherite Blade', pixel: true, box: [-44, -120, 88, 170], defaultBlade: '#4a3f45',
      build(c) {
        const b = c.blade;
        const px = pixelSword({
          B: b, E: shade(b, 0.35), D: shade(b, -0.4),
          G: '#2e2329', H: '#1f181c',
        });
        return {
          bladeD: px.bladeD, len: 70,
          blade: px.svg + `<g fill="#ff7a3d">
            <rect x="-2.3" y="-52" width="4.6" height="4.6" opacity=".85">
              <animate attributeName="opacity" values=".85;.3;.85" dur="2s" repeatCount="indefinite"/></rect>
            <rect x="2.3" y="-33.5" width="4.6" height="4.6" opacity=".6">
              <animate attributeName="opacity" values=".3;.9;.3" dur="2.6s" repeatCount="indefinite"/></rect>
          </g>`,
          guard: '', handle: '', noGuardSwap: true,
        };
      },
    },
    {
      id: 'energy', name: 'Energy Blade', box: [-46, -130, 92, 178], defaultBlade: '#5bb8ff', defaultEffect: 'glow',
      build(c, uid) {
        const d = 'M -3.4 -8 L -3.4 -96 Q -3.4 -104 0 -104 Q 3.4 -104 3.4 -96 L 3.4 -8 Z';
        return {
          bladeD: d, len: 98,
          blade: `<path d="${d}" fill="${c.blade}" opacity=".9"/>
            <path d="M -1.6 -10 L -1.6 -95 Q -1.6 -100 0 -100 Q 1.6 -100 1.6 -95 L 1.6 -10 Z" fill="#fff" opacity=".95"/>`,
          guard: `<g>
            <rect x="-5.5" y="-8" width="11" height="4.6" rx="1.6" fill="#2a3142"/>
            <rect x="-5.5" y="-8" width="11" height="1.6" rx=".8" fill="#5a6680"/>
          </g>`,
          handle: `<g>
            <rect x="-4.6" y="-3.5" width="9.2" height="30" rx="3.4" fill="#39404f"/>
            <rect x="-4.6" y="-3.5" width="3" height="30" rx="1.5" fill="#5d6883" opacity=".7"/>
            <rect x="-4.6" y="3" width="9.2" height="2.6" fill="${c.handle}"/>
            <rect x="-4.6" y="9" width="9.2" height="2.6" fill="${c.handle}"/>
            <rect x="-4.6" y="15" width="9.2" height="2.6" fill="${c.handle}"/>
            <circle cx="0" cy="23" r="2" fill="${c.blade}"/>
          </g>`,
          noGuardSwap: true,
        };
      },
    },
    {
      id: 'scimitar', name: 'Scimitar', box: [-50, -126, 100, 172],
      build(c, uid) {
        const d = 'M -3 -6 C -10 -34 -12 -62 -2 -88 C 4 -100 14 -106 22 -107 C 14 -100 10 -94 8 -86 C 2 -62 1.4 -34 2.8 -6 Z';
        return {
          bladeD: d, len: 100,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -3 -6 C -10 -34 -12 -62 -2 -88 C 1 -94 5 -99 10 -102 C 4 -95 1 -88 -0.5 -80 C -6 -56 -6.4 -32 -0.2 -6 Z" fill="${shade(c.blade, -0.28)}" opacity=".8"/>
            <path d="M 18 -105 C 12 -99 8.6 -93 6.6 -85 C 2.4 -64 1.8 -40 2.6 -18 L 4 -18 C 3.6 -42 4.6 -64 8.6 -84 C 10.6 -92 14 -99 20 -105.6 Z" fill="#fff" opacity=".65"/>`,
          guard: `<g>
            <rect x="-9" y="-7" width="18" height="4.4" rx="2.2" fill="${c.guard}"/>
            <path d="M 7 -6 q 6 0 7 6 l -3 0 q -1 -4 -5 -4 Z" fill="${c.guard}"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -2.6, 22, 6.4) +
            `<path d="M -3.2 22 q 0 6 7 5.4 q -2.4 -2 -1 -5.4 Z" fill="${shade(c.guard, -0.1)}"/>`,
        };
      },
    },
    {
      id: 'rapier', name: 'Rapier', box: [-46, -136, 92, 184],
      build(c, uid) {
        const d = 'M -1.7 -10 L -0.7 -106 L 0 -112 L 0.7 -106 L 1.7 -10 Z';
        return {
          bladeD: d, len: 106,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -1.7 -10 L -0.7 -106 L 0 -112 L 0 -10 Z" fill="${shade(c.blade, -0.25)}" opacity=".7"/>
            <path d="M 0.5 -100 L 1.1 -20 L 0.6 -20 L 0.2 -100 Z" fill="#fff" opacity=".8"/>`,
          guard: `<g fill="none" stroke="${c.guard}" stroke-width="2" stroke-linecap="round">
            <ellipse cx="0" cy="-6" rx="11" ry="4.4" fill="${alpha(c.guard, 0.25)}" stroke-width="1.6"/>
            <path d="M -10 -5 C -12 4 -7 10 0 11"/>
            <path d="M 10 -5 C 12 4 7 10 0 11"/>
            <path d="M -6 -8 C -8 0 -4 7 0 8.5" stroke-width="1.4" opacity=".8"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -3, 20, 5) + pommel(c.guard, 21, 4),
          noGuardSwap: true,
        };
      },
    },
    {
      id: 'ghost', name: 'Ghost Blade', box: [-52, -160, 104, 210], defaultBlade: '#9fd8e8', defaultEffect: 'none',
      build(c, uid) {
        const d = 'M -3.2 -6 C -6.6 -44 -4.4 -90 5 -128 L 9.4 -135 C 10.4 -128 6.6 -86 2.8 -6 Z';
        return {
          bladeD: d, len: 130,
          blade: `<path d="${d}" fill="url(#bg-${uid})" opacity=".55"/>
            <path d="${d}" fill="none" stroke="${shade(c.blade, 0.4)}" stroke-width="1" opacity=".9"/>
            <path d="M 7.8 -130 C 8.6 -122 5.6 -84 2.6 -22 L 1.6 -22 C 4.6 -82 7 -120 6.6 -128 Z" fill="#fff" opacity=".8"/>
            <g fill="${shade(c.blade, 0.3)}">
              <path d="M -6 -40 q -6 -6 -2 -13 q -1 6 4 8 Z" opacity=".7">
                <animateTransform attributeName="transform" type="translate" values="0 0; -3 -18; -5 -34" dur="3.2s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values=".7;.3;0" dur="3.2s" repeatCount="indefinite"/></path>
              <path d="M 8 -80 q 7 -5 4 -13 q 0 6 -5 8 Z" opacity=".6">
                <animateTransform attributeName="transform" type="translate" values="0 0; 3 -16; 6 -30" dur="2.7s" repeatCount="indefinite"/>
                <animate attributeName="opacity" values=".6;.25;0" dur="2.7s" repeatCount="indefinite"/></path>
            </g>`,
          guard: `<ellipse cx="0" cy="-4.4" rx="10" ry="3.4" fill="${c.guard}" opacity=".85"/>`,
          handle: wrapGrip(c.handle, 0, -2, 30, 6.4) + pommel(c.guard, 30, 4),
        };
      },
    },
    {
      id: 'zweihander', name: 'Zweihänder', two: true, box: [-52, -164, 104, 226],
      build(c, uid) {
        const d = 'M -6 -24 L -5 -110 L 0 -140 L 5 -110 L 6 -24 L 9 -28 L 9 -16 L 6 -18 L 6 -8 L -6 -8 L -6 -18 L -9 -16 L -9 -28 Z';
        return {
          bladeD: d, len: 132,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -6 -24 L -5 -110 L 0 -140 L 0 -8 L -6 -8 L -6 -18 L -9 -16 L -9 -28 L -6 -24 Z" fill="${shade(c.blade, -0.2)}" opacity=".6"/>
            <path d="M -1.1 -28 L -0.9 -108 L 0 -122 L 0.9 -108 L 1.1 -28 Z" fill="${shade(c.blade, -0.45)}" opacity=".75"/>
            <path d="M 3.6 -108 L 4.8 -40 L 3.8 -40 L 2.8 -106 Z" fill="#fff" opacity=".6"/>`,
          guard: `<g>
            <rect x="-19" y="-7.6" width="38" height="5" rx="2.4" fill="${c.guard}"/>
            <rect x="-19" y="-7.6" width="38" height="1.8" rx=".9" fill="${shade(c.guard, 0.4)}" opacity=".7"/>
            <circle cx="-18" cy="-5" r="2.8" fill="${shade(c.guard, -0.25)}"/>
            <circle cx="18" cy="-5" r="2.8" fill="${shade(c.guard, -0.25)}"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -2.4, 42, 7.4) + pommel(c.guard, 43, 5.2),
        };
      },
    },
    {
      id: 'chakram', name: 'Chakram Blade', box: [-58, -100, 116, 150], noHandle: true,
      build(c, uid) {
        const d = 'M 0 -84 A 42 42 0 1 1 -0.01 -84 Z M 0 -68 A 26 26 0 1 0 0.01 -68 Z';
        return {
          bladeD: d, len: 84, centerGrip: true,
          blade: `<g transform="translate(0 -42)">
            <path d="M 0 -42 A 42 42 0 1 1 -0.01 -42 Z M 0 -26 A 26 26 0 1 0 0.01 -26 Z" fill="url(#bg-${uid})" fill-rule="evenodd"/>
            <path d="M 0 -42 A 42 42 0 0 0 -42 0 L -34 0 A 34 34 0 0 1 0 -34 Z" fill="${shade(c.blade, -0.28)}" opacity=".75"/>
            <path d="M 0 -42 A 42 42 0 0 1 42 0 L 38 0 A 38 38 0 0 0 0 -38 Z" fill="#fff" opacity=".65"/>
            <g fill="url(#bg-${uid})">
              <path d="M 0 -42 L -8 -56 L 8 -56 Z" transform="rotate(0)"/>
              <path d="M 0 -42 L -8 -56 L 8 -56 Z" transform="rotate(90)"/>
              <path d="M 0 -42 L -8 -56 L 8 -56 Z" transform="rotate(180)"/>
              <path d="M 0 -42 L -8 -56 L 8 -56 Z" transform="rotate(270)"/>
            </g>
            <rect x="-13" y="-3.4" width="26" height="6.8" rx="3.4" fill="${c.handle}"/>
            <rect x="-13" y="-3.4" width="26" height="2.6" rx="1.3" fill="${shade(c.handle, 0.3)}"/>
          </g>`,
          guard: '', handle: '', noGuardSwap: true,
        };
      },
    },
    {
      id: 'trident', name: 'Trident Sword', box: [-50, -134, 100, 182],
      build(c, uid) {
        const d = `M -2.4 -8 L -2.4 -58 L -9 -64 L -10.5 -96 L -6.5 -66 L -2 -64 L -1 -100 L 0 -110 L 1 -100 L 2 -64 L 6.5 -66 L 10.5 -96 L 9 -64 L 2.4 -58 L 2.4 -8 Z`;
        return {
          bladeD: d, len: 104,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -2.4 -8 L -2.4 -58 L -9 -64 L -10.5 -96 L -8.6 -66 L -2.4 -62 Z" fill="${shade(c.blade, -0.3)}" opacity=".8"/>
            <path d="M 0.5 -102 L 1.4 -64 L 0.6 -62 L 0 -100 Z" fill="#fff" opacity=".75"/>`,
          guard: GUARDS.cross(c.guard),
          handle: wrapGrip(c.handle, 0, -2, 26, 6.6) + pommel(c.guard, 26, 4.4),
        };
      },
    },
    {
      id: 'crystal', name: 'Crystal Blade', box: [-48, -134, 96, 182], defaultBlade: '#b06ef7',
      build(c, uid) {
        const b = c.blade;
        return {
          bladeD: 'M -6.5 -8 L -4 -86 L 0 -108 L 4 -86 L 6.5 -8 Z', len: 102,
          blade: `<g>
            <path d="M -6.5 -8 L -4 -50 L 0 -54 L -0.5 -8 Z" fill="${alpha(b, 0.85)}"/>
            <path d="M -0.5 -8 L 0 -54 L 5 -48 L 6.5 -8 Z" fill="${alpha(shade(b, -0.25), 0.9)}"/>
            <path d="M -4 -50 L -3.4 -86 L 0 -90 L 0 -54 Z" fill="${alpha(shade(b, 0.3), 0.85)}"/>
            <path d="M 0 -54 L 0 -90 L 3.4 -84 L 5 -48 Z" fill="${alpha(b, 0.75)}"/>
            <path d="M -3.4 -86 L 0 -108 L 3.4 -84 L 0 -90 Z" fill="${alpha(shade(b, 0.55), 0.95)}"/>
            <g fill="#fff">
              <path d="M -2 -70 l 1 2.6 l 2.6 1 l -2.6 1 l -1 2.6 l -1 -2.6 l -2.6 -1 l 2.6 -1 Z" opacity=".95">
                <animate attributeName="opacity" values=".95;.2;.95" dur="2.4s" repeatCount="indefinite"/></path>
              <path d="M 2.4 -36 l .8 2 l 2 .8 l -2 .8 l -.8 2 l -.8 -2 l -2 -.8 l 2 -.8 Z" opacity=".7">
                <animate attributeName="opacity" values=".3;1;.3" dur="1.9s" repeatCount="indefinite"/></path>
            </g>
          </g>`,
          guard: `<g>
            <path d="M -13 -3 L -7 -9 L 7 -9 L 13 -3 L 7 -3.6 L -7 -3.6 Z" fill="${c.guard}"/>
            <path d="M -13 -3 L -7 -9 L 0 -9 L 0 -3.6 L -7 -3.6 Z" fill="${shade(c.guard, 0.3)}"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -2, 24, 6.4) +
            `<path d="M -3.4 24 L 0 31 L 3.4 24 Z" fill="${alpha(b, 0.9)}"/>`,
        };
      },
    },
    {
      id: 'shadowfang', name: 'Shadow Fang', box: [-50, -134, 100, 182], defaultBlade: '#3d2b56', defaultEffect: 'shadow',
      build(c, uid) {
        const d = 'M -5 -8 L -5.5 -100 L 0 -110 L 8 -96 L 3.5 -92 L 8.5 -78 L 3 -74 L 8 -60 L 2.6 -56 L 7 -42 L 2.2 -38 L 6 -24 L 2 -20 L 4.5 -8 Z';
        return {
          bladeD: d, len: 104,
          blade: `<path d="${d}" fill="url(#bg-${uid})"/>
            <path d="M -5 -8 L -5.5 -100 L 0 -110 L 0 -8 Z" fill="${shade(c.blade, -0.35)}" opacity=".8"/>
            <path d="M -3.8 -98 L -3.4 -20 L -2.4 -20 L -2.8 -96 Z" fill="${shade(c.blade, 0.6)}" opacity=".7"/>
            <path d="M 0 -106 L 5.6 -96 L 3 -93.6 L -0.6 -100 Z" fill="#fff" opacity=".5"/>`,
          guard: `<g>
            <path d="M -14 -2 L -8 -8.4 L 8 -8.4 L 14 -2 L 8 -4 L -8 -4 Z" fill="${c.guard}"/>
            <path d="M -11 -4.4 l -3 -5 l 5 2.4 Z M 11 -4.4 l 3 -5 l -5 2.4 Z" fill="${shade(c.guard, -0.3)}"/>
          </g>`,
          handle: wrapGrip(c.handle, 0, -2, 25, 6.6) +
            `<path d="M -3.2 25 L 0 33 L 3.2 25 Z" fill="${shade(c.guard, -0.2)}"/>`,
        };
      },
    },
  ];

  const byId = Object.fromEntries(DEFS.map(d => [d.id, d]));

  const DEFAULTS = {
    type: 'katana',
    bladeColor: '#cdd6e4',
    effect: 'none',
    handleColor: '#2d3a5c',
    guardStyle: 'default',
    guardColor: '#b9a45c',
    inscription: '',
  };

  const EFFECTS = ['none', 'glow', 'fire', 'ice', 'lightning', 'shadow', 'rainbow'];
  const GUARD_STYLES = ['default', 'cross', 'ornate', 'round', 'minimal', 'none'];

  let uidCounter = 0;

  /* Build the inner <g> for a sword. Returns { g, def } */
  function buildGroup(config) {
    const cfg = { ...DEFAULTS, ...config };
    const def = byId[cfg.type] || DEFS[0];
    const uid = 's' + (++uidCounter);
    const bladeColor = cfg.bladeColor === DEFAULTS.bladeColor && def.defaultBlade ? def.defaultBlade : cfg.bladeColor;
    const effect = (cfg.effect === 'none' && def.defaultEffect) ? def.defaultEffect : cfg.effect;
    const c = { blade: bladeColor, handle: cfg.handleColor, guard: cfg.guardColor };
    const parts = def.build(c, uid);
    const fx = effectLayers(effect, uid, parts.bladeD, bladeColor, parts.len);

    let guard = parts.guard;
    if (!parts.noGuardSwap && cfg.guardStyle !== 'default') {
      guard = (GUARDS[cfg.guardStyle] || (() => parts.guard))(cfg.guardColor);
    }

    let inscription = '';
    if (cfg.inscription && !def.pixel && def.id !== 'chakram') {
      const t = cfg.inscription.slice(0, 12).replace(/[<>&"]/g, '');
      inscription = `<text x="0" y="0" transform="translate(0.6 ${-parts.len * 0.42}) rotate(-90)"
        font-family="Rajdhani, sans-serif" font-size="7" font-weight="600" letter-spacing="2"
        fill="${shade(bladeColor, -0.5)}" opacity=".85" text-anchor="middle">${t}</text>`;
    }

    const bladeFill = fx.fill
      ? `<path d="${parts.bladeD}" fill="${fx.fill}"/>`
      : '';

    const g = `<g class="sword">
      <defs>
        <linearGradient id="bg-${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${shade(bladeColor, -0.12)}"/>
          <stop offset=".5" stop-color="${shade(bladeColor, 0.22)}"/>
          <stop offset="1" stop-color="${shade(bladeColor, -0.05)}"/>
        </linearGradient>
        ${effectDefs(uid, bladeColor, parts.len)}
      </defs>
      ${fx.behind}
      ${parts.blade}
      ${bladeFill}
      ${inscription}
      ${guard}
      ${parts.handle}
      ${fx.front}
    </g>`;
    return { g, def, len: parts.len };
  }

  /* Standalone <svg> for previews/cards */
  function thumb(config, cls = '') {
    const { g, def } = buildGroup(config);
    const [x, y, w, h] = def.box;
    return `<svg class="${cls}" viewBox="${x} ${y} ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
  }

  return { DEFS, byId, DEFAULTS, EFFECTS, GUARD_STYLES, buildGroup, thumb };
})();
