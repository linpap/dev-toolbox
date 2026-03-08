// ── State ──
const state = {
  elements: [],
  selectedId: null,
  counter: 0,
};

// ── DOM refs ──
const $ = (sel) => document.querySelector(sel);
const canvas = $('#canvas');
const canvasEmpty = $('#canvas-empty');
const configPanel = $('#config-panel');
const configFields = $('#config-fields');
const previewFrame = $('#preview-frame');
const htmlOutput = $('#html-output');
const elementCount = $('#element-count');
const toast = $('#toast');

// ── Element defaults ──
const ELEMENT_DEFAULTS = {
  text:     { label: 'Text Field',    name: 'text_field',    placeholder: 'Enter text...',    inputType: 'text' },
  email:    { label: 'Email',         name: 'email',         placeholder: 'you@example.com',  inputType: 'email' },
  password: { label: 'Password',      name: 'password',      placeholder: 'Enter password',   inputType: 'password' },
  number:   { label: 'Number',        name: 'number',        placeholder: '0',                inputType: 'number' },
  textarea: { label: 'Message',       name: 'message',       placeholder: 'Enter message...', inputType: 'textarea' },
  select:   { label: 'Select',        name: 'select',        placeholder: '',                 inputType: 'select',   options: 'Option 1\nOption 2\nOption 3' },
  checkbox: { label: 'Agree to terms',name: 'agree',         placeholder: '',                 inputType: 'checkbox' },
  radio:    { label: 'Choice',        name: 'choice',        placeholder: '',                 inputType: 'radio',    options: 'Option A\nOption B\nOption C' },
  date:     { label: 'Date',          name: 'date',          placeholder: '',                 inputType: 'date' },
  file:     { label: 'Upload File',   name: 'file',          placeholder: '',                 inputType: 'file' },
  range:    { label: 'Range',         name: 'range',         placeholder: '',                 inputType: 'range',    min: '0', max: '100' },
  color:    { label: 'Pick Color',    name: 'color',         placeholder: '',                 inputType: 'color' },
};

// ── Create new element ──
function createElement(type) {
  const def = ELEMENT_DEFAULTS[type];
  state.counter++;
  return {
    id: 'el_' + state.counter,
    type,
    label: def.label,
    name: def.name + '_' + state.counter,
    placeholder: def.placeholder,
    required: false,
    fieldId: def.name + '_' + state.counter,
    options: def.options || '',
    min: def.min || '',
    max: def.max || '',
  };
}

// ── Render everything ──
function render() {
  renderCanvas();
  renderPreview();
  renderHTML();
  updateCount();
}

function updateCount() {
  elementCount.textContent = state.elements.length + ' element' + (state.elements.length !== 1 ? 's' : '');
}

