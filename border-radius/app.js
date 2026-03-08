(function () {
  'use strict';

  // ---- State ----
  const state = {
    mode: 'simple', // 'simple' | 'advanced'
    linked: true,
    // Simple mode values (px)
    simple: { tl: 30, tr: 30, br: 30, bl: 30 },
    // Advanced mode values (px): horizontal & vertical per corner
    advanced: {
      tl: { h: 30, v: 30 },
      tr: { h: 30, v: 30 },
      br: { h: 30, v: 30 },
      bl: { h: 30, v: 30 },
    },
    bgColor: '#6c5ce7',
    borderColor: '#a29bfe',
    borderWidth: 3,
    previewWidth: 200,
    previewHeight: 200,
  };

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const previewBox = $('#previewBox');
  const previewContainer = $('#previewContainer');
  const resizeHandle = $('#resizeHandle');
  const cssOutput = $('#cssOutput');
  const copyBtn = $('#copyBtn');
  const toast = $('#toast');
  const linkBtn = $('#linkBtn');
  const linkLabel = $('#linkLabel');
  const simpleModeBtn = $('#simpleModeBtn');
  const advancedModeBtn = $('#advancedModeBtn');
  const simpleSliders = $('#simpleSliders');
  const advancedSliders = $('#advancedSliders');
  const bgColorInput = $('#bgColor');
  const borderColorInput = $('#borderColor');
  const borderWidthInput = $('#borderWidth');
  const borderWidthVal = $('#borderWidthVal');

  // ---- Presets (advanced 8-value format) ----
  const presets = {
    circle: {
      mode: 'simple',
      simple: { tl: 200, tr: 200, br: 200, bl: 200 },
      advanced: { tl: { h: 200, v: 200 }, tr: { h: 200, v: 200 }, br: { h: 200, v: 200 }, bl: { h: 200, v: 200 } },
    },
    pill: {
      mode: 'simple',
      simple: { tl: 200, tr: 200, br: 200, bl: 200 },
      advanced: { tl: { h: 200, v: 200 }, tr: { h: 200, v: 200 }, br: { h: 200, v: 200 }, bl: { h: 200, v: 200 } },
    },
    squircle: {
      mode: 'simple',
      simple: { tl: 60, tr: 60, br: 60, bl: 60 },
      advanced: { tl: { h: 60, v: 60 }, tr: { h: 60, v: 60 }, br: { h: 60, v: 60 }, bl: { h: 60, v: 60 } },
    },
    blob: {
      mode: 'advanced',
      simple: { tl: 60, tr: 40, br: 30, bl: 70 },
      advanced: {
        tl: { h: 120, v: 120 },
        tr: { h: 80, v: 60 },
        br: { h: 60, v: 140 },
        bl: { h: 140, v: 80 },
      },
    },
    leaf: {
      mode: 'simple',
      simple: { tl: 0, tr: 100, br: 0, bl: 100 },
      advanced: { tl: { h: 0, v: 0 }, tr: { h: 100, v: 100 }, br: { h: 0, v: 0 }, bl: { h: 100, v: 100 } },
    },
    ticket: {
      mode: 'simple',
      simple: { tl: 24, tr: 24, br: 0, bl: 0 },
      advanced: { tl: { h: 24, v: 24 }, tr: { h: 24, v: 24 }, br: { h: 0, v: 0 }, bl: { h: 0, v: 0 } },
    },
  };

  // ---- Helpers ----

  function getBorderRadiusCSS() {
    if (state.mode === 'simple') {
      const { tl, tr, br, bl } = state.simple;
      if (tl === tr && tr === br && br === bl) {
        return `border-radius: ${tl}px;`;
      }
      return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
    }
    // Advanced 8-value syntax
    const a = state.advanced;
    const h = `${a.tl.h}px ${a.tr.h}px ${a.br.h}px ${a.bl.h}px`;
    const v = `${a.tl.v}px ${a.tr.v}px ${a.br.v}px ${a.bl.v}px`;
    if (h === v) {
      return `border-radius: ${h};`;
    }
    return `border-radius: ${h} / ${v};`;
  }

  function getBorderRadiusValue() {
    if (state.mode === 'simple') {
      const { tl, tr, br, bl } = state.simple;
      return `${tl}px ${tr}px ${br}px ${bl}px`;
    }
    const a = state.advanced;
    const h = `${a.tl.h}px ${a.tr.h}px ${a.br.h}px ${a.bl.h}px`;
    const v = `${a.tl.v}px ${a.tr.v}px ${a.br.v}px ${a.bl.v}px`;
    if (h === v) return h;
    return `${h} / ${v}`;
  }

  function getFullCSS() {
    let lines = [getBorderRadiusCSS()];
    if (state.borderWidth > 0) {
      lines.push(`border: ${state.borderWidth}px solid ${state.borderColor};`);
    }
    return lines.join('\n');
  }

  // ---- Render ----

  function render() {
    // Update preview box
    previewBox.style.borderRadius = getBorderRadiusValue();
    previewBox.style.background = state.bgColor;
    previewBox.style.borderColor = state.borderColor;
    previewBox.style.borderWidth = state.borderWidth + 'px';
    previewBox.style.borderStyle = state.borderWidth > 0 ? 'solid' : 'none';
    previewBox.style.width = state.previewWidth + 'px';
    previewBox.style.height = state.previewHeight + 'px';

    // Update CSS output
    cssOutput.textContent = getFullCSS();

    // Update color inputs
    bgColorInput.value = state.bgColor;
    borderColorInput.value = state.borderColor;
    borderWidthInput.value = state.borderWidth;
    borderWidthVal.textContent = state.borderWidth + 'px';
  }

  function syncSlidersFromState() {
    // Simple sliders
    for (const corner of ['tl', 'tr', 'br', 'bl']) {
      const slider = document.querySelector(`.corner-slider[data-corner="${corner}"]`);
      const input = document.querySelector(`.corner-input[data-corner="${corner}"]`);
      if (slider) slider.value = state.simple[corner];
      if (input) input.value = state.simple[corner];
    }

    // Advanced sliders
    for (const corner of ['tl', 'tr', 'br', 'bl']) {
      for (const axis of ['h', 'v']) {
        const slider = document.querySelector(`.corner-slider-adv[data-corner="${corner}"][data-axis="${axis}"]`);
        const input = document.querySelector(`.corner-input-adv[data-corner="${corner}"][data-axis="${axis}"]`);
        if (slider) slider.value = state.advanced[corner][axis];
        if (input) input.value = state.advanced[corner][axis];
      }
    }
  }

  // ---- Event Handlers ----

  // Simple mode sliders
  function handleSimpleInput(corner, value) {
    value = clamp(parseInt(value, 10) || 0, 0, 200);
    if (state.linked) {
      state.simple.tl = value;
      state.simple.tr = value;
      state.simple.br = value;
      state.simple.bl = value;
      // Also sync advanced
      for (const c of ['tl', 'tr', 'br', 'bl']) {
        state.advanced[c].h = value;
        state.advanced[c].v = value;
      }
    } else {
      state.simple[corner] = value;
      state.advanced[corner].h = value;
      state.advanced[corner].v = value;
    }
    syncSlidersFromState();
    render();
  }

  // Advanced mode sliders
  function handleAdvancedInput(corner, axis, value) {
    value = clamp(parseInt(value, 10) || 0, 0, 200);
    if (state.linked) {
      for (const c of ['tl', 'tr', 'br', 'bl']) {
        state.advanced[c][axis] = value;
      }
      // Sync simple from horizontal
      if (axis === 'h') {
        for (const c of ['tl', 'tr', 'br', 'bl']) {
          state.simple[c] = value;
        }
      }
    } else {
      state.advanced[corner][axis] = value;
      // Keep simple in sync with the average or h value
      state.simple[corner] = state.advanced[corner].h;
    }
    syncSlidersFromState();
    render();
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Bind simple sliders
  for (const slider of $$('.corner-slider')) {
    slider.addEventListener('input', function () {
      handleSimpleInput(this.dataset.corner, this.value);
    });
  }
  for (const input of $$('.corner-input')) {
    input.addEventListener('input', function () {
      handleSimpleInput(this.dataset.corner, this.value);
    });
  }

  // Bind advanced sliders
  for (const slider of $$('.corner-slider-adv')) {
    slider.addEventListener('input', function () {
      handleAdvancedInput(this.dataset.corner, this.dataset.axis, this.value);
    });
  }
  for (const input of $$('.corner-input-adv')) {
    input.addEventListener('input', function () {
      handleAdvancedInput(this.dataset.corner, this.dataset.axis, this.value);
    });
  }

  // Mode toggle
  simpleModeBtn.addEventListener('click', function () {
    state.mode = 'simple';
    simpleModeBtn.classList.add('active');
    advancedModeBtn.classList.remove('active');
    simpleSliders.classList.remove('hidden');
    advancedSliders.classList.add('hidden');
    render();
  });

  advancedModeBtn.addEventListener('click', function () {
    state.mode = 'advanced';
    advancedModeBtn.classList.add('active');
    simpleModeBtn.classList.remove('active');
    advancedSliders.classList.remove('hidden');
    simpleSliders.classList.add('hidden');
    render();
  });

  // Link toggle
  linkBtn.addEventListener('click', function () {
    state.linked = !state.linked;
    if (state.linked) {
      linkBtn.classList.remove('unlinked');
      linkLabel.textContent = 'Linked';
      // Sync all corners to top-left value
      const val = state.mode === 'simple' ? state.simple.tl : state.advanced.tl.h;
      if (state.mode === 'simple') {
        handleSimpleInput('tl', val);
      } else {
        handleAdvancedInput('tl', 'h', state.advanced.tl.h);
        handleAdvancedInput('tl', 'v', state.advanced.tl.v);
      }
    } else {
      linkBtn.classList.add('unlinked');
      linkLabel.textContent = 'Unlinked';
    }
  });

  // Preview color / border controls
  bgColorInput.addEventListener('input', function () {
    state.bgColor = this.value;
    render();
  });

  borderColorInput.addEventListener('input', function () {
    state.borderColor = this.value;
    render();
  });

  borderWidthInput.addEventListener('input', function () {
    state.borderWidth = parseInt(this.value, 10);
    render();
  });

  // Presets
  for (const btn of $$('.preset-btn')) {
    btn.addEventListener('click', function () {
      const preset = presets[this.dataset.preset];
      if (!preset) return;

      // Copy preset values into state
      state.simple = { ...preset.simple };
      state.advanced = {
        tl: { ...preset.advanced.tl },
        tr: { ...preset.advanced.tr },
        br: { ...preset.advanced.br },
        bl: { ...preset.advanced.bl },
      };

      // Switch to the preset's preferred mode
      state.mode = preset.mode;
      if (state.mode === 'simple') {
        simpleModeBtn.classList.add('active');
        advancedModeBtn.classList.remove('active');
        simpleSliders.classList.remove('hidden');
        advancedSliders.classList.add('hidden');
      } else {
        advancedModeBtn.classList.add('active');
        simpleModeBtn.classList.remove('active');
        advancedSliders.classList.remove('hidden');
        simpleSliders.classList.add('hidden');
      }

      // Unlink when applying a preset with different corner values
      const s = preset.simple;
      const allSame = s.tl === s.tr && s.tr === s.br && s.br === s.bl;
      if (!allSame && state.linked) {
        state.linked = false;
        linkBtn.classList.add('unlinked');
        linkLabel.textContent = 'Unlinked';
      }

      syncSlidersFromState();
      render();
    });
  }

  // Copy CSS
  copyBtn.addEventListener('click', function () {
    const css = getFullCSS();
    navigator.clipboard.writeText(css).then(function () {
      showToast('Copied to clipboard!');
    }).catch(function () {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = css;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!');
    });
  });

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove('hidden');
    toast.classList.add('show');
    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.classList.add('hidden');
      }, 300);
    }, 1800);
  }

  // ---- Resize handle (drag to resize preview box) ----

  let resizing = false;
  let resizeStartX, resizeStartY, startW, startH;

  resizeHandle.addEventListener('mousedown', function (e) {
    e.preventDefault();
    resizing = true;
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    startW = state.previewWidth;
    startH = state.previewHeight;
    document.body.style.cursor = 'nwse-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', function (e) {
    if (!resizing) return;
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    state.previewWidth = clamp(startW + dx, 60, 500);
    state.previewHeight = clamp(startH + dy, 60, 500);
    render();
  });

  document.addEventListener('mouseup', function () {
    if (resizing) {
      resizing = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
  });

  // Touch support for resize
  resizeHandle.addEventListener('touchstart', function (e) {
    e.preventDefault();
    resizing = true;
    const touch = e.touches[0];
    resizeStartX = touch.clientX;
    resizeStartY = touch.clientY;
    startW = state.previewWidth;
    startH = state.previewHeight;
  }, { passive: false });

  document.addEventListener('touchmove', function (e) {
    if (!resizing) return;
    const touch = e.touches[0];
    const dx = touch.clientX - resizeStartX;
    const dy = touch.clientY - resizeStartY;
    state.previewWidth = clamp(startW + dx, 60, 500);
    state.previewHeight = clamp(startH + dy, 60, 500);
    render();
  });

  document.addEventListener('touchend', function () {
    resizing = false;
  });

  // ---- Init ----
  syncSlidersFromState();
  render();
})();
