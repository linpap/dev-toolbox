(function () {
  'use strict';

  // DOM refs
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const bgColorInput = document.getElementById('bg-color');
  const bgColorText = document.getElementById('bg-color-text');
  const textColorInput = document.getElementById('text-color');
  const textColorText = document.getElementById('text-color-text');
  const customTextInput = document.getElementById('custom-text');
  const fontSizeModeSelect = document.getElementById('font-size-mode');
  const manualFontSizeField = document.getElementById('manual-font-size-field');
  const fontSizeInput = document.getElementById('font-size');
  const canvas = document.getElementById('preview-canvas');
  const ctx = canvas.getContext('2d');
  const imgTagOutput = document.getElementById('img-tag-output');
  const downloadBtn = document.getElementById('download-btn');
  const copyUriBtn = document.getElementById('copy-uri-btn');
  const copyTagBtn = document.getElementById('copy-tag-btn');
  const batchGenerateBtn = document.getElementById('batch-generate-btn');
  const toastContainer = document.getElementById('toast-container');

  // State
  let currentDataUri = '';

  // Toast system
  function showToast(message, type) {
    type = type || 'success';
    var el = document.createElement('div');
    el.className = 'toast toast-' + type;
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(function () {
      el.classList.add('toast-out');
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 300);
    }, 2500);
  }

  // Color sync helpers
  function syncColorInputs(colorInput, textInput) {
    colorInput.addEventListener('input', function () {
      textInput.value = colorInput.value;
      generate();
    });
    textInput.addEventListener('input', function () {
      var v = textInput.value;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        colorInput.value = v;
        generate();
      }
    });
    textInput.addEventListener('change', function () {
      var v = textInput.value;
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        colorInput.value = v;
      } else {
        textInput.value = colorInput.value;
      }
      generate();
    });
  }

  syncColorInputs(bgColorInput, bgColorText);
  syncColorInputs(textColorInput, textColorText);

  // Font size mode toggle
  fontSizeModeSelect.addEventListener('change', function () {
    manualFontSizeField.style.display = fontSizeModeSelect.value === 'manual' ? '' : 'none';
    generate();
  });

  // Get selected format
  function getFormat() {
    var checked = document.querySelector('input[name="format"]:checked');
    return checked ? checked.value : 'png';
  }

  // Calculate auto font size
  function calcAutoFontSize(w, h) {
    return Math.max(12, Math.min(w, h) / 8);
  }

  // Render to a canvas and return it
  function renderImage(w, h, bgColor, textColor, text, fontSize) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var cx = c.getContext('2d');

    // Background
    cx.fillStyle = bgColor;
    cx.fillRect(0, 0, w, h);

    // Text
    var label = text || (w + '\u00d7' + h);
    var size = fontSize || calcAutoFontSize(w, h);
    cx.fillStyle = textColor;
    cx.font = '600 ' + size + 'px Inter, system-ui, sans-serif';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.fillText(label, w / 2, h / 2);

    return c;
  }

  // Generate SVG string
  function generateSVG(w, h, bgColor, textColor, text, fontSize) {
    var label = text || (w + '\u00d7' + h);
    var size = fontSize || calcAutoFontSize(w, h);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '">' +
      '<rect width="100%" height="100%" fill="' + bgColor + '"/>' +
      '<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" ' +
      'font-family="Inter, system-ui, sans-serif" font-weight="600" ' +
      'font-size="' + size + '" fill="' + textColor + '">' +
      escapeXml(label) + '</text></svg>';
  }

  function escapeXml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  // Read current settings
  function getSettings() {
    var w = Math.max(1, Math.min(4096, parseInt(widthInput.value) || 800));
    var h = Math.max(1, Math.min(4096, parseInt(heightInput.value) || 600));
    var bgColor = bgColorInput.value;
    var textColor = textColorInput.value;
    var text = customTextInput.value;
    var fontSize = fontSizeModeSelect.value === 'manual' ? (parseInt(fontSizeInput.value) || 32) : 0;
    var format = getFormat();
    return { w: w, h: h, bgColor: bgColor, textColor: textColor, text: text, fontSize: fontSize, format: format };
  }

  // Get data URI for given settings
  function getDataUri(s) {
    if (s.format === 'svg') {
      var svg = generateSVG(s.w, s.h, s.bgColor, s.textColor, s.text, s.fontSize);
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    }
    var c = renderImage(s.w, s.h, s.bgColor, s.textColor, s.text, s.fontSize);
    var mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
    return c.toDataURL(mimeMap[s.format] || 'image/png', 0.92);
  }

  // Escape HTML for display
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Main generate
  function generate() {
    var s = getSettings();

    // Render preview on the visible canvas
    canvas.width = s.w;
    canvas.height = s.h;
    ctx.fillStyle = s.bgColor;
    ctx.fillRect(0, 0, s.w, s.h);
    var label = s.text || (s.w + '\u00d7' + s.h);
    var size = s.fontSize || calcAutoFontSize(s.w, s.h);
    ctx.fillStyle = s.textColor;
    ctx.font = '600 ' + size + 'px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, s.w / 2, s.h / 2);

    // Data URI
    currentDataUri = getDataUri(s);

    // HTML tag output
    var tag = '<img src="' + currentDataUri + '" width="' + s.w + '" height="' + s.h + '" alt="Placeholder ' + s.w + 'x' + s.h + '">';
    // Show truncated version for display
    var displayUri = currentDataUri.length > 120
      ? currentDataUri.substring(0, 120) + '...'
      : currentDataUri;
    var displayTag = '&lt;img src=&quot;' + escapeHtml(displayUri) + '&quot; width=&quot;' + s.w + '&quot; height=&quot;' + s.h + '&quot; alt=&quot;Placeholder ' + s.w + 'x' + s.h + '&quot;&gt;';
    imgTagOutput.innerHTML = displayTag;

    // Store full tag for copy
    imgTagOutput.dataset.fullTag = tag;
  }

  // Download
  function downloadImage(dataUri, filename) {
    var a = document.createElement('a');
    a.href = dataUri;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  downloadBtn.addEventListener('click', function () {
    var s = getSettings();
    var ext = s.format === 'jpeg' ? 'jpg' : s.format;
    var uri = getDataUri(s);
    downloadImage(uri, 'placeholder-' + s.w + 'x' + s.h + '.' + ext);
    showToast('Image downloaded');
  });

  // Copy data URI
  copyUriBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(currentDataUri).then(function () {
      showToast('Data URI copied to clipboard');
    }).catch(function () {
      fallbackCopy(currentDataUri);
      showToast('Data URI copied to clipboard');
    });
  });

  // Copy HTML tag
  copyTagBtn.addEventListener('click', function () {
    var tag = imgTagOutput.dataset.fullTag || '';
    navigator.clipboard.writeText(tag).then(function () {
      showToast('HTML tag copied to clipboard');
    }).catch(function () {
      fallbackCopy(tag);
      showToast('HTML tag copied to clipboard');
    });
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  // Presets
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      widthInput.value = btn.dataset.w;
      heightInput.value = btn.dataset.h;
      generate();
      showToast('Preset applied: ' + btn.dataset.w + '\u00d7' + btn.dataset.h);
    });
  });

  // Format change
  document.querySelectorAll('input[name="format"]').forEach(function (radio) {
    radio.addEventListener('change', generate);
  });

  // Batch generate
  batchGenerateBtn.addEventListener('click', function () {
    var checks = document.querySelectorAll('.batch-checks input[type="checkbox"]:checked');
    if (checks.length === 0) {
      showToast('Select at least one preset for batch generation', 'error');
      return;
    }

    var s = getSettings();
    var count = 0;

    checks.forEach(function (cb) {
      var w = parseInt(cb.dataset.w);
      var h = parseInt(cb.dataset.h);
      var batchSettings = {
        w: w, h: h,
        bgColor: s.bgColor,
        textColor: s.textColor,
        text: '', // use dimensions for batch
        fontSize: 0, // auto for batch
        format: s.format
      };
      var ext = s.format === 'jpeg' ? 'jpg' : s.format;
      var uri = getDataUri(batchSettings);

      // Stagger downloads slightly to avoid browser blocking
      setTimeout(function () {
        downloadImage(uri, 'placeholder-' + w + 'x' + h + '.' + ext);
      }, count * 200);
      count++;
    });

    showToast(count + ' image' + (count > 1 ? 's' : '') + ' downloading');
  });

  // Live update on input changes
  var inputElements = [widthInput, heightInput, customTextInput, fontSizeInput];
  inputElements.forEach(function (el) {
    el.addEventListener('input', generate);
  });

  // Initial render
  generate();
})();