// ── Canvas rendering ──
function renderCanvas() {
  // Remove old element nodes but keep the empty placeholder
  canvas.querySelectorAll('.canvas-element').forEach(el => el.remove());
  canvasEmpty.style.display = state.elements.length ? 'none' : 'flex';

  state.elements.forEach((el, idx) => {
    const node = document.createElement('div');
    node.className = 'canvas-element' + (el.id === state.selectedId ? ' selected' : '');
    node.dataset.id = el.id;
    node.dataset.index = idx;
    node.draggable = true;

    const reqBadge = el.required ? ' <span style="color:var(--red);font-size:10px;">*</span>' : '';
    node.innerHTML = `
      <div class="element-drag-handle">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="6" r="1"/><circle cx="15" cy="6" r="1"/>
          <circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/>
          <circle cx="9" cy="18" r="1"/><circle cx="15" cy="18" r="1"/>
        </svg>
      </div>
      <div class="element-info">
        <div class="element-type">${el.type}</div>
        <div class="element-label">${escapeHTML(el.label)}${reqBadge}</div>
        <div class="element-meta">name="${escapeHTML(el.name)}"</div>
      </div>
      <div class="element-actions">
        <button class="btn-icon" data-action="edit" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
        <button class="btn-icon delete" data-action="delete" title="Delete"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
      </div>
    `;

    // Click to select
    node.addEventListener('click', (e) => {
      if (e.target.closest('[data-action="delete"]')) {
        state.elements = state.elements.filter(x => x.id !== el.id);
        if (state.selectedId === el.id) {
          state.selectedId = null;
          configPanel.style.display = 'none';
        }
        render();
        return;
      }
      if (e.target.closest('[data-action="edit"]') || !e.target.closest('.element-actions')) {
        state.selectedId = el.id;
        render();
        showConfig(el);
      }
    });

    // Drag events for reordering
    node.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', el.id);
      e.dataTransfer.setData('application/x-reorder', 'true');
      node.classList.add('dragging-el');
    });
    node.addEventListener('dragend', () => {
      node.classList.remove('dragging-el');
      canvas.querySelectorAll('.drag-over').forEach(n => n.classList.remove('drag-over'));
    });
    node.addEventListener('dragover', (e) => {
      e.preventDefault();
      node.classList.add('drag-over');
    });
    node.addEventListener('dragleave', () => {
      node.classList.remove('drag-over');
    });
    node.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      node.classList.remove('drag-over');

      const draggedId = e.dataTransfer.getData('text/plain');
      const isReorder = e.dataTransfer.getData('application/x-reorder');

      if (isReorder) {
        // Reorder
        const fromIdx = state.elements.findIndex(x => x.id === draggedId);
        const toIdx = state.elements.findIndex(x => x.id === el.id);
        if (fromIdx !== -1 && fromIdx !== toIdx) {
          const [moved] = state.elements.splice(fromIdx, 1);
          state.elements.splice(toIdx, 0, moved);
          render();
        }
      } else {
        // New element dropped onto existing one - insert before
        const type = e.dataTransfer.getData('text/plain');
        if (ELEMENT_DEFAULTS[type]) {
          const newEl = createElement(type);
          const toIdx = state.elements.findIndex(x => x.id === el.id);
          state.elements.splice(toIdx, 0, newEl);
          state.selectedId = newEl.id;
          render();
          showConfig(newEl);
        }
      }
    });

    canvas.appendChild(node);
  });
}

// ── Config panel ──
function showConfig(el) {
  configPanel.style.display = 'block';
  const hasOptions = el.type === 'select' || el.type === 'radio';
  const hasRange = el.type === 'range' || el.type === 'number';

  let html = `
    <div class="config-field">
      <label>Label</label>
      <input type="text" data-prop="label" value="${escapeAttr(el.label)}">
    </div>
    <div class="config-field">
      <label>Name</label>
      <input type="text" data-prop="name" value="${escapeAttr(el.name)}">
    </div>
    <div class="config-field">
      <label>ID</label>
      <input type="text" data-prop="fieldId" value="${escapeAttr(el.fieldId)}">
    </div>`;

  if (el.type !== 'checkbox' && el.type !== 'radio' && el.type !== 'select' && el.type !== 'file' && el.type !== 'range' && el.type !== 'color') {
    html += `
    <div class="config-field">
      <label>Placeholder</label>
      <input type="text" data-prop="placeholder" value="${escapeAttr(el.placeholder)}">
    </div>`;
  }

  if (hasOptions) {
    html += `
    <div class="config-field">
      <label>Options (one per line)</label>
      <textarea data-prop="options">${escapeHTML(el.options)}</textarea>
    </div>`;
  }

  if (hasRange) {
    html += `
    <div class="config-field">
      <label>Min</label>
      <input type="number" data-prop="min" value="${escapeAttr(el.min)}">
    </div>
    <div class="config-field">
      <label>Max</label>
      <input type="number" data-prop="max" value="${escapeAttr(el.max)}">
    </div>`;
  }

  html += `
    <div class="config-field config-checkbox">
      <input type="checkbox" id="cfg-required" data-prop="required" ${el.required ? 'checked' : ''}>
      <label for="cfg-required">Required</label>
    </div>`;

  configFields.innerHTML = html;

  // Bind live changes
  configFields.querySelectorAll('[data-prop]').forEach(input => {
    const event = input.type === 'checkbox' ? 'change' : 'input';
    input.addEventListener(event, () => {
      const prop = input.dataset.prop;
      el[prop] = input.type === 'checkbox' ? input.checked : input.value;
      render();
      // Keep config open
      configPanel.style.display = 'block';
    });
  });
}

