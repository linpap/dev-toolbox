(function () {
  'use strict';

  // DOM references
  const els = {
    blurRange: document.getElementById('blurRange'),
    blurValue: document.getElementById('blurValue'),
    opacityRange: document.getElementById('opacityRange'),
    opacityValue: document.getElementById('opacityValue'),
    borderOpacityRange: document.getElementById('borderOpacityRange'),
    borderOpacityValue: document.getElementById('borderOpacityValue'),
    borderRadiusRange: document.getElementById('borderRadiusRange'),
    borderRadiusValue: document.getElementById('borderRadiusValue'),
    glassColor: document.getElementById('glassColor'),
    glassColorHex: document.getElementById('glassColorHex'),
    bgColor: document.getElementById('bgColor'),
    bgColorHex: document.getElementById('bgColorHex'),
    borderToggle: document.getElementById('borderToggle'),
    shadowToggle: document.getElementById('shadowToggle'),
    borderColor: document.getElementById('borderColor'),
    borderColorHex: document.getElementById('borderColorHex'),
    borderColorRow: document.getElementById('borderColorRow'),
    glassCard: document.getElementById('glassCard'),
    previewArea: document.getElementById('previewArea'),
    codeOutput: document.getElementById('codeOutput'),
    copyBtn: document.getElementById('copyBtn'),
    toast: document.getElementById('toast'),
  };

  // State
  const state = {
    blur: 12,
    opacity: 0.15,
    borderOpacity: 0.25,
    borderRadius: 16,
    glassColor: '#ffffff',
    bgColor: '#6c3ce0',
    borderEnabled: true,
    borderColor: '#ffffff',
    shadowEnabled: true,
  };

  // Hex to RGB
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  // Generate CSS string
  function generateCSS() {
    const { r, g, b } = hexToRgb(state.glassColor);
    const br = hexToRgb(state.borderColor);

    let css = '';
    css += `background: rgba(${r}, ${g}, ${b}, ${state.opacity});\n`;
    css += `backdrop-filter: blur(${state.blur}px);\n`;
    css += `-webkit-backdrop-filter: blur(${state.blur}px);\n`;
    css += `border-radius: ${state.borderRadius}px;\n`;

    if (state.borderEnabled) {
      css += `border: 1px solid rgba(${br.r}, ${br.g}, ${br.b}, ${state.borderOpacity});\n`;
    }

    if (state.shadowEnabled) {
      css += `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);`;
    }

    return css;
  }

  // Apply styles to glass card
  function updatePreview() {
    const { r, g, b } = hexToRgb(state.glassColor);
    const br = hexToRgb(state.borderColor);
    const card = els.glassCard;

    card.style.background = `rgba(${r}, ${g}, ${b}, ${state.opacity})`;
    card.style.backdropFilter = `blur(${state.blur}px)`;
    card.style.webkitBackdropFilter = `blur(${state.blur}px)`;
    card.style.borderRadius = `${state.borderRadius}px`;

    if (state.borderEnabled) {
      card.style.border = `1px solid rgba(${br.r}, ${br.g}, ${br.b}, ${state.borderOpacity})`;
    } else {
      card.style.border = 'none';
    }

    if (state.shadowEnabled) {
      card.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.25)';
    } else {
      card.style.boxShadow = 'none';
    }

    // Update preview background gradient
    const bgRgb = hexToRgb(state.bgColor);
    els.previewArea.style.background = `radial-gradient(ellipse at 30% 50%, rgba(${bgRgb.r}, ${bgRgb.g}, ${bgRgb.b}, 0.4) 0%, #1a1a24 70%)`;

    // Update code output
    els.codeOutput.textContent = generateCSS();

    // Show/hide border color row
    els.borderColorRow.style.display = state.borderEnabled ? '' : 'none';
  }

  // Sync UI controls with state
  function syncUI() {
    els.blurRange.value = state.blur;
    els.blurValue.textContent = state.blur + 'px';

    els.opacityRange.value = Math.round(state.opacity * 100);
    els.opacityValue.textContent = state.opacity.toFixed(2);

    els.borderOpacityRange.value = Math.round(state.borderOpacity * 100);
    els.borderOpacityValue.textContent = state.borderOpacity.toFixed(2);

    els.borderRadiusRange.value = state.borderRadius;
    els.borderRadiusValue.textContent = state.borderRadius + 'px';

    els.glassColor.value = state.glassColor;
    els.glassColorHex.textContent = state.glassColor;

    els.bgColor.value = state.bgColor;
    els.bgColorHex.textContent = state.bgColor;

    els.borderColor.value = state.borderColor;
    els.borderColorHex.textContent = state.borderColor;

    els.borderToggle.checked = state.borderEnabled;
    els.shadowToggle.checked = state.shadowEnabled;
  }

  // Presets
  const presets = {
    subtle: {
      blur: 8,
      opacity: 0.08,
      borderOpacity: 0.15,
      borderRadius: 12,
      glassColor: '#ffffff',
      borderColor: '#ffffff',
      borderEnabled: true,
      shadowEnabled: false,
      bgColor: '#6c3ce0',
    },
    medium: {
      blur: 12,
      opacity: 0.15,
      borderOpacity: 0.25,
      borderRadius: 16,
      glassColor: '#ffffff',
      borderColor: '#ffffff',
      borderEnabled: true,
      shadowEnabled: true,
      bgColor: '#6c3ce0',
    },
    heavy: {
      blur: 28,
      opacity: 0.25,
      borderOpacity: 0.35,
      borderRadius: 20,
      glassColor: '#ffffff',
      borderColor: '#ffffff',
      borderEnabled: true,
      shadowEnabled: true,
      bgColor: '#6c3ce0',
    },
    dark: {
      blur: 16,
      opacity: 0.3,
      borderOpacity: 0.12,
      borderRadius: 16,
      glassColor: '#0a0a0a',
      borderColor: '#ffffff',
      borderEnabled: true,
      shadowEnabled: true,
      bgColor: '#3b1a8e',
    },
    colorful: {
      blur: 14,
      opacity: 0.18,
      borderOpacity: 0.3,
      borderRadius: 24,
      glassColor: '#c850f0',
      borderColor: '#f0a0ff',
      borderEnabled: true,
      shadowEnabled: true,
      bgColor: '#e44da0',
    },
  };

  // Event listeners - sliders
  els.blurRange.addEventListener('input', function () {
    state.blur = parseInt(this.value);
    els.blurValue.textContent = state.blur + 'px';
    updatePreview();
  });

  els.opacityRange.addEventListener('input', function () {
    state.opacity = parseInt(this.value) / 100;
    els.opacityValue.textContent = state.opacity.toFixed(2);
    updatePreview();
  });

  els.borderOpacityRange.addEventListener('input', function () {
    state.borderOpacity = parseInt(this.value) / 100;
    els.borderOpacityValue.textContent = state.borderOpacity.toFixed(2);
    updatePreview();
  });

  els.borderRadiusRange.addEventListener('input', function () {
    state.borderRadius = parseInt(this.value);
    els.borderRadiusValue.textContent = state.borderRadius + 'px';
    updatePreview();
  });

  // Color pickers
  els.glassColor.addEventListener('input', function () {
    state.glassColor = this.value;
    els.glassColorHex.textContent = this.value;
    updatePreview();
  });

  els.bgColor.addEventListener('input', function () {
    state.bgColor = this.value;
    els.bgColorHex.textContent = this.value;
    updatePreview();
  });

  els.borderColor.addEventListener('input', function () {
    state.borderColor = this.value;
    els.borderColorHex.textContent = this.value;
    updatePreview();
  });

  // Toggles
  els.borderToggle.addEventListener('change', function () {
    state.borderEnabled = this.checked;
    updatePreview();
  });

  els.shadowToggle.addEventListener('change', function () {
    state.shadowEnabled = this.checked;
    updatePreview();
  });

  // Presets
  document.querySelectorAll('.preset-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const presetName = this.dataset.preset;
      const preset = presets[presetName];
      if (!preset) return;

      // Update active state
      document.querySelectorAll('.preset-btn').forEach(function (b) {
        b.classList.remove('active');
      });
      this.classList.add('active');

      // Apply preset
      Object.assign(state, preset);
      syncUI();
      updatePreview();
    });
  });

  // Copy button
  els.copyBtn.addEventListener('click', function () {
    const css = generateCSS();
    navigator.clipboard.writeText(css).then(function () {
      showToast();
    }).catch(function () {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = css;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast();
    });
  });

  // Toast
  let toastTimeout;
  function showToast() {
    clearTimeout(toastTimeout);
    els.toast.classList.add('show');
    toastTimeout = setTimeout(function () {
      els.toast.classList.remove('show');
    }, 2000);
  }

  // Initial render
  syncUI();
  updatePreview();
})();
