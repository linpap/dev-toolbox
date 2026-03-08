// ── DOM Elements ──────────────────────────────────

const $ = (sel) => document.querySelector(sel);
const fgPicker = $('#fg-picker');
const bgPicker = $('#bg-picker');
const fgHex = $('#fg-hex');
const bgHex = $('#bg-hex');
const fgR = $('#fg-r'), fgG = $('#fg-g'), fgB = $('#fg-b');
const bgR = $('#bg-r'), bgG = $('#bg-g'), bgB = $('#bg-b');
const ratioValue = $('#ratio-value');
const previewBox = $('#preview-box');
const badgeAANormal = $('#badge-aa-normal');
const badgeAALarge = $('#badge-aa-large');
const badgeAAANormal = $('#badge-aaa-normal');
const badgeAAALarge = $('#badge-aaa-large');
const swapBtn = $('#swap-btn');
const randomBtn = $('#random-btn');
const copyBtn = $('#copy-btn');
const suggestionsSection = $('#suggestions-section');
const suggestionsGrid = $('#suggestions-grid');
const toastContainer = $('#toast-container');

// ── Color Utilities ──────────────────────────────

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(c => {
    const h = Math.max(0, Math.min(255, Math.round(c))).toString(16);
    return h.length === 1 ? '0' + h : h;
  }).join('');
}

function isValidHex(hex) {
  return /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex);
}

// ── Relative Luminance (WCAG 2.1) ───────────────

