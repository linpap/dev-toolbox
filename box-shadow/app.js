(function () {
  'use strict';

  const previewBox = document.getElementById('previewBox');
  const cssOutput = document.getElementById('cssOutput');
  const copyBtn = document.getElementById('copyBtn');
  const toast = document.getElementById('toast');
  const addShadowBtn = document.getElementById('addShadowBtn');
  const shadowLayersEl = document.getElementById('shadowLayers');
  const presetGrid = document.getElementById('presetGrid');

  const PRESETS = {
    subtle: [{ x: 0, y: 1, blur: 3, spread: 0, color: '#000000', opacity: 0.12, inset: false }],
    medium: [{ x: 0, y: 4, blur: 14, spread: -2, color: '#000000', opacity: 0.25, inset: false }],
    heavy: [{ x: 0, y: 12, blur: 40, spread: -4, color: '#000000', opacity: 0.45, inset: false }],
    floating: [
      { x: 0, y: 20, blur: 60, spread: -10, color: '#000000', opacity: 0.35, inset: false },
      { x: 0, y: 4, blur: 12, spread: -2, color: '#000000', opacity: 0.15, inset: false },
    ],
    sharp: [{ x: 6, y: 6, blur: 0, spread: 0, color: '#6366f1', opacity: 0.6, inset: false }],
    layered: [
      { x: 0, y: 1, blur: 2, spread: 0, color: '#000000', opacity: 0.1, inset: false },
      { x: 0, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 0.1, inset: false },
      { x: 0, y: 16, blur: 32, spread: 0, color: '#000000', opacity: 0.15, inset: false },
    ],
  };

  let shadows = [
    { x: 0, y: 8, blur: 24, spread: -4, color: '#000000', opacity: 0.3, inset: false },
  ];

  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  function shadowToCSS(s) {
    const insetStr = s.inset ? 'inset ' : '';
    return `${insetStr}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${hexToRgba(s.color, s.opacity)}`;
  }

  function getFullCSS() {
    const val = shadows.map(shadowToCSS).join(',\n    ');
    return `box-shadow: ${val};`;
  }

  function update() {
    const val = shadows.map(shadowToCSS).join(', ');
    previewBox.style.boxShadow = val;
    cssOutput.textContent = getFullCSS();
  }

  function createSliderRow(label, value, min, max, step, onChange) {
    const row = document.createElement('div');
    row.className = 'control-row';

    const lbl = document.createElement('span');
    lbl.className = 'control-label';
    lbl.textContent = label;

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'control-slider';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = value;

    const num = document.createElement('input');
    num.type = 'number';
    num.className = 'control-number';
    num.min = min;
    num.max = max;
    num.step = step;
    num.value = value;

    slider.addEventListener('input', function () {
      num.value = this.value;
      onChange(parseFloat(this.value));
    });

    num.addEventListener('input', function () {
      const v = parseFloat(this.value);
      if (!isNaN(v)) {
        slider.value = v;
        onChange(v);
      }
    });

    row.appendChild(lbl);
    row.appendChild(slider);
    row.appendChild(num);
    return row;
  }

  function renderLayers() {
    shadowLayersEl.innerHTML = '';

    shadows.forEach(function (shadow, index) {
      const layer = document.createElement('div');
      layer.className = 'shadow-layer';

      // Header
      const header = document.createElement('div');
      header.className = 'layer-header';

      const title = document.createElement('span');
      title.className = 'layer-title';
      title.textContent = 'Shadow ' + (index + 1);

      const actions = document.createElement('div');
      actions.className = 'layer-actions';

      if (shadows.length > 1) {
        const delBtn = document.createElement('button');
        delBtn.className = 'btn-icon btn-delete';
        delBtn.title = 'Remove layer';
        delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        delBtn.addEventListener('click', function () {
          shadows.splice(index, 1);
          renderLayers();
          update();
        });
        actions.appendChild(delBtn);
      }

      header.appendChild(title);
      header.appendChild(actions);
      layer.appendChild(header);

      // Sliders
      layer.appendChild(
        createSliderRow('X Offset', shadow.x, -100, 100, 1, function (v) {
          shadow.x = v;
          update();
        })
      );
      layer.appendChild(
        createSliderRow('Y Offset', shadow.y, -100, 100, 1, function (v) {
          shadow.y = v;
          update();
        })
      );
      layer.appendChild(
        createSliderRow('Blur', shadow.blur, 0, 200, 1, function (v) {
          shadow.blur = v;
          update();
        })
      );
      layer.appendChild(
        createSliderRow('Spread', shadow.spread, -100, 100, 1, function (v) {
          shadow.spread = v;
          update();
        })
      );

      // Color row
      const colorRow = document.createElement('div');
      colorRow.className = 'color-row';

      const colorLabel = document.createElement('span');
      colorLabel.className = 'control-label';
      colorLabel.textContent = 'Color';

      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.className = 'color-picker';
      colorPicker.value = shadow.color;
      colorPicker.addEventListener('input', function () {
        shadow.color = this.value;
        hexInput.value = this.value;
        update();
      });

      const hexInput = document.createElement('input');
      hexInput.type = 'text';
      hexInput.className = 'color-hex';
      hexInput.value = shadow.color;
      hexInput.maxLength = 7;
      hexInput.addEventListener('input', function () {
        const v = this.value;
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
          shadow.color = v;
          colorPicker.value = v;
          update();
        }
      });

      colorRow.appendChild(colorLabel);
      colorRow.appendChild(colorPicker);
      colorRow.appendChild(hexInput);
      layer.appendChild(colorRow);

      // Opacity slider
      layer.appendChild(
        createSliderRow('Opacity', shadow.opacity, 0, 1, 0.01, function (v) {
          shadow.opacity = v;
          update();
        })
      );

      // Inset toggle
      const toggleRow = document.createElement('div');
      toggleRow.className = 'control-row toggle-row';

      const toggleLabel = document.createElement('span');
      toggleLabel.className = 'control-label';
      toggleLabel.textContent = 'Inset';

      const toggle = document.createElement('label');
      toggle.className = 'toggle';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = shadow.inset;
      checkbox.addEventListener('change', function () {
        shadow.inset = this.checked;
        update();
      });

      const track = document.createElement('span');
      track.className = 'toggle-track';

      toggle.appendChild(checkbox);
      toggle.appendChild(track);

      toggleRow.appendChild(toggleLabel);
      toggleRow.appendChild(toggle);
      layer.appendChild(toggleRow);

      shadowLayersEl.appendChild(layer);
    });
  }

  function renderPresets() {
    Object.keys(PRESETS).forEach(function (name) {
      const btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.addEventListener('click', function () {
        shadows = PRESETS[name].map(function (s) {
          return Object.assign({}, s);
        });
        renderLayers();
        update();
      });
      presetGrid.appendChild(btn);
    });
  }

  function showToast() {
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  addShadowBtn.addEventListener('click', function () {
    shadows.push({ x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 0.2, inset: false });
    renderLayers();
    update();
  });

  copyBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(getFullCSS()).then(showToast).catch(function () {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = getFullCSS();
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
  });

  renderPresets();
  renderLayers();
  update();
})();
