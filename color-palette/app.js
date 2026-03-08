document.addEventListener('DOMContentLoaded', () => {
    const paletteEl = document.getElementById('palette');
    const generateBtn = document.getElementById('generateBtn');
    const harmonySelect = document.getElementById('harmonySelect');
    const countSelect = document.getElementById('countSelect');
    const toast = document.getElementById('toast');
    const modal = document.getElementById('exportModal');
    const modalTitle = document.getElementById('modalTitle');
    const exportCode = document.getElementById('exportCode');
    const copyExport = document.getElementById('copyExport');
    const closeModal = document.getElementById('closeModal');
    const historyList = document.getElementById('historyList');
    const colorWheel = document.getElementById('colorWheel');
    const wheelCursor = document.getElementById('wheelCursor');
    const wheelPreview = document.getElementById('wheelPreview');
    const hueSlider = document.getElementById('hueSlider');
    const satSlider = document.getElementById('satSlider');
    const lightSlider = document.getElementById('lightSlider');
    const hueVal = document.getElementById('hueVal');
    const satVal = document.getElementById('satVal');
    const lightVal = document.getElementById('lightVal');
    const hexInput = document.getElementById('hexInput');
    const addColorBtn = document.getElementById('addColorBtn');
    const detailGrid = document.getElementById('detailGrid');
    const colorDetails = document.getElementById('colorDetails');
    const shadesSection = document.getElementById('shadesSection');
    const shadesBar = document.getElementById('shadesBar');

    let colors = [];
    let locked = [];
    let selectedIndex = -1;
    let history = JSON.parse(localStorage.getItem('paletteHistory') || '[]');
    let wheelHue = 0, wheelSat = 80, wheelLight = 50;

    // ===== COLOR UTILITIES =====
    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s));
        l = Math.max(0, Math.min(100, l));
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    function hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return { r, g, b };
    }

    function hexToHsl(hex) {
        let { r, g, b } = hexToRgb(hex);
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0, s = 0, l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }
        return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
    }

    function rgbToCmyk(r, g, b) {
        if (r === 0 && g === 0 && b === 0) return { c: 0, m: 0, y: 0, k: 100 };
        const c1 = 1 - r / 255, m1 = 1 - g / 255, y1 = 1 - b / 255;
        const k = Math.min(c1, m1, y1);
        return {
            c: Math.round((c1 - k) / (1 - k) * 100),
            m: Math.round((m1 - k) / (1 - k) * 100),
            y: Math.round((y1 - k) / (1 - k) * 100),
            k: Math.round(k * 100)
        };
    }

    function getLuminance(hex) {
        const { r, g, b } = hexToRgb(hex);
        return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    }

    // ===== COLOR WHEEL =====
    function drawWheel() {
        const ctx = colorWheel.getContext('2d');
        const w = colorWheel.width, h = colorWheel.height;
        const cx = w / 2, cy = h / 2, radius = w / 2 - 4;

        ctx.clearRect(0, 0, w, h);

        // Draw hue/saturation wheel
        for (let angle = 0; angle < 360; angle += 0.5) {
            const startRad = (angle - 0.5) * Math.PI / 180;
            const endRad = (angle + 0.5) * Math.PI / 180;

            const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            gradient.addColorStop(0, `hsl(${angle}, 10%, ${wheelLight}%)`);
            gradient.addColorStop(0.5, `hsl(${angle}, 70%, ${wheelLight}%)`);
            gradient.addColorStop(1, `hsl(${angle}, 100%, ${wheelLight}%)`);

            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, radius, startRad, endRad);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }

    function drawCursor(hue, sat) {
        const ctx = wheelCursor.getContext('2d');
        const w = wheelCursor.width, h = wheelCursor.height;
        const cx = w / 2, cy = h / 2, radius = w / 2 - 4;

        ctx.clearRect(0, 0, w, h);

        const r = (sat / 100) * radius;
        const angle = (hue - 90) * Math.PI / 180;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);

        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = hslToHex(hue, sat, wheelLight);
        ctx.fill();
    }

    function updateWheelFromPos(clientX, clientY) {
        const rect = colorWheel.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const x = clientX - rect.left - cx;
        const y = clientY - rect.top - cy;
        const radius = rect.width / 2 - 4;

        const dist = Math.min(Math.sqrt(x * x + y * y), radius);
        let angle = Math.atan2(y, x) * 180 / Math.PI + 90;
        if (angle < 0) angle += 360;

        wheelHue = Math.round(angle);
        wheelSat = Math.round((dist / radius) * 100);

        hueSlider.value = wheelHue;
        satSlider.value = wheelSat;
        hueVal.textContent = wheelHue;
        satVal.textContent = wheelSat;

        updateWheelPreview();
        drawCursor(wheelHue, wheelSat);
    }

    let wheelDragging = false;
    colorWheel.addEventListener('mousedown', (e) => { wheelDragging = true; updateWheelFromPos(e.clientX, e.clientY); });
    document.addEventListener('mousemove', (e) => { if (wheelDragging) updateWheelFromPos(e.clientX, e.clientY); });
    document.addEventListener('mouseup', () => { wheelDragging = false; });
    colorWheel.addEventListener('touchstart', (e) => { e.preventDefault(); wheelDragging = true; updateWheelFromPos(e.touches[0].clientX, e.touches[0].clientY); });
    document.addEventListener('touchmove', (e) => { if (wheelDragging) updateWheelFromPos(e.touches[0].clientX, e.touches[0].clientY); });
    document.addEventListener('touchend', () => { wheelDragging = false; });

    function updateWheelPreview() {
        const hex = hslToHex(wheelHue, wheelSat, wheelLight);
        wheelPreview.style.background = hex;
        hexInput.value = hex.toUpperCase();
    }

    // Sliders
    hueSlider.addEventListener('input', () => {
        wheelHue = parseInt(hueSlider.value);
        hueVal.textContent = wheelHue;
        drawWheel();
        drawCursor(wheelHue, wheelSat);
        updateWheelPreview();
    });

    satSlider.addEventListener('input', () => {
        wheelSat = parseInt(satSlider.value);
        satVal.textContent = wheelSat;
        drawCursor(wheelHue, wheelSat);
        updateWheelPreview();
    });

    lightSlider.addEventListener('input', () => {
        wheelLight = parseInt(lightSlider.value);
        lightVal.textContent = wheelLight;
        drawWheel();
        drawCursor(wheelHue, wheelSat);
        updateWheelPreview();
    });

    // Add color from wheel
    addColorBtn.addEventListener('click', () => {
        const hex = hexInput.value.trim();
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
            showToast('Enter a valid hex color');
            return;
        }
        if (selectedIndex >= 0 && selectedIndex < colors.length) {
            colors[selectedIndex] = hex.toLowerCase();
        } else {
            colors.push(hex.toLowerCase());
            locked.push(false);
        }
        render();
        showToast('Color added!');
    });

    // ===== HARMONY GENERATORS =====
    function generateColors(mode, count) {
        const baseH = Math.random() * 360;

        switch (mode) {
            case 'analogous':
                return distributeColors(count, i => {
                    const offset = (i - Math.floor(count / 2)) * (30 / Math.max(count - 1, 1)) * 2;
                    return hslToHex((baseH + offset + 360) % 360, 75 + Math.random() * 20, 45 + Math.random() * 15);
                });
            case 'complementary': {
                const comp = (baseH + 180) % 360;
                return distributeColors(count, i => {
                    const h = i < count / 2 ? baseH : comp;
                    return hslToHex(h + (Math.random() - 0.5) * 20, 70 + Math.random() * 25, 35 + (i / count) * 30);
                });
            }
            case 'split-complementary': {
                const s1 = (baseH + 150) % 360;
                const s2 = (baseH + 210) % 360;
                const hues = [baseH, s1, s2];
                return distributeColors(count, i => {
                    const h = hues[i % 3];
                    return hslToHex(h + (Math.random() - 0.5) * 15, 75 + Math.random() * 20, 40 + Math.random() * 20);
                });
            }
            case 'triadic': {
                const hues = [baseH, (baseH + 120) % 360, (baseH + 240) % 360];
                return distributeColors(count, i => {
                    const h = hues[i % 3];
                    return hslToHex(h + (Math.random() - 0.5) * 10, 70 + Math.random() * 25, 40 + Math.random() * 20);
                });
            }
            case 'tetradic': {
                const hues = [baseH, (baseH + 90) % 360, (baseH + 180) % 360, (baseH + 270) % 360];
                return distributeColors(count, i => {
                    const h = hues[i % 4];
                    return hslToHex(h, 70 + Math.random() * 25, 40 + Math.random() * 20);
                });
            }
            case 'square': {
                const hues = [baseH, (baseH + 90) % 360, (baseH + 180) % 360, (baseH + 270) % 360];
                return distributeColors(count, i => {
                    return hslToHex(hues[i % 4], 80 + Math.random() * 15, 45 + Math.random() * 15);
                });
            }
            case 'monochromatic':
                return distributeColors(count, i => {
                    const l = 20 + (i / (count - 1)) * 55;
                    return hslToHex(baseH, 60 + Math.random() * 30, l);
                });
            case 'pastel':
                return distributeColors(count, () =>
                    hslToHex(Math.random() * 360, 55 + Math.random() * 30, 78 + Math.random() * 12)
                );
            case 'vivid':
                return distributeColors(count, () =>
                    hslToHex(Math.random() * 360, 85 + Math.random() * 15, 50 + Math.random() * 10)
                );
            case 'neon':
                return distributeColors(count, () => {
                    const h = Math.random() * 360;
                    return hslToHex(h, 100, 55 + Math.random() * 10);
                });
            case 'jewel':
                return distributeColors(count, () => {
                    const hues = [0, 30, 120, 200, 270, 320];
                    const h = hues[Math.floor(Math.random() * hues.length)];
                    return hslToHex(h + Math.random() * 20, 60 + Math.random() * 30, 30 + Math.random() * 20);
                });
            case 'sunset': {
                const sunsetHues = [350, 10, 25, 40, 55, 280, 300];
                return distributeColors(count, i => {
                    const h = sunsetHues[i % sunsetHues.length] + Math.random() * 10;
                    return hslToHex(h, 80 + Math.random() * 20, 45 + Math.random() * 20);
                });
            }
            case 'ocean': {
                return distributeColors(count, i => {
                    const h = 170 + (i / count) * 60 + Math.random() * 15;
                    return hslToHex(h, 60 + Math.random() * 35, 30 + Math.random() * 30);
                });
            }
            case 'forest': {
                return distributeColors(count, i => {
                    const h = 80 + (i / count) * 80 + Math.random() * 20;
                    return hslToHex(h, 40 + Math.random() * 40, 25 + Math.random() * 30);
                });
            }
            case 'candy': {
                return distributeColors(count, () => {
                    const h = [320, 340, 280, 200, 170, 50][Math.floor(Math.random() * 6)];
                    return hslToHex(h + Math.random() * 20, 70 + Math.random() * 25, 65 + Math.random() * 15);
                });
            }
            case 'earth': {
                return distributeColors(count, () => {
                    const h = [15, 25, 35, 45, 80, 140][Math.floor(Math.random() * 6)];
                    return hslToHex(h + Math.random() * 15, 35 + Math.random() * 30, 30 + Math.random() * 25);
                });
            }
            case 'retro': {
                return distributeColors(count, () => {
                    const h = [0, 30, 50, 160, 190, 350][Math.floor(Math.random() * 6)];
                    return hslToHex(h + Math.random() * 15, 50 + Math.random() * 30, 45 + Math.random() * 20);
                });
            }
            default:
                return distributeColors(count, () => {
                    return hslToHex(Math.random() * 360, 55 + Math.random() * 40, 35 + Math.random() * 30);
                });
        }
    }

    function distributeColors(count, generator) {
        return Array.from({ length: count }, (_, i) => generator(i));
    }

    // ===== RENDER =====
    function generate() {
        const count = parseInt(countSelect.value);
        const newColors = generateColors(harmonySelect.value, count);

        // Expand/shrink locked array
        while (locked.length < count) locked.push(false);
        locked.length = count;

        if (colors.length === 0 || colors.length !== count) {
            colors = newColors;
        } else {
            colors = colors.map((c, i) => locked[i] ? c : (newColors[i] || c));
        }

        selectedIndex = -1;
        render();
        saveHistory();
    }

    function render() {
        paletteEl.innerHTML = colors.map((color, i) => {
            const { r, g, b } = hexToRgb(color);
            const hsl = hexToHsl(color);
            const textColor = getLuminance(color) > 0.5 ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.95)';
            const isSelected = i === selectedIndex;
            return `
                <div class="color-card ${locked[i] ? 'locked' : ''} ${isSelected ? 'selected' : ''}" style="background:${color}" data-index="${i}">
                    <div class="color-actions">
                        <button class="icon-btn ${locked[i] ? 'active' : ''}" data-action="lock" data-index="${i}" title="Lock">&#128274;</button>
                        <button class="icon-btn" data-action="remove" data-index="${i}" title="Remove">&#10005;</button>
                    </div>
                    <div class="color-info">
                        <div class="color-hex" style="color:${textColor}">${color.toUpperCase()}</div>
                        <div class="color-rgb" style="color:${textColor}">rgb(${r}, ${g}, ${b})</div>
                        <div class="color-hsl" style="color:${textColor}">hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showColorDetails(index) {
        const hex = colors[index];
        const { r, g, b } = hexToRgb(hex);
        const hsl = hexToHsl(hex);
        const cmyk = rgbToCmyk(r, g, b);

        colorDetails.classList.remove('hidden');
        detailGrid.innerHTML = `
            <div class="detail-item" data-copy="${hex.toUpperCase()}">
                <div class="detail-label">HEX</div>
                <div class="detail-value">${hex.toUpperCase()}</div>
            </div>
            <div class="detail-item" data-copy="rgb(${r}, ${g}, ${b})">
                <div class="detail-label">RGB</div>
                <div class="detail-value">${r}, ${g}, ${b}</div>
            </div>
            <div class="detail-item" data-copy="hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)">
                <div class="detail-label">HSL</div>
                <div class="detail-value">${hsl.h}, ${hsl.s}%, ${hsl.l}%</div>
            </div>
            <div class="detail-item" data-copy="cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)">
                <div class="detail-label">CMYK</div>
                <div class="detail-value">${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}</div>
            </div>
        `;

        // Shades & tints
        shadesSection.classList.remove('hidden');
        let shadesHTML = '';
        for (let i = 0; i <= 10; i++) {
            const l = i * 10;
            const shadeHex = hslToHex(hsl.h, hsl.s, l);
            const tc = l > 50 ? '#000' : '#fff';
            shadesHTML += `<div class="shade-swatch" style="background:${shadeHex}" data-hex="${shadeHex}">
                <span class="shade-label" style="color:${tc}">${shadeHex}</span>
            </div>`;
        }
        shadesBar.innerHTML = shadesHTML;

        // Update wheel
        wheelHue = hsl.h;
        wheelSat = hsl.s;
        wheelLight = hsl.l;
        hueSlider.value = hsl.h;
        satSlider.value = hsl.s;
        lightSlider.value = hsl.l;
        hueVal.textContent = hsl.h;
        satVal.textContent = hsl.s;
        lightVal.textContent = hsl.l;
        drawWheel();
        drawCursor(wheelHue, wheelSat);
        updateWheelPreview();
    }

    // ===== EVENTS =====
    paletteEl.addEventListener('click', (e) => {
        const lockBtn = e.target.closest('[data-action="lock"]');
        if (lockBtn) {
            const i = parseInt(lockBtn.dataset.index);
            locked[i] = !locked[i];
            render();
            return;
        }

        const removeBtn = e.target.closest('[data-action="remove"]');
        if (removeBtn) {
            const i = parseInt(removeBtn.dataset.index);
            if (colors.length > 2) {
                colors.splice(i, 1);
                locked.splice(i, 1);
                if (selectedIndex === i) selectedIndex = -1;
                else if (selectedIndex > i) selectedIndex--;
                render();
            } else {
                showToast('Need at least 2 colors');
            }
            return;
        }

        const card = e.target.closest('.color-card');
        if (card) {
            const i = parseInt(card.dataset.index);
            selectedIndex = i;
            render();
            showColorDetails(i);
            navigator.clipboard.writeText(colors[i].toUpperCase());
            showToast(`Copied ${colors[i].toUpperCase()}`);
        }
    });

    // Detail items click to copy
    detailGrid.addEventListener('click', (e) => {
        const item = e.target.closest('.detail-item');
        if (item) {
            navigator.clipboard.writeText(item.dataset.copy);
            showToast(`Copied ${item.dataset.copy}`);
        }
    });

    // Shades click to copy
    shadesBar.addEventListener('click', (e) => {
        const swatch = e.target.closest('.shade-swatch');
        if (swatch) {
            navigator.clipboard.writeText(swatch.dataset.hex);
            showToast(`Copied ${swatch.dataset.hex}`);
        }
    });

    generateBtn.addEventListener('click', generate);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && e.target.tagName !== 'SELECT') {
            e.preventDefault();
            generate();
        }
    });

    // ===== EXPORTS =====
    function showModal(title, code) {
        modalTitle.textContent = title;
        exportCode.textContent = code;
        modal.classList.add('active');
    }

    closeModal.addEventListener('click', () => modal.classList.remove('active'));
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

    copyExport.addEventListener('click', () => {
        navigator.clipboard.writeText(exportCode.textContent);
        showToast('Copied!');
        modal.classList.remove('active');
    });

    document.getElementById('exportCSS').addEventListener('click', () => {
        const css = `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c};`).join('\n')}\n}`;
        showModal('CSS Variables', css);
    });

    document.getElementById('exportTailwind').addEventListener('click', () => {
        const tw = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colors.map((c, i) => `          '${i + 1}': '${c}',`).join('\n')}\n        }\n      }\n    }\n  }\n}`;
        showModal('Tailwind Config', tw);
    });

    document.getElementById('exportJSON').addEventListener('click', () => {
        const data = {
            palette: colors.map(c => {
                const { r, g, b } = hexToRgb(c);
                const hsl = hexToHsl(c);
                return { hex: c, rgb: { r, g, b }, hsl };
            }),
            harmony: harmonySelect.value
        };
        showModal('JSON', JSON.stringify(data, null, 2));
    });

    document.getElementById('exportSCSS').addEventListener('click', () => {
        const scss = colors.map((c, i) => `$color-${i + 1}: ${c};`).join('\n') +
            '\n\n$palette: (' + colors.map((c, i) => `\n  '${i + 1}': ${c}`).join(',') + '\n);';
        showModal('SCSS Variables', scss);
    });

    document.getElementById('exportSVG').addEventListener('click', () => {
        const w = colors.length * 80;
        const rects = colors.map((c, i) => `  <rect x="${i * 80}" y="0" width="80" height="120" fill="${c}"/>`).join('\n');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="120" viewBox="0 0 ${w} 120">\n${rects}\n</svg>`;
        showModal('SVG', svg);
    });

    document.getElementById('exportURL').addEventListener('click', () => {
        const params = colors.map(c => c.slice(1)).join('-');
        const url = `${window.location.origin}${window.location.pathname}#${params}`;
        navigator.clipboard.writeText(url);
        window.location.hash = params;
        showToast('Share link copied!');
    });

    // Load from URL hash
    function loadFromHash() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const hexColors = hash.split('-').map(c => `#${c}`).filter(c => /^#[0-9A-Fa-f]{6}$/.test(c));
            if (hexColors.length >= 2) {
                colors = hexColors;
                locked = new Array(colors.length).fill(false);
                countSelect.value = Math.min(colors.length, 8);
                render();
                return true;
            }
        }
        return false;
    }

    // ===== HISTORY =====
    function saveHistory() {
        history.unshift([...colors]);
        if (history.length > 12) history.pop();
        localStorage.setItem('paletteHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = history.slice(1).map((palette, idx) => `
            <div class="history-item" data-history="${idx + 1}">
                ${palette.map(c => `<div class="history-swatch" style="background:${c}"></div>`).join('')}
            </div>
        `).join('');
    }

    historyList.addEventListener('click', (e) => {
        const item = e.target.closest('.history-item');
        if (item) {
            const idx = parseInt(item.dataset.history);
            colors = [...history[idx]];
            locked = new Array(colors.length).fill(false);
            countSelect.value = Math.min(colors.length, 8);
            render();
        }
    });

    // ===== TOAST =====
    let toastTimeout;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // ===== INIT =====
    drawWheel();
    drawCursor(wheelHue, wheelSat);
    updateWheelPreview();

    if (!loadFromHash()) {
        generate();
    }
    renderHistory();
});
