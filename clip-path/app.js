(() => {
  'use strict';

  // ── State ──
  let shapeType = 'polygon';
  let bgType = 'gradient';

  let polygonPoints = [
    { x: 50, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  let circleState = { r: 50, cx: 50, cy: 50 };
  let ellipseState = { rx: 50, ry: 35, cx: 50, cy: 50 };
  let insetState = { top: 10, right: 10, bottom: 10, left: 10, radius: 0 };

  // ── DOM refs ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const previewContainer = $('#previewContainer');
  const previewElement = $('#previewElement');
  const previewGhost = $('#previewGhost');
  const previewGrid = $('#previewGrid');
  const pointsOverlay = $('#pointsOverlay');
  const cssOutput = $('#cssOutput');
  const pointsList = $('#pointsList');
  const toast = $('#toast');

  const controlPanels = {
    polygon: $('#polygonControls'),
    circle: $('#circleControls'),
    ellipse: $('#ellipseControls'),
    inset: $('#insetControls'),
  };

  // ── Presets ──
  const presets = {
    triangle: [
      { x: 50, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 },
    ],
    pentagon: [
      { x: 50, y: 0 },
      { x: 100, y: 38 },
      { x: 81, y: 100 },
      { x: 19, y: 100 },
      { x: 0, y: 38 },
    ],
    hexagon: [
      { x: 50, y: 0 },
      { x: 100, y: 25 },
      { x: 100, y: 75 },
      { x: 50, y: 100 },
      { x: 0, y: 75 },
      { x: 0, y: 25 },
    ],
    star: [
      { x: 50, y: 0 },
      { x: 61, y: 35 },
      { x: 98, y: 35 },
      { x: 68, y: 57 },
      { x: 79, y: 91 },
      { x: 50, y: 70 },
      { x: 21, y: 91 },
      { x: 32, y: 57 },
      { x: 2, y: 35 },
      { x: 39, y: 35 },
    ],
    cross: [
      { x: 35, y: 0 },
      { x: 65, y: 0 },
      { x: 65, y: 35 },
      { x: 100, y: 35 },
      { x: 100, y: 65 },
      { x: 65, y: 65 },
      { x: 65, y: 100 },
      { x: 35, y: 100 },
      { x: 35, y: 65 },
      { x: 0, y: 65 },
      { x: 0, y: 35 },
      { x: 35, y: 35 },
    ],
    arrow: [
      { x: 0, y: 35 },
      { x: 60, y: 35 },
      { x: 60, y: 10 },
      { x: 100, y: 50 },
      { x: 60, y: 90 },
      { x: 60, y: 65 },
      { x: 0, y: 65 },
    ],
    heart: [
      { x: 50, y: 100 },
      { x: 5, y: 55 },
      { x: 0, y: 35 },
      { x: 2, y: 20 },
      { x: 10, y: 8 },
      { x: 25, y: 2 },
      { x: 40, y: 8 },
      { x: 50, y: 22 },
      { x: 60, y: 8 },
      { x: 75, y: 2 },
      { x: 90, y: 8 },
      { x: 98, y: 20 },
      { x: 100, y: 35 },
      { x: 95, y: 55 },
    ],
    diamond: [
      { x: 50, y: 0 },
      { x: 100, y: 50 },
      { x: 50, y: 100 },
      { x: 0, y: 50 },
    ],
    message: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 70 },
      { x: 55, y: 70 },
      { x: 30, y: 100 },
      { x: 35, y: 70 },
      { x: 0, y: 70 },
    ],
  };

  // ── Grid ──
  function buildGrid() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.cssText = 'position:absolute;inset:0;';
    for (let i = 0; i <= 10; i++) {
      const pct = i * 10 + '%';
      const color = i === 5 ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.06)';
      const hLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      hLine.setAttribute('x1', '0%'); hLine.setAttribute('y1', pct);
      hLine.setAttribute('x2', '100%'); hLine.setAttribute('y2', pct);
      hLine.setAttribute('stroke', color); hLine.setAttribute('stroke-width', '1');
      svg.appendChild(hLine);
      const vLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      vLine.setAttribute('x1', pct); vLine.setAttribute('y1', '0%');
      vLine.setAttribute('x2', pct); vLine.setAttribute('y2', '100%');
      vLine.setAttribute('stroke', color); vLine.setAttribute('stroke-width', '1');
      svg.appendChild(vLine);
    }
    previewGrid.appendChild(svg);
  }
  buildGrid();

  // ── Background ──
  function applyBg() {
    const classes = ['bg-gradient', 'bg-image', 'bg-solid'];
    const cls = 'bg-' + bgType;
    [previewElement, previewGhost].forEach((el) => {
      classes.forEach((c) => el.classList.remove(c));
      el.classList.add(cls);
    });
  }
  applyBg();

  $$('.bg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.bg-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      bgType = btn.dataset.bg;
      applyBg();
    });
  });

  // ── Grid toggle ──
  $('#gridToggle').addEventListener('change', (e) => {
    previewGrid.classList.toggle('visible', e.target.checked);
  });

  // ── Shape selector ──
  $$('.shape-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.shape-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      shapeType = btn.dataset.shape;
      Object.values(controlPanels).forEach((p) => p.classList.add('hidden'));
      controlPanels[shapeType].classList.remove('hidden');
      render();
    });
  });

  // ── Clip path generation ──
  function getClipPath() {
    switch (shapeType) {
      case 'polygon':
        return `polygon(${polygonPoints.map((p) => `${r(p.x)}% ${r(p.y)}%`).join(', ')})`;
      case 'circle':
        return `circle(${r(circleState.r)}% at ${r(circleState.cx)}% ${r(circleState.cy)}%)`;
      case 'ellipse':
        return `ellipse(${r(ellipseState.rx)}% ${r(ellipseState.ry)}% at ${r(ellipseState.cx)}% ${r(ellipseState.cy)}%)`;
      case 'inset': {
        const s = insetState;
        const base = `inset(${r(s.top)}% ${r(s.right)}% ${r(s.bottom)}% ${r(s.left)}%`;
        return s.radius > 0 ? `${base} round ${r(s.radius)}%)` : `${base})`;
      }
    }
  }

  function r(n) {
    return Math.round(n * 100) / 100;
  }

  // ── Render ──
  function render() {
    const cp = getClipPath();
    previewElement.style.clipPath = cp;
    cssOutput.textContent = `clip-path: ${cp};`;
    renderOverlay();
    renderPointsList();
  }

  // ── SVG overlay for polygon handles ──
  function renderOverlay() {
    pointsOverlay.innerHTML = '';
    if (shapeType !== 'polygon') return;

    const rect = previewContainer.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Draw edges + invisible hit areas for adding points
    for (let i = 0; i < polygonPoints.length; i++) {
      const a = polygonPoints[i];
      const b = polygonPoints[(i + 1) % polygonPoints.length];

      const line = svgEl('line', {
        x1: (a.x / 100) * w, y1: (a.y / 100) * h,
        x2: (b.x / 100) * w, y2: (b.y / 100) * h,
      });
      pointsOverlay.appendChild(line);

      const hitLine = svgEl('line', {
        class: 'edge-hitarea',
        x1: (a.x / 100) * w, y1: (a.y / 100) * h,
        x2: (b.x / 100) * w, y2: (b.y / 100) * h,
      });
      hitLine.addEventListener('click', (e) => {
        const pr = previewContainer.getBoundingClientRect();
        const nx = ((e.clientX - pr.left) / pr.width) * 100;
        const ny = ((e.clientY - pr.top) / pr.height) * 100;
        polygonPoints.splice(i + 1, 0, { x: clamp(nx), y: clamp(ny) });
        render();
      });
      pointsOverlay.appendChild(hitLine);
    }

    // Draw point handles
    polygonPoints.forEach((pt, idx) => {
      const cx = (pt.x / 100) * w;
      const cy = (pt.y / 100) * h;
      const circle = svgEl('circle', { cx, cy, r: 7, class: 'point-handle' });
      circle.addEventListener('mousedown', (e) => startDrag(e, idx));
      circle.addEventListener('touchstart', (e) => startDrag(e, idx), { passive: false });
      pointsOverlay.appendChild(circle);
    });
  }

  function svgEl(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function clamp(v, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v));
  }

  // ── Drag ──
  function startDrag(e, idx) {
    e.preventDefault();
    const rect = previewContainer.getBoundingClientRect();

    function onMove(ev) {
      const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const clientY = ev.touches ? ev.touches[0].clientY : ev.clientY;
      polygonPoints[idx].x = clamp(((clientX - rect.left) / rect.width) * 100);
      polygonPoints[idx].y = clamp(((clientY - rect.top) / rect.height) * 100);
      render();
    }

    function onUp() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }

  // ── Points list (sidebar) ──
  function renderPointsList() {
    if (shapeType !== 'polygon') {
      pointsList.innerHTML = '';
      return;
    }
    pointsList.innerHTML = polygonPoints
      .map(
        (pt, i) => `
      <div class="point-row" data-idx="${i}">
        <span class="point-label">${i + 1}</span>
        <span class="coord-label">X</span>
        <input type="number" min="0" max="100" step="1" value="${Math.round(pt.x)}" data-axis="x" data-idx="${i}">
        <span class="coord-label">Y</span>
        <input type="number" min="0" max="100" step="1" value="${Math.round(pt.y)}" data-axis="y" data-idx="${i}">
        ${polygonPoints.length > 3 ? `<button class="remove-point-btn" data-idx="${i}" title="Remove point">&times;</button>` : ''}
      </div>`
      )
      .join('');

    pointsList.querySelectorAll('input').forEach((inp) => {
      inp.addEventListener('input', (e) => {
        const idx = +e.target.dataset.idx;
        const axis = e.target.dataset.axis;
        polygonPoints[idx][axis] = clamp(+e.target.value);
        render();
      });
    });

    pointsList.querySelectorAll('.remove-point-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = +e.target.dataset.idx;
        if (polygonPoints.length > 3) {
          polygonPoints.splice(idx, 1);
          render();
        }
      });
    });
  }

  // ── Add / Remove point buttons ──
  $('#addPointBtn').addEventListener('click', () => {
    // Add midpoint between last two points
    const len = polygonPoints.length;
    const a = polygonPoints[len - 1];
    const b = polygonPoints[0];
    polygonPoints.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
    render();
  });

  $('#removePointBtn').addEventListener('click', () => {
    if (polygonPoints.length > 3) {
      polygonPoints.pop();
      render();
    }
  });

  // ── Circle controls ──
  function bindSlider(id, valId, stateObj, key, cb) {
    const slider = $(`#${id}`);
    const val = $(`#${valId}`);
    slider.value = stateObj[key];
    val.textContent = stateObj[key] + '%';
    slider.addEventListener('input', () => {
      stateObj[key] = +slider.value;
      val.textContent = slider.value + '%';
      if (cb) cb();
      render();
    });
  }

  bindSlider('circleRadius', 'circleRadiusVal', circleState, 'r');
  bindSlider('circleCx', 'circleCxVal', circleState, 'cx');
  bindSlider('circleCy', 'circleCyVal', circleState, 'cy');

  bindSlider('ellipseRx', 'ellipseRxVal', ellipseState, 'rx');
  bindSlider('ellipseRy', 'ellipseRyVal', ellipseState, 'ry');
  bindSlider('ellipseCx', 'ellipseCxVal', ellipseState, 'cx');
  bindSlider('ellipseCy', 'ellipseCyVal', ellipseState, 'cy');

  bindSlider('insetTop', 'insetTopVal', insetState, 'top');
  bindSlider('insetRight', 'insetRightVal', insetState, 'right');
  bindSlider('insetBottom', 'insetBottomVal', insetState, 'bottom');
  bindSlider('insetLeft', 'insetLeftVal', insetState, 'left');
  bindSlider('insetRadius', 'insetRadiusVal', insetState, 'radius');

  // ── Presets ──
  $$('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.preset;
      if (!presets[name]) return;
      shapeType = 'polygon';
      $$('.shape-btn').forEach((b) => b.classList.remove('active'));
      $$('.shape-btn').forEach((b) => {
        if (b.dataset.shape === 'polygon') b.classList.add('active');
      });
      Object.values(controlPanels).forEach((p) => p.classList.add('hidden'));
      controlPanels.polygon.classList.remove('hidden');
      polygonPoints = presets[name].map((p) => ({ ...p }));
      render();
    });
  });

  // ── Copy ──
  $('#copyBtn').addEventListener('click', () => {
    const text = cssOutput.textContent;
    navigator.clipboard.writeText(text).then(() => {
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    }).catch(() => {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  });

  // ── Resize handler ──
  window.addEventListener('resize', () => render());

  // ── Initial render ──
  render();
})();