$('#config-close').addEventListener('click', () => {
  state.selectedId = null;
  configPanel.style.display = 'none';
  renderCanvas();
});

// ── Preview ──
function renderPreview() {
  const title = $('#form-title').value || 'My Form';
  const style = $('#form-style').value;

  let html = `<div style="${getPreviewContainerStyle(style)}">`;
  html += `<h2 style="${getPreviewTitleStyle(style)}">${escapeHTML(title)}</h2>`;

  state.elements.forEach(el => {
    html += renderPreviewElement(el, style);
  });

  if (state.elements.length > 0) {
    html += `<button type="submit" style="${getPreviewButtonStyle(style)}">Submit</button>`;
  }

  html += '</div>';
  previewFrame.innerHTML = html;
}

function getPreviewContainerStyle(style) {
  const base = 'font-family:Inter,sans-serif;';
  switch (style) {
    case 'material': return base + 'padding:0;';
    case 'bootstrap': return base + 'padding:0;';
    default: return base + 'padding:0;';
  }
}

function getPreviewTitleStyle(style) {
  const base = 'margin:0 0 16px 0;font-size:18px;';
  switch (style) {
    case 'basic': return base + 'color:#333;';
    case 'modern': return base + 'color:#1a1a2e;font-weight:600;';
    case 'material': return base + 'color:#1a1a2e;font-weight:500;';
    case 'bootstrap': return base + 'color:#212529;font-weight:700;';
    default: return base + 'color:#333;';
  }
}

function getPreviewInputStyle(style) {
  switch (style) {
    case 'basic':
      return 'width:100%;padding:6px 8px;border:1px solid #ccc;border-radius:3px;font-size:13px;font-family:inherit;box-sizing:border-box;';
    case 'modern':
      return 'width:100%;padding:10px 14px;border:1px solid #e2e2e8;border-radius:8px;font-size:13px;font-family:inherit;box-sizing:border-box;outline:none;transition:border 150ms;background:#fafafa;';
    case 'material':
      return 'width:100%;padding:10px 0;border:none;border-bottom:2px solid #e0e0e0;font-size:14px;font-family:inherit;box-sizing:border-box;outline:none;background:transparent;';
    case 'bootstrap':
      return 'width:100%;padding:8px 12px;border:1px solid #ced4da;border-radius:6px;font-size:14px;font-family:inherit;box-sizing:border-box;outline:none;transition:border-color .15s;';
    default:
      return 'width:100%;padding:8px;border:1px solid #ccc;border-radius:4px;font-size:13px;font-family:inherit;box-sizing:border-box;';
  }
}

function getPreviewLabelStyle(style) {
  switch (style) {
    case 'basic': return 'display:block;margin-bottom:4px;font-size:13px;color:#333;font-weight:500;';
    case 'modern': return 'display:block;margin-bottom:6px;font-size:12px;color:#555;font-weight:600;letter-spacing:0.02em;';
    case 'material': return 'display:block;margin-bottom:4px;font-size:12px;color:#666;font-weight:500;';
    case 'bootstrap': return 'display:block;margin-bottom:6px;font-size:14px;color:#212529;font-weight:500;';
    default: return 'display:block;margin-bottom:4px;font-size:13px;color:#333;';
  }
}

