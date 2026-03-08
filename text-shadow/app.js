(function () {
  'use strict';

  // --- State ---
  let layers = [];
  let layerIdCounter = 0;

  // --- DOM refs ---
  const previewText = document.getElementById('previewText');
  const previewBox = document.getElementById('previewBox');
  const textColorInput = document.getElementById('textColor');
  const textColorHex = document.getElementById('textColorHex');
  const bgColorInput = document.getElementById('bgColor');
  const bgColorHex = document.getElementById('bgColorHex');
  const fontSizeSlider = document.getElementById('fontSizeSlider');
  const fontSizeInput = document.getElementById('fontSizeInput');
  const fontFamilySelect = document.getElementById('fontFamily');
  const layersList = document.getElementById('layersList');
  const addLayerBtn = document.getElementById('addLayerBtn');
  const presetsGrid = document.getElementById('presetsGrid');
  const cssOutput = document.getElementById('cssOutput');
  const copyBtn = document.getElementById('copyBtn');
  const toast = document.getElementById('toast');

  // --- Presets ---
  const presets = [
    {
      name: 'Neon Glow',
      desc: 'Vibrant neon',
      layers: [
        { x: 0, y: 0, blur: 7, color: '#ff00ff', opacity: 1 },
        { x: 0, y: 0, blur: 20, color: '#ff00ff', opacity: 0.8 },
        { x: 0, y: 0, blur: 40, color: '#ff00ff', opacity: 0.5 },
        { x: 0, y: 0, blur: 80, color: '#ff00ff', opacity: 0.3 },
      ],
    },
    {
      name: 'Retro',
      desc: 'Classic offset',
      layers: [
        { x: 3, y: 3, blur: 0, color: '#e74c3c', opacity: 1 },
        { x: 6, y: 6, blur: 0, color: '#3498db', opacity: 1 },
      ],
    },
    {
      name: '3D',
      desc: 'Depth effect',
      layers: [
        { x: 1, y: 1, blur: 0, color: '#5a5a7a', opacity: 1 },
        { x: 2, y: 2, blur: 0, color: '#50506a', opacity: 1 },
        { x: 3, y: 3, blur: 0, color: '#46465a', opacity: 1 },
        { x: 4, y: 4, blur: 0, color: '#3c3c4a', opacity: 1 },
        { x: 5, y: 5, blur: 0, color: '#32323a', opacity: 1 },
      ],
    },
    {
      name: 'Emboss',
      desc: 'Raised text',
      layers: [
        { x: -1, y: -1, blur: 1, color: '#ffffff', opacity: 0.3 },
        { x: 1, y: 1, blur: 1, color: '#000000', opacity: 0.5 },
      ],
    },
    {
      name: 'Fire',
      desc: 'Flame effect',
      layers: [
        { x: 0, y: -2, blur: 4, color: '#ffcc00', opacity: 1 },
        { x: 0, y: -4, blur: 8, color: '#ff6600', opacity: 0.8 },
        { x: 0, y: -6, blur: 16, color: '#ff0000', opacity: 0.6 },
        { x: 0, y: -8, blur: 30, color: '#990000', opacity: 0.4 },
      ],
    },
    {
      name: 'Outline',
      desc: 'Stroke effect',
      layers: [
        { x: -1, y: -1, blur: 0, color: '#6c5ce7', opacity: 1 },
        { x: 1, y: -1, blur: 0, color: '#6c5ce7', opacity: 1 },
        { x: -1, y: 1, blur: 0, color: '#6c5ce7', opacity: 1 },
        { x: 1, y: 1, blur: 0, color: '#6c5ce7', opacity: 1 },
      ],
    },
    {
      name: 'Long Shadow',
      desc: 'Flat design',
      layers: Array.from({ length: 10 }, (_, i) => ({
        x: i + 1,
        y: i + 1,
        blur: 0,
        color: '#000000',
        opacity: 1 - i * 0.08,
      })),
    },
    {
      name: 'Vintage',
      desc: 'Warm retro',
      layers: [
        { x: 2, y: 2, blur: 0, color: '#c0392b', opacity: 0.9 },
        { x: 4, y: 4, blur: 0, color: '#e67e22', opacity: 0.6 },
        { x: 6, y: 6, blur: 0, color: '#f1c40f', opacity: 0.4 },
      ],
    },
  ];

  // --- Helpers ---
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    if (opacity >= 1) return hex;
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + opacity + ')';
  }

  function createLayer(opts) {
    const id = layerIdCounter++;
    return {
      id: id,
      x: opts && opts.x !== undefined ? opts.x : 4,
      y: opts && opts.y !== undefined ? opts.y : 4,
      blur: opts && opts.blur !== undefined ? opts.blur : 6,
      color: opts && opts.color !== undefined ? opts.color : '#000000',
      opacity: opts && opts.opacity !== undefined ? opts.opacity : 0.5,
    };
  }

  // --- Rendering ---
  function buildShadowCSS() {
    return layers
      .map(function (l) {
        var colorStr = hexToRgba(l.color, l.opacity);
        return l.x + 'px ' + l.y + 'px ' + l.blur + 'px ' + colorStr;
      })
      .join(',\n    ');
  }

  function updatePreview() {
    var shadow = buildShadowCSS();
    previewText.style.textShadow = shadow || 'none';
    cssOutput.textContent = shadow
      ? 'text-shadow: ' + shadow + ';'
      : 'text-shadow: none;';
  }

  function renderLayers() {
    layersList.innerHTML = '';
    layers.forEach(function (layer, index) {
      var card = document.createElement('div');
      card.className = 'layer-card';
      card.innerHTML =
        '<div class="layer-top">' +
        '  <span class="layer-title">Layer ' + (index + 1) + '</span>' +
        '  <div class="layer-actions">' +
        '    <button class="btn-remove" data-id="' + layer.id + '">Remove</button>' +
        '  </div>' +
        '</div>' +
        '<div class="layer-controls">' +
        '  <div class="layer-control">' +
        '    <label>Horizontal Offset</label>' +
        '    <div class="slider-row">' +
        '      <input type="range" min="-100" max="100" value="' + layer.x + '" data-id="' + layer.id + '" data-prop="x">' +
        '      <input type="number" min="-100" max="100" value="' + layer.x + '" data-id="' + layer.id + '" data-prop="x">' +
        '    </div>' +
        '  </div>' +
        '  <div class="layer-control">' +
        '    <label>Vertical Offset</label>' +
        '    <div class="slider-row">' +
        '      <input type="range" min="-100" max="100" value="' + layer.y + '" data-id="' + layer.id + '" data-prop="y">' +
        '      <input type="number" min="-100" max="100" value="' + layer.y + '" data-id="' + layer.id + '" data-prop="y">' +
        '    </div>' +
        '  </div>' +
        '  <div class="layer-control">' +
        '    <label>Blur Radius</label>' +
        '    <div class="slider-row">' +
        '      <input type="range" min="0" max="100" value="' + layer.blur + '" data-id="' + layer.id + '" data-prop="blur">' +
        '      <input type="number" min="0" max="100" value="' + layer.blur + '" data-id="' + layer.id + '" data-prop="blur">' +
        '    </div>' +
        '  </div>' +
        '  <div class="layer-control">' +
        '    <label>Shadow Color</label>' +
        '    <div class="color-input-wrap">' +
        '      <input type="color" value="' + layer.color + '" data-id="' + layer.id + '" data-prop="color">' +
        '      <span class="color-hex">' + layer.color + '</span>' +
        '    </div>' +
        '  </div>' +
        '  <div class="layer-control full-width">' +
        '    <label>Color Opacity</label>' +
        '    <div class="opacity-row">' +
        '      <input type="range" min="0" max="100" value="' + Math.round(layer.opacity * 100) + '" data-id="' + layer.id + '" data-prop="opacity">' +
        '      <span class="opacity-val">' + Math.round(layer.opacity * 100) + '%</span>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      layersList.appendChild(card);
    });
    updatePreview();
  }

  function renderPresets() {
    presetsGrid.innerHTML = '';
    presets.forEach(function (preset) {
      var btn = document.createElement('button');
      btn.className = 'preset-btn';
      btn.innerHTML =
        '<span class="preset-label">' + preset.name + '</span>' +
        '<span class="preset-preview">' + preset.desc + '</span>';
      btn.addEventListener('click', function () {
        applyPreset(preset);
      });
      presetsGrid.appendChild(btn);
    });
  }

  function applyPreset(preset) {
    layers = preset.layers.map(function (l) {
      return createLayer(l);
    });
    renderLayers();
  }

  // --- Event Delegation for Layers ---
  layersList.addEventListener('input', function (e) {
    var target = e.target;
    var id = parseInt(target.dataset.id, 10);
    var prop = target.dataset.prop;
    if (isNaN(id) || !prop) return;

    var layer = layers.find(function (l) { return l.id === id; });
    if (!layer) return;

    if (prop === 'opacity') {
      layer.opacity = parseInt(target.value, 10) / 100;
    } else if (prop === 'color') {
      layer.color = target.value;
    } else {
      layer[prop] = parseInt(target.value, 10);
    }

    // Sync slider <-> number within the same slider-row or opacity-row
    var row = target.closest('.slider-row') || target.closest('.opacity-row');
    if (row) {
      var inputs = row.querySelectorAll('input');
      inputs.forEach(function (inp) {
        if (inp !== target) inp.value = target.value;
      });
      var opacityVal = row.querySelector('.opacity-val');
      if (opacityVal) {
        opacityVal.textContent = Math.round(layer.opacity * 100) + '%';
      }
    }

    // Sync color hex display
    if (prop === 'color') {
      var wrap = target.closest('.color-input-wrap');
      if (wrap) {
        var hexSpan = wrap.querySelector('.color-hex');
        if (hexSpan) hexSpan.textContent = target.value;
      }
    }

    updatePreview();
  });

  layersList.addEventListener('click', function (e) {
    if (e.target.classList.contains('btn-remove')) {
      var id = parseInt(e.target.dataset.id, 10);
      layers = layers.filter(function (l) { return l.id !== id; });
      renderLayers();
    }
  });

  // --- Add Layer ---
  addLayerBtn.addEventListener('click', function () {
    layers.push(createLayer());
    renderLayers();
  });

  // --- Preview Controls ---
  textColorInput.addEventListener('input', function () {
    previewText.style.color = this.value;
    textColorHex.textContent = this.value;
  });

  bgColorInput.addEventListener('input', function () {
    previewBox.style.backgroundColor = this.value;
    bgColorHex.textContent = this.value;
  });

  fontSizeSlider.addEventListener('input', function () {
    var val = this.value;
    fontSizeInput.value = val;
    previewText.style.fontSize = val + 'px';
  });

  fontSizeInput.addEventListener('input', function () {
    var val = Math.min(200, Math.max(16, parseInt(this.value, 10) || 16));
    fontSizeSlider.value = val;
    previewText.style.fontSize = val + 'px';
  });

  fontFamilySelect.addEventListener('change', function () {
    previewText.style.fontFamily = this.value;
  });

  // --- Copy CSS ---
  copyBtn.addEventListener('click', function () {
    var text = cssOutput.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(function () {
      showToast();
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');
      setTimeout(function () {
        copyBtn.textContent = 'Copy CSS';
        copyBtn.classList.remove('copied');
      }, 1500);
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
  });

  function showToast() {
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  // --- Init ---
  function init() {
    renderPresets();
    layers.push(createLayer({ x: 4, y: 4, blur: 8, color: '#6c5ce7', opacity: 0.7 }));
    renderLayers();
    previewText.style.color = textColorInput.value;
    previewText.style.fontSize = fontSizeSlider.value + 'px';
    previewText.style.fontFamily = fontFamilySelect.value;
  }

  init();
})();
