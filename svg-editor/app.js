(function () {
  'use strict';

  // ---- DOM refs ----
  const svgInput = document.getElementById('svg-input');
  const svgPreview = document.getElementById('svg-preview');
  const previewBg = document.getElementById('preview-bg');
  const sizeBefore = document.getElementById('size-before');
  const sizeAfter = document.getElementById('size-after');
  const savingsBadge = document.getElementById('savings');
  const fileUpload = document.getElementById('file-upload');

  const optComments = document.getElementById('opt-comments');
  const optMetadata = document.getElementById('opt-metadata');
  const optEmptyGroups = document.getElementById('opt-empty-groups');
  const optShortenIds = document.getElementById('opt-shorten-ids');
  const optDecimals = document.getElementById('opt-decimals');
  const decimalPlaces = document.getElementById('decimal-places');

  const attrWidth = document.getElementById('attr-width');
  const attrHeight = document.getElementById('attr-height');
  const attrViewbox = document.getElementById('attr-viewbox');
  const attrFill = document.getElementById('attr-fill');
  const attrStroke = document.getElementById('attr-stroke');
  const fillPicker = document.getElementById('fill-picker');
  const strokePicker = document.getElementById('stroke-picker');

  const btnOptimize = document.getElementById('btn-optimize');
  const btnApplyAttrs = document.getElementById('btn-apply-attrs');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  const btnDataUri = document.getElementById('btn-data-uri');
  const btnBase64 = document.getElementById('btn-base64');

  const bgLight = document.getElementById('bg-light');
  const bgDark = document.getElementById('bg-dark');
  const bgChecker = document.getElementById('bg-checker');

  // ---- Toast notifications ----
  function toast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;

    const icons = {
      success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
      error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    el.innerHTML = (icons[type] || icons.info) + `<span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('toast-out');
      el.addEventListener('animationend', () => el.remove());
    }, 2800);
  }

  // ---- Helpers ----
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(2) + ' MB';
  }

  function byteSize(str) {
    return new Blob([str]).size;
  }

  function isSvg(str) {
    return /<svg[\s>]/i.test(str);
  }

  // ---- File size display ----
  function updateSizeBefore(svg) {
    if (!svg.trim()) {
      sizeBefore.textContent = '--';
      return;
    }
    sizeBefore.textContent = formatBytes(byteSize(svg));
  }

  function updateSizeAfter(svg) {
    if (!svg.trim()) {
      sizeAfter.textContent = '--';
      savingsBadge.textContent = '--';
      return;
    }
    sizeAfter.textContent = formatBytes(byteSize(svg));
  }

  function updateSavings(originalSvg, optimizedSvg) {
    if (!originalSvg.trim() || !optimizedSvg.trim()) {
      savingsBadge.textContent = '--';
      return;
    }
    const before = byteSize(originalSvg);
    const after = byteSize(optimizedSvg);
    if (before === 0) {
      savingsBadge.textContent = '--';
      return;
    }
    const pct = ((1 - after / before) * 100).toFixed(1);
    if (pct > 0) {
      savingsBadge.textContent = '-' + pct + '%';
    } else {
      savingsBadge.textContent = '0%';
    }
  }

  // ---- Live preview ----
  let originalSvg = '';

  function updatePreview() {
    const raw = svgInput.value.trim();
    if (!raw) {
      svgPreview.innerHTML = '';
      updateSizeBefore('');
      updateSizeAfter('');
      savingsBadge.textContent = '--';
      return;
    }
    if (!isSvg(raw)) {
      svgPreview.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Not a valid SVG</p>';
      return;
    }

    // Sanitize: use DOMParser to avoid script injection
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'image/svg+xml');
    const errorNode = doc.querySelector('parsererror');

    if (errorNode) {
      svgPreview.innerHTML = '<p style="color:var(--red);font-size:13px;">SVG parse error</p>';
      return;
    }

    // Remove script elements for safety
    doc.querySelectorAll('script').forEach(s => s.remove());

    const svgEl = doc.documentElement;
    // Ensure it renders reasonably
    if (!svgEl.getAttribute('width') && !svgEl.getAttribute('viewBox')) {
      svgEl.setAttribute('width', '100%');
    }

    svgPreview.innerHTML = '';
    svgPreview.appendChild(document.importNode(svgEl, true));

    updateSizeAfter(raw);
    updateSavings(originalSvg || raw, raw);
  }

  let previewTimeout;
  svgInput.addEventListener('input', () => {
    if (!originalSvg) {
      originalSvg = svgInput.value;
      updateSizeBefore(originalSvg);
    }
    clearTimeout(previewTimeout);
    previewTimeout = setTimeout(updatePreview, 200);
  });

  // ---- Optimization engine ----
  function optimizeSvg(svg) {
    let result = svg;

    // Remove XML declaration
    result = result.replace(/<\?xml[^?]*\?>\s*/gi, '');

    // Remove comments
    if (optComments.checked) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }

    // Remove metadata elements
    if (optMetadata.checked) {
      result = result.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
      result = result.replace(/<desc[\s\S]*?<\/desc>/gi, '');
      result = result.replace(/<title[\s\S]*?<\/title>/gi, '');
      // Remove common editor attributes
      result = result.replace(/\s+(data-name|xmlns:xlink|xmlns:serif|xmlns:sketch|xmlns:inkscape|inkscape:[a-z\-]+|sodipodi:[a-z\-]+)="[^"]*"/gi, '');
    }

    // Remove empty groups
    if (optEmptyGroups.checked) {
      let prev;
      do {
        prev = result;
        result = result.replace(/<g[^>]*>\s*<\/g>/gi, '');
      } while (result !== prev);
    }

    // Shorten IDs
    if (optShortenIds.checked) {
      const idMap = {};
      let counter = 0;
      const chars = 'abcdefghijklmnopqrstuvwxyz';

      function shortId(n) {
        let id = '';
        do {
          id = chars[n % 26] + id;
          n = Math.floor(n / 26) - 1;
        } while (n >= 0);
        return id;
      }

      // Find all IDs
      const idRegex = /\bid="([^"]+)"/g;
      let match;
      while ((match = idRegex.exec(result)) !== null) {
        const origId = match[1];
        if (!idMap[origId]) {
          idMap[origId] = shortId(counter++);
        }
      }

      // Replace IDs and their references
      for (const [orig, short] of Object.entries(idMap)) {
        const escapedOrig = orig.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        result = result.replace(new RegExp(`id="${escapedOrig}"`, 'g'), `id="${short}"`);
        result = result.replace(new RegExp(`#${escapedOrig}`, 'g'), `#${short}`);
        result = result.replace(new RegExp(`url\\(#${escapedOrig}\\)`, 'g'), `url(#${short})`);
      }
    }

    // Reduce decimal precision
    if (optDecimals.checked) {
      const places = parseInt(decimalPlaces.value, 10) || 2;
      // Match numbers with excessive decimals in attribute values
      result = result.replace(/(\d+\.\d{3,})/g, (m) => {
        return parseFloat(parseFloat(m).toFixed(places)).toString();
      });
    }

    // Clean up excessive whitespace
    result = result.replace(/\n\s*\n/g, '\n');
    result = result.trim();

    return result;
  }

  btnOptimize.addEventListener('click', () => {
    const raw = svgInput.value.trim();
    if (!raw) {
      toast('No SVG to optimize', 'error');
      return;
    }
    if (!isSvg(raw)) {
      toast('Input does not appear to be valid SVG', 'error');
      return;
    }

    originalSvg = raw;
    updateSizeBefore(originalSvg);

    const optimized = optimizeSvg(raw);
    svgInput.value = optimized;
    updatePreview();

    const before = byteSize(raw);
    const after = byteSize(optimized);
    const saved = ((1 - after / before) * 100).toFixed(1);
    toast(`Optimized: ${formatBytes(before)} \u2192 ${formatBytes(after)} (-${saved}%)`, 'success');
  });

  // ---- Apply attributes ----
  btnApplyAttrs.addEventListener('click', () => {
    let svg = svgInput.value.trim();
    if (!svg || !isSvg(svg)) {
      toast('No valid SVG in editor', 'error');
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    const svgEl = doc.documentElement;

    if (doc.querySelector('parsererror')) {
      toast('Cannot parse SVG', 'error');
      return;
    }

    if (attrWidth.value.trim()) svgEl.setAttribute('width', attrWidth.value.trim());
    if (attrHeight.value.trim()) svgEl.setAttribute('height', attrHeight.value.trim());
    if (attrViewbox.value.trim()) svgEl.setAttribute('viewBox', attrViewbox.value.trim());
    if (attrFill.value.trim()) svgEl.setAttribute('fill', attrFill.value.trim());
    if (attrStroke.value.trim()) svgEl.setAttribute('stroke', attrStroke.value.trim());

    const serializer = new XMLSerializer();
    svgInput.value = serializer.serializeToString(svgEl);
    updatePreview();
    toast('Attributes applied', 'success');
  });

  // ---- Color pickers sync ----
  fillPicker.addEventListener('input', () => {
    attrFill.value = fillPicker.value;
  });

  strokePicker.addEventListener('input', () => {
    attrStroke.value = strokePicker.value;
  });

  attrFill.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(attrFill.value)) {
      fillPicker.value = attrFill.value;
    }
  });

  attrStroke.addEventListener('input', () => {
    if (/^#[0-9a-f]{6}$/i.test(attrStroke.value)) {
      strokePicker.value = attrStroke.value;
    }
  });

  // ---- Copy ----
  btnCopy.addEventListener('click', () => {
    const svg = svgInput.value.trim();
    if (!svg) {
      toast('Nothing to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(svg).then(() => {
      toast('SVG copied to clipboard', 'success');
    }).catch(() => {
      toast('Failed to copy', 'error');
    });
  });

  // ---- Download ----
  btnDownload.addEventListener('click', () => {
    const svg = svgInput.value.trim();
    if (!svg) {
      toast('Nothing to download', 'error');
      return;
    }
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast('SVG downloaded', 'success');
  });

  // ---- Data URI ----
  btnDataUri.addEventListener('click', () => {
    const svg = svgInput.value.trim();
    if (!svg) {
      toast('Nothing to convert', 'error');
      return;
    }
    // Encode for CSS use
    const encoded = svg
      .replace(/"/g, "'")
      .replace(/%/g, '%25')
      .replace(/#/g, '%23')
      .replace(/{/g, '%7B')
      .replace(/}/g, '%7D')
      .replace(/</g, '%3C')
      .replace(/>/g, '%3E')
      .replace(/\s+/g, ' ');

    const dataUri = `url("data:image/svg+xml,${encoded}")`;
    navigator.clipboard.writeText(dataUri).then(() => {
      toast('Data URI copied to clipboard', 'success');
    }).catch(() => {
      toast('Failed to copy', 'error');
    });
  });

  // ---- Base64 ----
  btnBase64.addEventListener('click', () => {
    const svg = svgInput.value.trim();
    if (!svg) {
      toast('Nothing to convert', 'error');
      return;
    }
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    const dataUri = `data:image/svg+xml;base64,${base64}`;
    navigator.clipboard.writeText(dataUri).then(() => {
      toast('Base64 data URI copied to clipboard', 'success');
    }).catch(() => {
      toast('Failed to copy', 'error');
    });
  });

  // ---- File upload ----
  fileUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      toast('Please select an SVG file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      svgInput.value = content;
      originalSvg = content;
      updateSizeBefore(content);
      updatePreview();
      toast(`Loaded: ${file.name}`, 'success');
    };
    reader.onerror = () => {
      toast('Failed to read file', 'error');
    };
    reader.readAsText(file);

    // Reset so the same file can be re-uploaded
    fileUpload.value = '';
  });

  // ---- Preview background toggle ----
  const bgBtns = [bgLight, bgDark, bgChecker];

  function setPreviewBg(mode) {
    bgBtns.forEach(b => b.classList.remove('active'));
    previewBg.classList.remove('bg-light', 'bg-dark');

    if (mode === 'light') {
      previewBg.classList.add('bg-light');
      bgLight.classList.add('active');
    } else if (mode === 'dark') {
      previewBg.classList.add('bg-dark');
      bgDark.classList.add('active');
    } else {
      bgChecker.classList.add('active');
    }
  }

  bgLight.addEventListener('click', () => setPreviewBg('light'));
  bgDark.addEventListener('click', () => setPreviewBg('dark'));
  bgChecker.addEventListener('click', () => setPreviewBg('checker'));

  // ---- Parse attributes from loaded SVG ----
  svgInput.addEventListener('input', () => {
    parseAttributesFromSvg();
  });

  function parseAttributesFromSvg() {
    const svg = svgInput.value.trim();
    if (!svg || !isSvg(svg)) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) return;

    const svgEl = doc.documentElement;
    attrWidth.value = svgEl.getAttribute('width') || '';
    attrHeight.value = svgEl.getAttribute('height') || '';
    attrViewbox.value = svgEl.getAttribute('viewBox') || '';

    const fill = svgEl.getAttribute('fill') || '';
    attrFill.value = fill;
    if (/^#[0-9a-f]{6}$/i.test(fill)) fillPicker.value = fill;

    const stroke = svgEl.getAttribute('stroke') || '';
    attrStroke.value = stroke;
    if (/^#[0-9a-f]{6}$/i.test(stroke)) strokePicker.value = stroke;
  }

  // ---- Drag and drop ----
  document.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  document.addEventListener('drop', (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      toast('Please drop an SVG file', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      svgInput.value = event.target.result;
      originalSvg = event.target.result;
      updateSizeBefore(originalSvg);
      updatePreview();
      toast(`Loaded: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  });
})();
