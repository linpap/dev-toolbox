(() => {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────
  let tableData = [];      // 2D array of { text, align, merged, hidden, rowspan, colspan }
  let hasHeader = true;
  let currentStyle = 'basic';
  let activeTab = 'html';

  // Selection state
  let selecting = false;
  let selStart = null;
  let selEnd = null;

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ── Toast ──────────────────────────────────────────────────────────
  function toast(message, type = 'info') {
    const container = $('#toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove());
    }, 2600);
  }

  // ── Cell factory ───────────────────────────────────────────────────
  function makeCell(text = '') {
    return { text, align: 'left', merged: false, hidden: false, rowspan: 1, colspan: 1 };
  }

  // ── Build initial data ─────────────────────────────────────────────
  function initData(rows, cols) {
    tableData = [];
    for (let r = 0; r < rows; r++) {
      const row = [];
      for (let c = 0; c < cols; c++) {
        const label = (hasHeader && r === 0) ? `Header ${c + 1}` : '';
        row.push(makeCell(label));
      }
      tableData.push(row);
    }
  }

  // ── Render table ───────────────────────────────────────────────────
  function renderTable() {
    const table = $('#data-table');
    table.className = currentStyle !== 'basic' ? `style-${currentStyle}` : '';
    table.innerHTML = '';

    tableData.forEach((row, ri) => {
      const isHeader = hasHeader && ri === 0;
      const tr = document.createElement('tr');

      row.forEach((cell, ci) => {
        if (cell.hidden) return;

        const el = document.createElement(isHeader ? 'th' : 'td');
        el.textContent = cell.text;
        el.style.textAlign = cell.align;
        el.dataset.row = ri;
        el.dataset.col = ci;

        if (cell.rowspan > 1) el.rowSpan = cell.rowspan;
        if (cell.colspan > 1) el.colSpan = cell.colspan;

        // Selection highlighting
        if (isInSelection(ri, ci)) {
          el.classList.add('cell-selected');
        }

        tr.appendChild(el);
      });

      table.appendChild(tr);
    });

    updateOutput();
  }

  // ── Selection helpers ──────────────────────────────────────────────
  function getSelectionBounds() {
    if (!selStart || !selEnd) return null;
    return {
      r1: Math.min(selStart.r, selEnd.r),
      c1: Math.min(selStart.c, selEnd.c),
      r2: Math.max(selStart.r, selEnd.r),
      c2: Math.max(selStart.c, selEnd.c),
    };
  }

  function isInSelection(r, c) {
    const b = getSelectionBounds();
    if (!b) return false;
    return r >= b.r1 && r <= b.r2 && c >= b.c1 && c <= b.c2;
  }

  function clearSelection() {
    selStart = null;
    selEnd = null;
    $$('.cell-selected').forEach((el) => el.classList.remove('cell-selected'));
  }

  // ── Cell editing ───────────────────────────────────────────────────
  function startEdit(el) {
    if (el.contentEditable === 'true') return;
    el.contentEditable = 'true';
    el.classList.add('cell-editing');
    el.focus();

    // Place cursor at end
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function stopEdit(el) {
    if (el.contentEditable !== 'true') return;
    el.contentEditable = 'false';
    el.classList.remove('cell-editing');
    const r = parseInt(el.dataset.row);
    const c = parseInt(el.dataset.col);
    if (tableData[r] && tableData[r][c]) {
      tableData[r][c].text = el.textContent.trim();
    }
    updateOutput();
  }

  // ── Mouse events on table ──────────────────────────────────────────
  const table = $('#data-table');

  table.addEventListener('mousedown', (e) => {
    const cell = e.target.closest('td, th');
    if (!cell) return;

    // Stop editing any other cell
    $$('.cell-editing').forEach((el) => stopEdit(el));

    const r = parseInt(cell.dataset.row);
    const c = parseInt(cell.dataset.col);

    selecting = true;
    selStart = { r, c };
    selEnd = { r, c };
    renderTable();
  });

  table.addEventListener('mouseover', (e) => {
    if (!selecting) return;
    const cell = e.target.closest('td, th');
    if (!cell) return;
    selEnd = { r: parseInt(cell.dataset.row), c: parseInt(cell.dataset.col) };
    renderTable();
  });

  document.addEventListener('mouseup', () => {
    if (selecting) {
      selecting = false;
      // If single cell click, start editing
      if (selStart && selEnd && selStart.r === selEnd.r && selStart.c === selEnd.c) {
        const cell = table.querySelector(`[data-row="${selStart.r}"][data-col="${selStart.c}"]`);
        if (cell) startEdit(cell);
      }
    }
  });

  // Stop editing on blur
  table.addEventListener('focusout', (e) => {
    const cell = e.target.closest('td, th');
    if (cell) stopEdit(cell);
  });

  // Tab / Enter navigation
  table.addEventListener('keydown', (e) => {
    const cell = e.target.closest('td, th');
    if (!cell || cell.contentEditable !== 'true') return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      stopEdit(cell);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      stopEdit(cell);

      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      const nextC = e.shiftKey ? c - 1 : c + 1;
      let nextR = r;
      let nc = nextC;

      if (nc >= tableData[0].length) { nc = 0; nextR++; }
      if (nc < 0) { nc = tableData[0].length - 1; nextR--; }
      if (nextR >= 0 && nextR < tableData.length) {
        const next = table.querySelector(`[data-row="${nextR}"][data-col="${nc}"]`);
        if (next) {
          selStart = { r: nextR, c: nc };
          selEnd = { r: nextR, c: nc };
          renderTable();
          const el = table.querySelector(`[data-row="${nextR}"][data-col="${nc}"]`);
          if (el) startEdit(el);
        }
      }
    }
  });

  // ── Generate button ────────────────────────────────────────────────
  $('#btn-generate').addEventListener('click', () => {
    const rows = clamp(parseInt($('#row-count').value) || 3, 1, 20);
    const cols = clamp(parseInt($('#col-count').value) || 3, 1, 20);
    $('#row-count').value = rows;
    $('#col-count').value = cols;
    hasHeader = $('#header-toggle').checked;
    initData(rows, cols);
    clearSelection();
    renderTable();
    toast('Table generated', 'success');
  });

  // ── Header toggle ─────────────────────────────────────────────────
  $('#header-toggle').addEventListener('change', (e) => {
    hasHeader = e.target.checked;
    renderTable();
  });

  // ── Style selector ────────────────────────────────────────────────
  $('#table-style').addEventListener('change', (e) => {
    currentStyle = e.target.value;
    renderTable();
  });

  // ── Add / Remove rows & cols ──────────────────────────────────────
  $('#btn-add-row').addEventListener('click', () => {
    if (tableData.length >= 20) { toast('Maximum 20 rows', 'error'); return; }
    const cols = tableData[0]?.length || 3;
    const row = [];
    for (let c = 0; c < cols; c++) row.push(makeCell());
    tableData.push(row);
    renderTable();
    toast('Row added', 'success');
  });

  $('#btn-remove-row').addEventListener('click', () => {
    if (tableData.length <= 1) { toast('Need at least one row', 'error'); return; }
    tableData.pop();
    clearSelection();
    renderTable();
    toast('Row removed', 'success');
  });

  $('#btn-add-col').addEventListener('click', () => {
    if ((tableData[0]?.length || 0) >= 20) { toast('Maximum 20 columns', 'error'); return; }
    tableData.forEach((row, ri) => {
      const label = (hasHeader && ri === 0) ? `Header ${row.length + 1}` : '';
      row.push(makeCell(label));
    });
    renderTable();
    toast('Column added', 'success');
  });

  $('#btn-remove-col').addEventListener('click', () => {
    if ((tableData[0]?.length || 0) <= 1) { toast('Need at least one column', 'error'); return; }
    tableData.forEach((row) => row.pop());
    clearSelection();
    renderTable();
    toast('Column removed', 'success');
  });

  // ── Merge / Unmerge ────────────────────────────────────────────────
  $('#btn-merge').addEventListener('click', () => {
    const b = getSelectionBounds();
    if (!b || (b.r1 === b.r2 && b.c1 === b.c2)) {
      toast('Select a range of cells to merge', 'error');
      return;
    }

    // Collect text from all cells in the range
    let texts = [];
    for (let r = b.r1; r <= b.r2; r++) {
      for (let c = b.c1; c <= b.c2; c++) {
        if (tableData[r][c].text) texts.push(tableData[r][c].text);
        tableData[r][c].hidden = true;
        tableData[r][c].rowspan = 1;
        tableData[r][c].colspan = 1;
        tableData[r][c].merged = true;
      }
    }

    // Top-left cell becomes the merged cell
    const anchor = tableData[b.r1][b.c1];
    anchor.hidden = false;
    anchor.rowspan = b.r2 - b.r1 + 1;
    anchor.colspan = b.c2 - b.c1 + 1;
    anchor.text = texts.join(' ');

    clearSelection();
    renderTable();
    toast('Cells merged', 'success');
  });

  $('#btn-unmerge').addEventListener('click', () => {
    const b = getSelectionBounds();
    if (!b) { toast('Select merged cells to unmerge', 'error'); return; }

    let unmerged = false;
    for (let r = b.r1; r <= b.r2; r++) {
      for (let c = b.c1; c <= b.c2; c++) {
        const cell = tableData[r][c];
        if (cell.rowspan > 1 || cell.colspan > 1 || cell.merged) {
          // Unhide all cells in the merged range
          for (let mr = r; mr < r + cell.rowspan; mr++) {
            for (let mc = c; mc < c + cell.colspan; mc++) {
              tableData[mr][mc].hidden = false;
              tableData[mr][mc].merged = false;
              tableData[mr][mc].rowspan = 1;
              tableData[mr][mc].colspan = 1;
            }
          }
          unmerged = true;
        }
      }
    }

    if (unmerged) {
      clearSelection();
      renderTable();
      toast('Cells unmerged', 'success');
    } else {
      toast('No merged cells in selection', 'error');
    }
  });

  // ── Alignment buttons ─────────────────────────────────────────────
  $$('.btn-align').forEach((btn) => {
    btn.addEventListener('click', () => {
      const align = btn.dataset.align;
      const b = getSelectionBounds();
      if (!b) {
        toast('Select cells first', 'error');
        return;
      }
      for (let r = b.r1; r <= b.r2; r++) {
        for (let c = b.c1; c <= b.c2; c++) {
          tableData[r][c].align = align;
        }
      }
      renderTable();
      toast(`Aligned ${align}`, 'info');
    });
  });

  // ── Import CSV ─────────────────────────────────────────────────────
  $('#btn-import-csv').addEventListener('click', () => {
    const raw = $('#csv-input').value.trim();
    if (!raw) { toast('Paste CSV data first', 'error'); return; }

    const rows = parseCSV(raw);
    if (rows.length === 0 || rows[0].length === 0) {
      toast('Could not parse CSV', 'error');
      return;
    }

    const maxCols = Math.min(Math.max(...rows.map((r) => r.length)), 20);
    const maxRows = Math.min(rows.length, 20);

    tableData = [];
    for (let r = 0; r < maxRows; r++) {
      const row = [];
      for (let c = 0; c < maxCols; c++) {
        row.push(makeCell(rows[r]?.[c] || ''));
      }
      tableData.push(row);
    }

    $('#row-count').value = maxRows;
    $('#col-count').value = maxCols;
    clearSelection();
    renderTable();
    toast('CSV imported', 'success');
  });

  function parseCSV(text) {
    const rows = [];
    let current = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (ch === '"' && next === '"') {
          cell += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          cell += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          current.push(cell.trim());
          cell = '';
        } else if (ch === '\n' || (ch === '\r' && next === '\n')) {
          current.push(cell.trim());
          rows.push(current);
          current = [];
          cell = '';
          if (ch === '\r') i++;
        } else {
          cell += ch;
        }
      }
    }

    // Last cell / row
    if (cell || current.length > 0) {
      current.push(cell.trim());
      rows.push(current);
    }

    return rows;
  }

  // ── Output tabs ────────────────────────────────────────────────────
  $$('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      $$('.tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      activeTab = tab.dataset.tab;
      updateOutput();
    });
  });

  // ── Copy button ────────────────────────────────────────────────────
  $('#btn-copy').addEventListener('click', () => {
    const text = $('#output-code').textContent;
    if (!text) { toast('Nothing to copy', 'error'); return; }
    navigator.clipboard.writeText(text).then(
      () => toast('Copied to clipboard', 'success'),
      () => {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('Copied to clipboard', 'success');
      }
    );
  });

  // ── Output generators ─────────────────────────────────────────────
  function updateOutput() {
    const code = $('#output-code');
    switch (activeTab) {
      case 'html': code.textContent = generateHTML(); break;
      case 'markdown': code.textContent = generateMarkdown(); break;
      case 'csv': code.textContent = generateCSV(); break;
    }
  }

  function generateHTML() {
    const styleClass = currentStyle !== 'basic' ? ` class="table-${currentStyle}"` : '';
    let html = `<table${styleClass}>\n`;

    tableData.forEach((row, ri) => {
      const isHeader = hasHeader && ri === 0;
      if (isHeader) html += '  <thead>\n';
      if (!isHeader && ri === (hasHeader ? 1 : 0)) html += '  <tbody>\n';

      html += '    <tr>\n';
      row.forEach((cell) => {
        if (cell.hidden) return;
        const tag = isHeader ? 'th' : 'td';
        const attrs = [];
        if (cell.rowspan > 1) attrs.push(`rowspan="${cell.rowspan}"`);
        if (cell.colspan > 1) attrs.push(`colspan="${cell.colspan}"`);
        if (cell.align !== 'left') attrs.push(`style="text-align: ${cell.align}"`);
        const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
        html += `      <${tag}${attrStr}>${escapeHTML(cell.text)}</${tag}>\n`;
      });
      html += '    </tr>\n';

      if (isHeader) html += '  </thead>\n';
    });

    const lastRow = hasHeader && tableData.length > 1;
    if (lastRow || !hasHeader) html += '  </tbody>\n';
    html += '</table>';
    return html;
  }

  function generateMarkdown() {
    if (tableData.length === 0) return '';

    // Flatten merged cells for markdown (markdown doesn't support merge)
    const cols = tableData[0].length;

    // Calculate column widths
    const widths = [];
    for (let c = 0; c < cols; c++) {
      let max = 3;
      tableData.forEach((row) => {
        if (row[c] && !row[c].hidden) {
          max = Math.max(max, row[c].text.length);
        }
      });
      widths.push(max);
    }

    let md = '';
    tableData.forEach((row, ri) => {
      let line = '|';
      for (let c = 0; c < cols; c++) {
        const cell = row[c];
        const text = (cell && !cell.hidden) ? cell.text : '';
        line += ' ' + text.padEnd(widths[c]) + ' |';
      }
      md += line + '\n';

      // Separator after first row (header)
      if (ri === 0) {
        let sep = '|';
        for (let c = 0; c < cols; c++) {
          const align = row[c]?.align || 'left';
          const w = widths[c];
          if (align === 'center') {
            sep += ':' + '-'.repeat(w) + ':|';
          } else if (align === 'right') {
            sep += '-'.repeat(w) + ':|';
          } else {
            sep += '-'.repeat(w + 1) + '-|';
          }
        }
        md += sep + '\n';
      }
    });

    return md;
  }

  function generateCSV() {
    return tableData.map((row) =>
      row
        .filter((cell) => !cell.hidden)
        .map((cell) => {
          const t = cell.text;
          if (t.includes(',') || t.includes('"') || t.includes('\n')) {
            return '"' + t.replace(/"/g, '""') + '"';
          }
          return t;
        })
        .join(',')
    ).join('\n');
  }

  function escapeHTML(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  // ── Initialize ─────────────────────────────────────────────────────
  initData(3, 3);
  renderTable();
})();
