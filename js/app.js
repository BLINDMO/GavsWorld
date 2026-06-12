/* ============================================================
   Gavin's World — Main app controller
   Handles routing, page transitions, homepage, avatar creator,
   and module navigation.
   ============================================================ */

(function () {
  'use strict';

  /* ---- Page registry ---- */
  const pages = {};
  function getPage(id) {
    return pages[id] || (pages[id] = document.getElementById('page-' + id));
  }

  let activePage = 'home';

  function showPage(id, onEnter) {
    const prev = getPage(activePage);
    const next = getPage(id);
    if (!next || id === activePage) return;

    prev.classList.remove('active');
    prev.classList.add('exit');
    setTimeout(() => { prev.classList.remove('exit'); }, 280);

    activePage = id;
    if (onEnter) onEnter();
    requestAnimationFrame(() => { next.classList.add('active'); });
  }

  function goHome() { showPage('home'); }

  /* ---- Date/time ---- */
  function updateDateTime() {
    const el = document.getElementById('home-date');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' });
  }

  /* ---- Avatar on homepage ---- */
  let homeSvgEl = null;

  function renderHomeAvatar() {
    if (!homeSvgEl) homeSvgEl = document.getElementById('home-avatar-svg');
    if (!homeSvgEl) return;
    const saved = Store.getAvatar() || {};
    const cfg = { ...Avatar.DEFAULTS, ...saved };
    Avatar.update(homeSvgEl, cfg);
  }

  /* ---- Avatar Creator ---- */
  let avatarCreatorState = {};
  let avatarPreviewEl = null;

  function openAvatarCreator() {
    const saved = Store.getAvatar() || {};
    avatarCreatorState = { ...Avatar.DEFAULTS, ...saved };

    showPage('avatar', () => {
      buildAvatarCreator();
    });
  }

  function buildAvatarCreator() {
    const page = getPage('avatar');
    const previewPane = page.querySelector('.avatar-preview-pane');
    const optionsPane = page.querySelector('.avatar-options-pane');

    /* create/get the preview SVG */
    if (!page.querySelector('.avatar-preview-pane svg')) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'avatar-svg');
      svg.setAttribute('viewBox', '-85 -110 170 200');
      previewPane.appendChild(svg);
    }
    avatarPreviewEl = page.querySelector('.avatar-preview-pane svg');
    Avatar.update(avatarPreviewEl, avatarCreatorState);

    /* build tabs if not built yet */
    if (optionsPane.querySelector('.avatar-tab-content[data-content="look"]')) return;

    const tabs = optionsPane.querySelector('.avatar-tabs');
    if (tabs) tabs.innerHTML = `
      <button class="avatar-tab active" data-tab="look">Look</button>
      <button class="avatar-tab" data-tab="accessories">Accessories</button>`;

    /* ---- Look tab ---- */
    const lookDiv = document.createElement('div');
    lookDiv.className = 'avatar-tab-content active';
    lookDiv.dataset.content = 'look';
    lookDiv.style.display = 'flex';

    /* Skin tones */
    const skinSec = document.createElement('div');
    skinSec.className = 'field-group';
    skinSec.innerHTML = `<div class="field-label">Skin Tone</div><div class="swatch-grid" id="ac-skin-grid"></div>`;
    const skinGrid = skinSec.querySelector('#ac-skin-grid');
    Avatar.SKIN_TONES.forEach(t => {
      const sw = document.createElement('div');
      sw.className = 'swatch' + (avatarCreatorState.skinTone === t.id ? ' active' : '');
      sw.style.background = t.hex; sw.title = t.name;
      sw.addEventListener('click', () => {
        avatarCreatorState.skinTone = t.id;
        skinGrid.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      skinGrid.appendChild(sw);
    });
    lookDiv.appendChild(skinSec);

    /* Hair style chips */
    const hairStyleSec = document.createElement('div');
    hairStyleSec.className = 'field-group';
    hairStyleSec.innerHTML = `<div class="field-label">Hair Style</div>`;
    const hairChips = document.createElement('div');
    hairChips.className = 'style-chips';
    Avatar.HAIR_STYLES.forEach(h => {
      const chip = document.createElement('button');
      chip.className = 'style-chip' + (avatarCreatorState.hairStyle === h ? ' active' : '');
      chip.dataset.hair = h;
      chip.textContent = h;
      chip.addEventListener('click', () => {
        avatarCreatorState.hairStyle = h;
        hairChips.querySelectorAll('.style-chip').forEach(c => c.classList.toggle('active', c.dataset.hair === h));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      hairChips.appendChild(chip);
    });
    hairStyleSec.appendChild(hairChips);
    lookDiv.appendChild(hairStyleSec);

    /* Hair color swatches */
    const hairColorSec = document.createElement('div');
    hairColorSec.className = 'field-group';
    hairColorSec.innerHTML = `<div class="field-label">Hair Color</div><div class="swatch-grid" id="ac-hair-color-grid"></div>`;
    const hairColorGrid = hairColorSec.querySelector('#ac-hair-color-grid');
    Avatar.HAIR_COLORS.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch' + (avatarCreatorState.hairColor === c.hex ? ' active' : '');
      sw.style.background = c.hex;
      sw.title = c.name;
      sw.addEventListener('click', () => {
        avatarCreatorState.hairColor = c.hex;
        hairColorGrid.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      hairColorGrid.appendChild(sw);
    });
    lookDiv.appendChild(hairColorSec);

    /* Eye style chips */
    const eyeStyleSec = document.createElement('div');
    eyeStyleSec.className = 'field-group';
    eyeStyleSec.innerHTML = `<div class="field-label">Eye Style</div>`;
    const eyeChips = document.createElement('div');
    eyeChips.className = 'style-chips';
    Avatar.EYE_STYLES.forEach(e => {
      const chip = document.createElement('button');
      chip.className = 'style-chip' + (avatarCreatorState.eyeStyle === e ? ' active' : '');
      chip.dataset.eye = e;
      chip.textContent = e;
      chip.addEventListener('click', () => {
        avatarCreatorState.eyeStyle = e;
        eyeChips.querySelectorAll('.style-chip').forEach(c => c.classList.toggle('active', c.dataset.eye === e));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      eyeChips.appendChild(chip);
    });
    eyeStyleSec.appendChild(eyeChips);
    lookDiv.appendChild(eyeStyleSec);

    /* Eye color */
    const eyeColorSec = document.createElement('div');
    eyeColorSec.className = 'field-group';
    eyeColorSec.innerHTML = `<div class="field-label">Eye Color</div>
      <input type="color" class="color-picker-inline" value="${avatarCreatorState.eyeColor || '#2a5fc8'}"/>`;
    eyeColorSec.querySelector('input').addEventListener('input', ev => {
      avatarCreatorState.eyeColor = ev.target.value;
      Avatar.update(avatarPreviewEl, avatarCreatorState);
    });
    lookDiv.appendChild(eyeColorSec);

    /* ---- Accessories tab ---- */
    const accDiv = document.createElement('div');
    accDiv.className = 'avatar-tab-content';
    accDiv.dataset.content = 'accessories';
    accDiv.style.display = 'none';

    const accSec = document.createElement('div');
    accSec.className = 'field-group';
    accSec.innerHTML = `<div class="field-label">Face Accessory</div>`;
    const accGrid = document.createElement('div');
    accGrid.className = 'acc-grid';
    Object.entries(Avatar.ACCESSORIES).forEach(([id, acc]) => {
      const card = document.createElement('div');
      card.className = 'acc-card' + (avatarCreatorState.accessory === id ? ' active' : '');
      card.dataset.acc = id;
      card.innerHTML = `<span class="acc-icon">${acc.icon}</span><span class="acc-name">${acc.name}</span>`;
      card.addEventListener('click', () => {
        avatarCreatorState.accessory = id;
        accGrid.querySelectorAll('.acc-card').forEach(c => c.classList.toggle('active', c.dataset.acc === id));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      accGrid.appendChild(card);
    });
    accSec.appendChild(accGrid);
    accDiv.appendChild(accSec);

    optionsPane.appendChild(lookDiv);
    optionsPane.appendChild(accDiv);

    /* Tab switching */
    optionsPane.querySelector('.avatar-tabs').addEventListener('click', e => {
      const btn = e.target.closest('.avatar-tab');
      if (!btn) return;
      const tab = btn.dataset.tab;
      optionsPane.querySelectorAll('.avatar-tab').forEach(b => b.classList.toggle('active', b === btn));
      optionsPane.querySelectorAll('.avatar-tab-content').forEach(c => {
        c.classList.toggle('active', c.dataset.content === tab);
        c.style.display = c.dataset.content === tab ? 'flex' : 'none';
      });
    });
  }

  /* ---- Wheel of Fate ---- */
  let wheelInited = false;
  let activeWheelCanvas = null;
  let currentWheelData = null;

  function openWheelPage() {
    showPage('wheel', () => {
      const page = getPage('wheel');
      page.querySelector('#wheel-landing').style.display = 'flex';
      page.querySelector('#wheel-screen').style.display = 'none';
      page.querySelector('#wheel-saved-screen').style.display = 'none';
    });
  }

  function showWheelSpinner(wheelData) {
    const page = getPage('wheel');
    page.querySelector('#wheel-landing').style.display = 'none';
    page.querySelector('#wheel-saved-screen').style.display = 'none';
    page.querySelector('#wheel-screen').style.display = 'flex';
    const outerHdr = page.querySelector('#wheel-page-header');
    if (outerHdr) outerHdr.style.display = 'none';

    currentWheelData = wheelData;
    const nameEl = page.querySelector('#wheel-current-name');
    if (nameEl) nameEl.textContent = wheelData.name || 'Unnamed Wheel';

    activeWheelCanvas = page.querySelector('#wheel-canvas');
    /* delay one frame so CSS min() layout has resolved before reading dimensions */
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Wheel.resizeCanvas();
      Wheel.drawWheel();
    }));
    if (!wheelInited) {
      Wheel.init(activeWheelCanvas, (idx, entry) => {
        const stage    = page.querySelector('#wheel-stage');
        const winnerEl = page.querySelector('#wheel-winner');
        const winnerText = page.querySelector('#wheel-winner-text');
        const spinBtn  = page.querySelector('#btn-spin-wheel');
        const label = typeof entry === 'string' ? entry : (entry.label || '');
        winnerText.textContent = label;
        winnerEl.classList.add('show');
        if (spinBtn) spinBtn.disabled = false;
        Wheel.burst(stage);
      });
      wheelInited = true;
    }
    Wheel.load(wheelData);

    /* re-enable spin button on new wheel load */
    const spinBtn = page.querySelector('#btn-spin-wheel');
    if (spinBtn) spinBtn.disabled = false;

    /* hide winner overlay on click */
    const winnerEl = page.querySelector('#wheel-winner');
    winnerEl.onclick = () => winnerEl.classList.remove('show');
  }

  function showSavedWheels() {
    const page = getPage('wheel');
    page.querySelector('#wheel-landing').style.display = 'none';
    page.querySelector('#wheel-screen').style.display = 'none';
    const savedScreen = page.querySelector('#wheel-saved-screen');
    savedScreen.style.display = 'flex';
    const outerHdr = page.querySelector('#wheel-page-header');
    if (outerHdr) outerHdr.style.display = 'none';

    const grid = page.querySelector('#wheels-grid');
    grid.innerHTML = '';
    const wheels = Store.getWheels();
    if (!wheels.length) {
      grid.innerHTML = '<div class="empty-state"><p>No saved wheels yet.</p></div>';
      return;
    }
    wheels.slice().reverse().forEach(w => {
      const card = document.createElement('div');
      card.className = 'wheel-thumb-card';
      card.innerHTML = Wheel.thumbSVG(w) + `<div class="wheel-thumb-name">${ScrollModule.escHtml(w.name)}</div>`;
      card.addEventListener('click', () => showWheelSpinner(w));
      grid.appendChild(card);
    });
  }

  /* ---- Build-a-wheel overlay ---- */
  function openNewWheel() {
    const overlay = document.getElementById('overlay-new-wheel');
    overlay.classList.add('open');
    const entriesList = overlay.querySelector('#new-wheel-entries');
    entriesList.innerHTML = '';
    overlay.querySelector('#new-wheel-name').value = '';
    addWheelEntry(entriesList, '');
    addWheelEntry(entriesList, '');
    updateWheelPreview(overlay);
  }

  function addWheelEntry(list, val = '') {
    const idx = list.children.length;
    const color = Wheel.SEG_COLORS[idx % Wheel.SEG_COLORS.length];
    const row = document.createElement('div');
    row.className = 'wheel-entry-row';
    row.innerHTML = `
      <div class="entry-swatch" style="background:${color}"></div>
      <input class="field-input" type="text" placeholder="Entry ${idx + 1}…" value="${ScrollModule.escHtml(val)}"/>
      <button class="btn-remove-entry" title="Remove">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      </button>`;
    row.querySelector('.btn-remove-entry').addEventListener('click', () => {
      row.remove();
      updateWheelPreview(row.closest('#overlay-new-wheel'));
    });
    row.querySelector('input').addEventListener('input', () => updateWheelPreview(row.closest('#overlay-new-wheel')));
    list.appendChild(row);
  }

  function updateWheelPreview(overlay) {
    const previewEl = overlay.querySelector('#new-wheel-preview');
    const entries = [...overlay.querySelectorAll('.wheel-entry-row input')]
      .map(i => i.value.trim()).filter(Boolean);
    if (!entries.length) { previewEl.innerHTML = ''; return; }
    previewEl.innerHTML = Wheel.thumbSVG({ entries, name: '' });
  }

  function collectAndLaunchWheel(overlay) {
    const name = overlay.querySelector('#new-wheel-name').value.trim() || 'My Wheel';
    const entries = [...overlay.querySelectorAll('.wheel-entry-row input')]
      .map(i => i.value.trim()).filter(Boolean);
    if (entries.length < 2) {
      overlay.querySelector('#new-wheel-name').focus();
      return;
    }
    const wheel = { id: Store.uid(), name, entries, ts: Date.now() };
    overlay.classList.remove('open');
    showPage('wheel', () => {});
    setTimeout(() => { showWheelSpinner(wheel); }, 50);
  }

  /* ---- Scroll module ---- */
  function openScrollPage() {
    showPage('scroll', () => {
      const page = getPage('scroll');
      const content = page.querySelector('#scroll-list-content');
      renderScrollList(page, content);
    });
  }

  function renderScrollList(page, content) {
    page.querySelector('#scroll-editor').style.display = 'none';
    page.querySelector('#scroll-list-view').style.display = 'flex';
    ScrollModule.renderList(content);
  }

  /* ---- Forge module ---- */
  function openForgePage() {
    showPage('forge', () => {
      const page = getPage('forge');
      const mountEl = page.querySelector('#forge-mount');
      if (!mountEl.dataset.mounted) {
        /* sync forge state from avatar if available */
        const saved = Store.getAvatar();
        if (saved) Forge.loadFromAvatarConfig(saved);
        Forge.mount(mountEl);
        mountEl.dataset.mounted = '1';
      } else {
        Forge.refresh();
      }
    });
  }

  /* ---- Wire spin button ---- */
  function wireSpinButton() {
    const page = getPage('wheel');
    const spinBtn = page.querySelector('#btn-spin-wheel');
    if (!spinBtn) return;
    spinBtn.addEventListener('click', () => {
      if (!Wheel.spinning) {
        spinBtn.disabled = true;
        const winnerEl = page.querySelector('#wheel-winner');
        if (winnerEl) winnerEl.classList.remove('show');
        Wheel.launch(0.18 + Math.random() * 0.16);
      }
    });
  }

  /* ---- Loot Drop module ---- */
  function openLootPage() {
    showPage('loot', () => {
      const page = getPage('loot');
      const mountEl = page.querySelector('#loot-mount');
      if (!mountEl.dataset.mounted) {
        Loot.mount(mountEl);
        mountEl.dataset.mounted = '1';
      } else {
        Loot.reset();
      }
    });
  }

  /* ---- Bootstrap ---- */
  function init() {
    updateDateTime();
    setInterval(updateDateTime, 60000);

    /* Start particle background */
    Particles.start();

    /* Show home page */
    getPage('home').classList.add('active');

    /* Home: module tile clicks */
    document.querySelectorAll('.module-tile').forEach(tile => {
      tile.addEventListener('click', () => {
        const mod = tile.dataset.module;
        if (mod === 'scroll')  openScrollPage();
        if (mod === 'wheel')   openWheelPage();
        if (mod === 'forge')   openForgePage();
        if (mod === 'loot')    openLootPage();
      });
    });

    /* Home: avatar click → creator */
    const avatarWrap = document.getElementById('home-avatar-wrap');
    if (avatarWrap) avatarWrap.addEventListener('click', openAvatarCreator);
    const customizeBtn = document.getElementById('btn-customize-avatar');
    if (customizeBtn) customizeBtn.addEventListener('click', openAvatarCreator);

    /* Avatar creator: save & back */
    const avatarPage = getPage('avatar');
    if (avatarPage) {
      avatarPage.querySelector('#btn-save-avatar').addEventListener('click', () => {
        Store.setAvatar({ ...avatarCreatorState });
        renderHomeAvatar();
        goHome();
      });
      avatarPage.querySelector('#btn-back-avatar').addEventListener('click', goHome);
    }

    /* Scroll page: back, fab, card clicks */
    const scrollPage = getPage('scroll');
    if (scrollPage) {
      scrollPage.querySelector('#btn-back-scroll').addEventListener('click', goHome);

      const listContent = scrollPage.querySelector('#scroll-list-content');
      const scrollListView = scrollPage.querySelector('#scroll-list-view');
      const scrollEditor = scrollPage.querySelector('#scroll-editor');

      const fab = scrollPage.querySelector('.scroll-fab');
      const typeOverlay = document.getElementById('overlay-scroll-type');

      fab.addEventListener('click', () => typeOverlay.classList.add('open'));

      typeOverlay.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          typeOverlay.classList.remove('open');
          const entry = ScrollModule.newEntry(btn.dataset.type);
          scrollListView.style.display = 'none';
          scrollEditor.style.display = 'flex';
          ScrollModule.renderEditor(scrollEditor, entry,
            () => renderScrollList(scrollPage, listContent),
            () => renderScrollList(scrollPage, listContent),
          );
        });
      });

      typeOverlay.addEventListener('click', e => {
        if (e.target === typeOverlay) typeOverlay.classList.remove('open');
      });

      listContent.addEventListener('click', e => {
        const card = e.target.closest('.scroll-card');
        if (!card) return;
        const id = card.dataset.id;
        const entry = Store.getScrolls().find(s => s.id === id);
        if (!entry) return;
        scrollListView.style.display = 'none';
        scrollEditor.style.display = 'flex';
        ScrollModule.renderEditor(scrollEditor, entry,
          () => renderScrollList(scrollPage, listContent),
          () => renderScrollList(scrollPage, listContent),
        );
      });
    }

    /* Wheel page: back, new, saved buttons */
    const wheelPage = getPage('wheel');
    if (wheelPage) {
      wheelPage.querySelector('#btn-back-wheel').addEventListener('click', goHome);
      wheelPage.querySelector('#btn-new-wheel').addEventListener('click', openNewWheel);
      wheelPage.querySelector('#btn-saved-wheels').addEventListener('click', showSavedWheels);
      wheelPage.querySelector('#btn-back-wheel-screen').addEventListener('click', () => {
        wheelPage.querySelector('#wheel-screen').style.display = 'none';
        wheelPage.querySelector('#wheel-landing').style.display = 'flex';
        const outerHdr = wheelPage.querySelector('#wheel-page-header');
        if (outerHdr) outerHdr.style.display = 'flex';
      });
      wheelPage.querySelector('#btn-back-saved').addEventListener('click', () => {
        wheelPage.querySelector('#wheel-saved-screen').style.display = 'none';
        wheelPage.querySelector('#wheel-landing').style.display = 'flex';
        const outerHdr = wheelPage.querySelector('#wheel-page-header');
        if (outerHdr) outerHdr.style.display = 'flex';
      });
      wheelPage.querySelector('#btn-save-wheel').addEventListener('click', () => {
        if (!currentWheelData) return;
        const wheels = Store.getWheels();
        const existing = wheels.findIndex(w => w.id === currentWheelData.id);
        if (existing >= 0) wheels[existing] = currentWheelData;
        else wheels.push({ ...currentWheelData });
        Store.setWheels(wheels);
        const btn = wheelPage.querySelector('#btn-save-wheel');
        btn.textContent = 'Saved!';
        setTimeout(() => btn.textContent = 'Save', 1800);
      });
      wireSpinButton();
    }

    /* New wheel overlay */
    const nwOverlay = document.getElementById('overlay-new-wheel');
    if (nwOverlay) {
      nwOverlay.querySelector('#btn-add-wheel-entry').addEventListener('click', () => {
        const list = nwOverlay.querySelector('#new-wheel-entries');
        addWheelEntry(list, '');
        updateWheelPreview(nwOverlay);
      });
      nwOverlay.querySelector('#btn-create-wheel').addEventListener('click', () => collectAndLaunchWheel(nwOverlay));
      nwOverlay.addEventListener('click', e => {
        if (e.target === nwOverlay) nwOverlay.classList.remove('open');
      });
    }

    /* Forge page: back */
    const forgePage = getPage('forge');
    if (forgePage) {
      forgePage.querySelector('#btn-back-forge').addEventListener('click', goHome);
    }

    /* Loot page: back */
    const lootPage = getPage('loot');
    if (lootPage) {
      lootPage.querySelector('#btn-back-loot').addEventListener('click', goHome);
    }

    /* Render home avatar after all scripts loaded */
    renderHomeAvatar();
  }

  /* Wait for DOM then init */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
