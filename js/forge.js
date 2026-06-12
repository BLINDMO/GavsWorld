/* ============================================================
   Gavin's World — The Forge module
   Sword design studio: type picker, blade/handle/effect/guard/
   inscription customisation, armory save/load/delete.
   No manikin, no avatar, just the sword — big and beautiful.
   ============================================================ */

const Forge = (() => {

  /* ---- Default state ---- */
  const DEFAULT_STATE = () => ({
    swordType:   'katana',
    bladeColor:  '#cdd6e4',
    effect:      'none',
    handleColor: '#2d3a5c',
    guardStyle:  'default',
    guardColor:  '#b9a45c',
    inscription: '',
    name:        '',
  });

  let state = DEFAULT_STATE();
  let previewSvgEl   = null;
  let forgeContainer = null;

  /* ---- Build sword config from state ---- */
  function swordCfg() {
    return {
      type:        state.swordType,
      bladeColor:  state.bladeColor,
      effect:      state.effect,
      handleColor: state.handleColor,
      guardStyle:  state.guardStyle,
      guardColor:  state.guardColor,
      inscription: state.inscription,
    };
  }

  /* ---- Update the large sword preview ---- */
  function updatePreview() {
    if (!previewSvgEl) return;
    const { g, def } = Swords.buildGroup(swordCfg());
    const [bx, by, bw, bh] = def.box;
    previewSvgEl.setAttribute('viewBox', bx + ' ' + by + ' ' + bw + ' ' + bh);
    previewSvgEl.innerHTML = g;
  }

  /* Public alias */
  function refresh() { updatePreview(); }

  /* ---- Mount the Forge UI into a container element ---- */
  function mount(container) {
    forgeContainer = container;

    container.innerHTML = `
      <div class="forge-wrap">

        <!-- Sword type strip -->
        <div class="forge-type-strip" id="forge-type-strip"></div>
        <div class="forge-type-name" id="forge-type-name"></div>

        <!-- Large sword preview -->
        <div class="forge-preview">
          <div class="forge-preview-glow"></div>
          <svg id="forge-preview-svg"
               class="forge-preview-svg"
               xmlns="http://www.w3.org/2000/svg"></svg>
        </div>

        <!-- Tab bar -->
        <div class="forge-tabs" id="forge-tabs">
          <button class="forge-tab active" data-tab="blade">Blade</button>
          <button class="forge-tab" data-tab="handle">Handle</button>
          <button class="forge-tab" data-tab="effects">Effects</button>
          <button class="forge-tab" data-tab="save">Armory</button>
        </div>

        <!-- Tab panels -->
        <div class="forge-panel-wrap">
          <div class="forge-panel active" data-panel="blade"   id="forge-panel-blade"></div>
          <div class="forge-panel"        data-panel="handle"  id="forge-panel-handle"></div>
          <div class="forge-panel"        data-panel="effects" id="forge-panel-effects"></div>
          <div class="forge-panel"        data-panel="save"    id="forge-panel-save"></div>
        </div>

      </div>`;

    previewSvgEl = container.querySelector('#forge-preview-svg');

    buildTypeStrip(container.querySelector('#forge-type-strip'), container.querySelector('#forge-type-name'));
    buildBladePanel(container.querySelector('#forge-panel-blade'));
    buildHandlePanel(container.querySelector('#forge-panel-handle'));
    buildEffectsPanel(container.querySelector('#forge-panel-effects'));
    buildArmoryPanel(container.querySelector('#forge-panel-save'));

    /* Tab switching */
    container.querySelector('#forge-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.forge-tab');
      if (!btn) return;
      const tab = btn.dataset.tab;
      container.querySelectorAll('.forge-tab').forEach(b => b.classList.toggle('active', b === btn));
      container.querySelectorAll('.forge-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === tab));
      if (tab === 'save') refreshArmoryPanel(container.querySelector('#forge-panel-save'));
    });

    updatePreview();
  }

  /* ---- Sword type strip ---- */
  function buildTypeStrip(stripEl, nameEl) {
    function render() {
      stripEl.innerHTML = '';
      Swords.DEFS.forEach(def => {
        const btn = document.createElement('button');
        btn.className = 'forge-type-btn' + (state.swordType === def.id ? ' active' : '');
        btn.dataset.sword = def.id;
        btn.title = def.name;
        const thumbSvg = Swords.thumb(
          { type: def.id, bladeColor: state.bladeColor, effect: 'none',
            handleColor: state.handleColor, guardColor: state.guardColor },
          'forge-type-thumb'
        );
        btn.innerHTML = thumbSvg;
        btn.addEventListener('click', () => {
          state.swordType = def.id;
          render();
          nameEl.textContent = def.name;
          updatePreview();
        });
        stripEl.appendChild(btn);
      });
      /* Scroll active button into view */
      const active = stripEl.querySelector('.active');
      if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }

    render();
    const current = Swords.byId[state.swordType];
    nameEl.textContent = current ? current.name : '';

    /* Expose render so color changes can refresh thumbs */
    stripEl._rerender = render;
  }

  /* ---- Blade tab ---- */
  function buildBladePanel(el) {
    /* Blade color */
    const bladeColorRow = makeColorRow('Blade Color', state.bladeColor, v => {
      state.bladeColor = v;
      updatePreview();
      refreshTypeThumbs();
    });

    /* Guard style */
    const guardStyleWrap = document.createElement('div');
    guardStyleWrap.className = 'field-group';
    guardStyleWrap.innerHTML = `<label class="field-label">Guard Style</label>`;
    const guardSel = document.createElement('select');
    guardSel.className = 'field-select';
    Swords.GUARD_STYLES.forEach(gs => {
      const opt = document.createElement('option');
      opt.value = gs;
      opt.textContent = gs.charAt(0).toUpperCase() + gs.slice(1);
      if (gs === state.guardStyle) opt.selected = true;
      guardSel.appendChild(opt);
    });
    guardSel.addEventListener('change', () => { state.guardStyle = guardSel.value; updatePreview(); });
    guardStyleWrap.appendChild(guardSel);

    /* Guard color */
    const guardColorRow = makeColorRow('Guard Color', state.guardColor, v => {
      state.guardColor = v;
      updatePreview();
    });

    el.appendChild(bladeColorRow);
    el.appendChild(makeDivider());
    el.appendChild(guardStyleWrap);
    el.appendChild(guardColorRow);
  }

  /* ---- Handle tab ---- */
  function buildHandlePanel(el) {
    const handleColorRow = makeColorRow('Handle Color', state.handleColor, v => {
      state.handleColor = v;
      updatePreview();
      refreshTypeThumbs();
    });

    const inscWrap = document.createElement('div');
    inscWrap.className = 'field-group';
    inscWrap.innerHTML = `<label class="field-label">Inscription <span style="color:var(--text3);font-weight:400">(up to 12 chars)</span></label>
      <input class="field-input" type="text" maxlength="12"
             placeholder="Engrave text on blade…"
             value="${ScrollModule.escHtml(state.inscription)}"/>`;
    inscWrap.querySelector('input').addEventListener('input', e => {
      state.inscription = e.target.value;
      updatePreview();
    });

    el.appendChild(handleColorRow);
    el.appendChild(makeDivider());
    el.appendChild(inscWrap);
  }

  /* ---- Effects tab ---- */

  /* Color hints per effect so buttons feel alive */
  const EFFECT_COLORS = {
    none:      { border: 'var(--border)',  bg: 'var(--bg3)',               text: 'var(--text3)' },
    glow:      { border: '#60a5fa',        bg: 'rgba(59,130,246,0.12)',     text: '#93c5fd' },
    fire:      { border: '#f97316',        bg: 'rgba(249,115,22,0.12)',     text: '#fdba74' },
    ice:       { border: '#67e8f9',        bg: 'rgba(103,232,249,0.10)',    text: '#a5f3fc' },
    lightning: { border: '#facc15',        bg: 'rgba(250,204,21,0.10)',     text: '#fde68a' },
    shadow:    { border: '#a78bfa',        bg: 'rgba(167,139,250,0.10)',    text: '#c4b5fd' },
    rainbow:   { border: '#f472b6',        bg: 'rgba(244,114,182,0.10)',    text: '#fbcfe8' },
  };

  function buildEffectsPanel(el) {
    const label = document.createElement('div');
    label.className = 'field-label';
    label.textContent = 'Blade Effect';

    const grid = document.createElement('div');
    grid.className = 'effect-grid';
    grid.id = 'forge-effect-grid';

    Swords.EFFECTS.forEach(ef => {
      const btn = document.createElement('button');
      btn.dataset.effect = ef;
      const cols = EFFECT_COLORS[ef] || EFFECT_COLORS.none;
      btn.style.cssText = `padding:8px 16px;border-radius:20px;border:1px solid ${cols.border};
        font-family:var(--font-display);font-size:.75rem;font-weight:600;
        letter-spacing:.07em;text-transform:uppercase;
        color:${cols.text};background:${cols.bg};
        transition:all var(--transition);cursor:pointer;`;
      btn.textContent = ef === 'none' ? 'None' : ef.charAt(0).toUpperCase() + ef.slice(1);
      if (state.effect === ef) btn.style.boxShadow = `0 0 10px ${cols.border}66`;
      btn.addEventListener('click', () => {
        state.effect = ef;
        grid.querySelectorAll('button').forEach(b => { b.style.boxShadow = ''; });
        btn.style.boxShadow = `0 0 10px ${cols.border}66`;
        updatePreview();
      });
      grid.appendChild(btn);
    });

    el.appendChild(label);
    el.appendChild(grid);
  }

  /* ---- Armory tab ---- */
  function buildArmoryPanel(el) {
    /* Just a placeholder root; refreshArmoryPanel fills it */
    el._root = el;
    refreshArmoryPanel(el);
  }

  function refreshArmoryPanel(el) {
    el.innerHTML = '';

    /* Save section */
    const saveSection = document.createElement('div');
    saveSection.className = 'field-group';
    saveSection.innerHTML = `<label class="field-label">Design Name</label>
      <input class="field-input" type="text" id="armory-name-input"
             placeholder="Name this creation…"
             value="${ScrollModule.escHtml(state.name || '')}"/>`;
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn-primary';
    saveBtn.textContent = 'Save Design';
    saveBtn.style.cssText = 'width:100%;margin-top:8px;';
    saveBtn.addEventListener('click', () => {
      const nameEl = el.querySelector('#armory-name-input');
      const name = nameEl ? nameEl.value.trim() : '';
      if (!name) { if (nameEl) nameEl.focus(); return; }
      state.name = name;
      const armory = Store.getArmory();
      armory.push({
        id: Store.uid(),
        name,
        ts: Date.now(),
        swordCfg: swordCfg(),
        state: { ...state },
      });
      Store.setArmory(armory);
      refreshArmoryPanel(el);
    });
    saveSection.appendChild(saveBtn);
    el.appendChild(saveSection);

    /* Saved designs list */
    const armory = Store.getArmory();

    if (!armory.length) {
      el.appendChild(Object.assign(document.createElement('div'), {
        className: 'empty-state',
        innerHTML: '<p style="margin-top:20px;text-align:center;color:var(--text3);font-size:.9rem">No saved designs yet.<br>Create something and save it here.</p>',
      }));
      return;
    }

    const listLabel = document.createElement('div');
    listLabel.className = 'field-label';
    listLabel.style.marginTop = '16px';
    listLabel.textContent = 'Saved Designs';
    el.appendChild(listLabel);

    const list = document.createElement('div');
    list.className = 'armory-grid';

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
          <button class="btn-icon btn-load-design" data-id="${item.id}" title="Load design">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10 4v12M4 10l6 6 6-6"/>
            </svg>
          </button>
          <button class="btn-icon btn-del-design" data-id="${item.id}" title="Delete" style="color:#f87171">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 5h14M8 5V3h4v2M6 5l1 12h6l1-12"/>
            </svg>
          </button>
        </div>`;
      list.appendChild(card);
    });

    list.addEventListener('click', e => {
      const loadBtn = e.target.closest('.btn-load-design');
      const delBtn  = e.target.closest('.btn-del-design');
      if (loadBtn) {
        const id = loadBtn.dataset.id;
        const item = Store.getArmory().find(a => a.id === id);
        if (item && item.state) {
          Object.assign(state, item.state);
          updatePreview();
          /* Re-sync color pickers & selects in other panels */
          syncPanelControls();
        }
      }
      if (delBtn) {
        const id = delBtn.dataset.id;
        Store.setArmory(Store.getArmory().filter(a => a.id !== id));
        refreshArmoryPanel(el);
      }
    });

    el.appendChild(list);
  }

  /* After loading a saved design, sync visible form controls to new state */
  function syncPanelControls() {
    if (!forgeContainer) return;

    /* Blade color picker */
    const bcp = forgeContainer.querySelector('#forge-panel-blade .color-picker-inline');
    if (bcp) { bcp.value = state.bladeColor; bcp.nextElementSibling.textContent = state.bladeColor; }

    /* Guard style select */
    const gsel = forgeContainer.querySelector('#forge-panel-blade .field-select');
    if (gsel) gsel.value = state.guardStyle;

    /* Guard color picker */
    const gcpAll = forgeContainer.querySelectorAll('#forge-panel-blade .color-picker-inline');
    if (gcpAll[1]) { gcpAll[1].value = state.guardColor; gcpAll[1].nextElementSibling.textContent = state.guardColor; }

    /* Handle color picker */
    const hcp = forgeContainer.querySelector('#forge-panel-handle .color-picker-inline');
    if (hcp) { hcp.value = state.handleColor; hcp.nextElementSibling.textContent = state.handleColor; }

    /* Inscription */
    const inscInput = forgeContainer.querySelector('#forge-panel-handle .field-input');
    if (inscInput) inscInput.value = state.inscription;

    /* Effect buttons — reset glow, re-glow active */
    const effectGrid = forgeContainer.querySelector('#forge-effect-grid');
    if (effectGrid) {
      effectGrid.querySelectorAll('button').forEach(btn => {
        btn.style.boxShadow = '';
        if (btn.dataset.effect === state.effect) {
          const cols = EFFECT_COLORS[state.effect] || EFFECT_COLORS.none;
          btn.style.boxShadow = `0 0 10px ${cols.border}66`;
        }
      });
    }

    /* Type strip */
    const strip = forgeContainer.querySelector('#forge-type-strip');
    if (strip && strip._rerender) strip._rerender();
    const nameEl = forgeContainer.querySelector('#forge-type-name');
    if (nameEl) {
      const def = Swords.byId[state.swordType];
      nameEl.textContent = def ? def.name : '';
    }
  }

  /* Re-render type-strip thumbnails when blade/handle color changes */
  function refreshTypeThumbs() {
    if (!forgeContainer) return;
    const strip = forgeContainer.querySelector('#forge-type-strip');
    if (strip && strip._rerender) strip._rerender();
  }

  /* ---- Helpers ---- */
  function makeDivider() {
    const el = document.createElement('div');
    el.className = 'divider';
    return el;
  }

  function makeColorRow(label, initial, onChange) {
    const row = document.createElement('div');
    row.className = 'field-group';
    row.innerHTML = `<div class="field-label">${label}</div>
      <div style="display:flex;align-items:center;gap:10px;">
        <input class="color-picker-inline" type="color" value="${initial}"/>
        <span class="color-hex-label" style="font-size:.82rem;color:var(--text2);font-family:var(--font-display);letter-spacing:.04em;">${initial}</span>
      </div>`;
    const picker = row.querySelector('input');
    const span   = row.querySelector('span');
    picker.addEventListener('input', e => { span.textContent = e.target.value; onChange(e.target.value); });
    return row;
  }

  /* ---- Public: expose saved swords to avatar wardrobe ---- */
  function getArmoryForAvatar() {
    return Store.getArmory().map(item => ({
      id:       item.id,
      name:     item.name,
      swordCfg: item.swordCfg,
    }));
  }

  /* ---- No-op stub kept for app.js compatibility ---- */
  function loadFromAvatarConfig() {}

  return {
    mount,
    refresh,
    swordCfg,
    getArmoryForAvatar,
    loadFromAvatarConfig,
    DEFAULT_STATE,
  };
})();
