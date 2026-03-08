(() => {
  "use strict";

  // ── Item Colors ──
  const ITEM_COLORS = [
    "#6366f1", "#ec4899", "#f59e0b", "#22c55e",
    "#06b6d4", "#f43f5e", "#8b5cf6", "#14b8a6",
    "#ef4444", "#3b82f6", "#a855f7", "#eab308",
  ];

  // ── Container property definitions ──
  const CONTAINER_PROPS = [
    { prop: "flexDirection",   css: "flex-direction",   default: "row",            values: ["row", "row-reverse", "column", "column-reverse"] },
    { prop: "justifyContent",  css: "justify-content",  default: "flex-start",     values: ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"] },
    { prop: "alignItems",      css: "align-items",      default: "stretch",        values: ["stretch", "flex-start", "flex-end", "center", "baseline"] },
    { prop: "alignContent",    css: "align-content",    default: "stretch",        values: ["stretch", "flex-start", "flex-end", "center", "space-between", "space-around"] },
    { prop: "flexWrap",        css: "flex-wrap",         default: "nowrap",         values: ["nowrap", "wrap", "wrap-reverse"] },
  ];

  const GAP_PROP = { prop: "gap", css: "gap", default: "12" };

  // ── Item property definitions ──
  const ITEM_PROPS = [
    { prop: "flexGrow",    css: "flex-grow",    default: "0",    values: ["0", "1", "2", "3"] },
    { prop: "flexShrink",  css: "flex-shrink",  default: "1",    values: ["0", "1", "2", "3"] },
    { prop: "alignSelf",   css: "align-self",   default: "auto", values: ["auto", "flex-start", "flex-end", "center", "stretch", "baseline"] },
    { prop: "order",       css: "order",        default: "0",    values: ["-1", "0", "1", "2", "3"] },
  ];

  const FLEX_BASIS_PROP = { prop: "flexBasis", css: "flex-basis", default: "auto" };

  // ── State ──
  let containerState = {};
  CONTAINER_PROPS.forEach(p => containerState[p.prop] = p.default);
  containerState.gap = GAP_PROP.default;

  let items = [];
  let selectedItemIndex = 0;

  function createDefaultItem() {
    const item = {};
    ITEM_PROPS.forEach(p => item[p.prop] = p.default);
    item.flexBasis = FLEX_BASIS_PROP.default;
    return item;
  }

  // Initialize with 3 items
  for (let i = 0; i < 3; i++) items.push(createDefaultItem());

  // ── DOM refs ──
  const flexContainer     = document.getElementById("flexContainer");
  const containerControls = document.getElementById("containerControls");
  const itemControls      = document.getElementById("itemControls");
  const itemTabs          = document.getElementById("itemTabs");
  const itemCountSpan     = document.getElementById("itemCount");
  const cssOutput         = document.getElementById("cssOutput");
  const addItemBtn        = document.getElementById("addItemBtn");
  const removeItemBtn     = document.getElementById("removeItemBtn");
  const resetBtn          = document.getElementById("resetBtn");
  const copyBtn           = document.getElementById("copyBtn");
  const toast             = document.getElementById("toast");
  const mainAxisEl        = document.getElementById("mainAxis");
  const crossAxisEl       = document.getElementById("crossAxis");

  // ── Build Container Controls ──
  function buildContainerControls() {
    containerControls.innerHTML = "";

    CONTAINER_PROPS.forEach(def => {
      const row = document.createElement("div");
      row.className = "control-row";

      const label = document.createElement("label");
      label.textContent = def.css;
      row.appendChild(label);

      const group = document.createElement("div");
      group.className = "toggle-group";

      def.values.forEach(val => {
        const btn = document.createElement("button");
        btn.className = "toggle-btn" + (containerState[def.prop] === val ? " active" : "");
        btn.textContent = val;
        btn.addEventListener("click", () => {
          containerState[def.prop] = val;
          render();
        });
        group.appendChild(btn);
      });

      row.appendChild(group);
      containerControls.appendChild(row);
    });

    // Gap input
    const gapRow = document.createElement("div");
    gapRow.className = "control-row";
    const gapLabel = document.createElement("label");
    gapLabel.textContent = "gap";
    gapRow.appendChild(gapLabel);

    const gapInput = document.createElement("div");
    gapInput.className = "input-control";
    const input = document.createElement("input");
    input.type = "number";
    input.min = "0";
    input.max = "100";
    input.value = containerState.gap;
    input.addEventListener("input", (e) => {
      containerState.gap = e.target.value || "0";
      render();
    });
    const unit = document.createElement("span");
    unit.textContent = "px";
    gapInput.appendChild(input);
    gapInput.appendChild(unit);
    gapRow.appendChild(gapInput);
    containerControls.appendChild(gapRow);
  }

  // ── Build Item Controls ──
  function buildItemControls() {
    itemControls.innerHTML = "";
    const item = items[selectedItemIndex];
    if (!item) return;

    ITEM_PROPS.forEach(def => {
      const row = document.createElement("div");
      row.className = "control-row";

      const label = document.createElement("label");
      label.textContent = def.css;
      row.appendChild(label);

      const group = document.createElement("div");
      group.className = "toggle-group";

      def.values.forEach(val => {
        const btn = document.createElement("button");
        btn.className = "toggle-btn" + (item[def.prop] === val ? " active" : "");
        btn.textContent = val;
        btn.addEventListener("click", () => {
          item[def.prop] = val;
          render();
        });
        group.appendChild(btn);
      });

      row.appendChild(group);
      itemControls.appendChild(row);
    });

    // flex-basis input
    const basisRow = document.createElement("div");
    basisRow.className = "control-row";
    const basisLabel = document.createElement("label");
    basisLabel.textContent = "flex-basis";
    basisRow.appendChild(basisLabel);

    const basisInput = document.createElement("div");
    basisInput.className = "input-control";
    const input = document.createElement("input");
    input.type = "text";
    input.value = item.flexBasis;
    input.placeholder = "auto";
    input.addEventListener("input", (e) => {
      item.flexBasis = e.target.value || "auto";
      render();
    });
    const hint = document.createElement("span");
    hint.textContent = "e.g. auto, 100px, 50%";
    basisInput.appendChild(input);
    basisInput.appendChild(hint);
    basisRow.appendChild(basisInput);
    itemControls.appendChild(basisRow);
  }

  // ── Build Item Tabs ──
  function buildItemTabs() {
    itemTabs.innerHTML = "";
    items.forEach((_, i) => {
      const tab = document.createElement("button");
      tab.className = "item-tab" + (i === selectedItemIndex ? " active" : "");
      tab.textContent = i + 1;
      tab.style.borderColor = ITEM_COLORS[i % ITEM_COLORS.length];
      tab.style.background = i === selectedItemIndex
        ? ITEM_COLORS[i % ITEM_COLORS.length] + "33"
        : "transparent";
      tab.addEventListener("click", () => {
        selectedItemIndex = i;
        render();
      });
      itemTabs.appendChild(tab);
    });
  }

  // ── Render Flex Container ──
  function renderFlexContainer() {
    // Apply container styles
    flexContainer.style.flexDirection  = containerState.flexDirection;
    flexContainer.style.justifyContent = containerState.justifyContent;
    flexContainer.style.alignItems     = containerState.alignItems;
    flexContainer.style.alignContent   = containerState.alignContent;
    flexContainer.style.flexWrap       = containerState.flexWrap;
    flexContainer.style.gap            = containerState.gap + "px";

    // Rebuild items
    flexContainer.innerHTML = "";
    items.forEach((item, i) => {
      const el = document.createElement("div");
      el.className = "flex-item" + (i === selectedItemIndex ? " selected" : "");
      el.textContent = i + 1;
      el.style.backgroundColor = ITEM_COLORS[i % ITEM_COLORS.length];

      // Apply item styles
      el.style.flexGrow   = item.flexGrow;
      el.style.flexShrink = item.flexShrink;
      el.style.flexBasis  = item.flexBasis;
      el.style.alignSelf  = item.alignSelf;
      el.style.order       = item.order;

      el.addEventListener("click", () => {
        selectedItemIndex = i;
        render();
      });

      flexContainer.appendChild(el);
    });
  }

  // ── Update Axis Indicators ──
  function updateAxes() {
    const dir = containerState.flexDirection;

    // Remove all direction classes then add current
    ["row", "row-reverse", "column", "column-reverse"].forEach(cls => {
      mainAxisEl.classList.remove(cls);
      crossAxisEl.classList.remove(cls);
    });

    mainAxisEl.classList.add(dir);
    crossAxisEl.classList.add(dir);
  }

  // ── Generate CSS ──
  function generateCSS() {
    let css = ".container {\n  display: flex;\n";

    CONTAINER_PROPS.forEach(def => {
      const val = containerState[def.prop];
      if (val !== def.default) {
        css += `  ${def.css}: ${val};\n`;
      }
    });

    if (containerState.gap !== "0") {
      css += `  gap: ${containerState.gap}px;\n`;
    }

    css += "}";

    // Item-specific CSS
    items.forEach((item, i) => {
      const lines = [];
      ITEM_PROPS.forEach(def => {
        if (item[def.prop] !== def.default) {
          lines.push(`  ${def.css}: ${item[def.prop]};`);
        }
      });
      if (item.flexBasis !== FLEX_BASIS_PROP.default) {
        lines.push(`  ${FLEX_BASIS_PROP.css}: ${item.flexBasis};`);
      }
      if (lines.length > 0) {
        css += `\n\n.item-${i + 1} {\n${lines.join("\n")}\n}`;
      }
    });

    return css;
  }

  function renderCSS() {
    cssOutput.textContent = generateCSS();
  }

  // ── Master Render ──
  function render() {
    itemCountSpan.textContent = items.length;
    buildContainerControls();
    buildItemControls();
    buildItemTabs();
    renderFlexContainer();
    updateAxes();
    renderCSS();
  }

  // ── Event Handlers ──
  addItemBtn.addEventListener("click", () => {
    if (items.length >= 12) return;
    items.push(createDefaultItem());
    selectedItemIndex = items.length - 1;
    render();
  });

  removeItemBtn.addEventListener("click", () => {
    if (items.length <= 1) return;
    items.pop();
    if (selectedItemIndex >= items.length) {
      selectedItemIndex = items.length - 1;
    }
    render();
  });

  resetBtn.addEventListener("click", () => {
    CONTAINER_PROPS.forEach(p => containerState[p.prop] = p.default);
    containerState.gap = GAP_PROP.default;
    items = [];
    for (let i = 0; i < 3; i++) items.push(createDefaultItem());
    selectedItemIndex = 0;
    render();
  });

  copyBtn.addEventListener("click", () => {
    const css = generateCSS();
    navigator.clipboard.writeText(css).then(() => {
      showToast();
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = css;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast();
    });
  });

  function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }

  // ── Init ──
  render();
})();