function srgbToLinear(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function contrastRatio(fg, bg) {
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ── WCAG Thresholds ──────────────────────────────

const THRESHOLDS = {
  aaNormal: 4.5,
  aaLarge: 3,
  aaaNormal: 7,
  aaaLarge: 4.5,
};

function checkCompliance(ratio) {
  return {
    aaNormal: ratio >= THRESHOLDS.aaNormal,
    aaLarge: ratio >= THRESHOLDS.aaLarge,
    aaaNormal: ratio >= THRESHOLDS.aaaNormal,
    aaaLarge: ratio >= THRESHOLDS.aaaLarge,
  };
}

// ── Update UI ────────────────────────────────────

function getFgColor() {
  return hexToRgb(fgHex.value);
}

function getBgColor() {
  return hexToRgb(bgHex.value);
}

function update() {
  const fg = getFgColor();
  const bg = getBgColor();
  const ratio = contrastRatio(fg, bg);
  const compliance = checkCompliance(ratio);

  // Ratio display
  ratioValue.textContent = ratio.toFixed(2) + ':1';

  // Badges
  updateBadge(badgeAANormal, compliance.aaNormal);
  updateBadge(badgeAALarge, compliance.aaLarge);
  updateBadge(badgeAAANormal, compliance.aaaNormal);
  updateBadge(badgeAAALarge, compliance.aaaLarge);

  // Preview
  const fgHexVal = rgbToHex(fg.r, fg.g, fg.b);
  const bgHexVal = rgbToHex(bg.r, bg.g, bg.b);
  previewBox.style.color = fgHexVal;
  previewBox.style.backgroundColor = bgHexVal;

  // Suggestions
  if (!compliance.aaNormal) {
    showSuggestions(fg, bg);
  } else {
    suggestionsSection.style.display = 'none';
  }
}

function updateBadge(badge, passes) {
  badge.classList.toggle('pass', passes);
  badge.classList.toggle('fail', !passes);
  badge.querySelector('.badge-status').textContent = passes ? 'Pass' : 'Fail';
}

// ── Sync Helpers ─────────────────────────────────

function syncFgFromHex() {
  const hex = fgHex.value;
  if (!isValidHex(hex)) return;
  const normalizedHex = hex.startsWith('#') ? hex : '#' + hex;
  const rgb = hexToRgb(normalizedHex);
  fgPicker.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  fgR.value = rgb.r;
  fgG.value = rgb.g;
  fgB.value = rgb.b;
  update();
}

function syncBgFromHex() {
  const hex = bgHex.value;
  if (!isValidHex(hex)) return;
  const normalizedHex = hex.startsWith('#') ? hex : '#' + hex;
  const rgb = hexToRgb(normalizedHex);
  bgPicker.value = rgbToHex(rgb.r, rgb.g, rgb.b);
  bgR.value = rgb.r;
  bgG.value = rgb.g;
  bgB.value = rgb.b;
  update();
}

function syncFgFromRgb() {
  const r = clampRgb(fgR.value);
  const g = clampRgb(fgG.value);
  const b = clampRgb(fgB.value);
  const hex = rgbToHex(r, g, b);
  fgHex.value = hex;
  fgPicker.value = hex;
  update();
}

function syncBgFromRgb() {
  const r = clampRgb(bgR.value);
  const g = clampRgb(bgG.value);
  const b = clampRgb(bgB.value);
  const hex = rgbToHex(r, g, b);
  bgHex.value = hex;
  bgPicker.value = hex;
  update();
}

function syncFgFromPicker() {
  const hex = fgPicker.value;
  fgHex.value = hex;
  const rgb = hexToRgb(hex);
  fgR.value = rgb.r;
  fgG.value = rgb.g;
  fgB.value = rgb.b;
  update();
}

function syncBgFromPicker() {
  const hex = bgPicker.value;
  bgHex.value = hex;
  const rgb = hexToRgb(hex);
  bgR.value = rgb.r;
  bgG.value = rgb.g;
  bgB.value = rgb.b;
  update();
}

function clampRgb(val) {
  const n = parseInt(val, 10);
  if (isNaN(n)) return 0;
  return Math.max(0, Math.min(255, n));
}

function setColors(fgHexVal, bgHexVal) {
  const fg = hexToRgb(fgHexVal);
  const bg = hexToRgb(bgHexVal);
  fgHex.value = fgHexVal;
  fgPicker.value = fgHexVal;
  fgR.value = fg.r;
  fgG.value = fg.g;
  fgB.value = fg.b;
  bgHex.value = bgHexVal;
  bgPicker.value = bgHexVal;
  bgR.value = bg.r;
  bgG.value = bg.g;
  bgB.value = bg.b;
  update();
}

// ── Event Listeners ──────────────────────────────

fgPicker.addEventListener('input', syncFgFromPicker);
bgPicker.addEventListener('input', syncBgFromPicker);
fgHex.addEventListener('input', syncFgFromHex);
bgHex.addEventListener('input', syncBgFromHex);
[fgR, fgG, fgB].forEach(el => el.addEventListener('input', syncFgFromRgb));
[bgR, bgG, bgB].forEach(el => el.addEventListener('input', syncBgFromRgb));

// ── Swap ─────────────────────────────────────────

swapBtn.addEventListener('click', () => {
  const currentFg = fgHex.value;
  const currentBg = bgHex.value;
  setColors(currentBg, currentFg);
  showToast('Colors swapped');
});

// ── Random Accessible Combo ──────────────────────

function randomChannel() {
  return Math.floor(Math.random() * 256);
}

randomBtn.addEventListener('click', () => {
  let attempts = 0;
  let fg, bg, ratio;
  do {
    fg = { r: randomChannel(), g: randomChannel(), b: randomChannel() };
    bg = { r: randomChannel(), g: randomChannel(), b: randomChannel() };
    ratio = contrastRatio(fg, bg);
    attempts++;
  } while (ratio < 4.5 && attempts < 500);

  // Ensure fg is lighter if bg is dark
  const fgLum = relativeLuminance(fg.r, fg.g, fg.b);
  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);
  if (fgLum < bgLum) {
    [fg, bg] = [bg, fg];
  }

  const fgH = rgbToHex(fg.r, fg.g, fg.b);
  const bgH = rgbToHex(bg.r, bg.g, bg.b);
  setColors(fgH, bgH);
  showToast('Random accessible combo generated (' + ratio.toFixed(1) + ':1)');
});

// ── Copy Colors ──────────────────────────────────

copyBtn.addEventListener('click', () => {
  const text = `Foreground: ${fgHex.value}\nBackground: ${bgHex.value}\nContrast: ${ratioValue.textContent}`;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Colors copied to clipboard');
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
    showToast('Colors copied to clipboard');
  });
});

// ── Suggested Fixes ──────────────────────────────