function getPreviewButtonStyle(style) {
  switch (style) {
    case 'basic': return 'padding:8px 20px;background:#333;color:#fff;border:none;border-radius:3px;font-size:14px;cursor:pointer;font-family:inherit;';
    case 'modern': return 'padding:10px 24px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;';
    case 'material': return 'padding:10px 24px;background:#1976d2;color:#fff;border:none;border-radius:4px;font-size:14px;font-weight:500;cursor:pointer;text-transform:uppercase;letter-spacing:0.05em;font-family:inherit;';
    case 'bootstrap': return 'padding:10px 20px;background:#0d6efd;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;font-family:inherit;';
    default: return 'padding:8px 20px;background:#333;color:#fff;border:none;border-radius:4px;font-size:14px;cursor:pointer;';
  }
}

function renderPreviewElement(el, style) {
  const req = el.required ? ' <span style="color:#ef4444;">*</span>' : '';
  const reqAttr = el.required ? ' required' : '';
  const labelStyle = getPreviewLabelStyle(style);
  const inputStyle = getPreviewInputStyle(style);
  const groupStyle = 'margin-bottom:16px;';

  switch (el.type) {
    case 'textarea':
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><textarea style="${inputStyle}min-height:80px;resize:vertical;" placeholder="${escapeAttr(el.placeholder)}"${reqAttr}></textarea></div>`;

    case 'select': {
      const opts = el.options.split('\n').filter(Boolean).map(o => `<option>${escapeHTML(o.trim())}</option>`).join('');
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><select style="${inputStyle}"${reqAttr}>${opts}</select></div>`;
    }

    case 'checkbox':
      return `<div style="${groupStyle}display:flex;align-items:center;gap:8px;"><input type="checkbox" id="prev-${el.fieldId}"${reqAttr}><label for="prev-${el.fieldId}" style="font-size:13px;color:#333;cursor:pointer;">${escapeHTML(el.label)}${req}</label></div>`;

    case 'radio': {
      const opts = el.options.split('\n').filter(Boolean).map(o =>
        `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;"><input type="radio" name="prev-${el.name}"${reqAttr}><label style="font-size:13px;color:#333;cursor:pointer;">${escapeHTML(o.trim())}</label></div>`
      ).join('');
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label>${opts}</div>`;
    }

    case 'range':
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><input type="range" style="width:100%;" min="${escapeAttr(el.min)}" max="${escapeAttr(el.max)}"></div>`;

    case 'color':
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><input type="color" style="border:none;padding:0;width:50px;height:34px;cursor:pointer;background:transparent;"></div>`;

    case 'file':
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><input type="file" style="font-size:13px;font-family:inherit;"${reqAttr}></div>`;

    default:
      return `<div style="${groupStyle}"><label style="${labelStyle}">${escapeHTML(el.label)}${req}</label><input type="${el.type}" style="${inputStyle}" placeholder="${escapeAttr(el.placeholder)}"${reqAttr}></div>`;
  }
}

// ── HTML generation ──
function renderHTML() {
  const title = $('#form-title').value || 'My Form';
  const action = $('#form-action').value || '#';
  const method = $('#form-method').value;
  const style = $('#form-style').value;

  if (state.elements.length === 0) {
    htmlOutput.textContent = '<!-- Add elements to generate HTML -->';
    return;
  }

  let css = generateCSS(style);
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>' + escapeHTML(title) + '</title>\n  <style>\n' + css + '  </style>\n</head>\n<body>\n';
  html += `  <form action="${escapeAttr(action)}" method="${method}" class="form-container">\n`;
  html += `    <h2 class="form-title">${escapeHTML(title)}</h2>\n`;

  state.elements.forEach(el => {
    html += generateElementHTML(el);
  });

  html += '    <button type="submit" class="form-btn">Submit</button>\n';
  html += '  </form>\n</body>\n</html>';

  htmlOutput.textContent = html;
}

