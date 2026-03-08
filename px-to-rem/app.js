(() => {
  "use strict";

  // ── DOM refs ──
  const $ = (sel) => document.querySelector(sel);
  const baseSlider = $("#baseSlider");
  const baseValue = $("#baseValue");
  const pxInput = $("#pxInput");
  const remInput = $("#remInput");
  const emInput = $("#emInput");
  const ptInput = $("#ptInput");
  const vhInput = $("#vhInput");
  const vwInput = $("#vwInput");
  const cssInput = $("#cssInput");
  const cssOutput = $("#cssOutput");
  const copyCssOutput = $("#copyCssOutput");
  const tableBody = document.querySelector("#conversionTable tbody");
  const toastContainer = $("#toastContainer");

  const TABLE_PX = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 80, 96];

  // ── Helpers ──
  function getBase() {
    return parseFloat(baseSlider.value) || 16;
  }

  function round(n, d = 4) {
    return parseFloat(n.toFixed(d));
  }

  function pxToRem(px) { return round(px / getBase()); }
  function remToPx(rem) { return round(rem * getBase()); }
  function pxToEm(px) { return round(px / getBase()); } // em ≈ rem when context = base
  function pxToPt(px) { return round(px * 0.75); }
  function pxToVh(px) { return round((px / window.innerHeight) * 100); }
  function pxToVw(px) { return round((px / window.innerWidth) * 100); }
  function ptToPx(pt) { return round(pt / 0.75); }
  function vhToPx(vh) { return round((vh / 100) * window.innerHeight); }
  function vwToPx(vw) { return round((vw / 100) * window.innerWidth); }

  // ── Toast ──
  function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.innerHTML = `<span class="toast-check">&check;</span> ${msg}`;
    toastContainer.appendChild(el);
    setTimeout(() => {
      el.classList.add("out");
      el.addEventListener("animationend", () => el.remove());
    }, 1800);
  }

  // ── Clipboard ──
  function copyText(text) {
    if (!text && text !== "0") return;
    navigator.clipboard.writeText(text).then(() => {
      toast(`Copied <strong>${text}</strong>`);
    }).catch(() => {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast(`Copied <strong>${text}</strong>`);
    });
  }

  // ── Update all units from a px value ──
  function updateFromPx(px, source) {
    if (source !== "px") pxInput.value = px === "" ? "" : px;
    if (source !== "rem") remInput.value = px === "" ? "" : pxToRem(parseFloat(px));
    if (source !== "em") emInput.value = px === "" ? "" : pxToEm(parseFloat(px));
    if (source !== "pt") ptInput.value = px === "" ? "" : pxToPt(parseFloat(px));
    if (source !== "vh") vhInput.value = px === "" ? "" : pxToVh(parseFloat(px));
    if (source !== "vw") vwInput.value = px === "" ? "" : pxToVw(parseFloat(px));
  }

  // ── Input handlers ──
  function onInput(e) {
    const id = e.target.id;
    const val = e.target.value.trim();

    if (val === "" || isNaN(parseFloat(val))) {
      updateFromPx("", id);
      return;
    }

    const num = parseFloat(val);
    let px;

    switch (id) {
      case "pxInput": px = num; break;
      case "remInput": px = remToPx(num); break;
      case "emInput": px = remToPx(num); break; // em treated same as rem at base
      case "ptInput": px = ptToPx(num); break;
      case "vhInput": px = vhToPx(num); break;
      case "vwInput": px = vwToPx(num); break;
      default: return;
    }

    updateFromPx(round(px), id);
  }

  [pxInput, remInput, emInput, ptInput, vhInput, vwInput].forEach((input) => {
    input.addEventListener("input", onInput);
  });

  // ── Base slider ──
  baseSlider.addEventListener("input", () => {
    baseValue.textContent = baseSlider.value;
    // Re-derive from whatever field has a value, prefer px
    if (pxInput.value !== "") {
      updateFromPx(pxInput.value, "px");
    }
    buildTable();
  });

  // ── Copy buttons ──
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);
      if (target && target.value) copyText(target.value);
    });
  });

  // ── Conversion Table ──
  function buildTable() {
    tableBody.innerHTML = "";
    TABLE_PX.forEach((px) => {
      const tr = document.createElement("tr");
      const rem = pxToRem(px);
      const em = pxToEm(px);
      const pt = pxToPt(px);

      const cells = [
        { val: px, unit: "px" },
        { val: rem, unit: "rem" },
        { val: em, unit: "em" },
        { val: pt, unit: "pt" },
      ];

      cells.forEach((c) => {
        const td = document.createElement("td");
        td.textContent = c.val;
        td.title = `Click to copy ${c.val}${c.unit}`;
        td.addEventListener("click", () => copyText(`${c.val}`));
        tr.appendChild(td);
      });

      tableBody.appendChild(tr);
    });
  }

  buildTable();

  // ── CSS Block Converter ──
  function convertCssBlock(css) {
    const base = getBase();
    return css.replace(/(\d*\.?\d+)\s*px/g, (match, num) => {
      const val = parseFloat(num);
      if (val === 0) return "0";
      return round(val / base) + "rem";
    });
  }

  cssInput.addEventListener("input", () => {
    const val = cssInput.value;
    cssOutput.value = val ? convertCssBlock(val) : "";
  });

  copyCssOutput.addEventListener("click", () => {
    const text = cssOutput.value;
    if (text) copyText(text);
  });

  // ── Recalc vh/vw on resize ──
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (pxInput.value !== "") {
        updateFromPx(pxInput.value, "px");
      }
    }, 150);
  });
})();
