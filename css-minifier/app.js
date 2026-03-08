(() => {
  "use strict";

  // ── DOM refs ────────────────────────────────────────
  const $ = (s) => document.querySelector(s);
  const inputArea = $("#inputArea");
  const outputArea = $("#outputArea");
  const btnMinify = $("#btnMinify");
  const btnBeautify = $("#btnBeautify");
  const btnAuto = $("#btnAuto");
  const btnCopy = $("#btnCopy");
  const btnDownload = $("#btnDownload");
  const fileUpload = $("#fileUpload");
  const toastEl = $("#toast");

  const inputLines = $("#inputLines");
  const inputSize = $("#inputSize");
  const outputLines = $("#outputLines");
  const outputSize = $("#outputSize");
  const savingsEl = $("#savings");

  const statRules = $("#statRules");
  const statSelectors = $("#statSelectors");
  const statProperties = $("#statProperties");
  const statSize = $("#statSize");

  let currentOutput = "";
  let toastTimer = null;

  // ── Utilities ───────────────────────────────────────

  function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  }

  function byteSize(str) {
    return new Blob([str]).size;
  }

  function countLines(str) {
    if (!str) return 0;
    return str.split("\n").length;
  }

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    requestAnimationFrame(() => {
      toastEl.classList.add("show");
    });
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 300);
    }, 2200);
  }

  function isMinified(css) {
    if (!css.trim()) return false;
    const lines = css.trim().split("\n");
    if (lines.length <= 2 && css.length > 80) return true;
    const avgLen = css.length / lines.length;
    return avgLen > 200;
  }

  // ── CSS Minifier ────────────────────────────────────

  function minifyCSS(css) {
    let out = css;

    // Remove comments
    out = out.replace(/\/\*[\s\S]*?\*\//g, "");

    // Remove newlines and carriage returns
    out = out.replace(/\r\n|\r|\n/g, " ");

    // Collapse whitespace
    out = out.replace(/\s{2,}/g, " ");

    // Remove spaces around structural characters
    out = out.replace(/\s*{\s*/g, "{");
    out = out.replace(/\s*}\s*/g, "}");
    out = out.replace(/\s*;\s*/g, ";");
    out = out.replace(/\s*:\s*/g, ":");
    out = out.replace(/\s*,\s*/g, ",");

    // Remove trailing semicolons before closing braces
    out = out.replace(/;}/g, "}");

    // Trim
    out = out.trim();

    return out;
  }

  // ── CSS Beautifier ──────────────────────────────────

  function beautifyCSS(css) {
    let out = css.trim();

    // Ensure spacing around braces
    out = out.replace(/\s*\{\s*/g, " {\n");
    out = out.replace(/\s*\}\s*/g, "\n}\n\n");
    out = out.replace(/\s*;\s*/g, ";\n");

    // Indent properties inside blocks
    const lines = out.split("\n");
    const result = [];
    let depth = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) {
        // Keep one blank line between rule blocks, skip consecutive blanks
        if (result.length > 0 && result[result.length - 1] !== "") {
          result.push("");
        }
        continue;
      }

      // Closing brace: decrease depth before printing
      if (line === "}") {
        depth = Math.max(0, depth - 1);
        result.push("  ".repeat(depth) + line);
        continue;
      }

      // Line that contains opening brace
      if (line.endsWith("{")) {
        result.push("  ".repeat(depth) + line);
        depth++;
        continue;
      }

      // Regular property or at-rule content
      result.push("  ".repeat(depth) + line);
    }

    // Clean up trailing blank lines
    let final = result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return final + "\n";
  }

  // ── CSS Stats ───────────────────────────────────────

  function analyzeCSS(css) {
    // Remove comments for analysis
    const clean = css.replace(/\/\*[\s\S]*?\*\//g, "");

    // Count rules (top-level and nested blocks)
    const braceBlocks = clean.match(/\{[^{}]*\}/g);
    const ruleCount = braceBlocks ? braceBlocks.length : 0;

    // Count selectors: everything before { that isn't an @-rule content
    let selectorCount = 0;
    const selectorRegex = /([^{}@]+?)\s*\{/g;
    let m;
    while ((m = selectorRegex.exec(clean)) !== null) {
      const sel = m[1].trim();
      if (sel) {
        // Count comma-separated selectors
        selectorCount += sel.split(",").filter((s) => s.trim()).length;
      }
    }

    // Count properties (word-with-hyphens followed by colon inside blocks)
    let propCount = 0;
    if (braceBlocks) {
      for (const block of braceBlocks) {
        const props = block.match(/[\w-]+\s*:/g);
        if (props) propCount += props.length;
      }
    }

    return { rules: ruleCount, selectors: selectorCount, properties: propCount };
  }

  // ── Syntax Highlighting ─────────────────────────────

  function escapeHTML(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function highlightCSS(css) {
    // Tokenize and highlight CSS
    let result = "";
    let i = 0;
    const len = css.length;

    while (i < len) {
      // Comments
      if (css[i] === "/" && css[i + 1] === "*") {
        let end = css.indexOf("*/", i + 2);
        if (end === -1) end = len;
        else end += 2;
        result += '<span class="syn-comment">' + escapeHTML(css.slice(i, end)) + "</span>";
        i = end;
        continue;
      }

      // @-rules
      if (css[i] === "@") {
        let end = i + 1;
        while (end < len && css[end] !== "{" && css[end] !== ";" && css[end] !== "\n") end++;
        const atrule = css.slice(i, end);
        result += '<span class="syn-atrule">' + escapeHTML(atrule) + "</span>";
        i = end;
        continue;
      }

      // Strings
      if (css[i] === '"' || css[i] === "'") {
        const quote = css[i];
        let end = i + 1;
        while (end < len && css[end] !== quote) {
          if (css[end] === "\\") end++;
          end++;
        }
        if (end < len) end++;
        result += '<span class="syn-string">' + escapeHTML(css.slice(i, end)) + "</span>";
        i = end;
        continue;
      }

      // Braces
      if (css[i] === "{" || css[i] === "}") {
        result += '<span class="syn-brace">' + css[i] + "</span>";
        i++;
        continue;
      }

      // Semicolon
      if (css[i] === ";") {
        result += '<span class="syn-semi">;</span>';
        i++;
        continue;
      }

      // Detect property: value pairs (inside blocks)
      // Look for pattern:  property-name : value ;
      // We do a line-based approach for beautified CSS
      if (css[i] === "\n" || i === 0) {
        let start = css[i] === "\n" ? i + 1 : i;
        let lineEnd = css.indexOf("\n", start);
        if (lineEnd === -1) lineEnd = len;
        const line = css.slice(start, lineEnd);
        const trimmed = line.trim();

        // Property: value line
        const propMatch = trimmed.match(/^([\w-]+)(\s*:\s*)(.*?)(;?)$/);
        if (propMatch && !trimmed.startsWith("@") && !trimmed.endsWith("{") && trimmed !== "}") {
          const indent = line.match(/^(\s*)/)[1];
          if (css[i] === "\n") result += "\n";
          result += escapeHTML(indent);
          result += '<span class="syn-property">' + escapeHTML(propMatch[1]) + "</span>";
          result += '<span class="syn-colon">' + escapeHTML(propMatch[2]) + "</span>";
          result += '<span class="syn-value">' + escapeHTML(propMatch[3]) + "</span>";
          if (propMatch[4]) result += '<span class="syn-semi">;</span>';
          i = lineEnd;
          continue;
        }

        // Selector line (ends with { or just text before a brace)
        if (trimmed.endsWith("{")) {
          const indent = line.match(/^(\s*)/)[1];
          const selectorPart = trimmed.slice(0, -1).trimEnd();
          if (css[i] === "\n") result += "\n";
          result += escapeHTML(indent);
          result += '<span class="syn-selector">' + escapeHTML(selectorPart) + "</span>";
          result += " ";
          result += '<span class="syn-brace">{</span>';
          i = lineEnd;
          continue;
        }

        // Closing brace line
        if (trimmed === "}") {
          const indent = line.match(/^(\s*)/)[1];
          if (css[i] === "\n") result += "\n";
          result += escapeHTML(indent);
          result += '<span class="syn-brace">}</span>';
          i = lineEnd;
          continue;
        }

        // For minified CSS, we can still try to highlight inline
        if (trimmed.length > 0 && !trimmed.startsWith("@")) {
          // Attempt inline highlight for minified content
          if (css[i] === "\n") result += "\n";
          result += highlightInline(line);
          i = lineEnd;
          continue;
        }

        // Default: just output the character
        result += escapeHTML(css[i]);
        i++;
        continue;
      }

      // Default character
      result += escapeHTML(css[i]);
      i++;
    }

    return result;
  }

  function highlightInline(segment) {
    // For minified CSS, highlight selectors, properties, values inline
    let result = "";
    let i = 0;
    const len = segment.length;
    let inBlock = false;

    while (i < len) {
      if (segment[i] === "{") {
        result += '<span class="syn-brace">{</span>';
        inBlock = true;
        i++;
        continue;
      }
      if (segment[i] === "}") {
        result += '<span class="syn-brace">}</span>';
        inBlock = false;
        i++;
        continue;
      }
      if (segment[i] === ";") {
        result += '<span class="syn-semi">;</span>';
        i++;
        continue;
      }

      if (!inBlock) {
        // Selector
        let end = i;
        while (end < len && segment[end] !== "{") end++;
        result += '<span class="syn-selector">' + escapeHTML(segment.slice(i, end)) + "</span>";
        i = end;
      } else {
        // Property: value
        const colonPos = segment.indexOf(":", i);
        const semiPos = segment.indexOf(";", i);
        const bracePos = segment.indexOf("}", i);
        let end = len;
        if (semiPos !== -1) end = Math.min(end, semiPos);
        if (bracePos !== -1) end = Math.min(end, bracePos);

        if (colonPos !== -1 && colonPos < end) {
          result +=
            '<span class="syn-property">' + escapeHTML(segment.slice(i, colonPos)) + "</span>";
          result += '<span class="syn-colon">:</span>';
          result +=
            '<span class="syn-value">' + escapeHTML(segment.slice(colonPos + 1, end)) + "</span>";
        } else {
          result += escapeHTML(segment.slice(i, end));
        }
        i = end;
      }
    }
    return result;
  }

  // ── Update UI ───────────────────────────────────────

  function updateInputMeta() {
    const val = inputArea.value;
    inputLines.textContent = countLines(val) + " lines";
    inputSize.textContent = formatBytes(byteSize(val));
  }

  function updateOutput(css) {
    currentOutput = css;
    outputArea.innerHTML = highlightCSS(css);

    const outBytes = byteSize(css);
    const inBytes = byteSize(inputArea.value);

    outputLines.textContent = countLines(css) + " lines";
    outputSize.textContent = formatBytes(outBytes);

    if (inBytes > 0 && outBytes < inBytes) {
      const pct = (((inBytes - outBytes) / inBytes) * 100).toFixed(1);
      savingsEl.textContent = pct + "% saved";
      savingsEl.hidden = false;
      statSize.textContent = pct + "%";
    } else if (inBytes > 0 && outBytes >= inBytes) {
      const pct = (((outBytes - inBytes) / inBytes) * 100).toFixed(1);
      savingsEl.textContent = "+" + pct + "% size";
      savingsEl.hidden = false;
      statSize.textContent = "+" + pct + "%";
    } else {
      savingsEl.hidden = true;
      statSize.textContent = "--";
    }

    // Stats
    const stats = analyzeCSS(css || inputArea.value);
    statRules.textContent = stats.rules;
    statSelectors.textContent = stats.selectors;
    statProperties.textContent = stats.properties;

    // Enable/disable output actions
    const hasOutput = css.trim().length > 0;
    btnCopy.disabled = !hasOutput;
    btnDownload.disabled = !hasOutput;
  }

  // ── Event Handlers ──────────────────────────────────

  inputArea.addEventListener("input", updateInputMeta);

  // Allow tab key in textarea
  inputArea.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = inputArea.selectionStart;
      const end = inputArea.selectionEnd;
      inputArea.value =
        inputArea.value.substring(0, start) + "  " + inputArea.value.substring(end);
      inputArea.selectionStart = inputArea.selectionEnd = start + 2;
      updateInputMeta();
    }
  });

  btnMinify.addEventListener("click", () => {
    const css = inputArea.value.trim();
    if (!css) return showToast("No CSS input to minify");
    const result = minifyCSS(css);
    updateOutput(result);
    showToast("CSS minified successfully");
  });

  btnBeautify.addEventListener("click", () => {
    const css = inputArea.value.trim();
    if (!css) return showToast("No CSS input to beautify");
    const result = beautifyCSS(css);
    updateOutput(result);
    showToast("CSS beautified successfully");
  });

  btnAuto.addEventListener("click", () => {
    const css = inputArea.value.trim();
    if (!css) return showToast("No CSS input");
    if (isMinified(css)) {
      const result = beautifyCSS(css);
      updateOutput(result);
      showToast("Auto-detected minified CSS \u2192 Beautified");
    } else {
      const result = minifyCSS(css);
      updateOutput(result);
      showToast("Auto-detected formatted CSS \u2192 Minified");
    }
  });

  btnCopy.addEventListener("click", async () => {
    if (!currentOutput) return;
    try {
      await navigator.clipboard.writeText(currentOutput);
      showToast("Copied to clipboard");
    } catch {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = currentOutput;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      showToast("Copied to clipboard");
    }
  });

  btnDownload.addEventListener("click", () => {
    if (!currentOutput) return;
    const blob = new Blob([currentOutput], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.css";
    a.click();
    URL.revokeObjectURL(url);
    showToast("File downloaded");
  });

  fileUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      inputArea.value = ev.target.result;
      updateInputMeta();
      showToast('Loaded "' + file.name + '"');
    };
    reader.readAsText(file);
    // Reset so the same file can be uploaded again
    e.target.value = "";
  });

  // Initial meta update
  updateInputMeta();
})();