function generateCSS(style) {
  switch (style) {
    case 'basic':
      return `    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: sans-serif; padding: 40px; background: #f5f5f5; }
    .form-container { max-width: 500px; margin: 0 auto; background: #fff; padding: 30px; border: 1px solid #ddd; }
    .form-title { margin-bottom: 20px; font-size: 22px; color: #333; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 4px; font-size: 14px; color: #333; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; font-size: 14px; font-family: inherit; }
    .form-group textarea { min-height: 80px; resize: vertical; }
    .form-check { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .form-check label { font-size: 14px; color: #333; cursor: pointer; }
    .form-btn { padding: 10px 24px; background: #333; color: #fff; border: none; border-radius: 3px; font-size: 14px; cursor: pointer; }
    .form-btn:hover { background: #555; }
    .required { color: red; }
`;
    case 'modern':
      return `    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', sans-serif; padding: 40px; background: #f0f0f5; }
    .form-container { max-width: 520px; margin: 0 auto; background: #fff; padding: 36px; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .form-title { margin-bottom: 24px; font-size: 22px; color: #1a1a2e; font-weight: 600; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 13px; color: #555; font-weight: 600; letter-spacing: 0.02em; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 14px; border: 1px solid #e2e2e8; border-radius: 10px; font-size: 14px; font-family: inherit; background: #fafafa; outline: none; transition: border 150ms, box-shadow 150ms; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
    .form-group textarea { min-height: 80px; resize: vertical; }
    .form-check { display: flex; align-items: center; gap: 8px; margin-bottom: 18px; }
    .form-check label { font-size: 14px; color: #444; cursor: pointer; }
    .form-btn { padding: 12px 28px; background: #6366f1; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 150ms; }
    .form-btn:hover { background: #818cf8; }
    .required { color: #ef4444; }
`;
    case 'material':
      return `    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Roboto', sans-serif; padding: 40px; background: #fafafa; }
    .form-container { max-width: 500px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.12); }
    .form-title { margin-bottom: 24px; font-size: 22px; color: #212121; font-weight: 500; }
    .form-group { margin-bottom: 20px; position: relative; }
    .form-group label { display: block; margin-bottom: 4px; font-size: 12px; color: #666; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px 0; border: none; border-bottom: 2px solid #e0e0e0; font-size: 15px; font-family: inherit; background: transparent; outline: none; transition: border-color 200ms; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-bottom-color: #1976d2; }
    .form-group textarea { min-height: 80px; resize: vertical; }
    .form-check { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; }
    .form-check label { font-size: 14px; color: #424242; cursor: pointer; }
    .form-btn { padding: 12px 28px; background: #1976d2; color: #fff; border: none; border-radius: 4px; font-size: 14px; font-weight: 500; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; transition: background 200ms; }
    .form-btn:hover { background: #1565c0; }
    .required { color: #d32f2f; }
`;
    case 'bootstrap':
      return `    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; background: #f8f9fa; }
    .form-container { max-width: 540px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 8px; border: 1px solid #dee2e6; }
    .form-title { margin-bottom: 24px; font-size: 24px; color: #212529; font-weight: 700; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; margin-bottom: 6px; font-size: 14px; color: #212529; font-weight: 500; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 8px 12px; border: 1px solid #ced4da; border-radius: 6px; font-size: 14px; font-family: inherit; outline: none; transition: border-color .15s, box-shadow .15s; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #86b7fe; box-shadow: 0 0 0 3px rgba(13,110,253,0.25); }
    .form-group textarea { min-height: 80px; resize: vertical; }
    .form-check { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
    .form-check label { font-size: 14px; color: #212529; cursor: pointer; }
    .form-btn { padding: 10px 24px; background: #0d6efd; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: background .15s; }
    .form-btn:hover { background: #0b5ed7; }
    .required { color: #dc3545; }
`;
    default: return '';
  }
}

