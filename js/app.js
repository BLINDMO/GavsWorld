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
      svg.setAttribute('viewBox', '-80 -240 160 380');
      previewPane.appendChild(svg);
    }
    avatarPreviewEl = page.querySelector('.avatar-preview-pane svg');
    Avatar.update(avatarPreviewEl, avatarCreatorState);

    /* build tabs if not built yet */
    if (optionsPane.querySelector('.avatar-tab-content[data-content="appearance"]')) return;

    const tabs = optionsPane.querySelector('.avatar-tabs');
    if (tabs) tabs.innerHTML = `
      <button class="avatar-tab active" data-tab="appearance">Look</button>
      <button class="avatar-tab" data-tab="outfit">Outfit</button>
      <button class="avatar-tab" data-tab="loadout">Loadout</button>`;

    /* Appearance content */
    const appearDiv = document.createElement('div');
    appearDiv.className = 'avatar-tab-content active';
    appearDiv.dataset.content = 'appearance';
    appearDiv.style.display = 'flex';

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
    appearDiv.appendChild(skinSec);

    /* Hair style */
    const hairStyleSec = document.createElement('div');
    hairStyleSec.className = 'field-group';
    hairStyleSec.innerHTML = `<div class="field-label">Hair Style</div>`;
    const hairGrid = document.createElement('div');
    hairGrid.className = 'hair-grid';
    Avatar.HAIR_STYLES.forEach(h => {
      const btn = document.createElement('div');
      btn.className = 'hair-choice' + (avatarCreatorState.hairStyle === h ? ' active' : '');
      btn.dataset.hair = h;
      btn.innerHTML = `<span style="font-size:.65rem;color:var(--text2);letter-spacing:.04em;text-transform:uppercase;font-weight:600;">${h}</span>`;
      btn.addEventListener('click', () => {
        avatarCreatorState.hairStyle = h;
        hairGrid.querySelectorAll('.hair-choice').forEach(b => b.classList.toggle('active', b.dataset.hair === h));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      hairGrid.appendChild(btn);
    });
    hairStyleSec.appendChild(hairGrid);
    appearDiv.appendChild(hairStyleSec);

    /* Hair color */
    const hairColorSec = document.createElement('div');
    hairColorSec.className = 'field-group';
    hairColorSec.innerHTML = `<div class="field-label">Hair Color</div><div class="swatch-grid" id="ac-hair-color-grid"></div>`;
    const hairColorGrid = hairColorSec.querySelector('#ac-hair-color-grid');
    Avatar.HAIR_COLORS.forEach(c => {
      const sw = document.createElement('div');
      sw.className = 'swatch' + (avatarCreatorState.hairColor === c ? ' active' : '');
      sw.style.background = c;
      sw.addEventListener('click', () => {
        avatarCreatorState.hairColor = c;
        hairColorGrid.querySelectorAll('.swatch').forEach(s => s.classList.toggle('active', s === sw));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      hairColorGrid.appendChild(sw);
    });
    appearDiv.appendChild(hairColorSec);

    /* Eye style */
    const eyeStyleSec = document.createElement('div');
    eyeStyleSec.className = 'field-group';
    eyeStyleSec.innerHTML = `<div class="field-label">Eye Style</div>`;
    const eyeGrid = document.createElement('div');
    eyeGrid.className = 'eye-grid';
    Avatar.EYE_STYLES.forEach(e => {
      const btn = document.createElement('div');
      btn.className = 'eye-choice' + (avatarCreatorState.eyeStyle === e ? ' active' : '');
      btn.dataset.eye = e;
      btn.innerHTML = `<span style="font-size:.65rem;color:var(--text2);letter-spacing:.04em;text-transform:uppercase;font-weight:600;">${e}</span>`;
      btn.addEventListener('click', () => {
        avatarCreatorState.eyeStyle = e;
        eyeGrid.querySelectorAll('.eye-choice').forEach(b => b.classList.toggle('active', b.dataset.eye === e));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      eyeGrid.appendChild(btn);
    });
    eyeStyleSec.appendChild(eyeGrid);
    appearDiv.appendChild(eyeStyleSec);

    /* Eye color */
    const eyeColorSec = document.createElement('div');
    eyeColorSec.className = 'field-group';
    eyeColorSec.innerHTML = `<div class="field-label">Eye Color</div>
      <input type="color" class="color-picker-inline" value="${avatarCreatorState.eyeColor || '#2a5fc8'}"/>`;
    eyeColorSec.querySelector('input').addEventListener('input', e => {
      avatarCreatorState.eyeColor = e.target.value;
      Avatar.update(avatarPreviewEl, avatarCreatorState);
    });
    appearDiv.appendChild(eyeColorSec);

    /* Outfit content */
    const outfitDiv = document.createElement('div');
    outfitDiv.className = 'avatar-tab-content';
    outfitDiv.dataset.content = 'outfit';
    outfitDiv.style.display = 'none';

    const costSec = document.createElement('div');
    costSec.className = 'field-group';
    costSec.innerHTML = `<div class="field-label">Outfit</div>`;
    const cosGrid = document.createElement('div');
    cosGrid.className = 'costume-grid';
    Object.entries(Avatar.COSTUMES).forEach(([id, cos]) => {
      const card = document.createElement('div');
      card.className = 'costume-card' + (avatarCreatorState.costume === id ? ' active' : '');
      card.dataset.cos = id;
      card.innerHTML = `<span class="costume-icon">${cos.icon}</span><span class="costume-name">${cos.name}</span>`;
      card.addEventListener('click', () => {
        avatarCreatorState.costume = id;
        cosGrid.querySelectorAll('.costume-card').forEach(c => c.classList.toggle('active', c.dataset.cos === id));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      cosGrid.appendChild(card);
    });
    costSec.appendChild(cosGrid);
    outfitDiv.appendChild(costSec);

    /* Accessories */
    const accSec = document.createElement('div');
    accSec.className = 'field-group';
    accSec.innerHTML = `<div class="field-label">Accessory</div>`;
    const accGrid = document.createElement('div');
    accGrid.className = 'costume-grid';
    Object.entries(Avatar.ACCESSORIES).forEach(([id, acc]) => {
      const card = document.createElement('div');
      card.className = 'costume-card' + (avatarCreatorState.accessory === id ? ' active' : '');
      card.dataset.acc = id;
      card.innerHTML = `<span class="costume-icon">${acc.icon}</span><span class="costume-name">${acc.name}</span>`;
      card.addEventListener('click', () => {
        avatarCreatorState.accessory = id;
        accGrid.querySelectorAll('.costume-card').forEach(c => c.classList.toggle('active', c.dataset.acc === id));
        Avatar.update(avatarPreviewEl, avatarCreatorState);
      });
      accGrid.appendChild(card);
    });
    accSec.appendChild(accGrid);
    outfitDiv.appendChild(accSec);

    /* Cape/aura color */
    const capeColorSec = document.createElement('div');
    capeColorSec.className = 'field-group';
    capeColorSec.innerHTML = `<div class="field-label">Cape / Aura Color</div>
      <input type="color" class="color-picker-inline" value="${avatarCreatorState.capeColor || '#1a2a6e'}"/>`;
    capeColorSec.querySelector('input').addEventListener('input', e => {
      avatarCreatorState.capeColor = e.target.value;
      avatarCreatorState.auraColor = e.target.value;
      Avatar.update(avatarPreviewEl, avatarCreatorState);
    });
    outfitDiv.appendChild(capeColorSec);

    /* Loadout content (equip swords from armory) */
    const loadoutDiv = document.createElement('div');
    loadoutDiv.className = 'avatar-tab-content';
    loadoutDiv.dataset.content = 'loadout';
    loadoutDiv.style.display = 'none';

    function refreshLoadout() {
      loadoutDiv.innerHTML = '<div class="field-label" style="margin-bottom:8px">Equip a sword from The Armory</div>';
      const armory = Forge.getArmoryForAvatar();
      if (!armory.length) {
        loadoutDiv.innerHTML += '<p style="color:var(--text3);font-size:.85rem">No saved designs yet.<br>Create a sword in The Forge first.</p>';
      } else {
        /* Unequip option */
        const unequip = document.createElement('button');
        unequip.className = 'btn-secondary';
        unequip.style.marginBottom = '10px';
        unequip.textContent = 'Unequip sword';
        unequip.addEventListener('click', () => {
          avatarCreatorState.equippedSwordConfig = null;
          Avatar.update(avatarPreviewEl, avatarCreatorState);
        });
        loadoutDiv.appendChild(unequip);

        armory.forEach(item => {
          const btn = document.createElement('div');
          btn.className = 'card armory-card';
          btn.style.cursor = 'pointer';
          const thumbSvg = Swords.thumb(item.swordCfg, '');
          btn.innerHTML = `<div class="armory-thumb">${thumbSvg}</div>
            <div class="armory-info"><div class="armory-name">${ScrollModule.escHtml(item.name)}</div></div>`;
          btn.addEventListener('click', () => {
            avatarCreatorState.equippedSwordConfig = item.swordCfg;
            Avatar.update(avatarPreviewEl, avatarCreatorState);
          });
          loadoutDiv.appendChild(btn);
        });
      }
    }

    loadoutDiv.addEventListener('click', () => {}); // ensure event delegation works
    optionsPane.addEventListener('shown', e => { if (e.detail === 'loadout') refreshLoadout(); });

    optionsPane.appendChild(appearDiv);
    optionsPane.appendChild(outfitDiv);
    optionsPane.appendChild(loadoutDiv);

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
      if (tab === 'loadout') refreshLoadout();
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
        const stage = page.querySelector('#wheel-stage');
        const winnerEl = page.querySelector('#wheel-winner');
        const winnerText = page.querySelector('#wheel-winner-text');
        const label = typeof entry === 'string' ? entry : (entry.label || '');
        winnerText.textContent = label;
        winnerEl.classList.add('show');
        Wheel.burst(stage);
      });
      wheelInited = true;
    }
    Wheel.load(wheelData);

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

  /* ---- Wire pull handle ---- */
  function wireHandle() {
    const page = getPage('wheel');
    const knob = page.querySelector('#handle-knob');
    const track = page.querySelector('#handle-track');
    if (!knob || !track) return;

    knob.addEventListener('pointerdown', e => Wheel.handlePointerDown(e, knob, track));
    window.addEventListener('pointermove', e => Wheel.handlePointerMove(e, knob, track));
    window.addEventListener('pointerup', () => Wheel.handlePointerUp(knob));
    knob.addEventListener('touchstart', e => Wheel.handlePointerDown(e, knob, track), { passive: false });
    window.addEventListener('touchmove', e => Wheel.handlePointerMove(e, knob, track), { passive: false });
    window.addEventListener('touchend', () => Wheel.handlePointerUp(knob));
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
        if (mod === 'scroll') openScrollPage();
        if (mod === 'wheel')  openWheelPage();
        if (mod === 'forge')  openForgePage();
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
      });
      wheelPage.querySelector('#btn-back-saved').addEventListener('click', () => {
        wheelPage.querySelector('#wheel-saved-screen').style.display = 'none';
        wheelPage.querySelector('#wheel-landing').style.display = 'flex';
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
      wireHandle();
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
