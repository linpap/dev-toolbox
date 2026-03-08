(function () {
  'use strict';

  // ── Config ──
  const SCALE_STEPS = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 80, 96];

  // Tailwind default spacing: key = px value, value = Tailwind class suffix
  // Based on Tailwind's default spacing scale (1 unit = 4px)
  const TAILWIND_MAP = {
    0: '0',
    1: 'px',
    2: '0.5',
    4: '1',
    6: '1.5',
    8: '2',
    10: '2.5',
    12: '3',
    14: '3.5',
    16: '4',
    20: '5',
    24: '6',
    28: '7',
    32: '8',
    36: '9',
    40: '10',
    44: '11',
    48: '12',
    56: '14',
    64: '16',
    72: '18',
    80: '20',
    96: '24',
    112: '28',
    128: '32',
    144: '36',
    160: '40',
    176: '44',
    192: '48',
    208: '52',
    224: '56',
    240: '60',
    256: '64',
    288: '72',
    320: '80',
    384: '96',
  };

  // ── DOM refs ──
  const baseUnitInput = document.getElementById('base-unit');
  const remBaseInput = document.getElementById('rem-base');
  const scaleBody = document.getElementById('scale-body');
  const cssOutput = document.getElementById('css-output');
  const copyCssBtn = document.getElementById('copy-css-btn');
  const toast = document.getElementById('toast');
  const presetBtns = document.querySelectorAll('.preset-btn');

  // Box model
  const boxMargin = document.getElementById('box-margin');
  const boxBorder = document.getElementById('box-border');
  const boxPadding = document.getElementById('box-padding');
  const boxContent = document.getElementById('box-content');
  const boxDims = document.getElementById('box-dims');
  const contentWidthInput = document.getElementById('content-width');
  const contentHeightInput = document.getElementById('content-height');

  let toastTimeout = null;

  // ── Helpers ──
  function round(val, decimals) {
    if (decimals === undefined) decimals = 4;
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  }

  function showToast(message) {
    if (!message) message = 'Copied!';
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }

  function copyText(text) {
    navigator.clipboard.writeText(text).then(function () {
      showToast('Copied: ' + text);
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied: ' + text);
    });
  }

  // ── Scale Rendering ──
  function getBaseUnit() {
    return parseFloat(baseUnitInput.value) || 4;
  }

  function getRemBase() {
    return parseFloat(remBaseInput.value) || 16;
  }

  function renderScale() {
    var base = getBaseUnit();
    var remBase = getRemBase();
    var maxPx = SCALE_STEPS[SCALE_STEPS.length - 1] * base;
    var rows = '';

    SCALE_STEPS.forEach(function (step) {
      var px = step * base;
      var rem = round(px / remBase);
      var em = rem; // em and rem are same numeric value (context-dependent in real use)
      var pxStr = px + 'px';
      var remStr = rem + 'rem';
      var emStr = em + 'em';

      // Tailwind match
      var twKey = px;
      var twMatch = TAILWIND_MAP[twKey];
      var twHtml;
      if (twMatch !== undefined) {
        twHtml = '<span class="tw-badge" title="Click to copy p-' + twMatch + '">' + twMatch + '</span>';
      } else {
        twHtml = '<span class="tw-badge no-match">--</span>';
      }

      // Bar width
      var barWidth = maxPx > 0 ? (px / maxPx) * 100 : 0;

      rows += '<tr>' +
        '<td class="step-cell">' + step + '</td>' +
        '<td class="value-cell" data-copy="' + pxStr + '"><span>' + pxStr + '</span></td>' +
        '<td class="value-cell" data-copy="' + remStr + '"><span>' + remStr + '</span></td>' +
        '<td class="value-cell" data-copy="' + emStr + '"><span>' + emStr + '</span></td>' +
        '<td class="tailwind-col">' + twHtml + '</td>' +
        '<td class="bar-col"><div class="bar-container"><div class="bar" style="width:' + barWidth + '%"></div></div></td>' +
        '</tr>';
    });

    scaleBody.innerHTML = rows;
  }

  function renderCSSOutput() {
    var base = getBaseUnit();
    var remBase = getRemBase();
    var lines = [];

    lines.push('<span class="comment">/* Spacing Scale — Base: ' + base + 'px */</span>');
    lines.push(':root {');

    SCALE_STEPS.forEach(function (step) {
      var px = step * base;
      var rem = round(px / remBase);
      var varName = '  --space-' + step;
      var padded = varName + ':';
      // Pad for alignment
      while (padded.length < 20) padded += ' ';
      lines.push(
        '<span class="prop-name">' + padded + '</span>' +
        '<span class="prop-value">' + rem + 'rem</span>;' +
        ' <span class="comment">/* ' + px + 'px */</span>'
      );
    });

    lines.push('}');

    cssOutput.innerHTML = lines.join('\n');
  }

  function getCSSPlainText() {
    var base = getBaseUnit();
    var remBase = getRemBase();
    var lines = [];

    lines.push('/* Spacing Scale \u2014 Base: ' + base + 'px */');
    lines.push(':root {');

    SCALE_STEPS.forEach(function (step) {
      var px = step * base;
      var rem = round(px / remBase);
      var line = '  --space-' + step + ': ' + rem + 'rem; /* ' + px + 'px */';
      lines.push(line);
    });

    lines.push('}');
    return lines.join('\n');
  }

  function renderAll() {
    renderScale();
    renderCSSOutput();
  }

  // ── Box Model ──
  function getBoxValues() {
    var vals = { margin: {}, border: {}, padding: {} };
    var inputs = document.querySelectorAll('[data-box]');
    inputs.forEach(function (input) {
      var box = input.getAttribute('data-box');
      var side = input.getAttribute('data-side');
      vals[box][side] = parseInt(input.value, 10) || 0;
    });
    vals.contentWidth = parseInt(contentWidthInput.value, 10) || 60;
    vals.contentHeight = parseInt(contentHeightInput.value, 10) || 40;
    return vals;
  }

  function updateBoxModel() {
    var v = getBoxValues();

    // Margin
    boxMargin.style.paddingTop = v.margin.top + 'px';
    boxMargin.style.paddingRight = v.margin.right + 'px';
    boxMargin.style.paddingBottom = v.margin.bottom + 'px';
    boxMargin.style.paddingLeft = v.margin.left + 'px';

    // Border (using padding to represent border thickness visually)
    boxBorder.style.paddingTop = v.border.top + 'px';
    boxBorder.style.paddingRight = v.border.right + 'px';
    boxBorder.style.paddingBottom = v.border.bottom + 'px';
    boxBorder.style.paddingLeft = v.border.left + 'px';

    // Padding
    boxPadding.style.paddingTop = v.padding.top + 'px';
    boxPadding.style.paddingRight = v.padding.right + 'px';
    boxPadding.style.paddingBottom = v.padding.bottom + 'px';
    boxPadding.style.paddingLeft = v.padding.left + 'px';

    // Content
    boxContent.style.width = v.contentWidth + 'px';
    boxContent.style.height = v.contentHeight + 'px';

    // Total dimensions
    var totalW = v.contentWidth +
      v.padding.left + v.padding.right +
      v.border.left + v.border.right +
      v.margin.left + v.margin.right;
    var totalH = v.contentHeight +
      v.padding.top + v.padding.bottom +
      v.border.top + v.border.bottom +
      v.margin.top + v.margin.bottom;

    boxDims.textContent = v.contentWidth + ' \u00d7 ' + v.contentHeight;
    boxMargin.title = 'Total: ' + totalW + ' \u00d7 ' + totalH + 'px';
  }

  // ── Event Listeners ──

  // Base unit & rem base
  baseUnitInput.addEventListener('input', function () {
    // Update preset button states
    var val = parseInt(baseUnitInput.value, 10);
    presetBtns.forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.dataset.base, 10) === val);
    });
    renderAll();
  });

  remBaseInput.addEventListener('input', renderAll);

  // Preset buttons
  presetBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var base = parseInt(btn.dataset.base, 10);
      baseUnitInput.value = base;
      presetBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      renderAll();
    });
  });

  // Click to copy values in scale table
  scaleBody.addEventListener('click', function (e) {
    var cell = e.target.closest('.value-cell');
    if (cell) {
      copyText(cell.dataset.copy);
      return;
    }
    var twBadge = e.target.closest('.tw-badge');
    if (twBadge && !twBadge.classList.contains('no-match')) {
      copyText(twBadge.textContent);
    }
  });

  // Copy CSS button
  copyCssBtn.addEventListener('click', function () {
    var text = getCSSPlainText();
    copyText(text);
    showToast('CSS copied to clipboard!');
  });

  // Box model inputs
  document.querySelectorAll('[data-box]').forEach(function (input) {
    input.addEventListener('input', updateBoxModel);
  });
  contentWidthInput.addEventListener('input', updateBoxModel);
  contentHeightInput.addEventListener('input', updateBoxModel);

  // ── Init ──
  renderAll();
  updateBoxModel();

})();
