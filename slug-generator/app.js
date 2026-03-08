(function () {
  'use strict';

  // --- Transliteration map ---
  const TRANSLITERATION = {
    'a': 'a','b': 'b','c': 'c','d': 'd','e': 'e','f': 'f','g': 'g',
    'h': 'h','i': 'i','j': 'j','k': 'k','l': 'l','m': 'm','n': 'n',
    'o': 'o','p': 'p','q': 'q','r': 'r','s': 's','t': 't','u': 'u',
    'v': 'v','w': 'w','x': 'x','y': 'y','z': 'z',
    '\u00e0': 'a', '\u00e1': 'a', '\u00e2': 'a', '\u00e3': 'a', '\u00e4': 'a', '\u00e5': 'a', '\u00e6': 'ae',
    '\u00e7': 'c', '\u00e8': 'e', '\u00e9': 'e', '\u00ea': 'e', '\u00eb': 'e',
    '\u00ec': 'i', '\u00ed': 'i', '\u00ee': 'i', '\u00ef': 'i',
    '\u00f0': 'd', '\u00f1': 'n',
    '\u00f2': 'o', '\u00f3': 'o', '\u00f4': 'o', '\u00f5': 'o', '\u00f6': 'o', '\u00f8': 'o',
    '\u00f9': 'u', '\u00fa': 'u', '\u00fb': 'u', '\u00fc': 'u',
    '\u00fd': 'y', '\u00fe': 'th', '\u00ff': 'y',
    '\u0100': 'a', '\u0101': 'a', '\u0102': 'a', '\u0103': 'a',
    '\u0104': 'a', '\u0105': 'a', '\u0106': 'c', '\u0107': 'c',
    '\u0108': 'c', '\u0109': 'c', '\u010a': 'c', '\u010b': 'c',
    '\u010c': 'c', '\u010d': 'c', '\u010e': 'd', '\u010f': 'd',
    '\u0110': 'd', '\u0111': 'd', '\u0112': 'e', '\u0113': 'e',
    '\u0116': 'e', '\u0117': 'e', '\u0118': 'e', '\u0119': 'e',
    '\u011a': 'e', '\u011b': 'e', '\u011c': 'g', '\u011d': 'g',
    '\u011e': 'g', '\u011f': 'g', '\u0120': 'g', '\u0121': 'g',
    '\u0122': 'g', '\u0123': 'g', '\u0124': 'h', '\u0125': 'h',
    '\u0128': 'i', '\u0129': 'i', '\u012a': 'i', '\u012b': 'i',
    '\u012e': 'i', '\u012f': 'i', '\u0130': 'i', '\u0131': 'i',
    '\u0134': 'j', '\u0135': 'j', '\u0136': 'k', '\u0137': 'k',
    '\u0139': 'l', '\u013a': 'l', '\u013b': 'l', '\u013c': 'l',
    '\u013d': 'l', '\u013e': 'l', '\u0141': 'l', '\u0142': 'l',
    '\u0143': 'n', '\u0144': 'n', '\u0145': 'n', '\u0146': 'n',
    '\u0147': 'n', '\u0148': 'n',
    '\u014c': 'o', '\u014d': 'o', '\u0150': 'o', '\u0151': 'o',
    '\u0152': 'oe', '\u0153': 'oe',
    '\u0154': 'r', '\u0155': 'r', '\u0158': 'r', '\u0159': 'r',
    '\u015a': 's', '\u015b': 's', '\u015c': 's', '\u015d': 's',
    '\u015e': 's', '\u015f': 's', '\u0160': 's', '\u0161': 's',
    '\u0162': 't', '\u0163': 't', '\u0164': 't', '\u0165': 't',
    '\u0168': 'u', '\u0169': 'u', '\u016a': 'u', '\u016b': 'u',
    '\u016c': 'u', '\u016d': 'u', '\u016e': 'u', '\u016f': 'u',
    '\u0170': 'u', '\u0171': 'u', '\u0172': 'u', '\u0173': 'u',
    '\u0174': 'w', '\u0175': 'w', '\u0176': 'y', '\u0177': 'y',
    '\u0178': 'y', '\u0179': 'z', '\u017a': 'z', '\u017b': 'z',
    '\u017c': 'z', '\u017d': 'z', '\u017e': 'z',
    '\u00df': 'ss',
    '\u0027': '', '\u2019': '', '\u2018': '', '\u201c': '', '\u201d': '',
  };

  // --- DOM Elements ---
  const $ = (sel) => document.querySelector(sel);
  const textInput = $('#text-input');
  const bulkInput = $('#bulk-input');
  const charCount = $('#char-count');
  const slugOutput = $('#slug-output');
  const copyBtn = $('#copy-btn');
  const bulkOutputEl = $('#bulk-output');
  const urlPreview = $('#url-preview');
  const historyList = $('#history-list');
  const clearHistoryBtn = $('#clear-history');
  const toastContainer = $('#toast-container');
  const separatorSelect = $('#separator');
  const maxLengthInput = $('#max-length');
  const lowercaseToggle = $('#lowercase-toggle');
  const transliterateToggle = $('#transliterate-toggle');
  const modeBtns = document.querySelectorAll('.mode-btn');

  // --- State ---
  let mode = 'single';
  let history = [];

  // --- Slugify ---
  function transliterate(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
      const ch = str[i].toLowerCase();
      if (TRANSLITERATION[ch] !== undefined) {
        result += TRANSLITERATION[ch];
      } else {
        result += str[i];
      }
    }
    return result;
  }

  function generateSlug(text) {
    if (!text || !text.trim()) return '';

    const sep = separatorSelect.value;
    const maxLen = parseInt(maxLengthInput.value) || 0;
    const doLower = lowercaseToggle.classList.contains('active');
    const doTransliterate = transliterateToggle.classList.contains('active');

    let slug = text.trim();

    if (doTransliterate) {
      slug = transliterate(slug);
    }

    if (doLower) {
      slug = slug.toLowerCase();
    }

    // Replace ampersand with 'and'
    slug = slug.replace(/&/g, sep + 'and' + sep);

    // Remove anything that's not alphanumeric, space, or separator
    const sepRegex = new RegExp('[^a-zA-Z0-9\\s\\' + sep + ']', 'g');
    slug = slug.replace(sepRegex, '');

    // Replace whitespace and repeated separators with single separator
    slug = slug.replace(/\s+/g, sep);
    const escapedSep = sep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    slug = slug.replace(new RegExp(escapedSep + '+', 'g'), sep);

    // Trim separator from start and end
    slug = slug.replace(new RegExp('^' + escapedSep + '+|' + escapedSep + '+$', 'g'), '');

    // Apply max length
    if (maxLen > 0 && slug.length > maxLen) {
      slug = slug.substring(0, maxLen);
      // Don't end on a separator
      slug = slug.replace(new RegExp(escapedSep + '+$', 'g'), '');
    }

    return slug;
  }

  // --- Toast ---
  function showToast(message, type) {
    type = type || 'info';
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('removing');
      setTimeout(function () { toast.remove(); }, 200);
    }, 2400);
  }

  // --- Clipboard ---
  function copyToClipboard(text) {
    if (!text) {
      showToast('Nothing to copy', 'error');
      return;
    }
    navigator.clipboard.writeText(text).then(function () {
      showToast('Copied to clipboard', 'success');
    }).catch(function () {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Copied to clipboard', 'success');
      } catch (e) {
        showToast('Failed to copy', 'error');
      }
      document.body.removeChild(ta);
    });
  }

  // --- History ---
  function addToHistory(source, slug) {
    if (!slug) return;
    // Avoid duplicates at the top
    if (history.length > 0 && history[0].slug === slug) return;

    history.unshift({ source: source, slug: slug });
    if (history.length > 20) history.pop();
    renderHistory();
  }

  function renderHistory() {
    if (history.length === 0) {
      historyList.innerHTML = '<p class="history-empty">No slugs generated yet</p>';
      return;
    }

    historyList.innerHTML = '';
    history.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'history-item';

      var sourceSpan = document.createElement('span');
      sourceSpan.className = 'history-source';
      sourceSpan.textContent = item.source;
      sourceSpan.title = item.source;

      var slugSpan = document.createElement('span');
      slugSpan.className = 'history-slug';
      slugSpan.textContent = item.slug;

      var copyItemBtn = document.createElement('button');
      copyItemBtn.className = 'history-copy-btn';
      copyItemBtn.title = 'Copy';
      copyItemBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

      copyItemBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        copyToClipboard(item.slug);
      });

      div.addEventListener('click', function () {
        if (mode === 'single') {
          textInput.value = item.source;
          update();
        }
      });

      div.appendChild(sourceSpan);
      div.appendChild(slugSpan);
      div.appendChild(copyItemBtn);
      historyList.appendChild(div);
    });
  }

  // --- Update ---
  function update() {
    if (mode === 'single') {
      var text = textInput.value;
      charCount.textContent = text.length + ' char' + (text.length !== 1 ? 's' : '');

      var slug = generateSlug(text);
      if (slug) {
        slugOutput.textContent = slug;
        slugOutput.classList.remove('empty');
        urlPreview.innerHTML = 'example.com/<strong>' + escapeHtml(slug) + '</strong>';
      } else {
        slugOutput.textContent = 'your-slug-here';
        slugOutput.classList.add('empty');
        urlPreview.innerHTML = 'example.com/<strong>your-slug-here</strong>';
      }
    } else {
      // Bulk mode
      var lines = bulkInput.value.split('\n').filter(function (l) { return l.trim(); });
      bulkOutputEl.innerHTML = '';

      if (lines.length === 0) {
        bulkOutputEl.classList.add('hidden');
        slugOutput.textContent = 'your-slug-here';
        slugOutput.classList.add('empty');
        urlPreview.innerHTML = 'example.com/<strong>your-slug-here</strong>';
        return;
      }

      bulkOutputEl.classList.remove('hidden');
      var firstSlug = '';

      lines.forEach(function (line) {
        var slug = generateSlug(line);
        if (!firstSlug && slug) firstSlug = slug;

        var item = document.createElement('div');
        item.className = 'bulk-output-item';

        var sourceSpan = document.createElement('span');
        sourceSpan.className = 'source';
        sourceSpan.textContent = line.trim();
        sourceSpan.title = line.trim();

        var slugSpan = document.createElement('span');
        slugSpan.className = 'slug';
        slugSpan.textContent = slug || '(empty)';

        var copyItemBtn = document.createElement('button');
        copyItemBtn.className = 'copy-item-btn';
        copyItemBtn.title = 'Copy';
        copyItemBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

        (function (s) {
          copyItemBtn.addEventListener('click', function () { copyToClipboard(s); });
        })(slug);

        item.appendChild(sourceSpan);
        item.appendChild(slugSpan);
        item.appendChild(copyItemBtn);
        bulkOutputEl.appendChild(item);
      });

      if (firstSlug) {
        slugOutput.textContent = firstSlug;
        slugOutput.classList.remove('empty');
        urlPreview.innerHTML = 'example.com/<strong>' + escapeHtml(firstSlug) + '</strong>';
      } else {
        slugOutput.textContent = 'your-slug-here';
        slugOutput.classList.add('empty');
        urlPreview.innerHTML = 'example.com/<strong>your-slug-here</strong>';
      }
    }
  }

  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  // --- Debounced history addition ---
  var historyTimer = null;
  function scheduleHistoryAdd() {
    clearTimeout(historyTimer);
    historyTimer = setTimeout(function () {
      if (mode === 'single') {
        var text = textInput.value.trim();
        var slug = generateSlug(text);
        addToHistory(text, slug);
      } else {
        var lines = bulkInput.value.split('\n').filter(function (l) { return l.trim(); });
        lines.forEach(function (line) {
          addToHistory(line.trim(), generateSlug(line));
        });
      }
    }, 800);
  }

  // --- Event Listeners ---
  textInput.addEventListener('input', function () {
    update();
    scheduleHistoryAdd();
  });

  bulkInput.addEventListener('input', function () {
    update();
    scheduleHistoryAdd();
  });

  separatorSelect.addEventListener('change', update);
  maxLengthInput.addEventListener('input', update);

  lowercaseToggle.addEventListener('click', function () {
    this.classList.toggle('active');
    this.setAttribute('aria-checked', this.classList.contains('active'));
    update();
  });

  transliterateToggle.addEventListener('click', function () {
    this.classList.toggle('active');
    this.setAttribute('aria-checked', this.classList.contains('active'));
    update();
  });

  copyBtn.addEventListener('click', function () {
    if (mode === 'single') {
      var slug = generateSlug(textInput.value);
      copyToClipboard(slug);
    } else {
      var lines = bulkInput.value.split('\n').filter(function (l) { return l.trim(); });
      var slugs = lines.map(function (l) { return generateSlug(l); }).filter(Boolean);
      copyToClipboard(slugs.join('\n'));
      if (slugs.length > 1) {
        showToast('Copied ' + slugs.length + ' slugs', 'success');
      }
    }
  });

  clearHistoryBtn.addEventListener('click', function () {
    history = [];
    renderHistory();
    showToast('History cleared', 'info');
  });

  // Mode switching
  modeBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      modeBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      mode = btn.dataset.mode;

      if (mode === 'single') {
        textInput.parentElement.classList.remove('hidden');
        textInput.classList.remove('hidden');
        charCount.classList.remove('hidden');
        bulkInput.classList.add('hidden');
        bulkOutputEl.classList.add('hidden');
      } else {
        textInput.parentElement.classList.add('hidden');
        bulkInput.classList.remove('hidden');
        bulkOutputEl.classList.remove('hidden');
      }

      update();
    });
  });

  // Init
  update();
  renderHistory();
})();
