/* ============================================================
   Gavin's World — The Forge module
   Sword selector, customizer, poseable manikin, costume/accessory
   picker, save to Armory.
   ============================================================ */

const Forge = (() => {
  /* Default state */
  const DEFAULT_STATE = () => ({
    swordType: 'katana',
    bladeColor: '#cdd6e4',
    effect: 'none',
    handleColor: '#2d3a5c',
    guardStyle: 'default',
    guardColor: '#b9a45c',
    inscription: '',
    costume: 'default',
    capeColor: '#1a2a6e',
    accessory: 'none',
    auraColor: '#3b82f6',
    skinTone: 'tone1',
    hairStyle: 'spiky',
    hairColor: '#111111',
    eyeStyle: 'default',
    eyeColor: '#2a5fc8',
    pose: 'idle',
    swordCarry: 'right',
    name: '',
  });

  let state = DEFAULT_STATE();
  let forgeSvgEl = null;

  /* ---- Build sword config from state ---- */
  function swordCfg() {
    return {
      type: state.swordType,
      bladeColor: state.bladeColor,
      effect: state.effect,
      handleColor: state.handleColor,
      guardStyle: state.guardStyle,
      guardColor: state.guardColor,
      inscription: state.inscription,
    };
  }

  /* ---- Build avatar config from state ---- */
  function avatarCfg(showHandles = false) {
    const poseData = Avatar.POSES[state.pose] || Avatar.POSES.idle;
    const poses = { ...poseData.a };
    return {
      skinTone: state.skinTone,
      hairStyle: state.hairStyle,
      hairColor: state.hairColor,
      eyeStyle: state.eyeStyle,
      eyeColor: state.eyeColor,
      costume: state.costume,
      accessory: state.accessory,
      capeColor: state.capeColor,
      auraColor: state.auraColor,
      equippedSwordConfig: state.swordCarry !== 'stow' ? swordCfg() : null,
      poses,
    };
  }

  /* ---- Re-render character in Forge stage ---- */
  function refresh() {
    if (!forgeSvgEl) return;
    Avatar.update(forgeSvgEl, avatarCfg(false));
  }

  /* ---- Build the Forge UI into a container element ---- */
  function mount(container) {
    container.innerHTML = `
      <div class="forge-layout">

        <!-- Stage: character preview + pose buttons -->
        <div class="forge-stage">
          <div class="forge-stage-bg"></div>
          <div class="forge-char-wrap">
            <svg class="forge-char-svg avatar-svg" viewBox="-80 -240 160 380" xmlns="http://www.w3.org/2000/svg"></svg>
          </div>
          <div class="forge-poses" id="forge-poses"></div>
        </div>

        <!-- Panel: tabbed customization -->
        <div class="forge-panel">
          <div class="forge-tabs">
            <button class="forge-tab active" data-tab="sword">Sword</button>
            <button class="forge-tab" data-tab="costume">Style</button>
            <button class="forge-tab" data-tab="armory">Armory</button>
          </div>
          <div class="forge-tab-content active" data-content="sword" id="forge-sword-panel"></div>
          <div class="forge-tab-content" data-content="costume" id="forge-costume-panel"></div>
          <div class="forge-tab-content" data-content="armory" id="forge-armory-panel"></div>
        </div>

      </div>`;

    forgeSvgEl = container.querySelector('.forge-char-svg');
    buildPoses(container.querySelector('#forge-poses'));
    buildSwordPanel(container.querySelector('#forge-sword-panel'));
    buildCostumePanel(container.querySelector('#forge-costume-panel'));
    buildArmoryPanel(container.querySelector('#forge-armory-panel'));

    /* Tab switching */
    container.querySelectorAll('.forge-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.forge-tab').forEach(b => b.classList.remove('active'));
        container.querySelectorAll('.forge-tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        container.querySelector(`[data-content="${btn.dataset.tab}"]`).classList.add('active');
        if (btn.dataset.tab === 'armory') refreshArmory(container.querySelector('#forge-armory-panel'));
      });
    });

    refresh();
  }

  /* ---- Poses ---- */
  function buildPoses(el) {
    el.innerHTML = Object.entries(Avatar.POSES).map(([id, p]) =>
      `<button class="pose-btn${state.pose === id ? ' active' : ''}" data-pose="${id}">${p.name}</button>`
    ).join('');
    el.addEventListener('click', e => {
      const btn = e.target.closest('.pose-btn');
      if (!btn) return;
      state.pose = btn.dataset.pose;
      el.querySelectorAll('.pose-btn').forEach(b => b.classList.toggle('active', b.dataset.pose === state.pose));
      refresh();
    });
  }

  /* ---- Sword panel ---- */
  function buildSwordPanel(el) {
    /* Sword type grid */
    const swordGrid = document.createElement('div');
    swordGrid.className = 'sword-selector';
    swordGrid.id = 'sword-type-grid';
    Swords.DEFS.forEach(def => {
      const btn = document.createElement('div');
      btn.className = 'sword-choice' + (state.swordType === def.id ? ' active' : '');
      btn.dataset.sword = def.id;
      const thumbSvg = Swords.thumb({ type: def.id, bladeColor: state.bladeColor, effect: state.effect, handleColor: state.handleColor, guardColor: state.guardColor }, '');
      btn.innerHTML = `${thumbSvg}<span class="sword-choice-name">${def.name}</span>`;
      btn.addEventListener('click', () => {
        state.swordType = def.id;
        swordGrid.querySelectorAll('.sword-choice').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        refresh();
      });
      swordGrid.appendChild(btn);
    });

    /* Blade color row */
    const bladeColorRow = makeColorRow('Blade Color', state.bladeColor, (v) => { state.bladeColor = v; refresh(); updateSwordThumbs(swordGrid); });

    /* Effect grid */
    const effectSection = document.createElement('div');
    effectSection.className = 'field-group';
    effectSection.innerHTML = `<div class="field-label">Blade Effect</div>`;
    const effectGrid = document.createElement('div');
    effectGrid.className = 'effect-grid';
    Swords.EFFECTS.forEach(ef => {
      const b = document.createElement('button');
      b.className = 'effect-btn' + (state.effect === ef ? ' active' : '');
      b.dataset.effect = ef;
      b.textContent = ef === 'none' ? 'None' : ef.charAt(0).toUpperCase() + ef.slice(1);
      b.addEventListener('click', () => {
        state.effect = ef;
        effectGrid.querySelectorAll('.effect-btn').forEach(x => x.classList.toggle('active', x.dataset.effect === ef));
        refresh();
      });
      effectGrid.appendChild(b);
    });
    effectSection.appendChild(effectGrid);

    /* Guard color */
    const guardColorRow = makeColorRow('Guard Color', state.guardColor, (v) => { state.guardColor = v; refresh(); });

    /* Guard style */
    const guardStyleSection = document.createElement('div');
    guardStyleSection.className = 'field-group';
    guardStyleSection.innerHTML = `<label class="field-label">Guard Style</label>`;
    const guardSel = document.createElement('select');
    guardSel.className = 'field-select';
    Swords.GUARD_STYLES.forEach(gs => {
      const opt = document.createElement('option');
      opt.value = gs; opt.textContent = gs.charAt(0).toUpperCase() + gs.slice(1);
      if (gs === state.guardStyle) opt.selected = true;
      guardSel.appendChild(opt);
    });
    guardSel.addEventListener('change', () => { state.guardStyle = guardSel.value; refresh(); });
    guardStyleSection.appendChild(guardSel);

    /* Handle color */
    const handleColorRow = makeColorRow('Handle Color', state.handleColor, (v) => { state.handleColor = v; refresh(); });

    /* Inscription */
    const inscSection = document.createElement('div');
    inscSection.className = 'field-group';
    inscSection.innerHTML = `<label class="field-label">Inscription (up to 12 chars)</label>
      <input class="field-input" type="text" maxlength="12" placeholder="Engrave text on blade…" value="${ScrollModule.escHtml(state.inscription)}"/>`;
    inscSection.querySelector('input').addEventListener('input', e => { state.inscription = e.target.value; refresh(); });

    /* Sword carry position */
    const carrySection = document.createElement('div');
    carrySection.className = 'field-group';
    carrySection.innerHTML = `<div class="field-label">Carry Position</div>
      <div class="effect-grid">
        ${['right','left','back','stow'].map(c =>
          `<button class="effect-btn${state.swordCarry === c ? ' active' : ''}" data-carry="${c}">${c.charAt(0).toUpperCase() + c.slice(1)}</button>`
        ).join('')}
      </div>`;
    carrySection.querySelectorAll('[data-carry]').forEach(b => {
      b.addEventListener('click', () => {
        state.swordCarry = b.dataset.carry;
        carrySection.querySelectorAll('[data-carry]').forEach(x => x.classList.toggle('active', x.dataset.carry === state.swordCarry));
        refresh();
      });
    });

    el.appendChild(makeDivider('Choose Sword'));
    el.appendChild(swordGrid);
    el.appendChild(bladeColorRow);
    el.appendChild(effectSection);
    el.appendChild(guardColorRow);
    el.appendChild(guardStyleSection);
    el.appendChild(handleColorRow);
    el.appendChild(inscSection);
    el.appendChild(carrySection);
  }

  function updateSwordThumbs(grid) {
    grid.querySelectorAll('.sword-choice').forEach(btn => {
      const def = Swords.byId[btn.dataset.sword];
      if (!def) return;
      const svg = btn.querySelector('svg');
      if (svg) {
        const newThumb = Swords.thumb({ type: def.id, bladeColor: state.bladeColor, effect: state.effect, handleColor: state.handleColor, guardColor: state.guardColor }, '');
        const tmp = document.createElement('div');
        tmp.innerHTML = newThumb;
        btn.replaceChild(tmp.firstElementChild, svg);
      }
    });
  }

  /* ---- Costume panel ---- */
  function buildCostumePanel(el) {
    /* Skin tone */
    const skinSection = document.createElement('div');
    skinSection.className = 'field-group';
    skinSection.innerHTML = `<div class="field-label">Skin Tone</div>`;
    const skinGrid = document.createElement('div');
    skinGrid.className = 'swatch-grid';
    Avatar.SKIN_TONES.forEach(tone => {
      const sw = document.createElement('div');
      sw.className = 'swatch' + (state.skinTone === tone.id ? ' active' : '');
      sw.style.background = tone.hex;
      sw.title = tone.name;
      sw.addEventListener('click', () => {
        state.skinTone = tone.id;
        skinGrid.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
        refresh();
      });
      skinGrid.appendChild(sw);
    });
    skinSection.appendChild(skinGrid);

    /* Hair style */
    const hairStyleSection = makeSelectorSection('Hair Style', Avatar.HAIR_STYLES, state.hairStyle, (v) => {
      state.hairStyle = v; refresh();
    });

    /* Hair color */
    const hairColorRow = makeSwatchRow('Hair Color', Avatar.HAIR_COLORS, state.hairColor, (v) => { state.hairColor = v; refresh(); });

    /* Eye style */
    const eyeStyleSection = makeSelectorSection('Eye Style', Avatar.EYE_STYLES, state.eyeStyle, (v) => {
      state.eyeStyle = v; refresh();
    });

    /* Eye color */
    const eyeColorRow = makeColorRow('Eye Color', state.eyeColor, (v) => { state.eyeColor = v; refresh(); });

    /* Costume */
    const costumeSection = document.createElement('div');
    costumeSection.className = 'field-group';
    costumeSection.innerHTML = `<div class="field-label">Outfit</div>`;
    const cosGrid = document.createElement('div');
    cosGrid.className = 'costume-grid';
    Object.entries(Avatar.COSTUMES).forEach(([id, cos]) => {
      const card = document.createElement('div');
      card.className = 'costume-card' + (state.costume === id ? ' active' : '');
      card.dataset.costume = id;
      card.innerHTML = `<span class="costume-icon">${cos.icon}</span><span class="costume-name">${cos.name}</span>`;
      card.addEventListener('click', () => {
        state.costume = id;
        cosGrid.querySelectorAll('.costume-card').forEach(c => c.classList.toggle('active', c.dataset.costume === id));
        refresh();
      });
      cosGrid.appendChild(card);
    });
    costumeSection.appendChild(cosGrid);

    /* Accessories */
    const accSection = document.createElement('div');
    accSection.className = 'field-group';
    accSection.innerHTML = `<div class="field-label">Accessory</div>`;
    const accGrid = document.createElement('div');
    accGrid.className = 'costume-grid';
    Object.entries(Avatar.ACCESSORIES).forEach(([id, acc]) => {
      const card = document.createElement('div');
      card.className = 'costume-card' + (state.accessory === id ? ' active' : '');
      card.dataset.acc = id;
      card.innerHTML = `<span class="costume-icon">${acc.icon}</span><span class="costume-name">${acc.name}</span>`;
      card.addEventListener('click', () => {
        state.accessory = id;
        accGrid.querySelectorAll('.costume-card').forEach(c => c.classList.toggle('active', c.dataset.acc === id));
        refresh();
      });
      accGrid.appendChild(card);
    });
    accSection.appendChild(accGrid);

    /* Cape / aura color */
    const capeColorRow = makeColorRow('Cape / Aura Color', state.capeColor, (v) => {
      state.capeColor = v; state.auraColor = v; refresh();
    });

    el.appendChild(skinSection);
    el.appendChild(hairStyleSection);
    el.appendChild(hairColorRow);
    el.appendChild(makeDivider());
    el.appendChild(eyeStyleSection);
    el.appendChild(eyeColorRow);
    el.appendChild(makeDivider());
    el.appendChild(costumeSection);
    el.appendChild(accSection);
    el.appendChild(capeColorRow);
  }

  /* ---- Armory panel ---- */
  function buildArmoryPanel(el) {
    el._root = el;
  }

  function refreshArmory(el) {
    const armory = Store.getArmory();
    el.innerHTML = '';

    /* Save current design button */
    const saveWrap = document.createElement('div');
    saveWrap.innerHTML = `
      <div class="field-group">
        <label class="field-label">Save Current Design</label>
        <input class="field-input" type="text" id="armory-name-input" placeholder="Name this creation…" value="${ScrollModule.escHtml(state.name || '')}"/>
      </div>`;
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary';
    saveBtn.textContent = 'Save to Armory';
    saveBtn.style.width = '100%';
    saveBtn.style.marginTop = '8px';
    saveBtn.addEventListener('click', () => {
      const nameEl = el.querySelector('#armory-name-input');
      const name = nameEl ? nameEl.value.trim() : '';
      if (!name) { nameEl && nameEl.focus(); return; }
      state.name = name;
      const armoryData = Store.getArmory();
      armoryData.push({
        id: Store.uid(),
        name,
        ts: Date.now(),
        swordCfg: swordCfg(),
        avatarCfg: avatarCfg(),
        state: { ...state },
      });
      Store.setArmory(armoryData);
      refreshArmory(el);
    });
    saveWrap.appendChild(saveBtn);
    el.appendChild(saveWrap);

    if (!armory.length) {
      el.appendChild(Object.assign(document.createElement('div'), {
        className: 'empty-state',
        innerHTML: '<p style="margin-top:16px">No saved designs yet.<br>Create something and save it here.</p>',
      }));
      return;
    }

    const list = document.createElement('div');
    list.className = 'armory-grid';
    list.style.marginTop = '16px';

    armory.slice().reverse().forEach(item => {
      const card = document.createElement('div');
      card.className = 'card armory-card';
      const thumbSvg = Swords.thumb(item.swordCfg, '');
      card.innerHTML = `
        <div class="armory-thumb">${thumbSvg}</div>
        <div class="armory-info">
          <div class="armory-name">${ScrollModule.escHtml(item.name)}</div>
          <div class="armory-meta">${new Date(item.ts).toLocaleDateString()}</div>
        </div>
        <div class="armory-actions">
          <button class="btn-icon btn-load-design" data-id="${item.id}" title="Load">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M10 4v12M4 10l6 6 6-6"/>
            </svg>
          </button>
          <button class="btn-icon btn-del-design" data-id="${item.id}" title="Delete" style="color:#f87171">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
              <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12"/>
            </svg>
          </button>
        </div>`;
      list.appendChild(card);
    });

    list.addEventListener('click', e => {
      const loadBtn = e.target.closest('.btn-load-design');
      const delBtn = e.target.closest('.btn-del-design');
      if (loadBtn) {
        const id = loadBtn.dataset.id;
        const item = Store.getArmory().find(a => a.id === id);
        if (item) { Object.assign(state, item.state); refresh(); }
      }
      if (delBtn) {
        const id = delBtn.dataset.id;
        Store.setArmory(Store.getArmory().filter(a => a.id !== id));
        refreshArmory(el);
      }
    });

    el.appendChild(list);
  }

  /* ---- Also expose saved sword designs to avatar wardrobe ---- */
  function getArmoryForAvatar() {
    return Store.getArmory().map(item => ({
      id: item.id,
      name: item.name,
      swordCfg: item.swordCfg,
    }));
  }

  /* ---- Helpers ---- */
  function makeDivider(label = '') {
    const el = document.createElement('div');
    el.className = label ? 'divider-label' : 'divider';
    if (label) el.textContent = label;
    return el;
  }

  function makeColorRow(label, initial, onChange) {
    const row = document.createElement('div');
    row.className = 'field-group';
    row.innerHTML = `<div class="field-label">${label}</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input class="color-picker-inline" type="color" value="${initial}"/>
        <span style="font-size:.8rem;color:var(--text3)">${initial}</span>
      </div>`;
    const picker = row.querySelector('input');
    const span = row.querySelector('span');
    picker.addEventListener('input', e => { span.textContent = e.target.value; onChange(e.target.value); });
    return row;
  }

  function makeSwatchRow(label, colors, initial, onChange) {
    const row = document.createElement('div');
    row.className = 'field-group';
    row.innerHTML = `<div class="field-label">${label}</div>`;
    const grid = document.createElement('div');
    grid.className = 'swatch-grid';
    colors.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch' + (c === initial ? ' active' : '');
      sw.style.background = c;
      sw.title = c;
      sw.addEventListener('click', () => {
        grid.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
        onChange(c);
      });
      grid.appendChild(sw);
    });
    row.appendChild(grid);
    return row;
  }

  function makeSelectorSection(label, options, active, onChange) {
    const section = document.createElement('div');
    section.className = 'field-group';
    section.innerHTML = `<div class="field-label">${label}</div>`;
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px;';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'costume-card' + (opt === active ? ' active' : '');
      btn.dataset.val = opt;
      btn.innerHTML = `<span class="costume-name" style="font-size:.7rem">${opt}</span>`;
      btn.addEventListener('click', () => {
        grid.querySelectorAll('.costume-card').forEach(b => b.classList.toggle('active', b.dataset.val === opt));
        onChange(opt);
      });
      grid.appendChild(btn);
    });
    section.appendChild(grid);
    return section;
  }

  /* Load a state from the avatar's equipped sword (cross-module integration) */
  function loadFromAvatarConfig(cfg) {
    if (cfg.costume)   state.costume   = cfg.costume;
    if (cfg.skinTone)  state.skinTone  = cfg.skinTone;
    if (cfg.hairStyle) state.hairStyle = cfg.hairStyle;
    if (cfg.hairColor) state.hairColor = cfg.hairColor;
    if (cfg.eyeStyle)  state.eyeStyle  = cfg.eyeStyle;
    if (cfg.eyeColor)  state.eyeColor  = cfg.eyeColor;
    if (cfg.accessory) state.accessory = cfg.accessory;
    if (cfg.capeColor) state.capeColor = cfg.capeColor;
    if (cfg.equippedSwordConfig) Object.assign(state, cfg.equippedSwordConfig);
  }

  return {
    state, mount, refresh, swordCfg, avatarCfg, getArmoryForAvatar, loadFromAvatarConfig,
    DEFAULT_STATE,
  };
})();
