/* ============================================
   CSS Keyframe Animator - Application Logic
   ============================================ */

(function () {
  'use strict';

  // ---- State ----
  const state = {
    keyframes: [],
    selectedKfId: null,
    playing: false,
    currentTime: 0,           // 0..1 normalized
    animationFrameId: null,
    lastTimestamp: null,
    elementType: 'div',
    onionSkinning: false,
  };

  let nextId = 1;

  // Default keyframe values
  function defaultKfProps() {
    return {
      translateX: 0,
      translateY: 0,
      rotate: 0,
      scale: 1,
      skewX: 0,
      skewY: 0,
      opacity: 1,
      width: 100,
      height: 100,
      backgroundColor: '#6c5ce7',
      borderRadius: 12,
    };
  }

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const previewEl = $('#preview-element');
  const previewArea = $('#preview-area');
  const onionContainer = $('#onion-container');
  const timelineTrack = $('#timeline-track');
  const timelineRuler = $('#timeline-ruler');
  const playhead = $('#playhead');
  const propsPanel = $('#keyframe-props');
  const cssOutput = $('#css-output');
  const timeDisplay = $('#time-display');
  const toast = $('#toast');
  const exportModal = $('#export-modal');
  const exportCss = $('#export-css');

  // Controls
  const btnPlay = $('#btn-play');
  const btnStepBack = $('#btn-step-back');
  const btnStepFwd = $('#btn-step-fwd');
  const btnAddKf = $('#btn-add-kf');
  const btnCopyCss = $('#btn-copy-css');
  const btnExport = $('#btn-export');
  const btnCopyExport = $('#btn-copy-export');
  const modalClose = $('#modal-close');
  const toggleOnion = $('#toggle-onion');
  const elementTypeSelect = $('#element-type');

  // Settings inputs
  const animName = $('#anim-name');
  const animDuration = $('#anim-duration');
  const animEasing = $('#anim-easing');
  const animIterations = $('#anim-iterations');
  const animDirection = $('#anim-direction');
  const animFill = $('#anim-fill');

  // ---- Initialization ----
  function init() {
    // Start with two keyframes: 0% and 100%
    addKeyframe(0, defaultKfProps());
    const endProps = defaultKfProps();
    endProps.translateX = 150;
    endProps.rotate = 360;
    addKeyframe(1, endProps);

    renderRuler();
    renderTimeline();
    renderCss();
    applyPreviewAtTime(0);
    bindEvents();
  }

  // ---- Keyframe Management ----
  function addKeyframe(position, props) {
    const kf = {
      id: nextId++,
      position: Math.max(0, Math.min(1, position)),
      props: { ...defaultKfProps(), ...props },
    };
    state.keyframes.push(kf);
    state.keyframes.sort((a, b) => a.position - b.position);
    return kf;
  }

  function removeKeyframe(id) {
    state.keyframes = state.keyframes.filter((k) => k.id !== id);
    if (state.selectedKfId === id) {
      state.selectedKfId = null;
    }
  }

  function getKeyframeById(id) {
    return state.keyframes.find((k) => k.id === id);
  }

  // ---- Timeline Rendering ----
  function renderRuler() {
    timelineRuler.innerHTML = '';
    const steps = 10;
    const duration = parseFloat(animDuration.value) || 1;
    for (let i = 0; i <= steps; i++) {
      const tick = document.createElement('div');
      tick.className = 'ruler-tick';
      tick.style.left = (i / steps) * 100 + '%';
      tick.textContent = ((i / steps) * duration).toFixed(1) + 's';
      timelineRuler.appendChild(tick);
    }
  }

  function renderTimeline() {
    // Remove old markers
    timelineTrack.querySelectorAll('.kf-marker').forEach((m) => m.remove());

    state.keyframes.forEach((kf) => {
      const marker = document.createElement('div');
      marker.className = 'kf-marker' + (kf.id === state.selectedKfId ? ' selected' : '');
      marker.style.left = kf.position * 100 + '%';
      marker.dataset.id = kf.id;

      const label = document.createElement('span');
      label.className = 'kf-marker-label';
      label.textContent = Math.round(kf.position * 100) + '%';
      marker.appendChild(label);

      // Drag handling
      marker.addEventListener('mousedown', startDragMarker);
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        selectKeyframe(kf.id);
      });

      timelineTrack.appendChild(marker);
    });
  }

  // ---- Marker Dragging ----
  let dragState = null;

  function startDragMarker(e) {
    e.preventDefault();
    e.stopPropagation();
    const id = parseInt(e.currentTarget.dataset.id);
    selectKeyframe(id);

    const trackRect = timelineTrack.getBoundingClientRect();
    dragState = { id, trackRect };
    e.currentTarget.classList.add('dragging');

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  function onDragMove(e) {
    if (!dragState) return;
    const kf = getKeyframeById(dragState.id);
    if (!kf) return;

    const rect = dragState.trackRect;
    let pos = (e.clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    kf.position = pos;

    state.keyframes.sort((a, b) => a.position - b.position);
    renderTimeline();
    renderCss();
    updatePlayhead(pos);
    applyPreviewAtTime(pos);
  }

  function onDragEnd() {
    if (dragState) {
      const marker = timelineTrack.querySelector(`.kf-marker[data-id="${dragState.id}"]`);
      if (marker) marker.classList.remove('dragging');
    }
    dragState = null;
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
  }

  // ---- Keyframe Selection & Properties ----
  function selectKeyframe(id) {
    state.selectedKfId = id;
    renderTimeline();
    renderPropsPanel();
  }

  function renderPropsPanel() {
    const kf = getKeyframeById(state.selectedKfId);
    if (!kf) {
      propsPanel.innerHTML = '<p class="no-selection">Select a keyframe on the timeline to edit its properties.</p>';
      return;
    }

    const p = kf.props;
    propsPanel.innerHTML = `
      <div class="prop-section-label">Position</div>
      <div class="form-row">
        <label>Offset (%)</label>
        <input type="number" id="prop-position" value="${Math.round(kf.position * 100)}" min="0" max="100">
      </div>

      <div class="prop-section-label">Transform</div>
      <div class="form-row">
        <label>translateX</label>
        <input type="number" id="prop-translateX" value="${p.translateX}" step="1">
      </div>
      <div class="form-row">
        <label>translateY</label>
        <input type="number" id="prop-translateY" value="${p.translateY}" step="1">
      </div>
      <div class="form-row">
        <label>rotate (deg)</label>
        <input type="number" id="prop-rotate" value="${p.rotate}" step="1">
      </div>
      <div class="form-row">
        <label>scale</label>
        <input type="number" id="prop-scale" value="${p.scale}" step="0.05" min="0">
      </div>
      <div class="form-row">
        <label>skewX (deg)</label>
        <input type="number" id="prop-skewX" value="${p.skewX}" step="1">
      </div>
      <div class="form-row">
        <label>skewY (deg)</label>
        <input type="number" id="prop-skewY" value="${p.skewY}" step="1">
      </div>

      <div class="prop-section-label">Appearance</div>
      <div class="form-row">
        <label>opacity</label>
        <input type="range" id="prop-opacity" value="${p.opacity}" min="0" max="1" step="0.01">
      </div>
      <div class="form-row">
        <label>width (px)</label>
        <input type="number" id="prop-width" value="${p.width}" min="10" step="1">
      </div>
      <div class="form-row">
        <label>height (px)</label>
        <input type="number" id="prop-height" value="${p.height}" min="10" step="1">
      </div>
      <div class="form-row">
        <label>bg color</label>
        <input type="color" id="prop-backgroundColor" value="${p.backgroundColor}">
      </div>
      <div class="form-row">
        <label>border-radius</label>
        <input type="number" id="prop-borderRadius" value="${p.borderRadius}" min="0" step="1">
      </div>

      <button class="delete-kf-btn" id="btn-delete-kf">Delete Keyframe</button>
    `;

    // Bind prop change events
    const inputs = propsPanel.querySelectorAll('input, select');
    inputs.forEach((input) => {
      input.addEventListener('input', onPropChange);
    });

    const deleteBtn = $('#btn-delete-kf');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        removeKeyframe(state.selectedKfId);
        renderTimeline();
        renderPropsPanel();
        renderCss();
        applyPreviewAtTime(state.currentTime);
      });
    }
  }

  function onPropChange(e) {
    const kf = getKeyframeById(state.selectedKfId);
    if (!kf) return;

    const id = e.target.id.replace('prop-', '');
    const val = e.target.value;

    if (id === 'position') {
      kf.position = Math.max(0, Math.min(1, parseFloat(val) / 100));
      state.keyframes.sort((a, b) => a.position - b.position);
      renderTimeline();
    } else if (id === 'backgroundColor') {
      kf.props[id] = val;
    } else {
      kf.props[id] = parseFloat(val);
    }

    renderCss();
    applyPreviewAtTime(kf.position);
    updatePlayhead(kf.position);
    updateOnionSkins();
  }

  // ---- Interpolation ----
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function lerpColor(c1, c2, t) {
    const r1 = parseInt(c1.slice(1, 3), 16);
    const g1 = parseInt(c1.slice(3, 5), 16);
    const b1 = parseInt(c1.slice(5, 7), 16);
    const r2 = parseInt(c2.slice(1, 3), 16);
    const g2 = parseInt(c2.slice(3, 5), 16);
    const b2 = parseInt(c2.slice(5, 7), 16);
    const r = Math.round(lerp(r1, r2, t));
    const g = Math.round(lerp(g1, g2, t));
    const b = Math.round(lerp(b1, b2, t));
    return '#' + [r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  function getInterpolatedProps(time) {
    const kfs = state.keyframes;
    if (kfs.length === 0) return defaultKfProps();
    if (kfs.length === 1) return { ...kfs[0].props };

    // Find surrounding keyframes
    let before = kfs[0];
    let after = kfs[kfs.length - 1];

    for (let i = 0; i < kfs.length; i++) {
      if (kfs[i].position <= time) before = kfs[i];
      if (kfs[i].position >= time) {
        after = kfs[i];
        break;
      }
    }

    if (before === after) return { ...before.props };

    const range = after.position - before.position;
    const t = range === 0 ? 0 : (time - before.position) / range;

    const result = {};
    const numericProps = ['translateX', 'translateY', 'rotate', 'scale', 'skewX', 'skewY', 'opacity', 'width', 'height', 'borderRadius'];
    numericProps.forEach((prop) => {
      result[prop] = lerp(before.props[prop], after.props[prop], t);
    });
    result.backgroundColor = lerpColor(before.props.backgroundColor, after.props.backgroundColor, t);

    return result;
  }

  // ---- Preview ----
  function applyPreviewAtTime(time) {
    state.currentTime = time;
    const props = getInterpolatedProps(time);
    applyStylesToElement(previewEl, props);
    updateTimeDisplay(time);
    updateOnionSkins();
  }

  function applyStylesToElement(el, props) {
    const isText = state.elementType === 'text';
    const isImage = state.elementType === 'image';

    el.className = 'preview-element';
    if (isText) el.classList.add('text-mode');
    if (isImage) el.classList.add('image-mode');

    if (isText) {
      el.textContent = 'Hello';
      el.innerHTML = 'Hello';
    } else if (isImage) {
      el.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>';
    } else {
      el.innerHTML = '';
    }

    const transform = `translateX(${props.translateX}px) translateY(${props.translateY}px) rotate(${props.rotate}deg) scale(${props.scale}) skewX(${props.skewX}deg) skewY(${props.skewY}deg)`;

    el.style.transform = transform;
    el.style.opacity = props.opacity;

    if (!isText) {
      el.style.width = props.width + 'px';
      el.style.height = props.height + 'px';
      el.style.backgroundColor = props.backgroundColor;
      el.style.borderRadius = props.borderRadius + 'px';
    } else {
      el.style.color = props.backgroundColor;
    }
  }

  function updateTimeDisplay(time) {
    const duration = parseFloat(animDuration.value) || 1;
    timeDisplay.textContent = (time * duration).toFixed(2) + 's / ' + duration.toFixed(2) + 's';
  }

  // ---- Onion Skinning ----
  function updateOnionSkins() {
    onionContainer.innerHTML = '';
    if (!state.onionSkinning) return;

    const steps = [0, 0.25, 0.5, 0.75, 1.0];
    steps.forEach((t) => {
      const props = getInterpolatedProps(t);
      const ghost = document.createElement('div');
      ghost.className = 'onion-ghost';

      const transform = `translateX(${props.translateX}px) translateY(${props.translateY}px) rotate(${props.rotate}deg) scale(${props.scale}) skewX(${props.skewX}deg) skewY(${props.skewY}deg)`;
      ghost.style.transform = transform;
      ghost.style.width = props.width + 'px';
      ghost.style.height = props.height + 'px';
      ghost.style.borderRadius = props.borderRadius + 'px';
      ghost.style.borderColor = props.backgroundColor.replace('#', 'rgba(') ? `${props.backgroundColor}44` : 'rgba(108,92,231,0.3)';

      // Slightly different opacity per step for depth
      ghost.style.opacity = 0.15 + Math.abs(t - state.currentTime) * 0.1;

      onionContainer.appendChild(ghost);
    });
  }

  // ---- Playhead ----
  function updatePlayhead(time) {
    playhead.style.left = time * 100 + '%';
  }

  // ---- Animation Playback ----
  function play() {
    if (state.playing) return;
    state.playing = true;
    state.lastTimestamp = null;
    $('#play-icon').style.display = 'none';
    $('#pause-icon').style.display = 'block';

    // Remove any CSS animation from preview element
    previewEl.style.animation = '';

    state.animationFrameId = requestAnimationFrame(animationLoop);
  }

  function pause() {
    state.playing = false;
    state.lastTimestamp = null;
    $('#play-icon').style.display = 'block';
    $('#pause-icon').style.display = 'none';

    if (state.animationFrameId) {
      cancelAnimationFrame(state.animationFrameId);
      state.animationFrameId = null;
    }
  }

  function animationLoop(timestamp) {
    if (!state.playing) return;

    if (state.lastTimestamp === null) {
      state.lastTimestamp = timestamp;
    }

    const duration = (parseFloat(animDuration.value) || 1) * 1000;
    const delta = timestamp - state.lastTimestamp;
    state.lastTimestamp = timestamp;

    state.currentTime += delta / duration;

    const direction = animDirection.value;
    const iterText = animIterations.value;
    const iterations = iterText === 'infinite' ? Infinity : parseFloat(iterText) || 1;

    if (state.currentTime >= 1) {
      if (iterations === Infinity || state.currentTime < iterations) {
        if (direction === 'alternate' || direction === 'alternate-reverse') {
          state.currentTime = 1 - (state.currentTime - 1);
          // Reverse direction indicator handled by clamping
        } else {
          state.currentTime = state.currentTime % 1;
        }
      } else {
        state.currentTime = 1;
        pause();
      }
    }

    const t = Math.max(0, Math.min(1, state.currentTime));
    updatePlayhead(t);
    applyPreviewAtTime(t);

    if (state.playing) {
      state.animationFrameId = requestAnimationFrame(animationLoop);
    }
  }

  function stepForward() {
    pause();
    // Find next keyframe
    const sorted = state.keyframes.filter((k) => k.position > state.currentTime + 0.001);
    if (sorted.length > 0) {
      const nextPos = sorted[0].position;
      state.currentTime = nextPos;
    } else {
      state.currentTime = 1;
    }
    updatePlayhead(state.currentTime);
    applyPreviewAtTime(state.currentTime);
  }

  function stepBackward() {
    pause();
    // Find previous keyframe
    const sorted = state.keyframes.filter((k) => k.position < state.currentTime - 0.001);
    if (sorted.length > 0) {
      const prevPos = sorted[sorted.length - 1].position;
      state.currentTime = prevPos;
    } else {
      state.currentTime = 0;
    }
    updatePlayhead(state.currentTime);
    applyPreviewAtTime(state.currentTime);
  }

  // ---- CSS Generation ----
  function generateCSS() {
    const name = animName.value || 'myAnimation';
    const duration = animDuration.value || '1';
    const easing = animEasing.value;
    const iterations = animIterations.value || 'infinite';
    const direction = animDirection.value;
    const fill = animFill.value;

    let css = `@keyframes ${name} {\n`;

    state.keyframes.forEach((kf) => {
      const pct = Math.round(kf.position * 100);
      const p = kf.props;
      const transform = `translateX(${p.translateX}px) translateY(${p.translateY}px) rotate(${p.rotate}deg) scale(${p.scale}) skewX(${p.skewX}deg) skewY(${p.skewY}deg)`;

      css += `  ${pct}% {\n`;
      css += `    transform: ${transform};\n`;
      css += `    opacity: ${p.opacity};\n`;
      css += `    width: ${p.width}px;\n`;
      css += `    height: ${p.height}px;\n`;
      css += `    background-color: ${p.backgroundColor};\n`;
      css += `    border-radius: ${p.borderRadius}px;\n`;
      css += `  }\n`;
    });

    css += `}\n\n`;
    css += `.animated-element {\n`;
    css += `  animation: ${name} ${duration}s ${easing} ${iterations} ${direction} ${fill};\n`;
    css += `}`;

    return css;
  }

  function renderCss() {
    const css = generateCSS();
    cssOutput.textContent = css;
  }

  // ---- Toast ----
  function showToast(msg) {
    toast.textContent = msg || 'Copied to clipboard!';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2200);
  }

  // ---- Copy to Clipboard ----
  function copyCSS() {
    const css = generateCSS();
    navigator.clipboard.writeText(css).then(() => {
      showToast('CSS copied to clipboard!');
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = css;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('CSS copied to clipboard!');
    });
  }

  // ---- Export Modal ----
  function openExport() {
    exportCss.textContent = generateCSS();
    exportModal.classList.add('open');
  }

  function closeExport() {
    exportModal.classList.remove('open');
  }

  // ---- Event Bindings ----
  function bindEvents() {
    // Play controls
    btnPlay.addEventListener('click', () => {
      if (state.playing) pause();
      else {
        if (state.currentTime >= 1) state.currentTime = 0;
        play();
      }
    });
    btnStepBack.addEventListener('click', stepBackward);
    btnStepFwd.addEventListener('click', stepForward);

    // Add keyframe at playhead position
    btnAddKf.addEventListener('click', () => {
      const pos = state.currentTime;
      // Don't add if one already exists very close
      const exists = state.keyframes.some((k) => Math.abs(k.position - pos) < 0.005);
      if (exists) {
        showToast('A keyframe already exists at this position.');
        return;
      }
      const props = getInterpolatedProps(pos);
      const kf = addKeyframe(pos, props);
      selectKeyframe(kf.id);
      renderTimeline();
      renderCss();
    });

    // Click on timeline to set playhead / add keyframe
    timelineTrack.addEventListener('click', (e) => {
      if (e.target.closest('.kf-marker')) return;
      const rect = timelineTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      pause();
      state.currentTime = pos;
      updatePlayhead(pos);
      applyPreviewAtTime(pos);
    });

    // Double click on timeline to add keyframe
    timelineTrack.addEventListener('dblclick', (e) => {
      if (e.target.closest('.kf-marker')) return;
      const rect = timelineTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      const exists = state.keyframes.some((k) => Math.abs(k.position - pos) < 0.005);
      if (!exists) {
        const props = getInterpolatedProps(pos);
        const kf = addKeyframe(pos, props);
        selectKeyframe(kf.id);
        renderTimeline();
        renderCss();
      }
    });

    // Copy / Export
    btnCopyCss.addEventListener('click', copyCSS);
    btnExport.addEventListener('click', openExport);
    btnCopyExport.addEventListener('click', () => {
      copyCSS();
      closeExport();
    });
    modalClose.addEventListener('click', closeExport);
    exportModal.addEventListener('click', (e) => {
      if (e.target === exportModal) closeExport();
    });

    // Onion skinning toggle
    toggleOnion.addEventListener('change', () => {
      state.onionSkinning = toggleOnion.checked;
      updateOnionSkins();
    });

    // Element type
    elementTypeSelect.addEventListener('change', () => {
      state.elementType = elementTypeSelect.value;
      applyPreviewAtTime(state.currentTime);
    });

    // Settings changes
    [animName, animDuration, animEasing, animIterations, animDirection, animFill].forEach((input) => {
      input.addEventListener('input', () => {
        renderCss();
        renderRuler();
      });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (state.playing) pause();
          else {
            if (state.currentTime >= 1) state.currentTime = 0;
            play();
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'Delete':
        case 'Backspace':
          if (state.selectedKfId && state.keyframes.length > 1) {
            e.preventDefault();
            removeKeyframe(state.selectedKfId);
            renderTimeline();
            renderPropsPanel();
            renderCss();
            applyPreviewAtTime(state.currentTime);
          }
          break;
      }
    });
  }

  // ---- Boot ----
  init();
})();
