(function () {
  'use strict';

  // State
  const state = {
    bgColor: '#3a3a4a',
    shape: 'flat',
    size: 200,
    radius: 24,
    distance: 12,
    intensity: 0.25,
    blur: 24,
    direction: 'top-left',
    element: 'card',
  };

  // DOM refs
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    previewArea: $('#previewArea'),
    previewEl: $('#previewElement'),
    previewText: $('#previewText'),
    codeOutput: $('#codeOutput'),
    copyBtn: $('#copyBtn'),
    toast: $('#toast'),
    bgColor: $('#bgColor'),
    bgColorText: $('#bgColorText'),
    size: $('#size'),
    radius: $('#radius'),
    distance: $('#distance'),
    intensity: $('#intensity'),
    blur: $('#blur'),
    sizeValue: $('#sizeValue'),
    radiusValue: $('#radiusValue'),
    distanceValue: $('#distanceValue'),
    intensityValue: $('#intensityValue'),
    blurValue: $('#blurValue'),
  };

  // Color utilities
  function hexToHSL(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * Math.max(0, Math.min(1, color)))
        .toString(16)
        .padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  }

  function getShadowColors(hex, intensity) {
    const hsl = hexToHSL(hex);
    const lightL = Math.min(100, hsl.l + hsl.l * intensity);
    const darkL = Math.max(0, hsl.l - hsl.l * intensity);
    return {
      light: hslToHex(hsl.h, hsl.s, lightL),
      dark: hslToHex(hsl.h, hsl.s, darkL),
    };
  }

  function getDirectionOffsets(direction, distance) {
    const map = {
      'top-left': [-distance, -distance],
      'top-right': [distance, -distance],
      'bottom-left': [-distance, distance],
      'bottom-right': [distance, distance],
    };
    return map[direction] || map['top-left'];
  }

  // Gradient for concave/convex
  function getShapeBackground(shape, bgColor) {
    const hsl = hexToHSL(bgColor);
    if (shape === 'flat' || shape === 'pressed') {
      return bgColor;
    }
    const lighter = hslToHex(hsl.h, hsl.s, Math.min(100, hsl.l + 6));
    const darker = hslToHex(hsl.h, hsl.s, Math.max(0, hsl.l - 6));
    if (shape === 'convex') {
      return `linear-gradient(145deg, ${lighter}, ${darker})`;
    }
    // concave
    return `linear-gradient(145deg, ${darker}, ${lighter})`;
  }

  // Build CSS
  function buildCSS() {
    const { bgColor, shape, radius, distance, intensity, blur, direction } = state;
    const shadows = getShadowColors(bgColor, intensity);
    const [ox, oy] = getDirectionOffsets(direction, distance);
    const inset = shape === 'pressed' ? 'inset ' : '';

    const boxShadow = `${inset}${ox}px ${oy}px ${blur}px ${shadows.dark},\n${' '.repeat(inset.length + 12)}${inset}${-ox}px ${-oy}px ${blur}px ${shadows.light}`;
    const bg = getShapeBackground(shape, bgColor);

    return {
      background: bg,
      boxShadow: `${inset}${ox}px ${oy}px ${blur}px ${shadows.dark},\n             ${inset}${-ox}px ${-oy}px ${blur}px ${shadows.light}`,
      borderRadius: `${radius}px`,
      rawBoxShadow: boxShadow,
    };
  }

  // Element presets
  function getElementStyles(element) {
    switch (element) {
      case 'card':
        return { width: state.size, height: state.size, text: 'Card' };
      case 'button':
        return { width: Math.max(140, state.size * 0.7), height: 48, text: 'Button' };
      case 'input':
        return { width: Math.max(200, state.size), height: 48, text: '' };
      case 'circle':
        return { width: state.size, height: state.size, text: '', borderRadiusOverride: '50%' };
      default:
        return { width: state.size, height: state.size, text: 'Card' };
    }
  }

  // Render
  function render() {
    const css = buildCSS();
    const elemStyles = getElementStyles(state.element);
    const el = els.previewEl;
    const effectiveRadius = elemStyles.borderRadiusOverride || `${state.radius}px`;

    // Preview area background
    els.previewArea.style.background = state.bgColor;

    // Preview element
    el.style.width = `${elemStyles.width}px`;
    el.style.height = `${elemStyles.height}px`;
    el.style.borderRadius = effectiveRadius;
    el.style.background = css.background;
    el.style.boxShadow = css.rawBoxShadow;

    // Element-specific styling
    el.className = 'preview-element';
    els.previewText.textContent = elemStyles.text;

    if (state.element === 'input') {
      el.style.border = 'none';
      els.previewText.textContent = '';
      el.innerHTML = `<input type="text" placeholder="Type here..." style="
        width: 100%; height: 100%; background: transparent; border: none;
        outline: none; color: #ccc; font-family: inherit; font-size: 14px;
        padding: 0 16px; box-sizing: border-box;
      ">`;
    } else if (state.element === 'button') {
      el.style.cursor = 'pointer';
      el.innerHTML = `<span class="preview-text" style="font-weight:600;font-size:14px;letter-spacing:0.3px;">Button</span>`;
    } else {
      el.innerHTML = `<span class="preview-text">${elemStyles.text}</span>`;
    }

    // Code output
    const displayRadius = elemStyles.borderRadiusOverride || `${state.radius}px`;
    let codeStr = `background: ${css.background};\nbox-shadow: ${css.boxShadow};\nborder-radius: ${displayRadius};`;
    els.codeOutput.textContent = codeStr;
  }

  // Event handlers
  function bindSlider(id, stateKey, displayId, transform) {
    const slider = els[id];
    const display = els[displayId];
    slider.addEventListener('input', () => {
      const raw = Number(slider.value);
      state[stateKey] = transform ? transform(raw) : raw;
      display.textContent = transform ? transform(raw) : raw;
      render();
    });
  }

  bindSlider('size', 'size', 'sizeValue');
  bindSlider('radius', 'radius', 'radiusValue');
  bindSlider('distance', 'distance', 'distanceValue');
  bindSlider('blur', 'blur', 'blurValue');
  bindSlider('intensity', 'intensity', 'intensityValue', (v) => (v / 100).toFixed(2));

  // Color picker
  els.bgColor.addEventListener('input', (e) => {
    state.bgColor = e.target.value;
    els.bgColorText.value = e.target.value;
    render();
  });

  els.bgColorText.addEventListener('input', (e) => {
    let val = e.target.value.trim();
    if (/^#?[0-9a-fA-F]{6}$/.test(val)) {
      if (!val.startsWith('#')) val = '#' + val;
      state.bgColor = val;
      els.bgColor.value = val;
      render();
    }
  });

  els.bgColorText.addEventListener('blur', (e) => {
    e.target.value = state.bgColor;
  });

  // Shape buttons
  $$('.shape-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.shape-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.shape = btn.dataset.shape;
      render();
    });
  });

  // Direction buttons
  $$('.dir-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.dir-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.direction = btn.dataset.dir;
      render();
    });
  });

  // Element buttons
  $$('.element-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.element-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      state.element = btn.dataset.element;
      render();
    });
  });

  // Copy button
  els.copyBtn.addEventListener('click', () => {
    const text = els.codeOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
  });

  function showToast() {
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 2000);
  }

  // Init
  render();
})();
