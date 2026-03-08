// ============================================
// CSS Custom Properties / Design Token Manager
// ============================================

(function () {
  'use strict';

  // ---- State ----

  const CATEGORIES = {
    colors: 'Colors',
    typography: 'Typography',
    spacing: 'Spacing',
    shadows: 'Shadows',
    borders: 'Borders',
    misc: 'Misc',
  };

  const CATEGORY_ICONS = {
    colors: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>',
    typography: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    spacing: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="12" y1="3" x2="12" y2="21"/></svg>',
    shadows: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="12" height="12" rx="2"/><rect x="8" y="8" width="12" height="12" rx="2"/></svg>',
    borders: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>',
    misc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  };

  let variables = [];
  let activeCategory = 'all';
  let searchQuery = '';
  let editingId = null;

  // ---- Presets ----

  const PRESETS = {
    dark: [
      { name: 'primary', value: '#6366f1', category: 'colors' },
      { name: 'primary-hover', value: '#818cf8', category: 'colors' },
      { name: 'bg-base', value: '#0f0f13', category: 'colors' },
      { name: 'bg-surface', value: '#1a1a24', category: 'colors' },
      { name: 'bg-elevated', value: '#22222e', category: 'colors' },
      { name: 'text-primary', value: '#e2e2e8', category: 'colors' },
      { name: 'text-secondary', value: '#9898ac', category: 'colors' },
      { name: 'text-muted', value: '#5a5a6e', category: 'colors' },
      { name: 'border', value: '#2e2e3e', category: 'colors' },
      { name: 'danger', value: '#ef4444', category: 'colors' },
      { name: 'success', value: '#22c55e', category: 'colors' },
      { name: 'font-family', value: "'Inter', sans-serif", category: 'typography' },
      { name: 'font-size-base', value: '14px', category: 'typography' },
      { name: 'font-size-sm', value: '12px', category: 'typography' },
      { name: 'font-size-lg', value: '18px', category: 'typography' },
      { name: 'font-size-xl', value: '24px', category: 'typography' },
      { name: 'line-height', value: '1.5', category: 'typography' },
      { name: 'font-weight-normal', value: '400', category: 'typography' },
      { name: 'font-weight-bold', value: '700', category: 'typography' },
      { name: 'spacing-xs', value: '4px', category: 'spacing' },
      { name: 'spacing-sm', value: '8px', category: 'spacing' },
      { name: 'spacing-md', value: '16px', category: 'spacing' },
      { name: 'spacing-lg', value: '24px', category: 'spacing' },
      { name: 'spacing-xl', value: '32px', category: 'spacing' },
      { name: 'shadow-sm', value: '0 1px 3px rgba(0,0,0,0.4)', category: 'shadows' },
      { name: 'shadow-md', value: '0 4px 12px rgba(0,0,0,0.5)', category: 'shadows' },
      { name: 'shadow-lg', value: '0 10px 40px rgba(0,0,0,0.6)', category: 'shadows' },
      { name: 'radius-sm', value: '4px', category: 'borders' },
      { name: 'radius-md', value: '8px', category: 'borders' },
      { name: 'radius-lg', value: '12px', category: 'borders' },
      { name: 'border-width', value: '1px', category: 'borders' },
      { name: 'transition-fast', value: '100ms ease', category: 'misc' },
      { name: 'transition-base', value: '200ms ease', category: 'misc' },
    ],
    light: [
      { name: 'primary', value: '#4f46e5', category: 'colors' },
      { name: 'primary-hover', value: '#6366f1', category: 'colors' },
      { name: 'bg-base', value: '#ffffff', category: 'colors' },
      { name: 'bg-surface', value: '#f8f8fa', category: 'colors' },
      { name: 'bg-elevated', value: '#f0f0f4', category: 'colors' },
      { name: 'text-primary', value: '#1a1a2e', category: 'colors' },
      { name: 'text-secondary', value: '#555570', category: 'colors' },
      { name: 'text-muted', value: '#8888a0', category: 'colors' },
      { name: 'border', value: '#e0e0e8', category: 'colors' },
      { name: 'danger', value: '#dc2626', category: 'colors' },
      { name: 'success', value: '#16a34a', category: 'colors' },
      { name: 'font-family', value: "'Inter', sans-serif", category: 'typography' },
      { name: 'font-size-base', value: '14px', category: 'typography' },
      { name: 'font-size-sm', value: '12px', category: 'typography' },
      { name: 'font-size-lg', value: '18px', category: 'typography' },
      { name: 'font-size-xl', value: '24px', category: 'typography' },
      { name: 'line-height', value: '1.5', category: 'typography' },
      { name: 'font-weight-normal', value: '400', category: 'typography' },
      { name: 'font-weight-bold', value: '700', category: 'typography' },
      { name: 'spacing-xs', value: '4px', category: 'spacing' },
      { name: 'spacing-sm', value: '8px', category: 'spacing' },
      { name: 'spacing-md', value: '16px', category: 'spacing' },
      { name: 'spacing-lg', value: '24px', category: 'spacing' },
      { name: 'spacing-xl', value: '32px', category: 'spacing' },
      { name: 'shadow-sm', value: '0 1px 3px rgba(0,0,0,0.08)', category: 'shadows' },
      { name: 'shadow-md', value: '0 4px 12px rgba(0,0,0,0.1)', category: 'shadows' },
      { name: 'shadow-lg', value: '0 10px 40px rgba(0,0,0,0.12)', category: 'shadows' },
      { name: 'radius-sm', value: '4px', category: 'borders' },
      { name: 'radius-md', value: '8px', category: 'borders' },
      { name: 'radius-lg', value: '12px', category: 'borders' },
      { name: 'border-width', value: '1px', category: 'borders' },
      { name: 'transition-fast', value: '100ms ease', category: 'misc' },
      { name: 'transition-base', value: '200ms ease', category: 'misc' },
    ],
  };

  // ---- DOM References ----

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    categoryNav: $('#categoryNav'),
    variablesList: $('#variablesList'),
    emptyState: $('#emptyState'),
    panelTitle: $('#panelTitle'),
    variableCount: $('#variableCount'),
    searchInput: $('#searchInput'),
    // Add modal
    addModal: $('#addModal'),
    modalTitle: $('#modalTitle'),
    modalClose: $('#modalClose'),
    modalCancel: $('#modalCancel'),
    modalSave: $('#modalSave'),
    varCategory: $('#varCategory'),
    varName: $('#varName'),
    varValue: $('#varValue'),
    varColorPicker: $('#varColorPicker'),
    // Import modal
    importModal: $('#importModal'),
    importBtn: $('#importBtn'),
    importModalClose: $('#importModalClose'),
    importModalCancel: $('#importModalCancel'),
    importModalConfirm: $('#importModalConfirm'),
    importTextarea: $('#importTextarea'),
    // Export modal
    exportModal: $('#exportModal'),
    exportModalTitle: $('#exportModalTitle'),
    exportModalClose: $('#exportModalClose'),
    exportModalDone: $('#exportModalDone'),
    exportOutput: $('#exportOutput'),
    copyExportBtn: $('#copyExportBtn'),
    exportCssBtn: $('#exportCssBtn'),
    exportScssBtn: $('#exportScssBtn'),
    exportJsonBtn: $('#exportJsonBtn'),
    // Presets modal
    presetsModal: $('#presetsModal'),
    presetsBtn: $('#presetsBtn'),
    presetsModalClose: $('#presetsModalClose'),
    // Others
    addVariableBtn: $('#addVariableBtn'),
    previewStyles: $('#previewStyles'),
    toast: $('#toast'),
  };

  // ---- Helpers ----

  let idCounter = 0;
  function genId() { return 'v_' + (++idCounter) + '_' + Date.now(); }

  function isColorValue(val) {
    if (!val) return false;
    const v = val.trim().toLowerCase();
    if (v.startsWith('#')) return true;
    if (v.startsWith('rgb')) return true;
    if (v.startsWith('hsl')) return true;
    const namedColors = ['red','blue','green','black','white','gray','grey','orange','purple','yellow','pink','cyan','magenta','brown','transparent'];
    if (namedColors.includes(v)) return true;
    return false;
  }

  function hexFromValue(val) {
    if (!val) return '#000000';
    const v = val.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      return '#' + v[1]+v[1] + v[2]+v[2] + v[3]+v[3];
    }
    // Try to parse rgb/hsl via canvas
    try {
      const ctx = document.createElement('canvas').getContext('2d');
      ctx.fillStyle = v;
      return ctx.fillStyle;
    } catch { return '#000000'; }
  }

  function guessCategory(name) {
    const n = name.toLowerCase();
    if (/color|bg|background|text-color|accent|brand|primary|secondary|danger|success|warning|info/.test(n)) return 'colors';
    if (/font|size|weight|line-height|letter|text|heading/.test(n)) return 'typography';
    if (/spacing|margin|padding|gap/.test(n)) return 'spacing';
    if (/shadow|elevation/.test(n)) return 'shadows';
    if (/border|radius|outline|stroke/.test(n)) return 'borders';
    return 'misc';
  }

  // ---- Rendering ----

  function render() {
    renderCategories();
    renderVariables();
    updatePreview();
    saveToStorage();
  }

  function renderCategories() {
    const counts = { all: variables.length };
    Object.keys(CATEGORIES).forEach(c => { counts[c] = 0; });
    variables.forEach(v => { counts[v.category] = (counts[v.category] || 0) + 1; });

    let html = `<div class="category-item ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">
      <span>All</span>
      <span class="category-count">${counts.all}</span>
    </div>`;

    Object.entries(CATEGORIES).forEach(([key, label]) => {
      html += `<div class="category-item ${activeCategory === key ? 'active' : ''}" data-cat="${key}">
        <span style="display:flex;align-items:center;gap:8px">${CATEGORY_ICONS[key]} ${label}</span>
        <span class="category-count">${counts[key]}</span>
      </div>`;
    });

    els.categoryNav.innerHTML = html;
  }

  function getFilteredVariables() {
    let filtered = variables;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(v => v.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.name.toLowerCase().includes(q) ||
        v.value.toLowerCase().includes(q) ||
        CATEGORIES[v.category].toLowerCase().includes(q)
      );
    }
    return filtered;
  }

  function renderVariables() {
    const filtered = getFilteredVariables();
    const title = activeCategory === 'all' ? 'All Variables' : CATEGORIES[activeCategory];
    els.panelTitle.textContent = title;
    els.variableCount.textContent = `${filtered.length} variable${filtered.length !== 1 ? 's' : ''}`;

    if (filtered.length === 0) {
      els.variablesList.innerHTML = '';
      els.emptyState.classList.add('visible');
      return;
    }

    els.emptyState.classList.remove('visible');

    els.variablesList.innerHTML = filtered.map(v => {
      const isColor = v.category === 'colors' || isColorValue(v.value);
      const swatchHtml = isColor
        ? `<div class="variable-swatch" style="background:${v.value}">
            <input type="color" value="${hexFromValue(v.value)}" data-id="${v.id}" data-action="swatch" />
          </div>`
        : `<div class="variable-swatch-placeholder">--</div>`;

      return `<div class="variable-row" data-id="${v.id}">
        ${swatchHtml}
        <div class="variable-info">
          <div class="variable-name">--${v.name}</div>
          <div class="variable-category-tag">${CATEGORIES[v.category]}</div>
        </div>
        <input class="variable-value-input" type="text" value="${escapeAttr(v.value)}" data-id="${v.id}" data-action="value" />
        <div class="variable-actions">
          <button class="btn-icon" data-id="${v.id}" data-action="edit" title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon danger" data-id="${v.id}" data-action="delete" title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`;
    }).join('');
  }

  function escapeAttr(s) {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- Preview ----

  function updatePreview() {
    const mappings = {
      'primary': '--pv-primary',
      'primary-hover': '--pv-primary:hover',
      'bg-base': '--pv-input-bg',
      'bg-surface': '--pv-card-bg',
      'bg-elevated': '--pv-secondary',
      'text-primary': '--pv-text',
      'text-secondary': '--pv-text-secondary',
      'text-muted': '--pv-text-tertiary',
      'border': '--pv-border',
      'radius-md': '--pv-radius',
      'font-size-base': '--pv-font-size',
      'shadow-md': '--pv-shadow',
    };

    let css = '#previewContent {\n';
    variables.forEach(v => {
      const mapped = mappings[v.name];
      if (mapped) {
        css += `  ${mapped}: ${v.value};\n`;
      }
    });

    // Map primary text color (white for dark primary, dark for light primary)
    const primary = variables.find(v => v.name === 'primary');
    if (primary) {
      css += `  --pv-primary: ${primary.value};\n`;
      css += `  --pv-primary-text: #fff;\n`;
    }

    const bgElevated = variables.find(v => v.name === 'bg-elevated');
    if (bgElevated) {
      css += `  --pv-secondary: ${bgElevated.value};\n`;
      const textPrimary = variables.find(v => v.name === 'text-primary');
      css += `  --pv-secondary-text: ${textPrimary ? textPrimary.value : '#e8e8f0'};\n`;
    }

    css += '}\n';
    els.previewStyles.textContent = css;
  }

  // ---- CRUD ----

  function addVariable(name, value, category) {
    const clean = name.replace(/^-+/, '').trim();
    if (!clean) return;
    variables.push({ id: genId(), name: clean, value: value.trim(), category });
    render();
  }

  function updateVariable(id, updates) {
    const v = variables.find(x => x.id === id);
    if (!v) return;
    Object.assign(v, updates);
    render();
  }

  function deleteVariable(id) {
    variables = variables.filter(x => x.id !== id);
    render();
  }

  // ---- Import ----

  function importCSS(text) {
    const regex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let match;
    let count = 0;
    while ((match = regex.exec(text)) !== null) {
      const name = match[1].trim();
      const value = match[2].trim();
      // Don't duplicate
      const existing = variables.find(v => v.name === name);
      if (existing) {
        existing.value = value;
      } else {
        const category = guessCategory(name);
        variables.push({ id: genId(), name, value, category });
      }
      count++;
    }
    return count;
  }

  // ---- Export ----

  function exportCSS() {
    let output = ':root {\n';
    const sorted = [...variables].sort((a, b) => {
      const catOrder = Object.keys(CATEGORIES);
      const ci = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      if (ci !== 0) return ci;
      return a.name.localeCompare(b.name);
    });

    let lastCat = '';
    sorted.forEach(v => {
      if (v.category !== lastCat) {
        if (lastCat) output += '\n';
        output += `  /* ${CATEGORIES[v.category]} */\n`;
        lastCat = v.category;
      }
      output += `  --${v.name}: ${v.value};\n`;
    });
    output += '}\n';
    return output;
  }

  function exportSCSS() {
    let output = '';
    const sorted = [...variables].sort((a, b) => {
      const catOrder = Object.keys(CATEGORIES);
      const ci = catOrder.indexOf(a.category) - catOrder.indexOf(b.category);
      if (ci !== 0) return ci;
      return a.name.localeCompare(b.name);
    });

    let lastCat = '';
    sorted.forEach(v => {
      if (v.category !== lastCat) {
        if (lastCat) output += '\n';
        output += `// ${CATEGORIES[v.category]}\n`;
        lastCat = v.category;
      }
      output += `$${v.name}: ${v.value};\n`;
    });
    return output;
  }

  function exportJSON() {
    const tokens = {};
    variables.forEach(v => {
      if (!tokens[v.category]) tokens[v.category] = {};
      tokens[v.category][v.name] = { value: v.value };
    });
    return JSON.stringify(tokens, null, 2);
  }

  // ---- Modals ----

  function openModal(modal) { modal.classList.add('active'); }
  function closeModal(modal) { modal.classList.remove('active'); }

  function openAddModal(existingVar) {
    editingId = existingVar ? existingVar.id : null;
    els.modalTitle.textContent = existingVar ? 'Edit Variable' : 'Add Variable';
    els.varCategory.value = existingVar ? existingVar.category : (activeCategory !== 'all' ? activeCategory : 'colors');
    els.varName.value = existingVar ? existingVar.name : '';
    els.varValue.value = existingVar ? existingVar.value : '';

    const showPicker = !existingVar || existingVar.category === 'colors' || isColorValue(existingVar?.value);
    toggleColorPicker(showPicker, existingVar?.value);

    openModal(els.addModal);
    setTimeout(() => els.varName.focus(), 100);
  }

  function toggleColorPicker(show, val) {
    els.varColorPicker.style.display = show ? 'block' : 'none';
    if (show && val) {
      try { els.varColorPicker.value = hexFromValue(val); } catch {}
    }
  }

  function showToast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => els.toast.classList.remove('visible'), 2200);
  }

  // ---- Storage ----

  function saveToStorage() {
    try {
      localStorage.setItem('css-token-manager', JSON.stringify(variables));
    } catch {}
  }

  function loadFromStorage() {
    try {
      const data = localStorage.getItem('css-token-manager');
      if (data) {
        variables = JSON.parse(data);
        variables.forEach(v => { if (!v.id) v.id = genId(); });
      }
    } catch {}
  }

  // ---- Event Handlers ----

  // Category navigation
  els.categoryNav.addEventListener('click', (e) => {
    const item = e.target.closest('.category-item');
    if (!item) return;
    activeCategory = item.dataset.cat;
    render();
  });

  // Search
  els.searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderVariables();
  });

  // Add variable button
  els.addVariableBtn.addEventListener('click', () => openAddModal());

  // Modal close / cancel
  els.modalClose.addEventListener('click', () => closeModal(els.addModal));
  els.modalCancel.addEventListener('click', () => closeModal(els.addModal));

  // Category change in modal toggles color picker
  els.varCategory.addEventListener('change', () => {
    toggleColorPicker(els.varCategory.value === 'colors', els.varValue.value);
  });

  // Color picker sync
  els.varColorPicker.addEventListener('input', (e) => {
    els.varValue.value = e.target.value;
  });

  // Value text field sync to picker
  els.varValue.addEventListener('input', (e) => {
    if (isColorValue(e.target.value)) {
      try { els.varColorPicker.value = hexFromValue(e.target.value); } catch {}
    }
  });

  // Save variable
  els.modalSave.addEventListener('click', () => {
    const name = els.varName.value.trim();
    const value = els.varValue.value.trim();
    const category = els.varCategory.value;

    if (!name) { els.varName.focus(); return; }
    if (!value) { els.varValue.focus(); return; }

    if (editingId) {
      updateVariable(editingId, { name: name.replace(/^-+/, ''), value, category });
      showToast('Variable updated');
    } else {
      addVariable(name, value, category);
      showToast('Variable added');
    }
    closeModal(els.addModal);
  });

  // Variables list events (inline edit, swatch, delete)
  els.variablesList.addEventListener('input', (e) => {
    const { id, action } = e.target.dataset;
    if (!id) return;

    if (action === 'value') {
      const v = variables.find(x => x.id === id);
      if (v) {
        v.value = e.target.value;
        updatePreview();
        // Update swatch if present
        const row = e.target.closest('.variable-row');
        const swatch = row.querySelector('.variable-swatch');
        if (swatch) swatch.style.background = e.target.value;
        saveToStorage();
      }
    }

    if (action === 'swatch') {
      const v = variables.find(x => x.id === id);
      if (v) {
        v.value = e.target.value;
        const row = e.target.closest('.variable-row');
        const valueInput = row.querySelector('.variable-value-input');
        if (valueInput) valueInput.value = e.target.value;
        const swatch = row.querySelector('.variable-swatch');
        if (swatch) swatch.style.background = e.target.value;
        updatePreview();
        saveToStorage();
      }
    }
  });

  els.variablesList.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { id, action } = btn.dataset;

    if (action === 'delete') {
      deleteVariable(id);
      showToast('Variable deleted');
    }

    if (action === 'edit') {
      const v = variables.find(x => x.id === id);
      if (v) openAddModal(v);
    }
  });

  // Import
  els.importBtn.addEventListener('click', () => {
    els.importTextarea.value = '';
    openModal(els.importModal);
    setTimeout(() => els.importTextarea.focus(), 100);
  });
  els.importModalClose.addEventListener('click', () => closeModal(els.importModal));
  els.importModalCancel.addEventListener('click', () => closeModal(els.importModal));
  els.importModalConfirm.addEventListener('click', () => {
    const text = els.importTextarea.value;
    const count = importCSS(text);
    closeModal(els.importModal);
    if (count > 0) {
      render();
      showToast(`Imported ${count} variable${count !== 1 ? 's' : ''}`);
    } else {
      showToast('No CSS variables found');
    }
  });

  // Export
  function openExport(format) {
    let output = '';
    let title = '';
    if (format === 'css') {
      output = exportCSS();
      title = 'Export CSS Custom Properties';
    } else if (format === 'scss') {
      output = exportSCSS();
      title = 'Export SCSS Variables';
    } else if (format === 'json') {
      output = exportJSON();
      title = 'Export JSON Design Tokens';
    }
    els.exportModalTitle.textContent = title;
    els.exportOutput.textContent = output;
    openModal(els.exportModal);
  }

  els.exportCssBtn.addEventListener('click', () => openExport('css'));
  els.exportScssBtn.addEventListener('click', () => openExport('scss'));
  els.exportJsonBtn.addEventListener('click', () => openExport('json'));
  els.exportModalClose.addEventListener('click', () => closeModal(els.exportModal));
  els.exportModalDone.addEventListener('click', () => closeModal(els.exportModal));

  els.copyExportBtn.addEventListener('click', () => {
    const text = els.exportOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Copied to clipboard');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard');
    });
  });

  // Presets
  els.presetsBtn.addEventListener('click', () => openModal(els.presetsModal));
  els.presetsModalClose.addEventListener('click', () => closeModal(els.presetsModal));

  els.presetsModal.addEventListener('click', (e) => {
    const card = e.target.closest('.preset-card');
    if (!card) return;
    const preset = card.dataset.preset;
    if (PRESETS[preset]) {
      variables = PRESETS[preset].map(v => ({ ...v, id: genId() }));
      activeCategory = 'all';
      closeModal(els.presetsModal);
      render();
      showToast(`Loaded ${preset} theme preset`);
    }
  });

  // Close modals on overlay click
  [els.addModal, els.importModal, els.exportModal, els.presetsModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      [els.addModal, els.importModal, els.exportModal, els.presetsModal].forEach(closeModal);
    }
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      els.searchInput.focus();
    }
  });

  // Enter key in add modal saves
  els.addModal.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'SELECT') {
      els.modalSave.click();
    }
  });

  // ---- Init ----

  loadFromStorage();
  render();

})();