function generateElementHTML(el) {
  const req = el.required ? ' required' : '';
  const reqSpan = el.required ? ' <span class="required">*</span>' : '';
  const indent = '    ';

  switch (el.type) {
    case 'textarea':
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <textarea id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}" placeholder="${escapeAttr(el.placeholder)}"${req}></textarea>\n${indent}</div>\n`;

    case 'select': {
      const opts = el.options.split('\n').filter(Boolean).map(o => `${indent}    <option value="${escapeAttr(o.trim())}">${escapeHTML(o.trim())}</option>`).join('\n');
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <select id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}"${req}>\n${opts}\n${indent}  </select>\n${indent}</div>\n`;
    }

    case 'checkbox':
      return `${indent}<div class="form-check">\n${indent}  <input type="checkbox" id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}"${req}>\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}</div>\n`;

    case 'radio': {
      const opts = el.options.split('\n').filter(Boolean).map((o, i) => {
        const optId = el.fieldId + '_' + i;
        return `${indent}  <div class="form-check">\n${indent}    <input type="radio" id="${optId}" name="${escapeAttr(el.name)}" value="${escapeAttr(o.trim())}"${req}>\n${indent}    <label for="${optId}">${escapeHTML(o.trim())}</label>\n${indent}  </div>`;
      }).join('\n');
      return `${indent}<div class="form-group">\n${indent}  <label>${escapeHTML(el.label)}${reqSpan}</label>\n${opts}\n${indent}</div>\n`;
    }

    case 'range':
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <input type="range" id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}" min="${escapeAttr(el.min)}" max="${escapeAttr(el.max)}">\n${indent}</div>\n`;

    case 'color':
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <input type="color" id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}">\n${indent}</div>\n`;

    case 'file':
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <input type="file" id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}"${req}>\n${indent}</div>\n`;

    default:
      return `${indent}<div class="form-group">\n${indent}  <label for="${escapeAttr(el.fieldId)}">${escapeHTML(el.label)}${reqSpan}</label>\n${indent}  <input type="${el.type}" id="${escapeAttr(el.fieldId)}" name="${escapeAttr(el.name)}" placeholder="${escapeAttr(el.placeholder)}"${req}>\n${indent}</div>\n`;
  }
}

// ── Canvas drop zone (new elements) ──
canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  canvas.classList.add('drag-active');
});

canvas.addEventListener('dragleave', (e) => {
  if (!canvas.contains(e.relatedTarget)) {
    canvas.classList.remove('drag-active');
  }
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  canvas.classList.remove('drag-active');

  const isReorder = e.dataTransfer.getData('application/x-reorder');
  if (isReorder) return; // handled by element's own drop

  const type = e.dataTransfer.getData('text/plain');
  if (!ELEMENT_DEFAULTS[type]) return;

  const el = createElement(type);
  state.elements.push(el);
  state.selectedId = el.id;
  render();
  showConfig(el);
});

// ── Palette drag ──
document.querySelectorAll('.palette-item').forEach(item => {
  item.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', item.dataset.type);
    item.classList.add('dragging');
  });
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
  });
});

// ── Form settings listeners ──
['form-title', 'form-action', 'form-method', 'form-style'].forEach(id => {
  $(`#${id}`).addEventListener('input', render);
  $(`#${id}`).addEventListener('change', render);
});

// ── Header buttons ──
$('#btn-reset').addEventListener('click', () => {
  if (state.elements.length === 0) return;
  if (!confirm('Clear all form elements?')) return;
  state.elements = [];
  state.selectedId = null;
  state.counter = 0;
  configPanel.style.display = 'none';
  render();
});

$('#btn-copy').addEventListener('click', () => {
  const text = htmlOutput.textContent;
  if (!text || text.startsWith('<!--')) return;
  navigator.clipboard.writeText(text).then(() => showToast('Copied to clipboard!'));
});

$('#btn-download').addEventListener('click', () => {
  const text = htmlOutput.textContent;
  if (!text || text.startsWith('<!--')) return;
  const blob = new Blob([text], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = ($('#form-title').value || 'form').toLowerCase().replace(/\s+/g, '-') + '.html';
  a.click();
  URL.revokeObjectURL(url);
  showToast('HTML file downloaded!');
});

// ── Toast ──
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2000);
}

// ── Helpers ──
function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ──
render();
