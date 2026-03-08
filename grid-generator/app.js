(() => {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  const state = {
    columns: ['1fr', '1fr', '1fr'],
    rows: ['1fr', '1fr', '1fr'],
    rowGap: '10px',
    colGap: '10px',
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'stretch',
    alignContent: 'stretch',
    areasEnabled: false,
    areas: {},          // key: "row-col" => area name string
    cells: [],          // array of { id, colStart, colEnd, rowStart, rowEnd }
    selectedCellId: null,
  };

  let cellIdCounter = 0;

  // ── DOM refs ───────────────────────────────────────────────────────
  const $ = (sel) => document.querySelector(sel);
  const colsList = $('#columns-list');
  const rowsList = $('#rows-list');
  const gridPreview = $('#grid-preview');
  const cssOutput = $('#css-output code');
  const rowGapInput = $('#row-gap');
  const colGapInput = $('#col-gap');
  const justifyItemsSel = $('#justify-items');
  const alignItemsSel = $('#align-items');
  const justifyContentSel = $('#justify-content');
  const alignContentSel = $('#align-content');
  const areasToggle = $('#areas-toggle');
  const areasEditor = $('#areas-editor');
  const areasInputs = $('#areas-inputs');
  const toast = $('#toast');
  const cellEditor = $('#cell-editor');

  // ── Helpers ────────────────────────────────────────────────────────
  const CELL_COLORS = 12;

  function showToast(msg) {
    toast.textContent = msg || 'Copied to clipboard!';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }

  function rebuildCells() {
    const totalCols = state.columns.length;
    const totalRows = state.rows.length;

    // Remove cells that are fully outside the grid
    state.cells = state.cells.filter(c =>
      c.colStart <= totalCols && c.rowStart <= totalRows
    );

    // Clamp existing cells
    state.cells.forEach(c => {
      if (c.colEnd > totalCols + 1) c.colEnd = totalCols + 1;
      if (c.rowEnd > totalRows + 1) c.rowEnd = totalRows + 1;
    });

    // Find occupied positions
    const occupied = new Set();
    state.cells.forEach(c => {
      for (let r = c.rowStart; r < c.rowEnd; r++) {
        for (let col = c.colStart; col < c.colEnd; col++) {
          occupied.add(`${r}-${col}`);
        }
      }
    });

    // Fill in missing single-cell items
    for (let r = 1; r <= totalRows; r++) {
      for (let c = 1; c <= totalCols; c++) {
        if (!occupied.has(`${r}-${c}`)) {
          state.cells.push({
            id: ++cellIdCounter,
            colStart: c,
            colEnd: c + 1,
            rowStart: r,
            rowEnd: r + 1,
          });
        }
      }
    }
  }

  function resetCells() {
    state.cells = [];
    state.selectedCellId = null;
    cellIdCounter = 0;
    closeCellEditor();
    rebuildCells();
    render();
  }

  // ── Track rendering (columns / rows) ──────────────────────────────
  function renderTracks(container, tracks, type) {
    container.innerHTML = '';
    tracks.forEach((val, i) => {
      const div = document.createElement('div');
      div.className = 'track-item';

      const label = document.createElement('span');
      label.className = 'track-label';
      label.textContent = i + 1;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = val;
      input.addEventListener('input', () => {
        if (type === 'col') state.columns[i] = input.value;
        else state.rows[i] = input.value;
        render();
      });

      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = `Remove ${type === 'col' ? 'column' : 'row'} ${i + 1}`;
      removeBtn.addEventListener('click', () => {
        if (type === 'col') {
          if (state.columns.length <= 1) return;
          state.columns.splice(i, 1);
        } else {
          if (state.rows.length <= 1) return;
          state.rows.splice(i, 1);
        }
        rebuildCells();
        render();
      });

      div.append(label, input, removeBtn);
      container.appendChild(div);
    });
  }

  // ── Grid preview rendering ────────────────────────────────────────
  function renderGridPreview() {
    gridPreview.style.gridTemplateColumns = state.columns.join(' ');
    gridPreview.style.gridTemplateRows = state.rows.join(' ');
    gridPreview.style.rowGap = state.rowGap;
    gridPreview.style.columnGap = state.colGap;
    gridPreview.style.justifyItems = state.justifyItems;
    gridPreview.style.alignItems = state.alignItems;
    gridPreview.style.justifyContent = state.justifyContent;
    gridPreview.style.alignContent = state.alignContent;

    // Template areas
    if (state.areasEnabled) {
      const areaStrings = [];
      for (let r = 1; r <= state.rows.length; r++) {
        let row = '';
        for (let c = 1; c <= state.columns.length; c++) {
          const name = state.areas[`${r}-${c}`] || '.';
          row += (row ? ' ' : '') + name;
        }
        areaStrings.push(`"${row}"`);
      }
      gridPreview.style.gridTemplateAreas = areaStrings.join(' ');
    } else {
      gridPreview.style.gridTemplateAreas = '';
    }

    gridPreview.innerHTML = '';

    state.cells.forEach((cell, idx) => {
      const div = document.createElement('div');
      div.className = `grid-cell cell-color-${idx % CELL_COLORS}`;
      div.dataset.cellId = cell.id;

      if (cell.id === state.selectedCellId) {
        div.classList.add('selected');
      }

      div.style.gridColumnStart = cell.colStart;
      div.style.gridColumnEnd = cell.colEnd;
      div.style.gridRowStart = cell.rowStart;
      div.style.gridRowEnd = cell.rowEnd;

      if (state.areasEnabled) {
        const areaName = state.areas[`${cell.rowStart}-${cell.colStart}`];
        if (areaName && areaName !== '.') {
          div.style.gridArea = areaName;
        }
      }

      const label = document.createElement('span');
      label.className = 'cell-label';
      label.textContent = idx + 1;
      div.appendChild(label);

      const isSpanned = (cell.colEnd - cell.colStart > 1) || (cell.rowEnd - cell.rowStart > 1);
      if (isSpanned) {
        const info = document.createElement('span');
        info.className = 'cell-span-info';
        info.textContent = `${cell.colStart}/${cell.colEnd} ${cell.rowStart}/${cell.rowEnd}`;
        div.appendChild(info);
      }

      div.addEventListener('click', (e) => onCellClick(cell, e));
      gridPreview.appendChild(div);
    });
  }

  // ── Cell click / spanning ─────────────────────────────────────────
  function onCellClick(cell, e) {
    if (e.shiftKey && state.selectedCellId !== null) {
      // Merge: span from selected cell to this cell
      const selCell = state.cells.find(c => c.id === state.selectedCellId);
      if (!selCell || selCell.id === cell.id) return;

      const minCol = Math.min(selCell.colStart, cell.colStart);
      const maxCol = Math.max(selCell.colEnd, cell.colEnd);
      const minRow = Math.min(selCell.rowStart, cell.rowStart);
      const maxRow = Math.max(selCell.rowEnd, cell.rowEnd);

      // Remove all cells that fall within the merged region
      state.cells = state.cells.filter(c => {
        if (c.id === selCell.id) return true; // keep the anchor
        const overlaps = c.colStart >= minCol && c.colEnd <= maxCol &&
                         c.rowStart >= minRow && c.rowEnd <= maxRow;
        return !overlaps;
      });

      selCell.colStart = minCol;
      selCell.colEnd = maxCol;
      selCell.rowStart = minRow;
      selCell.rowEnd = maxRow;

      state.selectedCellId = null;
      rebuildCells();
      render();
      return;
    }

    // Single click – select and open editor
    state.selectedCellId = cell.id;
    openCellEditor(cell);
    render();
  }

  // ── Cell editor popup ─────────────────────────────────────────────
  let backdrop = null;

  function openCellEditor(cell) {
    $('#ce-col-start').value = cell.colStart;
    $('#ce-col-end').value = cell.colEnd;
    $('#ce-row-start').value = cell.rowStart;
    $('#ce-row-end').value = cell.rowEnd;

    cellEditor.classList.remove('hidden');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'backdrop';
      backdrop.addEventListener('click', closeCellEditor);
    }
    document.body.appendChild(backdrop);
  }

  function closeCellEditor() {
    cellEditor.classList.add('hidden');
    state.selectedCellId = null;
    if (backdrop && backdrop.parentNode) {
      backdrop.parentNode.removeChild(backdrop);
    }
    renderGridPreview();
  }

  $('#ce-apply').addEventListener('click', () => {
    const cell = state.cells.find(c => c.id === state.selectedCellId);
    if (!cell) return;

    const cs = parseInt($('#ce-col-start').value, 10);
    const ce = parseInt($('#ce-col-end').value, 10);
    const rs = parseInt($('#ce-row-start').value, 10);
    const re = parseInt($('#ce-row-end').value, 10);

    if (cs >= ce || rs >= re) return;

    // Remove overlapping cells
    state.cells = state.cells.filter(c => {
      if (c.id === cell.id) return true;
      const overlaps = c.colStart >= cs && c.colEnd <= ce &&
                       c.rowStart >= rs && c.rowEnd <= re;
      return !overlaps;
    });

    cell.colStart = cs;
    cell.colEnd = ce;
    cell.rowStart = rs;
    cell.rowEnd = re;

    closeCellEditor();
    rebuildCells();
    render();
  });

  $('#ce-cancel').addEventListener('click', closeCellEditor);

  $('#ce-remove').addEventListener('click', () => {
    const cell = state.cells.find(c => c.id === state.selectedCellId);
    if (!cell) return;
    // Reset to 1x1 at its start position
    cell.colEnd = cell.colStart + 1;
    cell.rowEnd = cell.rowStart + 1;
    closeCellEditor();
    rebuildCells();
    render();
  });

  // ── Areas editor ──────────────────────────────────────────────────
  function renderAreasEditor() {
    if (!state.areasEnabled) {
      areasEditor.classList.add('hidden');
      return;
    }
    areasEditor.classList.remove('hidden');
    areasInputs.innerHTML = '';
    areasInputs.style.gridTemplateColumns = `repeat(${state.columns.length}, 1fr)`;

    for (let r = 1; r <= state.rows.length; r++) {
      for (let c = 1; c <= state.columns.length; c++) {
        const key = `${r}-${c}`;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = state.areas[key] || '.';
        input.placeholder = '.';
        input.addEventListener('input', () => {
          const v = input.value.trim() || '.';
          state.areas[key] = v;
          render();
        });
        areasInputs.appendChild(input);
      }
    }
  }

  // ── CSS output generation ─────────────────────────────────────────
  function generateCSS() {
    const lines = [];

    lines.push(sel('.container') + ' {');
    lines.push(prop('display', 'grid'));
    lines.push(prop('grid-template-columns', state.columns.join(' ')));
    lines.push(prop('grid-template-rows', state.rows.join(' ')));

    if (state.rowGap === state.colGap) {
      lines.push(prop('gap', state.rowGap));
    } else {
      lines.push(prop('row-gap', state.rowGap));
      lines.push(prop('column-gap', state.colGap));
    }

    if (state.justifyItems !== 'stretch') lines.push(prop('justify-items', state.justifyItems));
    if (state.alignItems !== 'stretch') lines.push(prop('align-items', state.alignItems));
    if (state.justifyContent !== 'stretch') lines.push(prop('justify-content', state.justifyContent));
    if (state.alignContent !== 'stretch') lines.push(prop('align-content', state.alignContent));

    if (state.areasEnabled) {
      const areaLines = [];
      for (let r = 1; r <= state.rows.length; r++) {
        let row = '';
        for (let c = 1; c <= state.columns.length; c++) {
          const name = state.areas[`${r}-${c}`] || '.';
          row += (row ? ' ' : '') + name;
        }
        areaLines.push(`"${row}"`);
      }
      lines.push(prop('grid-template-areas', '\n    ' + areaLines.join('\n    ')));
    }

    lines.push('}');

    // Items with spanning
    const spanned = state.cells.filter(c =>
      (c.colEnd - c.colStart > 1) || (c.rowEnd - c.rowStart > 1)
    );

    if (spanned.length > 0) {
      lines.push('');
      lines.push(comment('/* Grid items with spanning */'));
    }

    spanned.forEach((cell, idx) => {
      const cellIndex = state.cells.indexOf(cell) + 1;
      lines.push('');
      lines.push(sel(`.item-${cellIndex}`) + ' {');
      lines.push(prop('grid-column', `${cell.colStart} / ${cell.colEnd}`));
      lines.push(prop('grid-row', `${cell.rowStart} / ${cell.rowEnd}`));
      lines.push('}');
    });

    // Named area items
    if (state.areasEnabled) {
      const uniqueAreas = [...new Set(Object.values(state.areas).filter(a => a && a !== '.'))];
      if (uniqueAreas.length > 0) {
        lines.push('');
        lines.push(comment('/* Grid area assignments */'));
        uniqueAreas.forEach(name => {
          lines.push('');
          lines.push(sel(`.${name}`) + ' {');
          lines.push(prop('grid-area', name));
          lines.push('}');
        });
      }
    }

    return lines.join('\n');
  }

  // CSS syntax helpers (returns plain text for raw, HTML for display)
  function prop(name, value) {
    return `  ${name}: ${value};`;
  }

  function sel(s) {
    return s;
  }

  function comment(s) {
    return s;
  }

  // Syntax highlighted version
  function highlightCSS(raw) {
    return raw
      .replace(/\/\*.*?\*\//g, m => `<span class="css-comment">${m}</span>`)
      .replace(/([.#]?[\w-]+)\s*\{/g, (_, s) => `<span class="css-sel">${s}</span> <span class="css-punc">{</span>`)
      .replace(/\}/g, '<span class="css-punc">}</span>')
      .replace(/  ([\w-]+):\s*(.+);/g, (_, p, v) =>
        `  <span class="css-prop">${p}</span>: <span class="css-val">${v}</span>;`
      );
  }

  function renderCSSOutput() {
    const raw = generateCSS();
    cssOutput.innerHTML = highlightCSS(raw);
  }

  // ── Copy button ───────────────────────────────────────────────────
  $('#copy-btn').addEventListener('click', () => {
    const raw = generateCSS();
    navigator.clipboard.writeText(raw).then(() => {
      showToast('Copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = raw;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    });
  });

  // ── Event listeners ───────────────────────────────────────────────
  $('#add-col-btn').addEventListener('click', () => {
    state.columns.push('1fr');
    rebuildCells();
    render();
  });

  $('#add-row-btn').addEventListener('click', () => {
    state.rows.push('1fr');
    rebuildCells();
    render();
  });

  rowGapInput.addEventListener('input', () => {
    state.rowGap = rowGapInput.value;
    render();
  });

  colGapInput.addEventListener('input', () => {
    state.colGap = colGapInput.value;
    render();
  });

  justifyItemsSel.addEventListener('change', () => { state.justifyItems = justifyItemsSel.value; render(); });
  alignItemsSel.addEventListener('change', () => { state.alignItems = alignItemsSel.value; render(); });
  justifyContentSel.addEventListener('change', () => { state.justifyContent = justifyContentSel.value; render(); });
  alignContentSel.addEventListener('change', () => { state.alignContent = alignContentSel.value; render(); });

  areasToggle.addEventListener('change', () => {
    state.areasEnabled = areasToggle.checked;
    render();
  });

  $('#reset-cells-btn').addEventListener('click', resetCells);

  // ── Presets ────────────────────────────────────────────────────────
  const presets = {
    'holy-grail': {
      columns: ['200px', '1fr', '200px'],
      rows: ['auto', '1fr', 'auto'],
      areas: {
        '1-1': 'header', '1-2': 'header', '1-3': 'header',
        '2-1': 'nav', '2-2': 'main', '2-3': 'aside',
        '3-1': 'footer', '3-2': 'footer', '3-3': 'footer',
      },
      areasEnabled: true,
    },
    'dashboard': {
      columns: ['240px', '1fr', '1fr'],
      rows: ['60px', '1fr', '1fr'],
      areas: {
        '1-1': 'sidebar', '1-2': 'header', '1-3': 'header',
        '2-1': 'sidebar', '2-2': 'card1', '2-3': 'card2',
        '3-1': 'sidebar', '3-2': 'main', '3-3': 'main',
      },
      areasEnabled: true,
    },
    'gallery': {
      columns: ['1fr', '1fr', '1fr', '1fr'],
      rows: ['1fr', '1fr', '1fr'],
      areas: {},
      areasEnabled: false,
    },
    'blog': {
      columns: ['1fr', 'minmax(0, 720px)', '1fr'],
      rows: ['auto', '1fr', 'auto'],
      areas: {
        '1-1': 'header', '1-2': 'header', '1-3': 'header',
        '2-1': '.', '2-2': 'content', '2-3': '.',
        '3-1': 'footer', '3-2': 'footer', '3-3': 'footer',
      },
      areasEnabled: true,
    },
    'sidebar': {
      columns: ['260px', '1fr'],
      rows: ['1fr'],
      areas: {
        '1-1': 'sidebar', '1-2': 'main',
      },
      areasEnabled: true,
    },
  };

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.preset;
      const preset = presets[key];
      if (!preset) return;

      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      state.columns = [...preset.columns];
      state.rows = [...preset.rows];
      state.areas = { ...preset.areas };
      state.areasEnabled = preset.areasEnabled;
      areasToggle.checked = state.areasEnabled;
      state.cells = [];
      state.selectedCellId = null;
      cellIdCounter = 0;

      // Reset alignment
      state.justifyItems = 'stretch';
      state.alignItems = 'stretch';
      state.justifyContent = 'stretch';
      state.alignContent = 'stretch';
      justifyItemsSel.value = 'stretch';
      alignItemsSel.value = 'stretch';
      justifyContentSel.value = 'stretch';
      alignContentSel.value = 'stretch';

      rebuildCells();

      // For gallery preset, create some spanning cells for visual interest
      if (key === 'gallery') {
        // Span top-left 2x2
        const topLeft = state.cells.find(c => c.rowStart === 1 && c.colStart === 1);
        if (topLeft) {
          topLeft.colEnd = 3;
          topLeft.rowEnd = 2;
          // Remove overlapping cells
          state.cells = state.cells.filter(c =>
            c.id === topLeft.id ||
            !(c.colStart >= 1 && c.colEnd <= 3 && c.rowStart >= 1 && c.rowEnd <= 2)
          );
          rebuildCells();
        }
      }

      render();
    });
  });

  // ── Main render ───────────────────────────────────────────────────
  function render() {
    renderTracks(colsList, state.columns, 'col');
    renderTracks(rowsList, state.rows, 'row');
    renderGridPreview();
    renderAreasEditor();
    renderCSSOutput();
  }

  // ── Init ──────────────────────────────────────────────────────────
  rebuildCells();
  render();
})();
