(() => {
  "use strict";

  // ── DOM refs ──
  const $ = (id) => document.getElementById(id);

  const els = {
    imageUrl:        $("imageUrl"),
    cardTitle:       $("cardTitle"),
    cardDesc:        $("cardDesc"),
    btnText:         $("btnText"),
    cardTags:        $("cardTags"),
    layoutVariant:   $("layoutVariant"),
    imagePosition:   $("imagePosition"),
    cardWidth:       $("cardWidth"),
    cardPadding:     $("cardPadding"),
    cardRadius:      $("cardRadius"),
    bgColor:         $("bgColor"),
    bgColorText:     $("bgColorText"),
    textColor:       $("textColor"),
    textColorText:   $("textColorText"),
    shadowStyle:     $("shadowStyle"),
    shadowX:         $("shadowX"),
    shadowY:         $("shadowY"),
    shadowBlur:      $("shadowBlur"),
    shadowSpread:    $("shadowSpread"),
    shadowColor:     $("shadowColor"),
    shadowColorText: $("shadowColorText"),
    shadowOpacity:   $("shadowOpacity"),
    customShadowFields: $("customShadowFields"),
    borderToggle:    $("borderToggle"),
    borderWidth:     $("borderWidth"),
    borderColor:     $("borderColor"),
    borderColorText: $("borderColorText"),
    borderFields:    $("borderFields"),
    hoverEffect:     $("hoverEffect"),
    hoverBorderColor:     $("hoverBorderColor"),
    hoverBorderColorText: $("hoverBorderColorText"),
    hoverBorderColorField: $("hoverBorderColorField"),
    btnBgColor:      $("btnBgColor"),
    btnBgColorText:  $("btnBgColorText"),
    btnTextColor:    $("btnTextColor"),
    btnTextColorText:$("btnTextColorText"),
    btnRadius:       $("btnRadius"),
    btnFullWidth:    $("btnFullWidth"),
    previewCanvas:   $("previewCanvas"),
    codeOutput:      $("codeOutput"),
    copyBtn:         $("copyBtn"),
    toast:           $("toast"),
    presetsGrid:     $("presetsGrid"),
  };

  // Output value displays
  const outputs = {
    cardWidth:     $("widthVal"),
    cardPadding:   $("paddingVal"),
    cardRadius:    $("radiusVal"),
    shadowX:       $("shXVal"),
    shadowY:       $("shYVal"),
    shadowBlur:    $("shBlurVal"),
    shadowSpread:  $("shSpreadVal"),
    shadowOpacity: $("shOpacVal"),
    borderWidth:   $("borderWVal"),
    btnRadius:     $("btnRadiusVal"),
  };

  let activeTab = "html";
  let activePreset = null;

  // ── Presets ──
  const presets = {
    product: {
      label: "Product",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600",
      cardTitle: "Premium Watch",
      cardDesc: "Elegant timepiece with Swiss movement and sapphire crystal glass.",
      btnText: "Add to Cart",
      cardTags: "new, sale",
      layoutVariant: "vertical",
      imagePosition: "top",
      cardWidth: 300,
      cardPadding: 0,
      cardRadius: 12,
      bgColor: "#1a1a2e",
      textColor: "#e0e0e0",
      shadowStyle: "medium",
      borderToggle: false,
      borderWidth: 1,
      borderColor: "#2a2a3e",
      hoverEffect: "lift",
      btnBgColor: "#6c63ff",
      btnTextColor: "#ffffff",
      btnRadius: 8,
      btnFullWidth: true,
    },
    profile: {
      label: "Profile",
      imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600",
      cardTitle: "Jane Cooper",
      cardDesc: "Senior Product Designer at Figma. Passionate about design systems.",
      btnText: "Follow",
      cardTags: "designer, mentor",
      layoutVariant: "vertical",
      imagePosition: "top",
      cardWidth: 280,
      cardPadding: 0,
      cardRadius: 16,
      bgColor: "#16162a",
      textColor: "#d4d4d4",
      shadowStyle: "large",
      borderToggle: true,
      borderWidth: 1,
      borderColor: "#2e2e4a",
      hoverEffect: "glow",
      btnBgColor: "#3b82f6",
      btnTextColor: "#ffffff",
      btnRadius: 20,
      btnFullWidth: true,
    },
    blog: {
      label: "Blog",
      imageUrl: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600",
      cardTitle: "Getting Started with CSS Grid",
      cardDesc: "A comprehensive guide to modern CSS layout techniques for responsive web design.",
      btnText: "Read Article",
      cardTags: "css, tutorial, web",
      layoutVariant: "vertical",
      imagePosition: "top",
      cardWidth: 360,
      cardPadding: 0,
      cardRadius: 8,
      bgColor: "#1e1e2a",
      textColor: "#c8c8d0",
      shadowStyle: "small",
      borderToggle: true,
      borderWidth: 1,
      borderColor: "#333350",
      hoverEffect: "border-color",
      hoverBorderColor: "#6c63ff",
      btnBgColor: "transparent",
      btnTextColor: "#6c63ff",
      btnRadius: 6,
      btnFullWidth: false,
    },
    pricing: {
      label: "Pricing",
      imageUrl: "",
      cardTitle: "Pro Plan",
      cardDesc: "Unlimited projects, priority support, and advanced analytics for teams.",
      btnText: "Get Started",
      cardTags: "$29/mo",
      layoutVariant: "vertical",
      imagePosition: "top",
      cardWidth: 300,
      cardPadding: 28,
      cardRadius: 16,
      bgColor: "#1a1a2e",
      textColor: "#d0d0d8",
      shadowStyle: "medium",
      borderToggle: true,
      borderWidth: 1,
      borderColor: "#6c63ff",
      hoverEffect: "grow",
      btnBgColor: "#6c63ff",
      btnTextColor: "#ffffff",
      btnRadius: 10,
      btnFullWidth: true,
    },
    testimonial: {
      label: "Testimonial",
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
      cardTitle: "Alex Johnson",
      cardDesc: '"This tool completely transformed our workflow. The team productivity increased by 40% in just two weeks."',
      btnText: "",
      cardTags: "CEO, TechCorp",
      layoutVariant: "horizontal",
      imagePosition: "left",
      cardWidth: 480,
      cardPadding: 0,
      cardRadius: 12,
      bgColor: "#181828",
      textColor: "#d0d0d8",
      shadowStyle: "small",
      borderToggle: true,
      borderWidth: 1,
      borderColor: "#2a2a42",
      hoverEffect: "lift",
      btnBgColor: "#6c63ff",
      btnTextColor: "#ffffff",
      btnRadius: 8,
      btnFullWidth: false,
    },
    feature: {
      label: "Feature",
      imageUrl: "",
      cardTitle: "Lightning Fast",
      cardDesc: "Optimized performance with edge computing and global CDN delivery.",
      btnText: "Learn More",
      cardTags: "performance",
      layoutVariant: "vertical",
      imagePosition: "top",
      cardWidth: 280,
      cardPadding: 24,
      cardRadius: 12,
      bgColor: "#12121e",
      textColor: "#c0c0cc",
      shadowStyle: "none",
      borderToggle: true,
      borderWidth: 1,
      borderColor: "#28283e",
      hoverEffect: "border-color",
      hoverBorderColor: "#22c55e",
      btnBgColor: "transparent",
      btnTextColor: "#22c55e",
      btnRadius: 8,
      btnFullWidth: false,
    },
  };

  // ── Build presets buttons ──
  Object.entries(presets).forEach(([key, preset]) => {
    const btn = document.createElement("button");
    btn.className = "preset-btn";
    btn.textContent = preset.label;
    btn.dataset.preset = key;
    btn.addEventListener("click", () => applyPreset(key));
    els.presetsGrid.appendChild(btn);
  });

  function applyPreset(key) {
    const p = presets[key];
    if (!p) return;

    activePreset = key;
    document.querySelectorAll(".preset-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.preset === key);
    });

    els.imageUrl.value = p.imageUrl;
    els.cardTitle.value = p.cardTitle;
    els.cardDesc.value = p.cardDesc;
    els.btnText.value = p.btnText;
    els.cardTags.value = p.cardTags;
    els.layoutVariant.value = p.layoutVariant;
    els.imagePosition.value = p.imagePosition;
    els.cardWidth.value = p.cardWidth;
    els.cardPadding.value = p.cardPadding;
    els.cardRadius.value = p.cardRadius;
    setColor("bgColor", p.bgColor);
    setColor("textColor", p.textColor);
    els.shadowStyle.value = p.shadowStyle;
    els.borderToggle.checked = p.borderToggle;
    els.borderWidth.value = p.borderWidth;
    setColor("borderColor", p.borderColor);
    els.hoverEffect.value = p.hoverEffect;
    if (p.hoverBorderColor) setColor("hoverBorderColor", p.hoverBorderColor);
    setColor("btnBgColor", p.btnBgColor === "transparent" ? "#000000" : p.btnBgColor);
    if (p.btnBgColor === "transparent") els.btnBgColorText.value = "transparent";
    setColor("btnTextColor", p.btnTextColor);
    els.btnRadius.value = p.btnRadius;
    els.btnFullWidth.checked = p.btnFullWidth;

    updateVisibility();
    updateOutputs();
    render();
  }

  function setColor(name, value) {
    const el = els[name];
    const textEl = els[name + "Text"];
    if (el) el.value = value;
    if (textEl) textEl.value = value;
  }

  // ── Color sync ──
  function syncColorPair(colorId) {
    const colorEl = els[colorId];
    const textEl = els[colorId + "Text"];
    if (!colorEl || !textEl) return;

    colorEl.addEventListener("input", () => {
      textEl.value = colorEl.value;
      render();
    });

    textEl.addEventListener("input", () => {
      const v = textEl.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        colorEl.value = v;
      }
      render();
    });
  }

  ["bgColor", "textColor", "shadowColor", "borderColor", "hoverBorderColor", "btnBgColor", "btnTextColor"].forEach(syncColorPair);

  // ── Visibility toggles ──
  function updateVisibility() {
    els.customShadowFields.classList.toggle("hidden", els.shadowStyle.value !== "custom");
    els.borderFields.classList.toggle("hidden", !els.borderToggle.checked);
    els.hoverBorderColorField.classList.toggle("hidden", els.hoverEffect.value !== "border-color");
  }

  els.shadowStyle.addEventListener("change", () => { updateVisibility(); render(); });
  els.borderToggle.addEventListener("change", () => { updateVisibility(); render(); });
  els.hoverEffect.addEventListener("change", () => { updateVisibility(); render(); });

  // ── Output value displays ──
  function updateOutputs() {
    outputs.cardWidth.textContent = els.cardWidth.value;
    outputs.cardPadding.textContent = els.cardPadding.value;
    outputs.cardRadius.textContent = els.cardRadius.value;
    outputs.shadowX.textContent = els.shadowX.value;
    outputs.shadowY.textContent = els.shadowY.value;
    outputs.shadowBlur.textContent = els.shadowBlur.value;
    outputs.shadowSpread.textContent = els.shadowSpread.value;
    outputs.shadowOpacity.textContent = (els.shadowOpacity.value / 100).toFixed(2);
    outputs.borderWidth.textContent = els.borderWidth.value;
    outputs.btnRadius.textContent = els.btnRadius.value;
  }

  // ── Gather state ──
  function getState() {
    const tags = els.cardTags.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    let shadow = "none";
    const ss = els.shadowStyle.value;
    if (ss === "small")  shadow = "0 2px 8px rgba(0,0,0,0.18)";
    if (ss === "medium") shadow = "0 4px 20px rgba(0,0,0,0.25)";
    if (ss === "large")  shadow = "0 8px 40px rgba(0,0,0,0.35)";
    if (ss === "custom") {
      const c = hexToRgb(els.shadowColor.value);
      const a = (els.shadowOpacity.value / 100).toFixed(2);
      shadow = `${els.shadowX.value}px ${els.shadowY.value}px ${els.shadowBlur.value}px ${els.shadowSpread.value}px rgba(${c},${a})`;
    }

    const btnBg = els.btnBgColorText.value.trim() || els.btnBgColor.value;
    const isTransparentBtn = btnBg === "transparent" || btnBg === "#000000" && els.btnBgColorText.value === "transparent";

    return {
      imageUrl: els.imageUrl.value.trim(),
      title: els.cardTitle.value,
      desc: els.cardDesc.value,
      btnText: els.btnText.value.trim(),
      tags,
      layout: els.layoutVariant.value,
      imgPos: els.imagePosition.value,
      width: parseInt(els.cardWidth.value),
      padding: parseInt(els.cardPadding.value),
      radius: parseInt(els.cardRadius.value),
      bgColor: els.bgColorText.value.trim() || els.bgColor.value,
      textColor: els.textColorText.value.trim() || els.textColor.value,
      shadow,
      hasBorder: els.borderToggle.checked,
      borderWidth: parseInt(els.borderWidth.value),
      borderColor: els.borderColorText.value.trim() || els.borderColor.value,
      hover: els.hoverEffect.value,
      hoverBorderColor: els.hoverBorderColorText.value.trim() || els.hoverBorderColor.value,
      btnBg: isTransparentBtn ? "transparent" : btnBg,
      btnColor: els.btnTextColorText.value.trim() || els.btnTextColor.value,
      btnRadius: parseInt(els.btnRadius.value),
      btnFull: els.btnFullWidth.checked,
    };
  }

  function hexToRgb(hex) {
    const h = hex.replace("#", "");
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ].join(",");
  }

  // ── Build shadow CSS for hover ──
  function getHoverStyles(s) {
    const rules = [];
    switch (s.hover) {
      case "lift":
        rules.push("transform: translateY(-6px)");
        if (s.shadow !== "none") {
          rules.push("box-shadow: 0 12px 32px rgba(0,0,0,0.35)");
        }
        break;
      case "grow":
        rules.push("transform: scale(1.04)");
        break;
      case "glow":
        rules.push("box-shadow: 0 0 24px rgba(108,99,255,0.35)");
        break;
      case "border-color":
        rules.push(`border-color: ${s.hoverBorderColor}`);
        break;
    }
    return rules;
  }

  // ── Determine flex direction from layout + imgPos ──
  function getDirection(s) {
    if (s.layout === "horizontal") {
      return s.imgPos === "right" ? "row-reverse" : "row";
    }
    return "column"; // vertical always column (overlay handled separately)
  }

  // ── Generate CSS string ──
  function generateCSS(s) {
    const lines = [];
    lines.push(".card {");
    lines.push(`  width: ${s.width}px;`);
    lines.push(`  background: ${s.bgColor};`);
    lines.push(`  color: ${s.textColor};`);
    lines.push(`  border-radius: ${s.radius}px;`);
    if (s.shadow !== "none") lines.push(`  box-shadow: ${s.shadow};`);
    if (s.hasBorder) lines.push(`  border: ${s.borderWidth}px solid ${s.borderColor};`);
    lines.push("  overflow: hidden;");
    lines.push("  font-family: 'Inter', sans-serif;");

    if (s.imgPos === "overlay") {
      lines.push("  position: relative;");
    } else {
      const dir = getDirection(s);
      if (dir !== "column") {
        lines.push("  display: flex;");
        lines.push(`  flex-direction: ${dir};`);
      }
    }

    if (s.hover !== "none") {
      lines.push(`  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;`);
    }
    lines.push("}");

    // Hover
    const hoverRules = getHoverStyles(s);
    if (hoverRules.length) {
      lines.push("");
      lines.push(".card:hover {");
      hoverRules.forEach((r) => lines.push(`  ${r};`));
      lines.push("}");
    }

    // Image
    if (s.imageUrl) {
      lines.push("");
      lines.push(".card-image {");
      lines.push("  width: 100%;");
      if (s.imgPos === "overlay") {
        lines.push("  height: 100%;");
        lines.push("  position: absolute;");
        lines.push("  top: 0;");
        lines.push("  left: 0;");
        lines.push("  object-fit: cover;");
        lines.push("  opacity: 0.35;");
      } else if (s.layout === "horizontal") {
        lines.push("  width: 40%;");
        lines.push("  min-height: 100%;");
        lines.push("  object-fit: cover;");
      } else {
        lines.push("  height: 200px;");
        lines.push("  object-fit: cover;");
      }
      lines.push("  display: block;");
      lines.push("}");
    }

    // Body
    lines.push("");
    lines.push(".card-body {");
    const pad = s.padding;
    if (s.imgPos === "overlay") {
      lines.push("  position: relative;");
      lines.push("  z-index: 1;");
    }
    if (s.layout === "horizontal" && s.imageUrl) {
      lines.push("  flex: 1;");
    }
    lines.push(`  padding: ${pad}px;`);
    lines.push("}");

    // Tags
    lines.push("");
    lines.push(".card-tags {");
    lines.push("  display: flex;");
    lines.push("  flex-wrap: wrap;");
    lines.push("  gap: 6px;");
    lines.push("  margin-bottom: 12px;");
    lines.push("}");

    lines.push("");
    lines.push(".card-tag {");
    lines.push("  font-size: 0.7rem;");
    lines.push("  font-weight: 600;");
    lines.push("  text-transform: uppercase;");
    lines.push("  letter-spacing: 0.04em;");
    lines.push(`  color: ${s.btnBg === "transparent" ? s.btnColor : s.btnBg};`);
    lines.push(`  background: ${s.btnBg === "transparent" ? s.btnColor : s.btnBg}15;`);
    lines.push("  padding: 3px 8px;");
    lines.push("  border-radius: 4px;");
    lines.push("}");

    // Title
    lines.push("");
    lines.push(".card-title {");
    lines.push("  font-size: 1.15rem;");
    lines.push("  font-weight: 700;");
    lines.push("  margin-bottom: 8px;");
    lines.push("  line-height: 1.3;");
    lines.push("}");

    // Desc
    lines.push("");
    lines.push(".card-desc {");
    lines.push("  font-size: 0.85rem;");
    lines.push("  line-height: 1.6;");
    lines.push("  opacity: 0.7;");
    lines.push("  margin-bottom: 16px;");
    lines.push("}");

    // Button
    if (s.btnText) {
      lines.push("");
      lines.push(".card-btn {");
      lines.push(`  background: ${s.btnBg};`);
      lines.push(`  color: ${s.btnColor};`);
      lines.push("  border: none;");
      if (s.btnBg === "transparent") {
        lines.push(`  border: 1px solid ${s.btnColor};`);
      }
      lines.push(`  border-radius: ${s.btnRadius}px;`);
      lines.push("  padding: 10px 20px;");
      lines.push("  font-family: inherit;");
      lines.push("  font-size: 0.85rem;");
      lines.push("  font-weight: 600;");
      lines.push("  cursor: pointer;");
      if (s.btnFull) lines.push("  width: 100%;");
      lines.push("  transition: opacity 0.2s ease;");
      lines.push("}");

      lines.push("");
      lines.push(".card-btn:hover {");
      lines.push("  opacity: 0.85;");
      lines.push("}");
    }

    return lines.join("\n");
  }

  // ── Generate HTML string ──
  function generateHTML(s) {
    const lines = [];
    lines.push('<div class="card">');

    const imgTag = s.imageUrl
      ? `  <img class="card-image" src="${escHtml(s.imageUrl)}" alt="${escHtml(s.title)}">`
      : null;

    if (imgTag && s.imgPos !== "overlay" && s.layout === "vertical") {
      lines.push(imgTag);
    }
    if (imgTag && s.layout === "horizontal" && s.imgPos !== "right") {
      lines.push(imgTag);
    }
    if (imgTag && s.imgPos === "overlay") {
      lines.push(imgTag);
    }

    lines.push('  <div class="card-body">');
    if (s.tags.length) {
      lines.push('    <div class="card-tags">');
      s.tags.forEach((t) => lines.push(`      <span class="card-tag">${escHtml(t)}</span>`));
      lines.push("    </div>");
    }
    lines.push(`    <h3 class="card-title">${escHtml(s.title)}</h3>`);
    lines.push(`    <p class="card-desc">${escHtml(s.desc)}</p>`);
    if (s.btnText) {
      lines.push(`    <button class="card-btn">${escHtml(s.btnText)}</button>`);
    }
    lines.push("  </div>");

    if (imgTag && s.layout === "horizontal" && s.imgPos === "right") {
      lines.push(imgTag);
    }

    lines.push("</div>");
    return lines.join("\n");
  }

  function escHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ── Render preview ──
  function render() {
    const s = getState();
    const html = generateHTML(s);
    const css = generateCSS(s);

    // Build preview
    const previewHTML = `<style>${css.replace(/\.card/g, ".card-preview")}</style>${html.replace(/class="card/g, 'class="card-preview')}`;
    els.previewCanvas.innerHTML = previewHTML;

    // Code output
    if (activeTab === "html") {
      els.codeOutput.textContent = generateHTML(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    } else {
      els.codeOutput.textContent = css;
    }
  }

  // ── Code tabs ──
  document.querySelectorAll(".code-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".code-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      activeTab = tab.dataset.tab;
      render();
    });
  });

  // ── Copy button ──
  els.copyBtn.addEventListener("click", () => {
    const s = getState();
    let text;
    if (activeTab === "html") {
      text = generateHTML(s).replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
    } else {
      text = generateCSS(s);
    }

    navigator.clipboard.writeText(text).then(() => {
      els.toast.classList.add("show");
      setTimeout(() => els.toast.classList.remove("show"), 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      els.toast.classList.add("show");
      setTimeout(() => els.toast.classList.remove("show"), 2000);
    });
  });

  // ── Bind all inputs ──
  const allInputs = document.querySelectorAll(".controls input, .controls textarea, .controls select");
  allInputs.forEach((el) => {
    const event = el.type === "range" ? "input" : (el.tagName === "SELECT" ? "change" : "input");
    el.addEventListener(event, () => {
      activePreset = null;
      document.querySelectorAll(".preset-btn").forEach((b) => b.classList.remove("active"));
      updateOutputs();
      render();
    });
  });

  // ── Init ──
  updateVisibility();
  updateOutputs();
  render();
})();
