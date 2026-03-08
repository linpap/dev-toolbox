(() => {
  "use strict";

  // Filter definitions: name, css function, unit, min, max, step, default
  const FILTERS = [
    { name: "Blur",        prop: "blur",        unit: "px",  min: 0,   max: 20,   step: 0.1, def: 0    },
    { name: "Brightness",  prop: "brightness",  unit: "%",   min: 0,   max: 300,  step: 1,   def: 100  },
    { name: "Contrast",    prop: "contrast",    unit: "%",   min: 0,   max: 300,  step: 1,   def: 100  },
    { name: "Grayscale",   prop: "grayscale",   unit: "%",   min: 0,   max: 100,  step: 1,   def: 0    },
    { name: "Hue Rotate",  prop: "hue-rotate",  unit: "deg", min: 0,   max: 360,  step: 1,   def: 0    },
    { name: "Invert",      prop: "invert",      unit: "%",   min: 0,   max: 100,  step: 1,   def: 0    },
    { name: "Opacity",     prop: "opacity",     unit: "%",   min: 0,   max: 100,  step: 1,   def: 100  },
    { name: "Saturate",    prop: "saturate",    unit: "%",   min: 0,   max: 300,  step: 1,   def: 100  },
    { name: "Sepia",       prop: "sepia",       unit: "%",   min: 0,   max: 100,  step: 1,   def: 0    },
    { name: "Drop Shadow X",  prop: "ds-x",     unit: "px",  min: -50, max: 50,   step: 1,   def: 0    },
    { name: "Drop Shadow Y",  prop: "ds-y",     unit: "px",  min: -50, max: 50,   step: 1,   def: 0    },
    { name: "Drop Shadow Blur",prop: "ds-blur",  unit: "px",  min: 0,   max: 50,   step: 1,   def: 0    },
  ];

  const PRESETS = {
    vintage:   { brightness: 110, contrast: 85, saturate: 75, sepia: 30, "hue-rotate": 5 },
    warm:      { brightness: 105, contrast: 105, saturate: 130, sepia: 15, "hue-rotate": 10 },
    cold:      { brightness: 105, contrast: 110, saturate: 90, "hue-rotate": 200 },
    noir:      { brightness: 110, contrast: 130, grayscale: 100 },
    dramatic:  { brightness: 90, contrast: 160, saturate: 140 },
    faded:     { brightness: 120, contrast: 80, saturate: 60, sepia: 10 },
    vibrant:   { brightness: 110, contrast: 120, saturate: 200 },
    sepia:     { sepia: 80, brightness: 105, contrast: 90 },
  };

  // State
  const state = {};
  const sliderEls = {};
  let comparing = false;
  let activePreset = null;

  // DOM refs
  const previewImage = document.getElementById("preview-image");
  const previewOriginal = document.getElementById("preview-original");
  const compareLabel = document.getElementById("compare-label");
  const slidersContainer = document.getElementById("sliders-container");
  const presetsGrid = document.getElementById("presets-grid");
  const cssOutput = document.getElementById("css-output");
  const copyBtn = document.getElementById("copy-css");
  const resetAllBtn = document.getElementById("reset-all");
  const compareToggle = document.getElementById("compare-toggle");
  const imageUpload = document.getElementById("image-upload");
  const removeImageBtn = document.getElementById("remove-image");
  const toast = document.getElementById("toast");

  // Initialize state with defaults
  function initState() {
    for (const f of FILTERS) {
      state[f.prop] = f.def;
    }
  }

  // Build filter CSS string
  function buildFilterCSS() {
    const parts = [];

    for (const f of FILTERS) {
      if (f.prop.startsWith("ds-")) continue; // handled separately
      const val = state[f.prop];
      if (val === f.def) continue;

      if (f.prop === "blur") {
        parts.push(`blur(${val}${f.unit})`);
      } else if (f.prop === "hue-rotate") {
        parts.push(`hue-rotate(${val}${f.unit})`);
      } else {
        // percentage-based: convert to fraction for CSS but display as %
        parts.push(`${f.prop}(${val}${f.unit})`);
      }
    }

    // Drop shadow
    const dsX = state["ds-x"];
    const dsY = state["ds-y"];
    const dsBlur = state["ds-blur"];
    if (dsX !== 0 || dsY !== 0 || dsBlur !== 0) {
      parts.push(`drop-shadow(${dsX}px ${dsY}px ${dsBlur}px rgba(0,0,0,0.5))`);
    }

    return parts.length ? parts.join(" ") : "none";
  }

  // Build the actual CSS filter value (convert percentages to decimals where needed)
  function buildFilterValue() {
    const parts = [];

    for (const f of FILTERS) {
      if (f.prop.startsWith("ds-")) continue;
      const val = state[f.prop];
      if (val === f.def) continue;

      if (f.unit === "px" || f.unit === "deg") {
        parts.push(`${f.prop}(${val}${f.unit})`);
      } else {
        // CSS filter functions use decimals or percentages both work
        parts.push(`${f.prop}(${val}%)`);
      }
    }

    const dsX = state["ds-x"];
    const dsY = state["ds-y"];
    const dsBlur = state["ds-blur"];
    if (dsX !== 0 || dsY !== 0 || dsBlur !== 0) {
      parts.push(`drop-shadow(${dsX}px ${dsY}px ${dsBlur}px rgba(0,0,0,0.5))`);
    }

    return parts.length ? parts.join(" ") : "none";
  }

  // Update preview and output
  function updatePreview() {
    const filterVal = buildFilterValue();
    previewImage.style.filter = filterVal === "none" ? "" : filterVal;
    cssOutput.textContent = `filter: ${buildFilterCSS()};`;
  }

  // Create a slider control
  function createSlider(filter) {
    const div = document.createElement("div");
    div.className = "filter-slider";

    const isDefault = state[filter.prop] === filter.def;

    div.innerHTML = `
      <div class="filter-slider-header">
        <span class="filter-slider-label">${filter.name}</span>
        <div class="filter-slider-right">
          <span class="filter-slider-value">${formatValue(state[filter.prop], filter)}</span>
          <button class="filter-reset-btn ${isDefault ? "" : "visible"}" title="Reset">&times;</button>
        </div>
      </div>
      <input type="range" min="${filter.min}" max="${filter.max}" step="${filter.step}" value="${state[filter.prop]}">
    `;

    const input = div.querySelector("input");
    const valueDisplay = div.querySelector(".filter-slider-value");
    const resetBtn = div.querySelector(".filter-reset-btn");

    input.addEventListener("input", () => {
      const val = parseFloat(input.value);
      state[filter.prop] = val;
      valueDisplay.textContent = formatValue(val, filter);
      resetBtn.classList.toggle("visible", val !== filter.def);
      clearActivePreset();
      updatePreview();
    });

    resetBtn.addEventListener("click", () => {
      state[filter.prop] = filter.def;
      input.value = filter.def;
      valueDisplay.textContent = formatValue(filter.def, filter);
      resetBtn.classList.remove("visible");
      clearActivePreset();
      updatePreview();
    });

    sliderEls[filter.prop] = { input, valueDisplay, resetBtn };
    return div;
  }

  function formatValue(val, filter) {
    if (filter.unit === "px") {
      return filter.step < 1 ? `${val.toFixed(1)}px` : `${val}px`;
    }
    if (filter.unit === "deg") return `${val}\u00B0`;
    return `${val}%`;
  }

  // Sync all sliders to current state
  function syncSliders() {
    for (const f of FILTERS) {
      const el = sliderEls[f.prop];
      if (!el) continue;
      el.input.value = state[f.prop];
      el.valueDisplay.textContent = formatValue(state[f.prop], f);
      el.resetBtn.classList.toggle("visible", state[f.prop] !== f.def);
    }
  }

  // Presets
  function createPresets() {
    for (const [name, values] of Object.entries(PRESETS)) {
      const btn = document.createElement("button");
      btn.className = "preset-btn";
      btn.textContent = name.charAt(0).toUpperCase() + name.slice(1);
      btn.dataset.preset = name;

      btn.addEventListener("click", () => {
        applyPreset(name, values);
      });

      presetsGrid.appendChild(btn);
    }
  }

  function applyPreset(name, values) {
    // Reset to defaults first
    for (const f of FILTERS) {
      state[f.prop] = f.def;
    }
    // Apply preset values
    for (const [prop, val] of Object.entries(values)) {
      if (state.hasOwnProperty(prop)) {
        state[prop] = val;
      }
    }
    syncSliders();
    updatePreview();
    setActivePreset(name);
  }

  function setActivePreset(name) {
    activePreset = name;
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.preset === name);
    });
  }

  function clearActivePreset() {
    activePreset = null;
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
  }

  // Reset all
  resetAllBtn.addEventListener("click", () => {
    initState();
    syncSliders();
    updatePreview();
    clearActivePreset();
  });

  // Compare toggle
  compareToggle.addEventListener("click", () => {
    comparing = !comparing;
    compareToggle.classList.toggle("active-compare", comparing);

    if (comparing) {
      previewOriginal.style.display = "block";
      compareLabel.style.display = "block";
      compareToggle.textContent = "Show Filtered";
    } else {
      previewOriginal.style.display = "none";
      compareLabel.style.display = "none";
      compareToggle.textContent = "Before / After";
    }
  });

  // Copy CSS
  copyBtn.addEventListener("click", () => {
    const text = `filter: ${buildFilterCSS()};`;
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast();
    });
  });

  function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  // Image upload
  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target.result;
      setImage(url);
    };
    reader.readAsDataURL(file);
  });

  function setImage(url) {
    const style = `url('${url}') center/cover no-repeat`;
    previewImage.style.background = style;
    previewOriginal.style.background = style;
    removeImageBtn.style.display = "inline-flex";
  }

  removeImageBtn.addEventListener("click", () => {
    const gradient = "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)";
    previewImage.style.background = gradient;
    previewOriginal.style.background = gradient;
    removeImageBtn.style.display = "none";
    imageUpload.value = "";
  });

  // Active compare button styling via inline override
  const styleTag = document.createElement("style");
  styleTag.textContent = `.active-compare { background: var(--accent) !important; color: #fff !important; border-color: var(--accent) !important; }`;
  document.head.appendChild(styleTag);

  // Init
  initState();
  createPresets();
  for (const f of FILTERS) {
    slidersContainer.appendChild(createSlider(f));
  }
  updatePreview();
})();