function adjustLuminance(rgb, targetLuminance, direction) {
  // Binary search to find a color along the lightness axis
  let { r, g, b } = rgb;
  let low = direction === 'lighten' ? 0 : -1;
  let high = direction === 'lighten' ? 1 : 0;
  let factor = 0;

  for (let i = 0; i < 30; i++) {
    factor = (low + high) / 2;
    let nr, ng, nb;
    if (direction === 'lighten') {
      nr = r + (255 - r) * factor;
      ng = g + (255 - g) * factor;
      nb = b + (255 - b) * factor;
    } else {
      nr = r * (1 + factor);
      ng = g * (1 + factor);
      nb = b * (1 + factor);
    }
    nr = Math.max(0, Math.min(255, nr));
    ng = Math.max(0, Math.min(255, ng));
    nb = Math.max(0, Math.min(255, nb));
    const lum = relativeLuminance(nr, ng, nb);
    if (lum < targetLuminance) {
      low = factor;
    } else {
      high = factor;
    }
  }

  let nr, ng, nb;
  if (direction === 'lighten') {
    nr = r + (255 - r) * factor;
    ng = g + (255 - g) * factor;
    nb = b + (255 - b) * factor;
  } else {
    nr = r * (1 + factor);
    ng = g * (1 + factor);
    nb = b * (1 + factor);
  }
  return {
    r: Math.max(0, Math.min(255, Math.round(nr))),
    g: Math.max(0, Math.min(255, Math.round(ng))),
    b: Math.max(0, Math.min(255, Math.round(nb))),
  };
}

function findAccessibleColor(fixColor, refColor, isFixForeground) {
  // Find a version of fixColor that meets 4.5:1 against refColor
  const refLum = relativeLuminance(refColor.r, refColor.g, refColor.b);
  const results = [];

  // Target luminance for lighter side: L1 = 4.5 * (L2 + 0.05) - 0.05
  const targetLighter = 4.5 * (refLum + 0.05) - 0.05;
  // Target luminance for darker side: L2 = (L1 + 0.05) / 4.5 - 0.05
  const targetDarker = (refLum + 0.05) / 4.5 - 0.05;

  if (targetLighter <= 1) {
    const lighter = adjustLuminance(fixColor, targetLighter, 'lighten');
    const ratio = contrastRatio(
      isFixForeground ? lighter : refColor,
      isFixForeground ? refColor : lighter
    );
    if (ratio >= 4.5) {
      results.push({ color: lighter, ratio, label: isFixForeground ? 'Lighter text' : 'Lighter bg' });
    }
  }

  if (targetDarker >= 0) {
    const darker = adjustLuminance(fixColor, targetDarker, 'darken');
    const ratio = contrastRatio(
      isFixForeground ? darker : refColor,
      isFixForeground ? refColor : darker
    );
    if (ratio >= 4.5) {
      results.push({ color: darker, ratio, label: isFixForeground ? 'Darker text' : 'Darker bg' });
    }
  }

  return results;
}

function showSuggestions(fg, bg) {
  suggestionsGrid.innerHTML = '';

  const fgSuggestions = findAccessibleColor(fg, bg, true);
  const bgSuggestions = findAccessibleColor(bg, fg, false);

  const all = [];

  fgSuggestions.forEach(s => {
    all.push({
      fg: s.color,
      bg: bg,
      ratio: s.ratio,
      label: s.label,
    });
  });

  bgSuggestions.forEach(s => {
    all.push({
      fg: fg,
      bg: s.color,
      ratio: s.ratio,
      label: s.label,
    });
  });

  if (all.length === 0) {
    suggestionsSection.style.display = 'none';
    return;
  }

  suggestionsSection.style.display = '';

  all.forEach(item => {
    const card = document.createElement('div');
    card.className = 'suggestion-card';
    const fgH = rgbToHex(item.fg.r, item.fg.g, item.fg.b);
    const bgH = rgbToHex(item.bg.r, item.bg.g, item.bg.b);
    card.innerHTML = `
      <div class="suggestion-preview" style="color:${fgH};background:${bgH};">Sample Text</div>
      <div class="suggestion-meta">
        <span class="suggestion-colors">${fgH} / ${bgH}</span>
        <span class="suggestion-ratio">${item.ratio.toFixed(1)}:1</span>
      </div>
    `;
    card.title = `${item.label} — Click to apply`;
    card.addEventListener('click', () => {
      setColors(fgH, bgH);
      showToast('Suggested colors applied');
    });
    suggestionsGrid.appendChild(card);
  });
}

// ── Toast Notifications ──────────────────────────

function showToast(message, duration = 2500) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ── Initialize ───────────────────────────────────

update();
