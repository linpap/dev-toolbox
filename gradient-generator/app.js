document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const gradientPreview = document.getElementById('gradientPreview');
    const cssOutput = document.getElementById('cssOutput');
    const copyBtn = document.getElementById('copyBtn');
    const randomBtn = document.getElementById('randomBtn');
    const reverseBtn = document.getElementById('reverseBtn');
    const addStopBtn = document.getElementById('addStopBtn');
    const colorStopsEl = document.getElementById('colorStops');
    const angleSlider = document.getElementById('angleSlider');
    const angleVal = document.getElementById('angleVal');
    const angleSection = document.getElementById('angleSection');
    const radialSection = document.getElementById('radialSection');
    const presetsGallery = document.getElementById('presetsGallery');
    const toast = document.getElementById('toast');

    // State
    let gradientType = 'linear';
    let angle = 135;
    let radialShape = 'circle';
    let stops = [
        { color: '#a855f7', position: 0 },
        { color: '#ec4899', position: 50 },
        { color: '#f97316', position: 100 }
    ];

    // Presets
    const presets = [
        {
            name: 'Sunset Glow',
            type: 'linear', angle: 135,
            stops: [
                { color: '#fa709a', position: 0 },
                { color: '#fee140', position: 100 }
            ]
        },
        {
            name: 'Ocean Blue',
            type: 'linear', angle: 135,
            stops: [
                { color: '#667eea', position: 0 },
                { color: '#764ba2', position: 100 }
            ]
        },
        {
            name: 'Emerald Dream',
            type: 'linear', angle: 135,
            stops: [
                { color: '#11998e', position: 0 },
                { color: '#38ef7d', position: 100 }
            ]
        },
        {
            name: 'Cosmic Fusion',
            type: 'linear', angle: 135,
            stops: [
                { color: '#ff0844', position: 0 },
                { color: '#ffb199', position: 100 }
            ]
        },
        {
            name: 'Northern Lights',
            type: 'linear', angle: 45,
            stops: [
                { color: '#43e97b', position: 0 },
                { color: '#38f9d7', position: 50 },
                { color: '#667eea', position: 100 }
            ]
        },
        {
            name: 'Deep Space',
            type: 'linear', angle: 180,
            stops: [
                { color: '#0f0c29', position: 0 },
                { color: '#302b63', position: 50 },
                { color: '#24243e', position: 100 }
            ]
        },
        {
            name: 'Warm Flame',
            type: 'linear', angle: 45,
            stops: [
                { color: '#ff9a9e', position: 0 },
                { color: '#fad0c4', position: 50 },
                { color: '#ffecd2', position: 100 }
            ]
        },
        {
            name: 'Berry Smoothie',
            type: 'linear', angle: 135,
            stops: [
                { color: '#8e2de2', position: 0 },
                { color: '#4a00e0', position: 100 }
            ]
        },
        {
            name: 'Radial Glow',
            type: 'radial', angle: 0,
            shape: 'circle',
            stops: [
                { color: '#f5af19', position: 0 },
                { color: '#f12711', position: 100 }
            ]
        },
        {
            name: 'Conic Rainbow',
            type: 'conic', angle: 0,
            stops: [
                { color: '#ff0000', position: 0 },
                { color: '#ffff00', position: 17 },
                { color: '#00ff00', position: 33 },
                { color: '#00ffff', position: 50 },
                { color: '#0000ff', position: 67 },
                { color: '#ff00ff', position: 83 },
                { color: '#ff0000', position: 100 }
            ]
        }
    ];

    // ===== GRADIENT BUILDING =====
    function buildGradientCSS() {
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);
        const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');

        switch (gradientType) {
            case 'linear':
                return `linear-gradient(${angle}deg, ${stopsStr})`;
            case 'radial':
                return `radial-gradient(${radialShape}, ${stopsStr})`;
            case 'conic':
                return `conic-gradient(from ${angle}deg, ${stopsStr})`;
            default:
                return `linear-gradient(${angle}deg, ${stopsStr})`;
        }
    }

    function buildFullCSS() {
        const gradient = buildGradientCSS();
        return `background: ${gradient};`;
    }

    // ===== RENDERING =====
    function update() {
        const gradient = buildGradientCSS();
        gradientPreview.style.background = gradient;
        cssOutput.textContent = buildFullCSS();
        renderStops();
    }

    function renderStops() {
        colorStopsEl.innerHTML = stops.map((stop, i) => `
            <div class="color-stop" data-index="${i}">
                <input type="color" class="color-stop-picker" value="${stop.color}" data-index="${i}">
                <input type="text" class="color-stop-hex" value="${stop.color.toUpperCase()}" data-index="${i}" maxlength="7" spellcheck="false">
                <input type="text" class="color-stop-pos" value="${stop.position}%" data-index="${i}" maxlength="4">
                <button class="remove-stop-btn ${stops.length <= 2 ? 'disabled' : ''}" data-index="${i}">&times;</button>
            </div>
        `).join('');
    }

    // ===== TYPE SELECTION =====
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gradientType = btn.dataset.type;

            // Show/hide relevant sections
            if (gradientType === 'linear') {
                angleSection.classList.remove('hidden');
                radialSection.classList.add('hidden');
                document.querySelector('#angleSection .section-label').textContent = 'Angle';
            } else if (gradientType === 'radial') {
                angleSection.classList.add('hidden');
                radialSection.classList.remove('hidden');
            } else if (gradientType === 'conic') {
                angleSection.classList.remove('hidden');
                radialSection.classList.add('hidden');
                document.querySelector('#angleSection .section-label').textContent = 'Starting Angle';
            }

            update();
        });
    });

    // ===== RADIAL SHAPE =====
    document.querySelectorAll('.shape-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            radialShape = btn.dataset.shape;
            update();
        });
    });

    // ===== ANGLE CONTROLS =====
    angleSlider.addEventListener('input', () => {
        angle = parseInt(angleSlider.value);
        angleVal.textContent = angle + '\u00B0';
        updateDirBtnActive();
        update();
    });

    function updateDirBtnActive() {
        document.querySelectorAll('.dir-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.angle) === angle);
        });
    }

    document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            angle = parseInt(btn.dataset.angle);
            angleSlider.value = angle;
            angleVal.textContent = angle + '\u00B0';
            updateDirBtnActive();
            update();
        });
    });

    // ===== COLOR STOPS EVENTS =====
    colorStopsEl.addEventListener('input', (e) => {
        const i = parseInt(e.target.dataset.index);

        if (e.target.classList.contains('color-stop-picker')) {
            stops[i].color = e.target.value;
            // Update sibling hex input
            const hex = e.target.parentElement.querySelector('.color-stop-hex');
            if (hex) hex.value = e.target.value.toUpperCase();
            updatePreviewOnly();
        }
    });

    colorStopsEl.addEventListener('change', (e) => {
        const i = parseInt(e.target.dataset.index);

        if (e.target.classList.contains('color-stop-hex')) {
            let val = e.target.value.trim();
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                stops[i].color = val.toLowerCase();
                const picker = e.target.parentElement.querySelector('.color-stop-picker');
                if (picker) picker.value = val.toLowerCase();
                update();
            } else {
                e.target.value = stops[i].color.toUpperCase();
            }
        }

        if (e.target.classList.contains('color-stop-pos')) {
            let val = parseInt(e.target.value);
            if (isNaN(val)) val = 0;
            val = Math.max(0, Math.min(100, val));
            stops[i].position = val;
            e.target.value = val + '%';
            update();
        }
    });

    colorStopsEl.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.remove-stop-btn');
        if (removeBtn && stops.length > 2) {
            const i = parseInt(removeBtn.dataset.index);
            stops.splice(i, 1);
            update();
        }
    });

    // Update only preview and CSS (not the stop inputs, to avoid fighting the user)
    function updatePreviewOnly() {
        const gradient = buildGradientCSS();
        gradientPreview.style.background = gradient;
        cssOutput.textContent = buildFullCSS();
    }

    // ===== ADD STOP =====
    addStopBtn.addEventListener('click', () => {
        if (stops.length >= 10) {
            showToast('Maximum 10 stops');
            return;
        }
        // Find a gap to insert a new stop
        const sorted = [...stops].sort((a, b) => a.position - b.position);
        let maxGap = 0, gapStart = 0, gapEnd = 100;
        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = sorted[i + 1].position - sorted[i].position;
            if (gap > maxGap) {
                maxGap = gap;
                gapStart = sorted[i].position;
                gapEnd = sorted[i + 1].position;
            }
        }
        const newPos = Math.round((gapStart + gapEnd) / 2);
        // Blend colors at gap boundaries
        const newColor = blendColors(
            sorted.find(s => s.position === gapStart).color,
            sorted.find(s => s.position === gapEnd).color,
            0.5
        );
        stops.push({ color: newColor, position: newPos });
        update();
    });

    function blendColors(hex1, hex2, ratio) {
        const r1 = parseInt(hex1.slice(1, 3), 16);
        const g1 = parseInt(hex1.slice(3, 5), 16);
        const b1 = parseInt(hex1.slice(5, 7), 16);
        const r2 = parseInt(hex2.slice(1, 3), 16);
        const g2 = parseInt(hex2.slice(3, 5), 16);
        const b2 = parseInt(hex2.slice(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('');
    }

    // ===== REVERSE =====
    reverseBtn.addEventListener('click', () => {
        stops.forEach(s => { s.position = 100 - s.position; });
        stops.reverse();
        update();
    });

    // ===== RANDOM =====
    randomBtn.addEventListener('click', () => {
        const numStops = 2 + Math.floor(Math.random() * 3); // 2-4 stops
        const types = ['linear', 'radial', 'conic'];
        const randomType = types[Math.floor(Math.random() * 3)];

        // Set type
        gradientType = randomType;
        document.querySelectorAll('.type-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === randomType);
        });

        if (randomType === 'linear') {
            angleSection.classList.remove('hidden');
            radialSection.classList.add('hidden');
            document.querySelector('#angleSection .section-label').textContent = 'Angle';
            angle = Math.floor(Math.random() * 360);
            angleSlider.value = angle;
            angleVal.textContent = angle + '\u00B0';
            updateDirBtnActive();
        } else if (randomType === 'radial') {
            angleSection.classList.add('hidden');
            radialSection.classList.remove('hidden');
            radialShape = Math.random() > 0.5 ? 'circle' : 'ellipse';
            document.querySelectorAll('.shape-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.shape === radialShape);
            });
        } else {
            angleSection.classList.remove('hidden');
            radialSection.classList.add('hidden');
            document.querySelector('#angleSection .section-label').textContent = 'Starting Angle';
            angle = Math.floor(Math.random() * 360);
            angleSlider.value = angle;
            angleVal.textContent = angle + '\u00B0';
            updateDirBtnActive();
        }

        // Generate random stops
        stops = [];
        const baseHue = Math.random() * 360;
        for (let i = 0; i < numStops; i++) {
            const hue = (baseHue + (i / numStops) * (120 + Math.random() * 180)) % 360;
            const sat = 60 + Math.random() * 40;
            const light = 40 + Math.random() * 30;
            const pos = Math.round((i / (numStops - 1)) * 100);
            stops.push({ color: hslToHex(hue, sat, light), position: pos });
        }

        update();
        showToast('Random gradient generated');
    });

    function hslToHex(h, s, l) {
        h = ((h % 360) + 360) % 360;
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // ===== COPY CSS =====
    copyBtn.addEventListener('click', () => {
        const css = buildFullCSS();
        navigator.clipboard.writeText(css).then(() => {
            showToast('CSS copied to clipboard');
        }).catch(() => {
            // Fallback: select text
            const range = document.createRange();
            range.selectNodeContents(cssOutput);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            showToast('Select and copy the CSS');
        });
    });

    // ===== PRESETS GALLERY =====
    function renderPresets() {
        presetsGallery.innerHTML = presets.map((preset, i) => {
            const sortedStops = [...preset.stops].sort((a, b) => a.position - b.position);
            const stopsStr = sortedStops.map(s => `${s.color} ${s.position}%`).join(', ');
            let bg;
            if (preset.type === 'linear') {
                bg = `linear-gradient(${preset.angle}deg, ${stopsStr})`;
            } else if (preset.type === 'radial') {
                bg = `radial-gradient(${preset.shape || 'circle'}, ${stopsStr})`;
            } else {
                bg = `conic-gradient(from ${preset.angle}deg, ${stopsStr})`;
            }
            return `
                <div class="preset-card" style="background: ${bg}" data-preset="${i}">
                    <div class="preset-name">${preset.name}</div>
                </div>
            `;
        }).join('');
    }

    presetsGallery.addEventListener('click', (e) => {
        const card = e.target.closest('.preset-card');
        if (!card) return;
        const preset = presets[parseInt(card.dataset.preset)];

        // Apply preset
        gradientType = preset.type;
        document.querySelectorAll('.type-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.type === preset.type);
        });

        if (preset.type === 'linear') {
            angleSection.classList.remove('hidden');
            radialSection.classList.add('hidden');
            document.querySelector('#angleSection .section-label').textContent = 'Angle';
            angle = preset.angle;
            angleSlider.value = angle;
            angleVal.textContent = angle + '\u00B0';
            updateDirBtnActive();
        } else if (preset.type === 'radial') {
            angleSection.classList.add('hidden');
            radialSection.classList.remove('hidden');
            radialShape = preset.shape || 'circle';
            document.querySelectorAll('.shape-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.shape === radialShape);
            });
        } else {
            angleSection.classList.remove('hidden');
            radialSection.classList.add('hidden');
            document.querySelector('#angleSection .section-label').textContent = 'Starting Angle';
            angle = preset.angle;
            angleSlider.value = angle;
            angleVal.textContent = angle + '\u00B0';
            updateDirBtnActive();
        }

        stops = preset.stops.map(s => ({ ...s }));
        update();
        showToast(`Applied "${preset.name}"`);
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
    renderPresets();
    update();
});
