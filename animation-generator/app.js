(() => {
  "use strict";

  // ── State ──
  const KEYFRAME_STOPS = [0, 25, 50, 75, 100];

  const defaultKF = () => ({
    translateX: 0,
    translateY: 0,
    rotate: 0,
    scale: 1,
    opacity: 1,
    backgroundColor: "#6c5ce7",
  });

  let keyframes = {};
  KEYFRAME_STOPS.forEach((s) => (keyframes[s] = defaultKF()));

  let activeStop = 0;
  let isPlaying = false;
  let animStyleEl = null;

  const animConfig = {
    duration: 1,
    delay: 0,
    iterations: 1,
    infinite: false,
    direction: "normal",
    fillMode: "none",
    timing: "ease",
    bezier: { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1 },
  };

  // ── DOM Refs ──
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const elPreview = $("#animatedElement");
  const elTimeline = $("#timelineTrack");
  const elTimelineLabels = $("#timelineLabels");
  const elKfLabel = $("#activeKeyframeLabel");
  const elCode = $("#codeOutput");
  const elToast = $("#toast");
  const elBezierEditor = $("#bezierEditor");
  const elBezierCanvas = $("#bezierCanvas");

  // ── Presets ──
  const presets = {
    bounce: {
      config: { duration: 0.8, timing: "ease", direction: "normal", fillMode: "both", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: -80, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        50:  { translateX: 0, translateY: 0, rotate: 0, scale: 1.1, opacity: 1, backgroundColor: "#6c5ce7" },
        75:  { translateX: 0, translateY: -30, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    "fade-in": {
      config: { duration: 1, timing: "ease-in", direction: "normal", fillMode: "forwards", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 0, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 0.25, backgroundColor: "#6c5ce7" },
        50:  { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 0.5, backgroundColor: "#6c5ce7" },
        75:  { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 0.75, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    "slide-in": {
      config: { duration: 0.6, timing: "ease-out", direction: "normal", fillMode: "forwards", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: -250, translateY: 0, rotate: 0, scale: 1, opacity: 0, backgroundColor: "#6c5ce7" },
        25:  { translateX: -150, translateY: 0, rotate: 0, scale: 1, opacity: 0.5, backgroundColor: "#6c5ce7" },
        50:  { translateX: -50, translateY: 0, rotate: 0, scale: 1, opacity: 0.8, backgroundColor: "#6c5ce7" },
        75:  { translateX: 10, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    pulse: {
      config: { duration: 1, timing: "ease-in-out", direction: "alternate", fillMode: "none", iterations: 1, infinite: true },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: 0, rotate: 0, scale: 1.08, opacity: 0.85, backgroundColor: "#7c6cf7" },
        50:  { translateX: 0, translateY: 0, rotate: 0, scale: 1.15, opacity: 0.7, backgroundColor: "#a29bfe" },
        75:  { translateX: 0, translateY: 0, rotate: 0, scale: 1.08, opacity: 0.85, backgroundColor: "#7c6cf7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    shake: {
      config: { duration: 0.5, timing: "ease-in-out", direction: "normal", fillMode: "none", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: -20, translateY: 0, rotate: -5, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        50:  { translateX: 20, translateY: 0, rotate: 5, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        75:  { translateX: -10, translateY: 0, rotate: -2, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    spin: {
      config: { duration: 1, timing: "linear", direction: "normal", fillMode: "none", iterations: 1, infinite: true },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: 0, rotate: 90, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        50:  { translateX: 0, translateY: 0, rotate: 180, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        75:  { translateX: 0, translateY: 0, rotate: 270, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 360, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    flip: {
      config: { duration: 0.8, timing: "ease-in-out", direction: "normal", fillMode: "forwards", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: -30, rotate: 90, scale: 1.1, opacity: 0.8, backgroundColor: "#6c5ce7" },
        50:  { translateX: 0, translateY: -40, rotate: 180, scale: 1, opacity: 0.6, backgroundColor: "#a29bfe" },
        75:  { translateX: 0, translateY: -20, rotate: 270, scale: 1.1, opacity: 0.8, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 360, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
    swing: {
      config: { duration: 1, timing: "ease-in-out", direction: "normal", fillMode: "none", iterations: 1, infinite: false },
      kf: {
        0:   { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        25:  { translateX: 0, translateY: 0, rotate: 15, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        50:  { translateX: 0, translateY: 0, rotate: -10, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        75:  { translateX: 0, translateY: 0, rotate: 5, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
        100: { translateX: 0, translateY: 0, rotate: 0, scale: 1, opacity: 1, backgroundColor: "#6c5ce7" },
      },
    },
  };

  // ── Init ──
  function init() {
    buildPresetChips();
    buildTimeline();
    bindAnimProps();
    bindPlayback();
    bindCopy();
    bindBezier();
    selectStop(0);
    updateAll();
  }

  // ── Preset Chips ──
  function buildPresetChips() {
    const container = $("#presetChips");
    Object.keys(presets).forEach((name) => {
      const chip = document.createElement("button");
      chip.className = "preset-chip";
      chip.textContent = name;
      chip.addEventListener("click", () => applyPreset(name));
      container.appendChild(chip);
    });
  }

  function applyPreset(name) {
    const p = presets[name];
    KEYFRAME_STOPS.forEach((s) => {
      keyframes[s] = { ...p.kf[s] };
    });
    Object.assign(animConfig, p.config);
    syncAnimUI();
    selectStop(activeStop);
    updateAll();

    $$(".preset-chip").forEach((c) => c.classList.toggle("active", c.textContent === name));
  }

  // ── Timeline ──
  function buildTimeline() {
    elTimeline.querySelectorAll(".kf-point").forEach((el) => el.remove());
    elTimelineLabels.innerHTML = "";

    KEYFRAME_STOPS.forEach((stop) => {
      const dot = document.createElement("div");
      dot.className = "kf-point";
      dot.style.left = stop + "%";
      dot.dataset.stop = stop;
      dot.addEventListener("click", () => selectStop(stop));
      elTimeline.appendChild(dot);

      const label = document.createElement("span");
      label.textContent = stop + "%";
      elTimelineLabels.appendChild(label);
    });
  }

  function selectStop(stop) {
    activeStop = stop;
    elKfLabel.textContent = stop + "%";
    elTimeline.querySelectorAll(".kf-point").forEach((el) => {
      el.classList.toggle("active", parseInt(el.dataset.stop) === stop);
    });
    syncKfUI();
  }

  // ── Keyframe Property UI ──
  function syncKfUI() {
    const kf = keyframes[activeStop];
    $$(".kf-input").forEach((input) => {
      const prop = input.dataset.prop;
      if (prop && kf[prop] !== undefined) {
        input.value = kf[prop];
      }
    });
  }

  function bindKfInputs() {
    $$(".kf-input").forEach((input) => {
      const prop = input.dataset.prop;
      const event = input.type === "color" ? "input" : "input";
      input.addEventListener(event, (e) => {
        const val = input.type === "color" ? input.value : parseFloat(input.value);
        keyframes[activeStop][prop] = val;

        // Sync paired range/number inputs
        $$(`.kf-input[data-prop="${prop}"]`).forEach((other) => {
          if (other !== input) other.value = input.value;
        });

        clearPresetActive();
        updateAll();
      });
    });
  }

  // ── Animation Properties UI ──
  function bindAnimProps() {
    const dur = $("#animDuration"), durN = $("#animDurationNum");
    const del = $("#animDelay"), delN = $("#animDelayNum");
    const iter = $("#animIterations"), inf = $("#animInfinite");
    const dir = $("#animDirection"), fill = $("#animFillMode"), timing = $("#animTiming");

    const syncPair = (range, num, key) => {
      range.addEventListener("input", () => { num.value = range.value; animConfig[key] = parseFloat(range.value); clearPresetActive(); updateAll(); });
      num.addEventListener("input", () => { range.value = num.value; animConfig[key] = parseFloat(num.value); clearPresetActive(); updateAll(); });
    };

    syncPair(dur, durN, "duration");
    syncPair(del, delN, "delay");

    iter.addEventListener("input", () => { animConfig.iterations = parseInt(iter.value) || 1; clearPresetActive(); updateAll(); });
    inf.addEventListener("change", () => { animConfig.infinite = inf.checked; iter.disabled = inf.checked; clearPresetActive(); updateAll(); });

    dir.addEventListener("change", () => { animConfig.direction = dir.value; clearPresetActive(); updateAll(); });
    fill.addEventListener("change", () => { animConfig.fillMode = fill.value; clearPresetActive(); updateAll(); });

    timing.addEventListener("change", () => {
      animConfig.timing = timing.value;
      elBezierEditor.style.display = timing.value === "custom" ? "flex" : "none";
      clearPresetActive();
      updateAll();
    });

    bindKfInputs();
  }

  function syncAnimUI() {
    $("#animDuration").value = animConfig.duration;
    $("#animDurationNum").value = animConfig.duration;
    $("#animDelay").value = animConfig.delay;
    $("#animDelayNum").value = animConfig.delay;
    $("#animIterations").value = animConfig.iterations;
    $("#animInfinite").checked = animConfig.infinite;
    $("#animIterations").disabled = animConfig.infinite;
    $("#animDirection").value = animConfig.direction;
    $("#animFillMode").value = animConfig.fillMode;
    $("#animTiming").value = animConfig.timing;
    elBezierEditor.style.display = animConfig.timing === "custom" ? "flex" : "none";
    if (animConfig.timing === "custom") drawBezier();
  }

  function clearPresetActive() {
    $$(".preset-chip").forEach((c) => c.classList.remove("active"));
  }

  // ── Bezier ──
  function bindBezier() {
    const fields = ["bx1", "by1", "bx2", "by2"];
    const keys = ["x1", "y1", "x2", "y2"];
    fields.forEach((id, i) => {
      $(`#${id}`).addEventListener("input", () => {
        animConfig.bezier[keys[i]] = parseFloat($(`#${id}`).value) || 0;
        drawBezier();
        updateAll();
      });
    });

    // Draggable control points
    let dragging = null;
    const canvas = elBezierCanvas;
    const S = 180;
    const P = 16; // padding

    const toCanvas = (x, y) => [P + x * (S - 2 * P), S - P - y * (S - 2 * P)];
    const fromCanvas = (cx, cy) => [(cx - P) / (S - 2 * P), (S - P - cy) / (S - 2 * P)];

    canvas.addEventListener("mousedown", (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const [cx1, cy1] = toCanvas(animConfig.bezier.x1, animConfig.bezier.y1);
      const [cx2, cy2] = toCanvas(animConfig.bezier.x2, animConfig.bezier.y2);
      if (Math.hypot(mx - cx1, my - cy1) < 14) dragging = "p1";
      else if (Math.hypot(mx - cx2, my - cy2) < 14) dragging = "p2";
    });

    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const [fx, fy] = fromCanvas(mx, my);
      if (dragging === "p1") {
        animConfig.bezier.x1 = Math.min(1, Math.max(0, fx));
        animConfig.bezier.y1 = Math.min(2, Math.max(-1, fy));
        $("#bx1").value = animConfig.bezier.x1.toFixed(2);
        $("#by1").value = animConfig.bezier.y1.toFixed(2);
      } else {
        animConfig.bezier.x2 = Math.min(1, Math.max(0, fx));
        animConfig.bezier.y2 = Math.min(2, Math.max(-1, fy));
        $("#bx2").value = animConfig.bezier.x2.toFixed(2);
        $("#by2").value = animConfig.bezier.y2.toFixed(2);
      }
      drawBezier();
      updateAll();
    });

    window.addEventListener("mouseup", () => { dragging = null; });

    drawBezier();
  }

  function drawBezier() {
    const ctx = elBezierCanvas.getContext("2d");
    const S = 180, P = 16;
    ctx.clearRect(0, 0, S, S);

    const toC = (x, y) => [P + x * (S - 2 * P), S - P - y * (S - 2 * P)];

    // Grid
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const v = P + (i / 4) * (S - 2 * P);
      ctx.beginPath(); ctx.moveTo(v, P); ctx.lineTo(v, S - P); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(P, v); ctx.lineTo(S - P, v); ctx.stroke();
    }

    // Diagonal
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(...toC(0, 0));
    ctx.lineTo(...toC(1, 1));
    ctx.stroke();
    ctx.setLineDash([]);

    const { x1, y1, x2, y2 } = animConfig.bezier;
    const [cx1, cy1] = toC(x1, y1);
    const [cx2, cy2] = toC(x2, y2);
    const [start] = [toC(0, 0)];
    const [end] = [toC(1, 1)];

    // Control lines
    ctx.strokeStyle = "rgba(108, 92, 231, 0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(...start); ctx.lineTo(cx1, cy1); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(...end); ctx.lineTo(cx2, cy2); ctx.stroke();

    // Curve
    ctx.strokeStyle = "#6c5ce7";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(...start);
    ctx.bezierCurveTo(cx1, cy1, cx2, cy2, ...end);
    ctx.stroke();

    // Points
    [
      [cx1, cy1, "#6c5ce7"],
      [cx2, cy2, "#a29bfe"],
    ].forEach(([x, y, col]) => {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // ── Playback ──
  function bindPlayback() {
    $("#btnPlay").addEventListener("click", play);
    $("#btnPause").addEventListener("click", pause);
    $("#btnRestart").addEventListener("click", restart);
  }

  function play() {
    isPlaying = true;
    applyAnimation();
    elPreview.style.animationPlayState = "running";
  }

  function pause() {
    isPlaying = false;
    elPreview.style.animationPlayState = "paused";
  }

  function restart() {
    elPreview.style.animation = "none";
    // Force reflow
    void elPreview.offsetWidth;
    isPlaying = true;
    applyAnimation();
    elPreview.style.animationPlayState = "running";
  }

  // ── Generate & Apply ──
  function buildKeyframesCSS() {
    let css = "@keyframes custom-animation {\n";
    KEYFRAME_STOPS.forEach((stop) => {
      const kf = keyframes[stop];
      const transforms = [];
      if (kf.translateX !== 0 || kf.translateY !== 0) {
        transforms.push(`translate(${kf.translateX}px, ${kf.translateY}px)`);
      }
      if (kf.rotate !== 0) transforms.push(`rotate(${kf.rotate}deg)`);
      if (kf.scale !== 1) transforms.push(`scale(${kf.scale})`);

      css += `  ${stop}% {\n`;
      if (transforms.length) css += `    transform: ${transforms.join(" ")};\n`;
      if (kf.opacity !== 1) css += `    opacity: ${kf.opacity};\n`;
      css += `    background-color: ${kf.backgroundColor};\n`;
      css += `  }\n`;
    });
    css += "}";
    return css;
  }

  function getTimingValue() {
    if (animConfig.timing === "custom") {
      const { x1, y1, x2, y2 } = animConfig.bezier;
      return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
    }
    return animConfig.timing;
  }

  function buildAnimationProp() {
    const iter = animConfig.infinite ? "infinite" : animConfig.iterations;
    return `animation: custom-animation ${animConfig.duration}s ${getTimingValue()} ${animConfig.delay}s ${iter} ${animConfig.direction} ${animConfig.fillMode};`;
  }

  function getFullCSS() {
    return buildKeyframesCSS() + "\n\n.element {\n  " + buildAnimationProp() + "\n}";
  }

  function buildHighlightedCSS() {
    const hl = (type, text) => `<span class="syn-${type}">${text}</span>`;

    let html = hl("sel", "@keyframes") + " " + hl("val", "custom-animation") + " " + hl("punc", "{") + "\n";

    KEYFRAME_STOPS.forEach((stop) => {
      const kf = keyframes[stop];
      const transforms = [];
      if (kf.translateX !== 0 || kf.translateY !== 0)
        transforms.push(`translate(${kf.translateX}px, ${kf.translateY}px)`);
      if (kf.rotate !== 0) transforms.push(`rotate(${kf.rotate}deg)`);
      if (kf.scale !== 1) transforms.push(`scale(${kf.scale})`);

      html += "  " + hl("num", stop + "%") + " " + hl("punc", "{") + "\n";
      if (transforms.length)
        html += "    " + hl("prop", "transform") + hl("punc", ": ") + hl("val", transforms.join(" ")) + hl("punc", ";") + "\n";
      if (kf.opacity !== 1)
        html += "    " + hl("prop", "opacity") + hl("punc", ": ") + hl("num", kf.opacity) + hl("punc", ";") + "\n";
      html += "    " + hl("prop", "background-color") + hl("punc", ": ") + hl("val", kf.backgroundColor) + hl("punc", ";") + "\n";
      html += "  " + hl("punc", "}") + "\n";
    });

    html += hl("punc", "}") + "\n\n";

    const iter = animConfig.infinite ? "infinite" : animConfig.iterations;
    html += hl("sel", ".element") + " " + hl("punc", "{") + "\n";
    html += "  " + hl("prop", "animation") + hl("punc", ": ");
    html += hl("val", "custom-animation") + " ";
    html += hl("num", animConfig.duration + "s") + " ";
    html += hl("val", getTimingValue()) + " ";
    html += hl("num", animConfig.delay + "s") + " ";
    html += hl("num", iter) + " ";
    html += hl("val", animConfig.direction) + " ";
    html += hl("val", animConfig.fillMode);
    html += hl("punc", ";") + "\n";
    html += hl("punc", "}");

    return html;
  }

  function applyAnimation() {
    if (animStyleEl) animStyleEl.remove();
    animStyleEl = document.createElement("style");
    animStyleEl.textContent = buildKeyframesCSS();
    document.head.appendChild(animStyleEl);

    const iter = animConfig.infinite ? "infinite" : animConfig.iterations;
    elPreview.style.animation = `custom-animation ${animConfig.duration}s ${getTimingValue()} ${animConfig.delay}s ${iter} ${animConfig.direction} ${animConfig.fillMode}`;
  }

  function updateAll() {
    elCode.innerHTML = buildHighlightedCSS();
    if (isPlaying) {
      applyAnimation();
      elPreview.style.animationPlayState = "running";
    }
  }

  // ── Copy ──
  function bindCopy() {
    $("#btnCopy").addEventListener("click", () => {
      navigator.clipboard.writeText(getFullCSS()).then(() => {
        elToast.classList.add("show");
        setTimeout(() => elToast.classList.remove("show"), 2000);
      }).catch(() => {
        // Fallback
        const ta = document.createElement("textarea");
        ta.value = getFullCSS();
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        elToast.classList.add("show");
        setTimeout(() => elToast.classList.remove("show"), 2000);
      });
    });
  }

  // ── Boot ──
  init();
})();
