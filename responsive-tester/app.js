// ============================================
// Responsive Design Tester - Application Logic
// ============================================

(function () {
  'use strict';

  // ---- Device Presets ----

  const DEVICES = {
    '375x667':  { name: 'iPhone SE',           w: 375,  h: 667,  type: 'phone'   },
    '390x844':  { name: 'iPhone 14',           w: 390,  h: 844,  type: 'phone'   },
    '430x932':  { name: 'iPhone 14 Pro Max',   w: 430,  h: 932,  type: 'phone'   },
    '360x800':  { name: 'Samsung Galaxy S21',  w: 360,  h: 800,  type: 'phone'   },
    '412x915':  { name: 'Pixel 7',             w: 412,  h: 915,  type: 'phone'   },
    '768x1024': { name: 'iPad Mini',           w: 768,  h: 1024, type: 'tablet'  },
    '1024x1366':{ name: 'iPad Pro',            w: 1024, h: 1366, type: 'tablet'  },
    '1366x768': { name: 'Laptop',              w: 1366, h: 768,  type: 'desktop' },
    '1440x900': { name: 'MacBook Pro',         w: 1440, h: 900,  type: 'desktop' },
    '1920x1080':{ name: 'Desktop HD',          w: 1920, h: 1080, type: 'desktop' },
  };

  const BREAKPOINTS = [
    { name: 'xs', max: 575  },
    { name: 'sm', max: 767  },
    { name: 'md', max: 991  },
    { name: 'lg', max: 1199 },
    { name: 'xl', max: Infinity },
  ];

  // ---- State ----

  const state = {
    url: 'https://example.com',
    width: 390,
    height: 844,
    originalWidth: 390,
    originalHeight: 844,
    orientation: 'portrait',
    zoom: 1,
    deviceKey: '390x844',
    showGrid: false,
    showRulers: false,
  };

  // ---- DOM Refs ----

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const els = {
    urlForm:       $('#url-form'),
    urlInput:      $('#url-input'),
    deviceSelect:  $('#device-select'),
    widthInput:    $('#width-input'),
    heightInput:   $('#height-input'),
    orientToggle:  $('#orientation-toggle'),
    zoomControls:  $('#zoom-controls'),
    gridToggle:    $('#grid-toggle'),
    rulerToggle:   $('#ruler-toggle'),
    breakpoint:    $('#breakpoint-badge'),
    deviceWrapper: $('#device-wrapper'),
    deviceFrame:   $('#device-frame'),
    deviceNotch:   $('#device-notch'),
    deviceChin:    $('#device-chin'),
    deviceScreen:  $('#device-screen'),
    deviceLabel:   $('#device-label'),
    iframe:        $('#preview-iframe'),
    gridOverlay:   $('#grid-overlay'),
    rulerH:        $('#ruler-h'),
    rulerV:        $('#ruler-v'),
    viewportArea:  $('#viewport-area'),
  };

  // ---- Init ----

  function init() {
    bindEvents();
    applyState();
    loadURL();
  }

  // ---- Events ----

  function bindEvents() {
    els.urlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      state.url = els.urlInput.value.trim();
      loadURL();
    });

    els.deviceSelect.addEventListener('change', () => {
      const val = els.deviceSelect.value;
      if (val === 'custom') {
        state.deviceKey = 'custom';
        return;
      }
      const dev = DEVICES[val];
      if (!dev) return;
      state.deviceKey = val;
      state.originalWidth = dev.w;
      state.originalHeight = dev.h;
      applyOrientation();
      applyState();
    });

    els.widthInput.addEventListener('change', () => {
      const v = parseInt(els.widthInput.value, 10);
      if (v >= 200 && v <= 3840) {
        state.width = v;
        state.originalWidth = state.orientation === 'portrait' ? v : state.height;
        state.originalHeight = state.orientation === 'portrait' ? state.height : v;
        state.deviceKey = 'custom';
        els.deviceSelect.value = 'custom';
        applyState();
      }
    });

    els.heightInput.addEventListener('change', () => {
      const v = parseInt(els.heightInput.value, 10);
      if (v >= 200 && v <= 2160) {
        state.height = v;
        state.originalWidth = state.orientation === 'portrait' ? state.width : v;
        state.originalHeight = state.orientation === 'portrait' ? v : state.width;
        state.deviceKey = 'custom';
        els.deviceSelect.value = 'custom';
        applyState();
      }
    });

    els.orientToggle.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-orientation]');
      if (!btn) return;
      state.orientation = btn.dataset.orientation;
      applyOrientation();
      applyState();
    });

    els.zoomControls.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-zoom]');
      if (!btn) return;
      state.zoom = parseFloat(btn.dataset.zoom);
      applyState();
    });

    els.gridToggle.addEventListener('click', () => {
      state.showGrid = !state.showGrid;
      applyState();
    });

    els.rulerToggle.addEventListener('click', () => {
      state.showRulers = !state.showRulers;
      applyState();
    });
  }

  // ---- Orientation ----

  function applyOrientation() {
    if (state.orientation === 'landscape') {
      state.width = Math.max(state.originalWidth, state.originalHeight);
      state.height = Math.min(state.originalWidth, state.originalHeight);
    } else {
      state.width = Math.min(state.originalWidth, state.originalHeight);
      state.height = Math.max(state.originalWidth, state.originalHeight);
    }
  }

  // ---- Load URL ----

  function loadURL() {
    let url = state.url;
    if (url && !/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
      state.url = url;
      els.urlInput.value = url;
    }

    // Show loading overlay
    let overlay = els.deviceScreen.querySelector('.loading-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div>';
      els.deviceScreen.appendChild(overlay);
    }
    overlay.classList.remove('hidden');

    els.iframe.src = url;
    els.iframe.onload = () => {
      setTimeout(() => overlay.classList.add('hidden'), 300);
    };
  }

  // ---- Apply State ----

  function applyState() {
    const { width, height, zoom } = state;

    // Screen size
    els.deviceScreen.style.width = width + 'px';
    els.deviceScreen.style.height = height + 'px';

    // Zoom
    els.deviceWrapper.style.transform = zoom !== 1 ? `scale(${zoom})` : '';
    els.deviceWrapper.style.transformOrigin = 'center center';

    // Inputs
    els.widthInput.value = width;
    els.heightInput.value = height;

    // Device type class
    const devType = getDeviceType();
    els.deviceFrame.classList.remove('phone', 'tablet', 'desktop');
    els.deviceFrame.classList.add(devType);

    // Orientation toggles
    els.orientToggle.querySelectorAll('.toggle-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.orientation === state.orientation);
    });

    // Zoom buttons
    els.zoomControls.querySelectorAll('.zoom-btn').forEach((btn) => {
      btn.classList.toggle('active', parseFloat(btn.dataset.zoom) === state.zoom);
    });

    // Grid / Ruler toggles
    els.gridToggle.classList.toggle('active', state.showGrid);
    els.rulerToggle.classList.toggle('active', state.showRulers);
    els.gridOverlay.classList.toggle('visible', state.showGrid);
    els.rulerH.classList.toggle('visible', state.showRulers);
    els.rulerV.classList.toggle('visible', state.showRulers);

    // Build rulers
    if (state.showRulers) {
      buildRulers();
    }

    // Breakpoint badge
    updateBreakpoint();

    // Device label
    updateDeviceLabel();
  }

  // ---- Get Device Type ----

  function getDeviceType() {
    if (state.deviceKey !== 'custom' && DEVICES[state.deviceKey]) {
      return DEVICES[state.deviceKey].type;
    }
    const w = Math.min(state.width, state.height);
    if (w < 500) return 'phone';
    if (w < 900) return 'tablet';
    return 'desktop';
  }

  // ---- Breakpoint ----

  function updateBreakpoint() {
    const w = state.width;
    let bp = 'xl';
    for (const b of BREAKPOINTS) {
      if (w <= b.max) { bp = b.name; break; }
    }
    els.breakpoint.textContent = bp;

    const colors = {
      xs: '#ff6b6b',
      sm: '#ffa06b',
      md: '#ffd43b',
      lg: '#51cf66',
      xl: '#6c5ce7',
    };
    const c = colors[bp] || '#6c5ce7';
    els.breakpoint.style.color = c;
    els.breakpoint.style.background = c.replace(')', ',0.15)').replace('rgb', 'rgba').replace('#', '');
    // Use hex with alpha
    els.breakpoint.style.background = hexToRGBA(c, 0.15);
    els.breakpoint.style.borderColor = hexToRGBA(c, 0.3);
  }

  function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---- Device Label ----

  function updateDeviceLabel() {
    let name = 'Custom';
    if (state.deviceKey !== 'custom' && DEVICES[state.deviceKey]) {
      name = DEVICES[state.deviceKey].name;
    }
    els.deviceLabel.innerHTML = `${name} &mdash; ${state.width} &times; ${state.height}`;
  }

  // ---- Build Rulers ----

  function buildRulers() {
    buildHorizontalRuler();
    buildVerticalRuler();
  }

  function buildHorizontalRuler() {
    els.rulerH.innerHTML = '';
    const w = state.width;
    const step = w > 1000 ? 100 : w > 500 ? 50 : 25;

    for (let x = 0; x <= w; x += step) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick' + (x % (step * 2) === 0 ? ' major' : '');
      tick.style.left = x + 'px';
      if (x % (step * 2) === 0 && x > 0) {
        tick.textContent = x;
      }
      els.rulerH.appendChild(tick);
    }
  }

  function buildVerticalRuler() {
    els.rulerV.innerHTML = '';
    const h = state.height;
    const step = h > 1000 ? 100 : h > 500 ? 50 : 25;

    for (let y = 0; y <= h; y += step) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick' + (y % (step * 2) === 0 ? ' major' : '');
      tick.style.top = y + 'px';
      if (y % (step * 2) === 0 && y > 0) {
        tick.textContent = y;
      }
      els.rulerV.appendChild(tick);
    }
  }

  // ---- Boot ----

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
