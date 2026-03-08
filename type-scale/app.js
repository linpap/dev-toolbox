(function () {
  'use strict';

  // ---- Elements ----
  const baseSizeInput = document.getElementById('base-size');
  const scaleRatioSelect = document.getElementById('scale-ratio');
  const customRatioWrap = document.getElementById('custom-ratio-wrap');
  const customRatioInput = document.getElementById('custom-ratio');
  const fontFamilySelect = document.getElementById('font-family');
  const lineHeightInput = document.getElementById('line-height');
  const lineHeightValue = document.getElementById('line-height-value');
  const letterSpacingInput = document.getElementById('letter-spacing');
  const letterSpacingValue = document.getElementById('letter-spacing-value');
  const previewEl = document.getElementById('preview');
  const cssOutputEl = document.getElementById('css-output').querySelector('code');
  const copyCssBtn = document.getElementById('copy-css');
  const toastEl = document.getElementById('toast');
  const sizeChartEl = document.getElementById('size-chart');

  // ---- Scale steps ----
  // Steps go from -1 (small) through 0 (body) up to 6 (h1)
  const steps = [
    { step: 6, tag: 'h1', label: 'Heading 1' },
    { step: 5, tag: 'h2', label: 'Heading 2' },
    { step: 4, tag: 'h3', label: 'Heading 3' },
    { step: 3, tag: 'h4', label: 'Heading 4' },
    { step: 2, tag: 'h5', label: 'Heading 5' },
    { step: 1, tag: 'h6', label: 'Heading 6' },
    { step: 0, tag: 'body', label: 'Body' },
    { step: -1, tag: 'small', label: 'Small' },
  ];

  // ---- State ----
  function getState() {
    const ratioValue = scaleRatioSelect.value;
    const ratio = ratioValue === 'custom'
      ? parseFloat(customRatioInput.value) || 1.2
      : parseFloat(ratioValue);

    return {
      baseSize: parseFloat(baseSizeInput.value) || 16,
      ratio: Math.max(1, Math.min(3, ratio)),
      fontFamily: fontFamilySelect.value,
      lineHeight: parseFloat(lineHeightInput.value),
      letterSpacing: parseFloat(letterSpacingInput.value),
    };
  }

  function calcSize(baseSize, ratio, step) {
    return baseSize * Math.pow(ratio, step);
  }

  function round(n, decimals) {
    const f = Math.pow(10, decimals);
    return Math.round(n * f) / f;
  }

  // ---- Render preview ----
  function renderPreview(state) {
    let html = '';

    steps.forEach(function (s) {
      const px = calcSize(state.baseSize, state.ratio, s.step);
      const rem = round(px / 16, 4);
      const em = round(px / state.baseSize, 4);
      const pxRound = round(px, 2);

      html += '<div class="preview-step">';
      html += '  <div class="preview-text" style="'
        + 'font-size:' + pxRound + 'px;'
        + 'font-family:\'' + state.fontFamily + '\', sans-serif;'
        + 'line-height:' + state.lineHeight + ';'
        + 'letter-spacing:' + state.letterSpacing + 'em;'
        + '">' + s.label + '</div>';
      html += '  <div class="preview-meta">';
      html += '    <span class="preview-tag">' + s.tag + '</span>';
      html += '    <span class="preview-sizes">'
        + pxRound + 'px / ' + rem + 'rem / ' + em + 'em'
        + '</span>';
      html += '  </div>';
      html += '</div>';
    });

    previewEl.innerHTML = html;
  }

  // ---- Render CSS output ----
  function renderCSS(state) {
    const lines = [];

    lines.push(span('comment', '/* Typography Scale'));
    lines.push(span('comment', '   Base: ' + state.baseSize + 'px | Ratio: ' + state.ratio + ' */'));
    lines.push('');
    lines.push(span('selector', ':root') + ' ' + span('punctuation', '{'));

    // Font family
    lines.push('  ' + span('property', '--font-family') + span('punctuation', ': ')
      + span('value', "'" + state.fontFamily + "', sans-serif") + span('punctuation', ';'));

    // Line height
    lines.push('  ' + span('property', '--line-height') + span('punctuation', ': ')
      + span('value', String(state.lineHeight)) + span('punctuation', ';'));

    // Letter spacing
    lines.push('  ' + span('property', '--letter-spacing') + span('punctuation', ': ')
      + span('value', state.letterSpacing + 'em') + span('punctuation', ';'));

    lines.push('');
    lines.push('  ' + span('comment', '/* Type scale steps */'));

    // Steps in ascending order for CSS custom properties
    var sorted = steps.slice().reverse();
    sorted.forEach(function (s) {
      var px = calcSize(state.baseSize, state.ratio, s.step);
      var rem = round(px / 16, 4);
      var stepName = s.step < 0 ? 'n' + Math.abs(s.step) : String(s.step);
      lines.push('  ' + span('property', '--step-' + stepName) + span('punctuation', ': ')
        + span('value', rem + 'rem') + span('punctuation', ';')
        + ' ' + span('comment', '/* ' + round(px, 2) + 'px */'));
    });

    lines.push(span('punctuation', '}'));

    // Element styles
    lines.push('');
    sorted.forEach(function (s) {
      var stepName = s.step < 0 ? 'n' + Math.abs(s.step) : String(s.step);
      lines.push(span('selector', s.tag) + ' ' + span('punctuation', '{'));
      lines.push('  ' + span('property', 'font-size') + span('punctuation', ': ')
        + span('value', 'var(--step-' + stepName + ')') + span('punctuation', ';'));
      lines.push(span('punctuation', '}'));
      lines.push('');
    });

    cssOutputEl.innerHTML = lines.join('\n');
  }

  function span(cls, text) {
    return '<span class="token-' + cls + '">' + escapeHtml(text) + '</span>';
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---- Render size chart ----
  function renderChart(state) {
    var maxPx = calcSize(state.baseSize, state.ratio, 6);
    var chartWidth = sizeChartEl.clientWidth - 80; // account for label + size text
    if (chartWidth < 40) chartWidth = 120;

    var html = '';
    steps.forEach(function (s) {
      var px = calcSize(state.baseSize, state.ratio, s.step);
      var pct = (px / maxPx) * 100;
      var barW = Math.max(2, (px / maxPx) * chartWidth);

      html += '<div class="chart-bar-row">';
      html += '  <span class="chart-label">' + s.tag + '</span>';
      html += '  <span class="chart-bar" style="width:' + pct + '%"></span>';
      html += '  <span class="chart-size">' + round(px, 1) + '</span>';
      html += '</div>';
    });

    sizeChartEl.innerHTML = html;
  }

  // ---- Get plain CSS for clipboard ----
  function getPlainCSS(state) {
    var lines = [];

    lines.push('/* Typography Scale');
    lines.push('   Base: ' + state.baseSize + 'px | Ratio: ' + state.ratio + ' */');
    lines.push('');
    lines.push(':root {');
    lines.push("  --font-family: '" + state.fontFamily + "', sans-serif;");
    lines.push('  --line-height: ' + state.lineHeight + ';');
    lines.push('  --letter-spacing: ' + state.letterSpacing + 'em;');
    lines.push('');
    lines.push('  /* Type scale steps */');

    var sorted = steps.slice().reverse();
    sorted.forEach(function (s) {
      var px = calcSize(state.baseSize, state.ratio, s.step);
      var rem = round(px / 16, 4);
      var stepName = s.step < 0 ? 'n' + Math.abs(s.step) : String(s.step);
      lines.push('  --step-' + stepName + ': ' + rem + 'rem; /* ' + round(px, 2) + 'px */');
    });

    lines.push('}');
    lines.push('');

    sorted.forEach(function (s) {
      var stepName = s.step < 0 ? 'n' + Math.abs(s.step) : String(s.step);
      lines.push(s.tag + ' {');
      lines.push('  font-size: var(--step-' + stepName + ');');
      lines.push('}');
      lines.push('');
    });

    return lines.join('\n');
  }

  // ---- Copy CSS ----
  function copyCSS() {
    var state = getState();
    var css = getPlainCSS(state);

    navigator.clipboard.writeText(css).then(function () {
      showToast();
    }).catch(function () {
      // Fallback
      var textarea = document.createElement('textarea');
      textarea.value = css;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showToast();
    });
  }

  var toastTimeout;
  function showToast() {
    clearTimeout(toastTimeout);
    toastEl.classList.add('show');
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove('show');
    }, 2000);
  }

  // ---- Update all ----
  function update() {
    var state = getState();
    lineHeightValue.textContent = state.lineHeight;
    letterSpacingValue.textContent = state.letterSpacing + 'em';

    // Show/hide custom ratio
    if (scaleRatioSelect.value === 'custom') {
      customRatioWrap.classList.remove('hidden');
    } else {
      customRatioWrap.classList.add('hidden');
    }

    renderPreview(state);
    renderCSS(state);
    renderChart(state);
  }

  // ---- Event listeners ----
  baseSizeInput.addEventListener('input', update);
  scaleRatioSelect.addEventListener('change', update);
  customRatioInput.addEventListener('input', update);
  fontFamilySelect.addEventListener('change', update);
  lineHeightInput.addEventListener('input', update);
  letterSpacingInput.addEventListener('input', update);
  copyCssBtn.addEventListener('click', copyCSS);

  // Recalculate chart on resize
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 100);
  });

  // ---- Init ----
  update();

})();
