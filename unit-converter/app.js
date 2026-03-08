(() => {
    'use strict';

    // ── Unit definitions ────────────────────────────────────────────────
    // Each unit stores a factor to convert TO the base unit of its category.
    // For temperature, custom functions are used instead.

    const units = {
        length: {
            base: 'm',
            items: [
                { id: 'mm',  label: 'Millimeters (mm)',  factor: 0.001 },
                { id: 'cm',  label: 'Centimeters (cm)',  factor: 0.01 },
                { id: 'm',   label: 'Meters (m)',        factor: 1 },
                { id: 'km',  label: 'Kilometers (km)',   factor: 1000 },
                { id: 'in',  label: 'Inches (in)',       factor: 0.0254 },
                { id: 'ft',  label: 'Feet (ft)',         factor: 0.3048 },
                { id: 'yd',  label: 'Yards (yd)',        factor: 0.9144 },
                { id: 'mi',  label: 'Miles (mi)',        factor: 1609.344 },
            ]
        },
        weight: {
            base: 'g',
            items: [
                { id: 'mg',  label: 'Milligrams (mg)', factor: 0.001 },
                { id: 'g',   label: 'Grams (g)',       factor: 1 },
                { id: 'kg',  label: 'Kilograms (kg)',  factor: 1000 },
                { id: 'lb',  label: 'Pounds (lb)',     factor: 453.592 },
                { id: 'oz',  label: 'Ounces (oz)',     factor: 28.3495 },
                { id: 'ton', label: 'Metric Tons (ton)', factor: 1_000_000 },
            ]
        },
        temperature: {
            base: 'C',
            items: [
                { id: 'C', label: 'Celsius (\u00B0C)' },
                { id: 'F', label: 'Fahrenheit (\u00B0F)' },
                { id: 'K', label: 'Kelvin (K)' },
            ]
        },
        volume: {
            base: 'ml',
            items: [
                { id: 'ml',   label: 'Milliliters (ml)',   factor: 1 },
                { id: 'L',    label: 'Liters (L)',         factor: 1000 },
                { id: 'gal',  label: 'Gallons (gal)',      factor: 3785.41 },
                { id: 'qt',   label: 'Quarts (qt)',        factor: 946.353 },
                { id: 'pt',   label: 'Pints (pt)',         factor: 473.176 },
                { id: 'cup',  label: 'Cups (cup)',         factor: 236.588 },
                { id: 'floz', label: 'Fluid Ounces (fl oz)', factor: 29.5735 },
            ]
        },
        area: {
            base: 'm\u00B2',
            items: [
                { id: 'mm\u00B2',    label: 'mm\u00B2',               factor: 0.000001 },
                { id: 'cm\u00B2',    label: 'cm\u00B2',               factor: 0.0001 },
                { id: 'm\u00B2',     label: 'm\u00B2',                factor: 1 },
                { id: 'km\u00B2',    label: 'km\u00B2',               factor: 1_000_000 },
                { id: 'in\u00B2',    label: 'in\u00B2',               factor: 0.00064516 },
                { id: 'ft\u00B2',    label: 'ft\u00B2',               factor: 0.092903 },
                { id: 'acre',   label: 'Acres',              factor: 4046.86 },
                { id: 'hectare', label: 'Hectares',           factor: 10000 },
            ]
        },
        speed: {
            base: 'm/s',
            items: [
                { id: 'm/s',  label: 'Meters/sec (m/s)',  factor: 1 },
                { id: 'km/h', label: 'Km/hour (km/h)',    factor: 0.277778 },
                { id: 'mph',  label: 'Miles/hour (mph)',   factor: 0.44704 },
                { id: 'knots', label: 'Knots (kn)',        factor: 0.514444 },
            ]
        },
        time: {
            base: 'sec',
            items: [
                { id: 'ms',   label: 'Milliseconds (ms)', factor: 0.001 },
                { id: 'sec',  label: 'Seconds (sec)',      factor: 1 },
                { id: 'min',  label: 'Minutes (min)',      factor: 60 },
                { id: 'hr',   label: 'Hours (hr)',         factor: 3600 },
                { id: 'day',  label: 'Days (day)',         factor: 86400 },
                { id: 'week', label: 'Weeks (week)',       factor: 604800 },
            ]
        },
        data: {
            base: 'B',
            items: [
                { id: 'B',  label: 'Bytes (B)',       factor: 1 },
                { id: 'KB', label: 'Kilobytes (KB)',  factor: 1024 },
                { id: 'MB', label: 'Megabytes (MB)',  factor: 1_048_576 },
                { id: 'GB', label: 'Gigabytes (GB)',  factor: 1_073_741_824 },
                { id: 'TB', label: 'Terabytes (TB)',  factor: 1_099_511_627_776 },
                { id: 'PB', label: 'Petabytes (PB)',  factor: 1_125_899_906_842_624 },
            ]
        }
    };

    // ── Temperature conversion ──────────────────────────────────────────

    function convertTemperature(value, from, to) {
        if (from === to) return value;
        // Convert to Celsius first
        let celsius;
        if (from === 'C') celsius = value;
        else if (from === 'F') celsius = (value - 32) * 5 / 9;
        else celsius = value - 273.15; // K

        // Convert from Celsius to target
        if (to === 'C') return celsius;
        if (to === 'F') return celsius * 9 / 5 + 32;
        return celsius + 273.15; // K
    }

    function getTemperatureFormula(from, to) {
        const formulas = {
            'C_F': '\u00B0F = \u00B0C \u00D7 9/5 + 32',
            'F_C': '\u00B0C = (\u00B0F \u2212 32) \u00D7 5/9',
            'C_K': 'K = \u00B0C + 273.15',
            'K_C': '\u00B0C = K \u2212 273.15',
            'F_K': 'K = (\u00B0F \u2212 32) \u00D7 5/9 + 273.15',
            'K_F': '\u00B0F = (K \u2212 273.15) \u00D7 9/5 + 32',
        };
        if (from === to) return `1 ${from} = 1 ${to}`;
        return formulas[`${from}_${to}`] || '';
    }

    // ── Common conversions per category ─────────────────────────────────

    const commonConversions = {
        length: [
            ['1', 'in', 'cm'],
            ['1', 'ft', 'm'],
            ['1', 'mi', 'km'],
            ['1', 'yd', 'm'],
            ['1', 'm', 'ft'],
            ['1', 'km', 'mi'],
        ],
        weight: [
            ['1', 'kg', 'lb'],
            ['1', 'lb', 'kg'],
            ['1', 'oz', 'g'],
            ['1', 'ton', 'kg'],
            ['1', 'lb', 'oz'],
            ['1', 'kg', 'oz'],
        ],
        temperature: [
            ['0', 'C', 'F'],
            ['100', 'C', 'F'],
            ['32', 'F', 'C'],
            ['0', 'C', 'K'],
            ['212', 'F', 'C'],
            ['98.6', 'F', 'C'],
        ],
        volume: [
            ['1', 'L', 'gal'],
            ['1', 'gal', 'L'],
            ['1', 'cup', 'ml'],
            ['1', 'floz', 'ml'],
            ['1', 'L', 'cup'],
            ['1', 'qt', 'L'],
        ],
        area: [
            ['1', 'acre', 'm\u00B2'],
            ['1', 'hectare', 'acre'],
            ['1', 'ft\u00B2', 'm\u00B2'],
            ['1', 'km\u00B2', 'acre'],
            ['1', 'm\u00B2', 'ft\u00B2'],
            ['1', 'acre', 'hectare'],
        ],
        speed: [
            ['1', 'mph', 'km/h'],
            ['1', 'km/h', 'mph'],
            ['1', 'm/s', 'km/h'],
            ['100', 'km/h', 'mph'],
            ['1', 'knots', 'km/h'],
            ['60', 'mph', 'km/h'],
        ],
        time: [
            ['1', 'hr', 'min'],
            ['1', 'day', 'hr'],
            ['1', 'week', 'day'],
            ['1', 'min', 'sec'],
            ['1000', 'ms', 'sec'],
            ['1', 'hr', 'sec'],
        ],
        data: [
            ['1', 'GB', 'MB'],
            ['1', 'TB', 'GB'],
            ['1', 'MB', 'KB'],
            ['1', 'PB', 'TB'],
            ['1', 'GB', 'KB'],
            ['1', 'KB', 'B'],
        ]
    };

    // ── State ───────────────────────────────────────────────────────────

    let currentCategory = 'length';

    // ── DOM refs ────────────────────────────────────────────────────────

    const $fromValue = document.getElementById('fromValue');
    const $toValue = document.getElementById('toValue');
    const $fromUnit = document.getElementById('fromUnit');
    const $toUnit = document.getElementById('toUnit');
    const $swapBtn = document.getElementById('swapBtn');
    const $formulaText = document.getElementById('formulaText');
    const $quickGrid = document.getElementById('quickGrid');
    const $categoryTabs = document.getElementById('categoryTabs');
    const $toast = document.getElementById('toast');

    // ── Helpers ─────────────────────────────────────────────────────────

    function formatNumber(n) {
        if (n === 0) return '0';
        const abs = Math.abs(n);
        if (abs >= 1e12) return n.toExponential(4);
        if (abs >= 1) return parseFloat(n.toPrecision(10)).toLocaleString('en-US', { maximumFractionDigits: 8 });
        // Small numbers
        if (abs < 1e-6) return n.toExponential(4);
        return parseFloat(n.toPrecision(8)).toString();
    }

    function showToast(msg) {
        $toast.textContent = msg;
        $toast.classList.add('show');
        setTimeout(() => $toast.classList.remove('show'), 1800);
    }

    // ── Conversion engine ───────────────────────────────────────────────

    function convert(value, fromId, toId, category) {
        if (fromId === toId) return value;
        if (category === 'temperature') {
            return convertTemperature(value, fromId, toId);
        }
        const cat = units[category];
        const fromUnit = cat.items.find(u => u.id === fromId);
        const toUnit = cat.items.find(u => u.id === toId);
        // value * fromFactor gives base unit; / toFactor gives target
        return (value * fromUnit.factor) / toUnit.factor;
    }

    function getFormula(fromId, toId, category) {
        if (fromId === toId) return `1 ${fromId} = 1 ${toId}`;
        if (category === 'temperature') {
            return getTemperatureFormula(fromId, toId);
        }
        const cat = units[category];
        const fromUnit = cat.items.find(u => u.id === fromId);
        const toUnit = cat.items.find(u => u.id === toId);
        const ratio = fromUnit.factor / toUnit.factor;
        return `1 ${fromId} = ${formatNumber(ratio)} ${toId}`;
    }

    // ── Populate UI ─────────────────────────────────────────────────────

    function populateUnits() {
        const cat = units[currentCategory];
        $fromUnit.innerHTML = '';
        $toUnit.innerHTML = '';
        cat.items.forEach((u, i) => {
            const o1 = new Option(u.label, u.id);
            const o2 = new Option(u.label, u.id);
            $fromUnit.add(o1);
            $toUnit.add(o2);
        });
        // Default: first and second unit
        $fromUnit.selectedIndex = 0;
        $toUnit.selectedIndex = Math.min(1, cat.items.length - 1);
    }

    function populateQuickRef() {
        const convs = commonConversions[currentCategory] || [];
        $quickGrid.innerHTML = '';
        convs.forEach(([val, from, to]) => {
            const result = convert(parseFloat(val), from, to, currentCategory);
            const div = document.createElement('div');
            div.className = 'quick-item';
            div.innerHTML = `
                <div class="quick-value">${val} ${from} = ${formatNumber(result)} ${to}</div>
                <div class="quick-label">${getUnitLabel(from)} \u2192 ${getUnitLabel(to)}</div>
            `;
            div.addEventListener('click', () => {
                // Set the converter to this conversion
                $fromUnit.value = from;
                $toUnit.value = to;
                $fromValue.value = val;
                doConvert();
                $fromValue.focus();
                showToast('Conversion loaded');
            });
            $quickGrid.appendChild(div);
        });
    }

    function getUnitLabel(id) {
        const cat = units[currentCategory];
        const u = cat.items.find(u => u.id === id);
        return u ? u.label.replace(/\s*\(.*\)/, '') : id;
    }

    // ── Perform conversion ──────────────────────────────────────────────

    function doConvert() {
        const val = parseFloat($fromValue.value);
        const fromId = $fromUnit.value;
        const toId = $toUnit.value;

        if (isNaN(val) || $fromValue.value.trim() === '') {
            $toValue.value = '';
            $formulaText.textContent = getFormula(fromId, toId, currentCategory);
            return;
        }

        const result = convert(val, fromId, toId, currentCategory);
        $toValue.value = formatNumber(result);
        $formulaText.textContent = getFormula(fromId, toId, currentCategory);
    }

    // ── Set category ────────────────────────────────────────────────────

    function setCategory(cat) {
        currentCategory = cat;
        // Update tabs
        document.querySelectorAll('.tab').forEach(t => {
            t.classList.toggle('active', t.dataset.category === cat);
        });
        populateUnits();
        $fromValue.value = '';
        $toValue.value = '';
        doConvert();
        populateQuickRef();
    }

    // ── Events ──────────────────────────────────────────────────────────

    $fromValue.addEventListener('input', doConvert);
    $fromUnit.addEventListener('change', doConvert);
    $toUnit.addEventListener('change', doConvert);

    $swapBtn.addEventListener('click', () => {
        const tmpUnit = $fromUnit.value;
        const tmpVal = $toValue.value;
        $fromUnit.value = $toUnit.value;
        $toUnit.value = tmpUnit;
        // Put the result into the from field
        $fromValue.value = tmpVal;
        doConvert();
    });

    $categoryTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;
        setCategory(tab.dataset.category);
    });

    // Keyboard shortcuts: arrow keys to switch categories
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
        const cats = Object.keys(units);
        const idx = cats.indexOf(currentCategory);
        if (e.key === 'ArrowLeft' && idx > 0) {
            setCategory(cats[idx - 1]);
        } else if (e.key === 'ArrowRight' && idx < cats.length - 1) {
            setCategory(cats[idx + 1]);
        }
    });

    // ── Init ────────────────────────────────────────────────────────────

    setCategory('length');
    $fromValue.focus();

})();
