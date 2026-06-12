/* ============================================================
   Gavin's World — The Scroll module
   4 entry types: Quest, Idea Drop, Ranking, Wishlist
   ============================================================ */

const ScrollModule = (() => {
  const TYPES = {
    quest:    { label: 'Quest',      icon: '⚔️',  badge: 'badge-blue',   desc: 'Checklist' },
    idea:     { label: 'Idea Drop',  icon: '💡',  badge: 'badge-orange', desc: 'Notes' },
    ranking:  { label: 'Ranking',    icon: '🏆',  badge: 'badge-silver', desc: 'Ordered list' },
    wishlist: { label: 'Wishlist',   icon: '⭐',  badge: 'badge-green',  desc: 'Want list' },
  };

  function fmtDate(ts) {
    const d = new Date(ts);
    const now = Date.now();
    const diff = now - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function previewText(entry) {
    if (entry.type === 'quest') return entry.items.map(i => i.text).join(' · ').slice(0, 60) || 'No items yet';
    if (entry.type === 'idea') return (entry.text || '').slice(0, 80) || 'Empty note';
    if (entry.type === 'ranking') return entry.items.map((it, i) => `${i + 1}. ${it}`).join(' · ').slice(0, 60) || 'No items yet';
    if (entry.type === 'wishlist') return entry.items.map(it => it.text).join(' · ').slice(0, 60) || 'Nothing yet';
    return '';
  }

  /* ---- Render the list page ---- */
  function renderList(container) {
    const scrolls = Store.getScrolls();
    container.innerHTML = '';
    if (!scrolls.length) {
      container.innerHTML = `<div class="empty-state">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="8" width="36" height="44" rx="4" stroke="#5a7096" stroke-width="2"/>
          <line x1="20" y1="20" x2="40" y2="20" stroke="#5a7096" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="28" x2="36" y2="28" stroke="#5a7096" stroke-width="2" stroke-linecap="round"/>
          <line x1="20" y1="36" x2="32" y2="36" stroke="#5a7096" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <p>No entries yet.<br>Tap <strong>+</strong> to write your first one.</p>
      </div>`;
      return;
    }
    scrolls.slice().reverse().forEach(entry => {
      const t = TYPES[entry.type] || TYPES.idea;
      const card = document.createElement('div');
      card.className = 'card scroll-card anim-fade-in-up';
      card.dataset.type = entry.type;
      card.dataset.id = entry.id;
      card.innerHTML = `
        <div class="scroll-card-bar"></div>
        <div class="scroll-card-body">
          <div class="scroll-card-meta">
            <span class="badge ${t.badge}">${t.icon} ${t.label}</span>
            <span class="scroll-card-date">${fmtDate(entry.ts)}</span>
          </div>
          <div class="scroll-card-title">${escHtml(entry.title || 'Untitled')}</div>
          <div class="scroll-card-preview">${escHtml(previewText(entry))}</div>
        </div>`;
      container.appendChild(card);
    });
  }

  /* ---- Editor forms per type ---- */
  function renderEditor(container, entry, onSave, onDelete) {
    container.innerHTML = '';
    const type = entry.type;

    const header = document.createElement('div');
    header.className = 'page-header';
    header.innerHTML = `
      <button class="btn-back btn-back-editor">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M10 3 L5 8 L10 13"/>
        </svg>
        Back
      </button>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn-ghost btn-delete-entry" style="color:#f87171;">Delete</button>
        <button class="btn-primary btn-save-entry">Save</button>
      </div>`;
    container.appendChild(header);

    const body = document.createElement('div');
    body.className = 'scroll-editor-body';

    /* Title */
    const titleField = document.createElement('div');
    titleField.className = 'field-group';
    titleField.innerHTML = `
      <label class="field-label">Title</label>
      <input class="field-input entry-title" type="text" placeholder="Name this entry…" value="${escHtml(entry.title || '')}"/>`;
    body.appendChild(titleField);

    if (type === 'quest') {
      body.appendChild(makeQuestEditor(entry));
    } else if (type === 'idea') {
      body.appendChild(makeIdeaEditor(entry));
    } else if (type === 'ranking') {
      body.appendChild(makeRankingEditor(entry));
    } else if (type === 'wishlist') {
      body.appendChild(makeWishlistEditor(entry));
    }

    container.appendChild(body);

    /* Wire save / delete / back */
    container.querySelector('.btn-save-entry').addEventListener('click', () => {
      entry.title = container.querySelector('.entry-title').value.trim() || 'Untitled';
      collectEntryData(container, entry);
      entry.ts = Date.now();
      const scrolls = Store.getScrolls();
      const idx = scrolls.findIndex(s => s.id === entry.id);
      if (idx >= 0) scrolls[idx] = entry; else scrolls.push(entry);
      Store.setScrolls(scrolls);
      onSave(entry);
    });

    container.querySelector('.btn-delete-entry').addEventListener('click', () => {
      if (!confirm('Delete this entry?')) return;
      const scrolls = Store.getScrolls().filter(s => s.id !== entry.id);
      Store.setScrolls(scrolls);
      onDelete();
    });

    container.querySelector('.btn-back-editor').addEventListener('click', () => onDelete());
  }

  function makeQuestEditor(entry) {
    entry.items = entry.items || [];
    const wrap = document.createElement('div');
    wrap.className = 'field-group';
    const lbl = document.createElement('div');
    lbl.className = 'field-label';
    lbl.textContent = 'Quest Items';
    wrap.appendChild(lbl);

    const list = document.createElement('div');
    list.className = 'quest-item-list';

    const addItem = (item = { text: '', done: false }) => {
      const row = document.createElement('div');
      row.className = 'quest-item' + (item.done ? ' done' : '');
      row.dataset.done = item.done ? '1' : '0';
      row.innerHTML = `
        <div class="quest-check">${item.done ? '<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : ''}</div>
        <input class="quest-text field-input" type="text" placeholder="Quest item…" value="${escHtml(item.text)}"/>
        <button class="btn-remove-entry" title="Remove">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>`;
      row.querySelector('.quest-check').addEventListener('click', () => {
        row.dataset.done = row.dataset.done === '1' ? '0' : '1';
        row.classList.toggle('done');
        const chk = row.querySelector('.quest-check');
        chk.innerHTML = row.dataset.done === '1' ? '<svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round"/></svg>' : '';
      });
      row.querySelector('.btn-remove-entry').addEventListener('click', () => row.remove());
      list.appendChild(row);
    };

    if (!entry.items.length) entry.items.push({ text: '', done: false });
    entry.items.forEach(addItem);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.style.marginTop = '8px';
    addBtn.innerHTML = '+';
    addBtn.title = 'Add item';
    addBtn.addEventListener('click', () => addItem());

    const footer = document.createElement('div');
    footer.style.display = 'flex'; footer.style.justifyContent = 'flex-start'; footer.style.marginTop = '8px';
    footer.appendChild(addBtn);

    wrap.appendChild(list);
    wrap.appendChild(footer);
    wrap._list = list;
    return wrap;
  }

  function makeIdeaEditor(entry) {
    const wrap = document.createElement('div');
    wrap.className = 'field-group';
    wrap.innerHTML = `
      <label class="field-label">Your Idea</label>
      <textarea class="field-textarea idea-text" placeholder="Dump it all here…" style="min-height:180px;">${escHtml(entry.text || '')}</textarea>`;
    return wrap;
  }

  function makeRankingEditor(entry) {
    entry.items = entry.items || [];
    const wrap = document.createElement('div');
    wrap.className = 'field-group';
    const lbl = document.createElement('div');
    lbl.className = 'field-label';
    lbl.textContent = 'Rankings (best → least)';
    wrap.appendChild(lbl);

    const list = document.createElement('div');
    list.className = 'rank-item-list';
    list.style.display = 'flex'; list.style.flexDirection = 'column'; list.style.gap = '8px';

    const refreshNums = () => {
      list.querySelectorAll('.rank-num').forEach((el, i) => { el.textContent = i + 1 + '.'; });
    };

    const addItem = (text = '') => {
      const row = document.createElement('div');
      row.className = 'rank-item';
      row.innerHTML = `
        <span class="rank-num">1.</span>
        <input class="rank-text field-input" type="text" placeholder="Enter item…" value="${escHtml(text)}"/>
        <button class="btn-remove-entry" title="Remove">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>`;
      row.querySelector('.btn-remove-entry').addEventListener('click', () => { row.remove(); refreshNums(); });
      list.appendChild(row);
      refreshNums();
    };

    if (!entry.items.length) entry.items.push('');
    entry.items.forEach(addItem);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.style.marginTop = '8px';
    addBtn.innerHTML = '+';
    addBtn.title = 'Add rank';
    addBtn.addEventListener('click', () => addItem());

    const footer = document.createElement('div');
    footer.style.display = 'flex'; footer.style.justifyContent = 'flex-start'; footer.style.marginTop = '8px';
    footer.appendChild(addBtn);

    wrap.appendChild(list);
    wrap.appendChild(footer);
    return wrap;
  }

  function makeWishlistEditor(entry) {
    entry.items = entry.items || [];
    const wrap = document.createElement('div');
    wrap.className = 'field-group';
    const lbl = document.createElement('div');
    lbl.className = 'field-label';
    lbl.textContent = 'Wish Items';
    wrap.appendChild(lbl);

    const list = document.createElement('div');
    list.className = 'wish-item-list';
    list.style.display = 'flex'; list.style.flexDirection = 'column'; list.style.gap = '8px';

    const addItem = (item = { text: '', star: false }) => {
      const row = document.createElement('div');
      row.className = 'wish-item';
      row.dataset.star = item.star ? '1' : '0';
      row.innerHTML = `
        <span class="wish-star" title="Toggle priority">${item.star ? '⭐' : '☆'}</span>
        <input class="wish-text field-input" type="text" placeholder="I want…" value="${escHtml(item.text)}"/>
        <button class="btn-remove-entry" title="Remove">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
        </button>`;
      row.querySelector('.wish-star').addEventListener('click', (e) => {
        row.dataset.star = row.dataset.star === '1' ? '0' : '1';
        e.target.textContent = row.dataset.star === '1' ? '⭐' : '☆';
      });
      row.querySelector('.btn-remove-entry').addEventListener('click', () => row.remove());
      list.appendChild(row);
    };

    if (!entry.items.length) entry.items.push({ text: '', star: false });
    entry.items.forEach(addItem);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn-add';
    addBtn.style.marginTop = '8px';
    addBtn.innerHTML = '+';
    addBtn.addEventListener('click', () => addItem());

    const footer = document.createElement('div');
    footer.style.display = 'flex'; footer.style.justifyContent = 'flex-start'; footer.style.marginTop = '8px';
    footer.appendChild(addBtn);

    wrap.appendChild(list);
    wrap.appendChild(footer);
    return wrap;
  }

  /* Collect the edited data back into the entry object */
  function collectEntryData(container, entry) {
    if (entry.type === 'quest') {
      entry.items = [...container.querySelectorAll('.quest-item')].map(row => ({
        text: row.querySelector('.quest-text').value.trim(),
        done: row.dataset.done === '1',
      })).filter(i => i.text);
    } else if (entry.type === 'idea') {
      entry.text = container.querySelector('.idea-text').value;
    } else if (entry.type === 'ranking') {
      entry.items = [...container.querySelectorAll('.rank-text')].map(i => i.value.trim()).filter(Boolean);
    } else if (entry.type === 'wishlist') {
      entry.items = [...container.querySelectorAll('.wish-item')].map(row => ({
        text: row.querySelector('.wish-text').value.trim(),
        star: row.dataset.star === '1',
      })).filter(i => i.text);
    }
  }

  /* Blank entry skeleton */
  function newEntry(type) {
    const base = { id: Store.uid(), type, title: '', ts: Date.now() };
    if (type === 'quest')    return { ...base, items: [] };
    if (type === 'idea')     return { ...base, text: '' };
    if (type === 'ranking')  return { ...base, items: [] };
    if (type === 'wishlist') return { ...base, items: [] };
    return base;
  }

  function escHtml(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { TYPES, renderList, renderEditor, newEntry, escHtml };
})();
