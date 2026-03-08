(function () {
  'use strict';

  // ---- DOM references ----
  const inputEditor = document.getElementById('inputEditor');
  const outputCode = document.getElementById('outputCode');
  const minifyBtn = document.getElementById('minifyBtn');
  const beautifyBtn = document.getElementById('beautifyBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const clearBtn = document.getElementById('clearBtn');
  const fileInput = document.getElementById('fileInput');
  const toast = document.getElementById('toast');

  const inputSizeEl = document.getElementById('inputSize');
  const outputSizeEl = document.getElementById('outputSize');
  const savingsEl = document.getElementById('savings');
  const lineCountEl = document.getElementById('lineCount');
  const funcCountEl = document.getElementById('funcCount');
  const inputLinesEl = document.getElementById('inputLines');
  const outputLinesEl = document.getElementById('outputLines');

  let currentOutput = '';

  // ---- Utilities ----

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function countLines(str) {
    if (!str) return 0;
    return str.split('\n').length;
  }

  function countFunctions(str) {
    if (!str) return 0;
    // Match function declarations, expressions, arrow functions, and methods
    const patterns = [
      /\bfunction\s+\w+\s*\(/g,           // function name(
      /\bfunction\s*\(/g,                  // function(
      /\w+\s*:\s*function\s*\(/g,          // key: function(
      /\w+\s*=\s*function\s*\(/g,          // var = function(
      /\w+\s*=\s*\([^)]*\)\s*=>/g,         // var = (...) =>
      /\w+\s*=\s*\w+\s*=>/g,              // var = x =>
      /\w+\s*\([^)]*\)\s*\{/g,            // method(params) {  (class methods)
    ];
    const seen = new Set();
    let count = 0;
    for (const pat of patterns) {
      let m;
      while ((m = pat.exec(str)) !== null) {
        // Deduplicate by position
        if (!seen.has(m.index)) {
          seen.add(m.index);
          count++;
        }
      }
    }
    return count;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('visible');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.remove('visible');
    }, 2000);
  }

  // ---- Minifier ----
  // Basic minifier: removes comments and unnecessary whitespace.
  // Does NOT rename variables or perform advanced optimizations.

  function minify(source) {
    var result = '';
    var i = 0;
    var len = source.length;

    while (i < len) {
      var ch = source[i];

      // String literals — preserve them exactly
      if (ch === '"' || ch === "'" || ch === '`') {
        var quote = ch;
        result += ch;
        i++;
        while (i < len) {
          var sc = source[i];
          if (sc === '\\') {
            result += sc;
            i++;
            if (i < len) {
              result += source[i];
              i++;
            }
            continue;
          }
          if (sc === quote) {
            result += sc;
            i++;
            break;
          }
          // Template literal: preserve ${...} contents
          if (quote === '`' && sc === '$' && i + 1 < len && source[i + 1] === '{') {
            result += sc;
            i++;
            result += source[i]; // {
            i++;
            var depth = 1;
            while (i < len && depth > 0) {
              if (source[i] === '{') depth++;
              if (source[i] === '}') depth--;
              if (depth > 0) {
                result += source[i];
              } else {
                result += source[i]; // closing }
              }
              i++;
            }
            continue;
          }
          result += sc;
          i++;
        }
        continue;
      }

      // Regex literals — basic detection
      if (ch === '/') {
        // Check for single-line comment
        if (i + 1 < len && source[i + 1] === '/') {
          // Skip until end of line
          i += 2;
          while (i < len && source[i] !== '\n') i++;
          continue;
        }
        // Check for multi-line comment
        if (i + 1 < len && source[i + 1] === '*') {
          i += 2;
          while (i < len) {
            if (source[i] === '*' && i + 1 < len && source[i + 1] === '/') {
              i += 2;
              break;
            }
            i++;
          }
          continue;
        }
        // Could be a regex literal — check if preceded by an operator or keyword context
        var prevNonSpace = result.length - 1;
        while (prevNonSpace >= 0 && (result[prevNonSpace] === ' ' || result[prevNonSpace] === '\t')) {
          prevNonSpace--;
        }
        var prevChar = prevNonSpace >= 0 ? result[prevNonSpace] : '';
        var isRegex = !prevChar || /[=(:,;!&|?{}\[+\-~^%<>*/\n]/.test(prevChar);

        if (isRegex) {
          result += ch;
          i++;
          while (i < len) {
            if (source[i] === '\\') {
              result += source[i];
              i++;
              if (i < len) {
                result += source[i];
                i++;
              }
              continue;
            }
            if (source[i] === '[') {
              result += source[i];
              i++;
              while (i < len && source[i] !== ']') {
                if (source[i] === '\\') {
                  result += source[i];
                  i++;
                  if (i < len) { result += source[i]; i++; }
                  continue;
                }
                result += source[i];
                i++;
              }
              if (i < len) { result += source[i]; i++; }
              continue;
            }
            if (source[i] === '/') {
              result += source[i];
              i++;
              // Regex flags
              while (i < len && /[gimsuy]/.test(source[i])) {
                result += source[i];
                i++;
              }
              break;
            }
            result += source[i];
            i++;
          }
          continue;
        }
      }

      // Whitespace collapsing
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        // Collapse all whitespace to a single space if needed
        while (i < len && (source[i] === ' ' || source[i] === '\t' || source[i] === '\n' || source[i] === '\r')) {
          i++;
        }
        // Check if space is needed (between two identifier-like chars)
        var lastChar = result.length > 0 ? result[result.length - 1] : '';
        var nextChar = i < len ? source[i] : '';
        if (needsSpace(lastChar, nextChar)) {
          result += ' ';
        }
        continue;
      }

      result += ch;
      i++;
    }

    return result.trim();
  }

  function needsSpace(left, right) {
    if (!left || !right) return false;
    var isIdentL = /[a-zA-Z0-9_$]/.test(left);
    var isIdentR = /[a-zA-Z0-9_$]/.test(right);
    // Space needed between two identifier characters
    if (isIdentL && isIdentR) return true;
    // Some operator combinations that need a space to avoid ambiguity
    // e.g., "return -1" needs space, but "x-1" doesn't
    // We keep it simple: space between ident chars only
    return false;
  }

  // ---- Beautifier ----

  function beautify(source) {
    // Simple beautifier: adds newlines and indentation around braces and semicolons
    var indent = 0;
    var result = '';
    var i = 0;
    var len = source.length;
    var indentStr = '  ';
    var newlinePending = false;

    function addNewline() {
      result += '\n';
      for (var j = 0; j < indent; j++) {
        result += indentStr;
      }
    }

    function trimTrailingSpaces() {
      while (result.length > 0 && (result[result.length - 1] === ' ' || result[result.length - 1] === '\t')) {
        result = result.slice(0, -1);
      }
    }

    while (i < len) {
      var ch = source[i];

      // String literals
      if (ch === '"' || ch === "'" || ch === '`') {
        if (newlinePending) { addNewline(); newlinePending = false; }
        var quote = ch;
        result += ch;
        i++;
        while (i < len) {
          var sc = source[i];
          if (sc === '\\') {
            result += sc; i++;
            if (i < len) { result += source[i]; i++; }
            continue;
          }
          result += sc;
          i++;
          if (sc === quote) break;
        }
        continue;
      }

      // Comments (re-add them in beautified output)
      if (ch === '/' && i + 1 < len) {
        if (source[i + 1] === '/') {
          if (newlinePending) { addNewline(); newlinePending = false; }
          while (i < len && source[i] !== '\n') {
            result += source[i]; i++;
          }
          if (i < len) { result += source[i]; i++; } // include \n
          for (var j = 0; j < indent; j++) result += indentStr;
          continue;
        }
        if (source[i + 1] === '*') {
          if (newlinePending) { addNewline(); newlinePending = false; }
          result += '/*';
          i += 2;
          while (i < len) {
            if (source[i] === '*' && i + 1 < len && source[i + 1] === '/') {
              result += '*/';
              i += 2;
              break;
            }
            result += source[i]; i++;
          }
          continue;
        }
      }

      // Regex literals
      if (ch === '/') {
        var prevIdx = result.length - 1;
        while (prevIdx >= 0 && (result[prevIdx] === ' ' || result[prevIdx] === '\t')) prevIdx--;
        var pc = prevIdx >= 0 ? result[prevIdx] : '';
        var maybeRegex = !pc || /[=(:,;!&|?{}\[+\-~^%<>*/\n]/.test(pc);
        if (maybeRegex) {
          if (newlinePending) { addNewline(); newlinePending = false; }
          result += ch; i++;
          while (i < len) {
            if (source[i] === '\\') {
              result += source[i]; i++;
              if (i < len) { result += source[i]; i++; }
              continue;
            }
            if (source[i] === '/') {
              result += source[i]; i++;
              while (i < len && /[gimsuy]/.test(source[i])) {
                result += source[i]; i++;
              }
              break;
            }
            result += source[i]; i++;
          }
          continue;
        }
      }

      if (ch === '{') {
        if (newlinePending) { newlinePending = false; }
        // Add space before { if the previous char isn't a space
        if (result.length > 0 && result[result.length - 1] !== ' ' && result[result.length - 1] !== '\n') {
          result += ' ';
        }
        result += '{';
        indent++;
        addNewline();
        i++;
        continue;
      }

      if (ch === '}') {
        newlinePending = false;
        trimTrailingSpaces();
        indent = Math.max(0, indent - 1);
        addNewline();
        result += '}';
        i++;
        // Check what follows: if it's else, catch, finally, etc. don't add newline
        var rest = source.slice(i).trimStart();
        if (/^(else|catch|finally)/.test(rest)) {
          result += ' ';
          // Skip whitespace in source
          while (i < len && (source[i] === ' ' || source[i] === '\t' || source[i] === '\n' || source[i] === '\r')) i++;
        } else {
          newlinePending = true;
        }
        continue;
      }

      if (ch === ';') {
        if (newlinePending) { newlinePending = false; }
        result += ';';
        i++;
        // Don't add newline if inside a for(;;) loop header
        var parenDepth = 0;
        var inFor = false;
        // Look backwards for 'for'
        var lookback = result.slice(Math.max(0, result.length - 200));
        var lastFor = lookback.lastIndexOf('for');
        if (lastFor !== -1) {
          var afterFor = lookback.slice(lastFor + 3);
          for (var ci = 0; ci < afterFor.length; ci++) {
            if (afterFor[ci] === '(') parenDepth++;
            if (afterFor[ci] === ')') parenDepth--;
          }
          if (parenDepth > 0) inFor = true;
        }
        if (!inFor) {
          newlinePending = true;
        } else {
          result += ' ';
        }
        continue;
      }

      // Skip extra whitespace
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        i++;
        // Add a single space if needed
        if (result.length > 0 && result[result.length - 1] !== ' ' && result[result.length - 1] !== '\n') {
          if (newlinePending) {
            // Don't add space, newline is pending
          } else {
            result += ' ';
          }
        }
        continue;
      }

      if (newlinePending) {
        addNewline();
        newlinePending = false;
      }

      result += ch;
      i++;
    }

    return result.trim();
  }

  // ---- Syntax Highlighting ----

  function highlight(code) {
    if (!code) return '';

    var tokens = [];
    var i = 0;
    var len = code.length;

    while (i < len) {
      var ch = code[i];

      // Multi-line comments
      if (ch === '/' && i + 1 < len && code[i + 1] === '*') {
        var start = i;
        i += 2;
        while (i < len && !(code[i] === '*' && i + 1 < len && code[i + 1] === '/')) i++;
        if (i < len) i += 2;
        tokens.push({ type: 'comment', value: code.slice(start, i) });
        continue;
      }

      // Single-line comments
      if (ch === '/' && i + 1 < len && code[i + 1] === '/') {
        var start = i;
        i += 2;
        while (i < len && code[i] !== '\n') i++;
        tokens.push({ type: 'comment', value: code.slice(start, i) });
        continue;
      }

      // Strings
      if (ch === '"' || ch === "'" || ch === '`') {
        var quote = ch;
        var start = i;
        i++;
        while (i < len) {
          if (code[i] === '\\') { i += 2; continue; }
          if (code[i] === quote) { i++; break; }
          i++;
        }
        tokens.push({ type: 'string', value: code.slice(start, i) });
        continue;
      }

      // Numbers
      if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < len && /[0-9]/.test(code[i + 1]))) {
        var start = i;
        if (ch === '0' && i + 1 < len && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
          i += 2;
          while (i < len && /[0-9a-fA-F_]/.test(code[i])) i++;
        } else if (ch === '0' && i + 1 < len && (code[i + 1] === 'b' || code[i + 1] === 'B')) {
          i += 2;
          while (i < len && /[01_]/.test(code[i])) i++;
        } else {
          while (i < len && /[0-9_.]/.test(code[i])) i++;
          if (i < len && (code[i] === 'e' || code[i] === 'E')) {
            i++;
            if (i < len && (code[i] === '+' || code[i] === '-')) i++;
            while (i < len && /[0-9]/.test(code[i])) i++;
          }
        }
        if (i < len && code[i] === 'n') i++; // BigInt
        tokens.push({ type: 'number', value: code.slice(start, i) });
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_$]/.test(ch)) {
        var start = i;
        while (i < len && /[a-zA-Z0-9_$]/.test(code[i])) i++;
        var word = code.slice(start, i);
        var keywords = [
          'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger',
          'default', 'delete', 'do', 'else', 'export', 'extends', 'finally',
          'for', 'function', 'if', 'import', 'in', 'instanceof', 'let', 'new',
          'of', 'return', 'static', 'super', 'switch', 'this', 'throw', 'try',
          'typeof', 'var', 'void', 'while', 'with', 'yield', 'async', 'await',
          'from', 'as', 'true', 'false', 'null', 'undefined'
        ];
        if (keywords.indexOf(word) !== -1) {
          tokens.push({ type: 'keyword', value: word });
        } else {
          // Check if followed by ( — then it's a function name
          var nextNonSpace = i;
          while (nextNonSpace < len && (code[nextNonSpace] === ' ' || code[nextNonSpace] === '\t')) nextNonSpace++;
          if (nextNonSpace < len && code[nextNonSpace] === '(') {
            tokens.push({ type: 'function', value: word });
          } else {
            tokens.push({ type: 'plain', value: word });
          }
        }
        continue;
      }

      // Brackets
      if ('()[]'.indexOf(ch) !== -1) {
        tokens.push({ type: 'bracket', value: ch });
        i++;
        continue;
      }

      if ('{}'.indexOf(ch) !== -1) {
        tokens.push({ type: 'bracket', value: ch });
        i++;
        continue;
      }

      // Operators
      if ('=+-*/<>!&|?:%^~'.indexOf(ch) !== -1) {
        var start = i;
        i++;
        // Grab multi-char operators
        while (i < len && '=+-*/<>!&|?:%^~'.indexOf(code[i]) !== -1) i++;
        tokens.push({ type: 'operator', value: code.slice(start, i) });
        continue;
      }

      // Everything else (punctuation, whitespace, etc.)
      tokens.push({ type: 'plain', value: ch });
      i++;
    }

    // Build HTML
    var html = '';
    for (var t = 0; t < tokens.length; t++) {
      var tok = tokens[t];
      var escaped = escapeHtml(tok.value);
      switch (tok.type) {
        case 'keyword':
          html += '<span class="syn-keyword">' + escaped + '</span>';
          break;
        case 'string':
          html += '<span class="syn-string">' + escaped + '</span>';
          break;
        case 'number':
          html += '<span class="syn-number">' + escaped + '</span>';
          break;
        case 'comment':
          html += '<span class="syn-comment">' + escaped + '</span>';
          break;
        case 'function':
          html += '<span class="syn-function">' + escaped + '</span>';
          break;
        case 'operator':
          html += '<span class="syn-operator">' + escaped + '</span>';
          break;
        case 'bracket':
          html += '<span class="syn-bracket">' + escaped + '</span>';
          break;
        default:
          html += escaped;
      }
    }
    return html;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ---- Stats ----

  function updateStats() {
    var input = inputEditor.value;
    var inputBytes = new Blob([input]).size;
    var outputBytes = new Blob([currentOutput]).size;

    inputSizeEl.textContent = formatBytes(inputBytes);
    outputSizeEl.textContent = formatBytes(outputBytes);

    if (inputBytes > 0 && outputBytes > 0) {
      var pct = ((1 - outputBytes / inputBytes) * 100);
      savingsEl.textContent = (pct >= 0 ? '' : '+') + pct.toFixed(1) + '%';
      savingsEl.style.color = pct >= 0 ? 'var(--green)' : 'var(--red)';
    } else {
      savingsEl.textContent = '0%';
      savingsEl.style.color = 'var(--green)';
    }

    var inLines = countLines(input);
    var outLines = countLines(currentOutput);
    lineCountEl.textContent = inLines + ' / ' + outLines;
    inputLinesEl.textContent = inLines + ' lines';
    outputLinesEl.textContent = outLines + ' lines';

    funcCountEl.textContent = countFunctions(input);
  }

  function setOutput(text) {
    currentOutput = text;
    outputCode.innerHTML = highlight(text);
    updateStats();
  }

  // ---- Event Handlers ----

  minifyBtn.addEventListener('click', function () {
    var input = inputEditor.value;
    if (!input.trim()) {
      showToast('Nothing to minify');
      return;
    }
    var result = minify(input);
    setOutput(result);
    showToast('Minified successfully');
  });

  beautifyBtn.addEventListener('click', function () {
    var input = inputEditor.value;
    if (!input.trim()) {
      showToast('Nothing to beautify');
      return;
    }
    var result = beautify(input);
    setOutput(result);
    showToast('Beautified successfully');
  });

  copyBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(currentOutput).then(function () {
      showToast('Copied to clipboard');
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = currentOutput;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard');
    });
  });

  downloadBtn.addEventListener('click', function () {
    if (!currentOutput) {
      showToast('Nothing to download');
      return;
    }
    var blob = new Blob([currentOutput], { type: 'application/javascript' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'output.min.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded output.min.js');
  });

  clearBtn.addEventListener('click', function () {
    inputEditor.value = '';
    currentOutput = '';
    outputCode.innerHTML = '';
    updateStats();
    showToast('Cleared');
  });

  fileInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (ev) {
      inputEditor.value = ev.target.result;
      updateStats();
      showToast('Loaded ' + file.name);
    };
    reader.readAsText(file);
    // Reset so same file can be re-uploaded
    fileInput.value = '';
  });

  inputEditor.addEventListener('input', function () {
    updateStats();
  });

  // Allow Tab key in textarea
  inputEditor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '  ' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
    }
  });

  // Initialize stats
  updateStats();
})();
