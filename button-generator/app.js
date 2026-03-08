(function () {
  'use strict';

  // ── DOM References ──────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const previewBtn = $('previewButton');
  const cssOutput = document.querySelector('#cssOutput code');
  const toast = $('toast');

  // ── State ───────────────────────────────────────────────────────
  const state = {
    buttonText: 'Click Me',
    paddingX: 24,
    paddingY: 12,
    fontSize: 16,
    fontWeight: 600,
    borderRadius: 8,
    borderWidth: 0,
    borderStyle: 'solid',
    bgColor: '#6366f1',
    textColor: '#ffffff',
    borderColor: '#6366f1',
    gradientEnabled: false,
    gradientStart: '#6366f1',
    gradientEnd: '#ec4899',
    gradientAngle: 135,
    shadowX: 0,
    shadowY: 0,
    shadowBlur: 0,
    shadowSpread: 0,
    shadowColor: '#000000',
    shadowOpacity: 25,
    hoverBgColor: '#4f46e5',
    hoverTextColor: '#ffffff',
    hoverBorderColor: '#4f46e5',
    hoverGradientEnabled: false,
    hoverGradientStart: '#4f46e5',
    hoverGradientEnd: '#db2777',
    transition: 0.2,
    textTransform: 'none',
    cursorStyle: 'pointer',
    letterSpacing: 0,
  };

  // ── Presets ─────────────────────────────────────────────────────
  const presets = {
    primary: {
      paddingX: 24, paddingY: 12, fontSize: 16, fontWeight: 600,
      borderRadius: 8, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#6366f1', textColor: '#ffffff', borderColor: '#6366f1',
      gradientEnabled: false, gradientStart: '#6366f1', gradientEnd: '#ec4899', gradientAngle: 135,
      shadowX: 0, shadowY: 4, shadowBlur: 14, shadowSpread: 0,
      shadowColor: '#6366f1', shadowOpacity: 35,
      hoverBgColor: '#4f46e5', hoverTextColor: '#ffffff', hoverBorderColor: '#4f46e5',
      hoverGradientEnabled: false, hoverGradientStart: '#4f46e5', hoverGradientEnd: '#db2777',
      transition: 0.2, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    secondary: {
      paddingX: 24, paddingY: 12, fontSize: 16, fontWeight: 600,
      borderRadius: 8, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#1e1e2e', textColor: '#a5b4fc', borderColor: '#1e1e2e',
      gradientEnabled: false, gradientStart: '#1e1e2e', gradientEnd: '#1e1e2e', gradientAngle: 135,
      shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0,
      shadowColor: '#000000', shadowOpacity: 25,
      hoverBgColor: '#2a2a40', hoverTextColor: '#c7d2fe', hoverBorderColor: '#2a2a40',
      hoverGradientEnabled: false, hoverGradientStart: '#2a2a40', hoverGradientEnd: '#2a2a40',
      transition: 0.2, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    outline: {
      paddingX: 24, paddingY: 12, fontSize: 16, fontWeight: 600,
      borderRadius: 8, borderWidth: 2, borderStyle: 'solid',
      bgColor: '#0f0f13', textColor: '#6366f1', borderColor: '#6366f1',
      gradientEnabled: false, gradientStart: '#6366f1', gradientEnd: '#ec4899', gradientAngle: 135,
      shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0,
      shadowColor: '#000000', shadowOpacity: 25,
      hoverBgColor: '#6366f1', hoverTextColor: '#ffffff', hoverBorderColor: '#6366f1',
      hoverGradientEnabled: false, hoverGradientStart: '#6366f1', hoverGradientEnd: '#6366f1',
      transition: 0.2, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    ghost: {
      paddingX: 24, paddingY: 12, fontSize: 16, fontWeight: 500,
      borderRadius: 8, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#0f0f13', textColor: '#8888a0', borderColor: '#0f0f13',
      gradientEnabled: false, gradientStart: '#0f0f13', gradientEnd: '#0f0f13', gradientAngle: 135,
      shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0,
      shadowColor: '#000000', shadowOpacity: 0,
      hoverBgColor: '#1e1e28', hoverTextColor: '#e4e4ed', hoverBorderColor: '#1e1e28',
      hoverGradientEnabled: false, hoverGradientStart: '#1e1e28', hoverGradientEnd: '#1e1e28',
      transition: 0.15, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    pill: {
      paddingX: 32, paddingY: 12, fontSize: 14, fontWeight: 600,
      borderRadius: 100, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#6366f1', textColor: '#ffffff', borderColor: '#6366f1',
      gradientEnabled: false, gradientStart: '#6366f1', gradientEnd: '#ec4899', gradientAngle: 135,
      shadowX: 0, shadowY: 2, shadowBlur: 10, shadowSpread: 0,
      shadowColor: '#6366f1', shadowOpacity: 30,
      hoverBgColor: '#4f46e5', hoverTextColor: '#ffffff', hoverBorderColor: '#4f46e5',
      hoverGradientEnabled: false, hoverGradientStart: '#4f46e5', hoverGradientEnd: '#4f46e5',
      transition: 0.2, textTransform: 'uppercase', cursorStyle: 'pointer', letterSpacing: 1,
    },
    threed: {
      paddingX: 28, paddingY: 14, fontSize: 16, fontWeight: 700,
      borderRadius: 10, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#6366f1', textColor: '#ffffff', borderColor: '#6366f1',
      gradientEnabled: false, gradientStart: '#6366f1', gradientEnd: '#6366f1', gradientAngle: 135,
      shadowX: 0, shadowY: 6, shadowBlur: 0, shadowSpread: 0,
      shadowColor: '#3730a3', shadowOpacity: 100,
      hoverBgColor: '#6366f1', hoverTextColor: '#ffffff', hoverBorderColor: '#6366f1',
      hoverGradientEnabled: false, hoverGradientStart: '#6366f1', hoverGradientEnd: '#6366f1',
      transition: 0.1, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    gradient: {
      paddingX: 28, paddingY: 14, fontSize: 16, fontWeight: 600,
      borderRadius: 10, borderWidth: 0, borderStyle: 'solid',
      bgColor: '#6366f1', textColor: '#ffffff', borderColor: '#6366f1',
      gradientEnabled: true, gradientStart: '#6366f1', gradientEnd: '#ec4899', gradientAngle: 135,
      shadowX: 0, shadowY: 4, shadowBlur: 20, shadowSpread: 0,
      shadowColor: '#8b5cf6', shadowOpacity: 35,
      hoverBgColor: '#4f46e5', hoverTextColor: '#ffffff', hoverBorderColor: '#4f46e5',
      hoverGradientEnabled: true, hoverGradientStart: '#4f46e5', hoverGradientEnd: '#db2777',
      transition: 0.3, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
    minimal: {
      paddingX: 16, paddingY: 8, fontSize: 14, fontWeight: 500,
      borderRadius: 4, borderWidth: 1, borderStyle: 'solid',
      bgColor: '#0f0f13', textColor: '#8888a0', borderColor: '#2a2a3a',
      gradientEnabled: false, gradientStart: '#0f0f13', gradientEnd: '#0f0f13', gradientAngle: 135,
      shadowX: 0, shadowY: 0, shadowBlur: 0, shadowSpread: 0,
      shadowColor: '#000000', shadowOpacity: 0,
      hoverBgColor: '#0f0f13', hoverTextColor: '#e4e4ed', hoverBorderColor: '#6366f1',
      hoverGradientEnabled: false, hoverGradientStart: '#0f0f13', hoverGradientEnd: '#0f0f13',
      transition: 0.2, textTransform: 'none', cursorStyle: 'pointer', letterSpacing: 0,
    },
  };

  // ── Control Bindings ────────────────────────────────────────────
  const rangeControls = [
    { id: 'paddingX', key: 'paddingX', suffix: 'px' },
    { id: 'paddingY', key: 'paddingY', suffix: 'px' },
    { id: 'fontSize', key: 'fontSize', suffix: 'px' },
    { id: 'fontWeight', key: 'fontWeight', suffix: '' },
    { id: 'borderRadius', key: 'borderRadius', suffix: 'px' },
    { id: 'borderWidth', key: 'borderWidth', suffix: 'px' },
    { id: 'shadowX', key: 'shadowX', suffix: 'px' },
    { id: 'shadowY', key: 'shadowY', suffix: 'px' },
    { id: 'shadowBlur', key: 'shadowBlur', suffix: 'px' },
    { id: 'shadowSpread', key: 'shadowSpread', suffix: 'px' },
    { id: 'shadowOpacity', key: 'shadowOpacity', suffix: '%' },
    { id: 'gradientAngle', key: 'gradientAngle', suffix: 'deg' },
    { id: 'letterSpacing', key: 'letterSpacing', suffix: 'px' },
    {
      id: 'transition', key: 'transition', suffix: 's',
      transform: (v) => (parseInt(v, 10) / 10).toFixed(1),
    },
  ];

  const colorControls = [
    { id: 'bgColor', key: 'bgColor' },
    { id: 'textColor', key: 'textColor' },
    { id: 'borderColor', key: 'borderColor' },
    { id: 'shadowColor', key: 'shadowColor' },
    { id: 'gradientStart', key: 'gradientStart' },
    { id: 'gradientEnd', key: 'gradientEnd' },
    { id: 'hoverBgColor', key: 'hoverBgColor' },
    { id: 'hoverTextColor', key: 'hoverTextColor' },
    { id: 'hoverBorderColor', key: 'hoverBorderColor' },
    { id: 'hoverGradientStart', key: 'hoverGradientStart' },
    { id: 'hoverGradientEnd', key: 'hoverGradientEnd' },
  ];

  const selectControls = [
    { id: 'borderStyle', key: 'borderStyle' },
    { id: 'textTransform', key: 'textTransform' },
    { id: 'cursorStyle', key: 'cursorStyle' },
  ];

  // ── Helper: hex to rgba ─────────────────────────────────────────
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${(opacity / 100).toFixed(2)})`;
  }

  // ── Render ──────────────────────────────────────────────────────
  function render() {
    const s = state;

    // Background
    let bg;
    if (s.gradientEnabled) {
      bg = `linear-gradient(${s.gradientAngle}deg, ${s.gradientStart}, ${s.gradientEnd})`;
    } else {
      bg = s.bgColor;
    }

    // Shadow
    const hasShadow = s.shadowBlur > 0 || s.shadowX !== 0 || s.shadowY !== 0 || s.shadowSpread !== 0;
    const shadowVal = hasShadow
      ? `${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${hexToRgba(s.shadowColor, s.shadowOpacity)}`
      : 'none';

    // Apply to preview button
    const btnStyle = previewBtn.style;
    btnStyle.padding = `${s.paddingY}px ${s.paddingX}px`;
    btnStyle.fontSize = `${s.fontSize}px`;
    btnStyle.fontWeight = s.fontWeight;
    btnStyle.borderRadius = `${s.borderRadius}px`;
    btnStyle.border = `${s.borderWidth}px ${s.borderStyle} ${s.borderColor}`;
    btnStyle.color = s.textColor;
    btnStyle.cursor = s.cursorStyle;
    btnStyle.textTransform = s.textTransform;
    btnStyle.letterSpacing = `${s.letterSpacing}px`;
    btnStyle.transition = `all ${s.transition}s ease`;
    btnStyle.boxShadow = shadowVal;

    if (s.gradientEnabled) {
      btnStyle.background = bg;
    } else {
      btnStyle.background = bg;
    }

    previewBtn.textContent = s.buttonText;

    // Hover state via CSS injection
    let hoverBg;
    if (s.hoverGradientEnabled) {
      hoverBg = `linear-gradient(${s.gradientAngle}deg, ${s.hoverGradientStart}, ${s.hoverGradientEnd})`;
    } else {
      hoverBg = s.hoverBgColor;
    }

    let hoverStyleEl = document.getElementById('hover-style');
    if (!hoverStyleEl) {
      hoverStyleEl = document.createElement('style');
      hoverStyleEl.id = 'hover-style';
      document.head.appendChild(hoverStyleEl);
    }
    hoverStyleEl.textContent = `
      #previewButton:hover {
        background: ${hoverBg} !important;
        color: ${s.hoverTextColor} !important;
        border-color: ${s.hoverBorderColor} !important;
      }
    `;

    // Generate CSS output
    generateCSS();
  }

  function generateCSS() {
    const s = state;
    const lines = [];

    lines.push('.btn {');
    lines.push(`  padding: ${s.paddingY}px ${s.paddingX}px;`);
    lines.push(`  font-size: ${s.fontSize}px;`);
    lines.push(`  font-weight: ${s.fontWeight};`);
    lines.push(`  border-radius: ${s.borderRadius}px;`);
    lines.push(`  border: ${s.borderWidth}px ${s.borderStyle} ${s.borderColor};`);
    lines.push(`  color: ${s.textColor};`);

    if (s.gradientEnabled) {
      lines.push(`  background: linear-gradient(${s.gradientAngle}deg, ${s.gradientStart}, ${s.gradientEnd});`);
    } else {
      lines.push(`  background: ${s.bgColor};`);
    }

    lines.push(`  cursor: ${s.cursorStyle};`);

    if (s.textTransform !== 'none') {
      lines.push(`  text-transform: ${s.textTransform};`);
    }

    if (s.letterSpacing > 0) {
      lines.push(`  letter-spacing: ${s.letterSpacing}px;`);
    }

    const hasShadow = s.shadowBlur > 0 || s.shadowX !== 0 || s.shadowY !== 0 || s.shadowSpread !== 0;
    if (hasShadow) {
      lines.push(`  box-shadow: ${s.shadowX}px ${s.shadowY}px ${s.shadowBlur}px ${s.shadowSpread}px ${hexToRgba(s.shadowColor, s.shadowOpacity)};`);
    }

    lines.push(`  transition: all ${s.transition}s ease;`);
    lines.push('}');
    lines.push('');

    // Hover
    lines.push('.btn:hover {');
    if (s.hoverGradientEnabled) {
      lines.push(`  background: linear-gradient(${s.gradientAngle}deg, ${s.hoverGradientStart}, ${s.hoverGradientEnd});`);
    } else {
      lines.push(`  background: ${s.hoverBgColor};`);
    }
    lines.push(`  color: ${s.hoverTextColor};`);
    lines.push(`  border-color: ${s.hoverBorderColor};`);
    lines.push('}');

    cssOutput.textContent = lines.join('\n');
  }

  // ── Sync UI from State ──────────────────────────────────────────
  function syncUI() {
    $('buttonText').value = state.buttonText;

    rangeControls.forEach((ctrl) => {
      const el = $(ctrl.id);
      if (ctrl.transform) {
        // Reverse-transform: state stores final value, input stores raw
        el.value = Math.round(state[ctrl.key] * 10);
      } else {
        el.value = state[ctrl.key];
      }
      const display = $(ctrl.id + 'Val');
      if (display) {
        const val = ctrl.transform ? ctrl.transform(el.value) : state[ctrl.key];
        display.textContent = val + ctrl.suffix;
      }
    });

    colorControls.forEach((ctrl) => {
      const el = $(ctrl.id);
      el.value = state[ctrl.key];
      const hex = $(ctrl.id + 'Hex');
      if (hex) hex.textContent = state[ctrl.key];
    });

    selectControls.forEach((ctrl) => {
      $(ctrl.id).value = state[ctrl.key];
    });

    $('gradientEnabled').checked = state.gradientEnabled;
    $('gradientControls').classList.toggle('hidden', !state.gradientEnabled);
    $('hoverGradientEnabled').checked = state.hoverGradientEnabled;
    $('hoverGradientControls').classList.toggle('hidden', !state.hoverGradientEnabled);
  }

  // ── Event Binding ───────────────────────────────────────────────
  function init() {
    // Range inputs
    rangeControls.forEach((ctrl) => {
      const el = $(ctrl.id);
      el.addEventListener('input', () => {
        const raw = el.value;
        const val = ctrl.transform ? parseFloat(ctrl.transform(raw)) : parseFloat(raw);
        state[ctrl.key] = val;
        const display = $(ctrl.id + 'Val');
        if (display) display.textContent = (ctrl.transform ? ctrl.transform(raw) : raw) + ctrl.suffix;
        render();
      });
    });

    // Color inputs
    colorControls.forEach((ctrl) => {
      const el = $(ctrl.id);
      el.addEventListener('input', () => {
        state[ctrl.key] = el.value;
        const hex = $(ctrl.id + 'Hex');
        if (hex) hex.textContent = el.value;
        render();
      });
    });

    // Select inputs
    selectControls.forEach((ctrl) => {
      $(ctrl.id).addEventListener('change', () => {
        state[ctrl.key] = $(ctrl.id).value;
        render();
      });
    });

    // Button text
    $('buttonText').addEventListener('input', () => {
      state.buttonText = $('buttonText').value || 'Button';
      render();
    });

    // Gradient toggle
    $('gradientEnabled').addEventListener('change', () => {
      state.gradientEnabled = $('gradientEnabled').checked;
      $('gradientControls').classList.toggle('hidden', !state.gradientEnabled);
      render();
    });

    // Hover gradient toggle
    $('hoverGradientEnabled').addEventListener('change', () => {
      state.hoverGradientEnabled = $('hoverGradientEnabled').checked;
      $('hoverGradientControls').classList.toggle('hidden', !state.hoverGradientEnabled);
      render();
    });

    // Presets
    $('presetsGrid').addEventListener('click', (e) => {
      const btn = e.target.closest('[data-preset]');
      if (!btn) return;
      const name = btn.dataset.preset;
      if (!presets[name]) return;
      Object.assign(state, presets[name]);
      syncUI();
      render();
    });

    // Copy CSS
    $('copyBtn').addEventListener('click', () => {
      const text = cssOutput.textContent;
      navigator.clipboard.writeText(text).then(() => {
        showToast();
      }).catch(() => {
        // Fallback
        const ta = document.createElement('textarea');
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

    // Initial render
    syncUI();
    render();
  }

  // ── Toast ───────────────────────────────────────────────────────
  let toastTimer = null;
  function showToast() {
    clearTimeout(toastTimer);
    toast.classList.add('show');
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // ── Start ───────────────────────────────────────────────────────
  init();
})();
