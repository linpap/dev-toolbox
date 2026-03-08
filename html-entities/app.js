(function () {
  'use strict';

  // ── DOM refs ──
  const inputArea = document.getElementById('input-area');
  const outputArea = document.getElementById('output-area');
  const inputCount = document.getElementById('input-count');
  const outputCount = document.getElementById('output-count');
  const btnEncode = document.getElementById('btn-encode');
  const btnDecode = document.getElementById('btn-decode');
  const btnSwap = document.getElementById('btn-swap');
  const btnClear = document.getElementById('btn-clear');
  const btnCopy = document.getElementById('btn-copy');
  const optRealtime = document.getElementById('opt-realtime');
  const entitySearch = document.getElementById('entity-search');
  const entityTableBody = document.querySelector('#entity-table tbody');
  const toastContainer = document.getElementById('toast-container');

  // ── Entity encoding / decoding ──
  const ENCODE_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '\u00A0': '&nbsp;',
  };

  function encodeEntities(str) {
    return str.replace(/[&<>"'\u00A0]/g, function (ch) {
      return ENCODE_MAP[ch] || ch;
    });
  }

  function decodeEntities(str) {
    const el = document.createElement('textarea');
    el.innerHTML = str;
    return el.value;
  }

  // ── Actions ──
  function doEncode() {
    const val = inputArea.value;
    if (!val) {
      outputArea.value = '';
      updateCounts();
      return;
    }
    outputArea.value = encodeEntities(val);
    updateCounts();
  }

  function doDecode() {
    const val = inputArea.value;
    if (!val) {
      outputArea.value = '';
      updateCounts();
      return;
    }
    outputArea.value = decodeEntities(val);
    updateCounts();
  }

  function updateCounts() {
    const ic = inputArea.value.length;
    const oc = outputArea.value.length;
    inputCount.textContent = ic + (ic === 1 ? ' char' : ' chars');
    outputCount.textContent = oc + (oc === 1 ? ' char' : ' chars');
  }

  btnEncode.addEventListener('click', function () {
    doEncode();
    showToast('Encoded successfully', 'success');
  });

  btnDecode.addEventListener('click', function () {
    doDecode();
    showToast('Decoded successfully', 'success');
  });

  btnSwap.addEventListener('click', function () {
    var tmp = inputArea.value;
    inputArea.value = outputArea.value;
    outputArea.value = tmp;
    updateCounts();
    showToast('Swapped', 'success');
  });

  btnClear.addEventListener('click', function () {
    inputArea.value = '';
    outputArea.value = '';
    updateCounts();
    showToast('Cleared', 'success');
  });

  btnCopy.addEventListener('click', function () {
    var text = outputArea.value;
    if (!text) {
      showToast('Nothing to copy', 'error');
      return;
    }
    copyToClipboard(text).then(function () {
      showToast('Copied to clipboard', 'success');
    });
  });

  // Real-time encoding on input
  inputArea.addEventListener('input', function () {
    if (optRealtime.checked) {
      doEncode();
    }
    updateCounts();
  });

  // ── Clipboard helper ──
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      resolve();
    });
  }

  // ── Toast ──
  function showToast(message, type) {
    var toast = document.createElement('div');
    toast.className = 'toast toast-' + (type || 'success');
    toast.innerHTML =
      '<span class="toast-icon">' + (type === 'error' ? '!' : '\u2713') + '</span>' +
      '<span>' + message + '</span>';
    toastContainer.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', function () {
        toast.remove();
      });
    }, 2200);
  }

  // ── Entity reference table ──
  var ENTITIES = [
    // Essentials
    { char: '&', entity: '&amp;', code: '&#38;', desc: 'Ampersand' },
    { char: '<', entity: '&lt;', code: '&#60;', desc: 'Less than' },
    { char: '>', entity: '&gt;', code: '&#62;', desc: 'Greater than' },
    { char: '"', entity: '&quot;', code: '&#34;', desc: 'Double quote' },
    { char: "'", entity: '&apos;', code: '&#39;', desc: 'Single quote / Apostrophe' },
    { char: '\u00A0', entity: '&nbsp;', code: '&#160;', desc: 'Non-breaking space' },

    // Punctuation & typographic
    { char: '\u2014', entity: '&mdash;', code: '&#8212;', desc: 'Em dash' },
    { char: '\u2013', entity: '&ndash;', code: '&#8211;', desc: 'En dash' },
    { char: '\u2026', entity: '&hellip;', code: '&#8230;', desc: 'Horizontal ellipsis' },
    { char: '\u2018', entity: '&lsquo;', code: '&#8216;', desc: 'Left single quote' },
    { char: '\u2019', entity: '&rsquo;', code: '&#8217;', desc: 'Right single quote' },
    { char: '\u201C', entity: '&ldquo;', code: '&#8220;', desc: 'Left double quote' },
    { char: '\u201D', entity: '&rdquo;', code: '&#8221;', desc: 'Right double quote' },
    { char: '\u00AB', entity: '&laquo;', code: '&#171;', desc: 'Left guillemet' },
    { char: '\u00BB', entity: '&raquo;', code: '&#187;', desc: 'Right guillemet' },
    { char: '\u2022', entity: '&bull;', code: '&#8226;', desc: 'Bullet' },
    { char: '\u00B7', entity: '&middot;', code: '&#183;', desc: 'Middle dot' },

    // Legal / symbols
    { char: '\u00A9', entity: '&copy;', code: '&#169;', desc: 'Copyright' },
    { char: '\u00AE', entity: '&reg;', code: '&#174;', desc: 'Registered' },
    { char: '\u2122', entity: '&trade;', code: '&#8482;', desc: 'Trademark' },
    { char: '\u00A7', entity: '&sect;', code: '&#167;', desc: 'Section sign' },
    { char: '\u00B6', entity: '&para;', code: '&#182;', desc: 'Paragraph / pilcrow' },
    { char: '\u2020', entity: '&dagger;', code: '&#8224;', desc: 'Dagger' },
    { char: '\u2021', entity: '&Dagger;', code: '&#8225;', desc: 'Double dagger' },

    // Currency
    { char: '\u00A2', entity: '&cent;', code: '&#162;', desc: 'Cent' },
    { char: '\u00A3', entity: '&pound;', code: '&#163;', desc: 'Pound sterling' },
    { char: '\u00A5', entity: '&yen;', code: '&#165;', desc: 'Yen / Yuan' },
    { char: '\u20AC', entity: '&euro;', code: '&#8364;', desc: 'Euro' },
    { char: '\u20B9', entity: '&#8377;', code: '&#8377;', desc: 'Indian rupee' },

    // Math
    { char: '\u00D7', entity: '&times;', code: '&#215;', desc: 'Multiplication' },
    { char: '\u00F7', entity: '&divide;', code: '&#247;', desc: 'Division' },
    { char: '\u00B1', entity: '&plusmn;', code: '&#177;', desc: 'Plus-minus' },
    { char: '\u2260', entity: '&ne;', code: '&#8800;', desc: 'Not equal' },
    { char: '\u2264', entity: '&le;', code: '&#8804;', desc: 'Less than or equal' },
    { char: '\u2265', entity: '&ge;', code: '&#8805;', desc: 'Greater than or equal' },
    { char: '\u221A', entity: '&radic;', code: '&#8730;', desc: 'Square root' },
    { char: '\u221E', entity: '&infin;', code: '&#8734;', desc: 'Infinity' },
    { char: '\u2248', entity: '&asymp;', code: '&#8776;', desc: 'Almost equal' },
    { char: '\u00B2', entity: '&sup2;', code: '&#178;', desc: 'Superscript 2' },
    { char: '\u00B3', entity: '&sup3;', code: '&#179;', desc: 'Superscript 3' },
    { char: '\u00BD', entity: '&frac12;', code: '&#189;', desc: 'Fraction one-half' },
    { char: '\u00BC', entity: '&frac14;', code: '&#188;', desc: 'Fraction one-quarter' },
    { char: '\u00BE', entity: '&frac34;', code: '&#190;', desc: 'Fraction three-quarters' },
    { char: '\u00B0', entity: '&deg;', code: '&#176;', desc: 'Degree' },
    { char: '\u03C0', entity: '&pi;', code: '&#960;', desc: 'Pi' },
    { char: '\u2211', entity: '&sum;', code: '&#8721;', desc: 'Summation' },
    { char: '\u220F', entity: '&prod;', code: '&#8719;', desc: 'Product' },
    { char: '\u222B', entity: '&int;', code: '&#8747;', desc: 'Integral' },
    { char: '\u2202', entity: '&part;', code: '&#8706;', desc: 'Partial differential' },
    { char: '\u00AC', entity: '&not;', code: '&#172;', desc: 'Not sign' },
    { char: '\u2227', entity: '&and;', code: '&#8743;', desc: 'Logical AND' },
    { char: '\u2228', entity: '&or;', code: '&#8744;', desc: 'Logical OR' },

    // Arrows
    { char: '\u2190', entity: '&larr;', code: '&#8592;', desc: 'Left arrow' },
    { char: '\u2191', entity: '&uarr;', code: '&#8593;', desc: 'Up arrow' },
    { char: '\u2192', entity: '&rarr;', code: '&#8594;', desc: 'Right arrow' },
    { char: '\u2193', entity: '&darr;', code: '&#8595;', desc: 'Down arrow' },
    { char: '\u2194', entity: '&harr;', code: '&#8596;', desc: 'Left-right arrow' },
    { char: '\u21D0', entity: '&lArr;', code: '&#8656;', desc: 'Left double arrow' },
    { char: '\u21D2', entity: '&rArr;', code: '&#8658;', desc: 'Right double arrow' },
    { char: '\u21D4', entity: '&hArr;', code: '&#8660;', desc: 'Left-right double arrow' },

    // Misc
    { char: '\u2660', entity: '&spades;', code: '&#9824;', desc: 'Spade' },
    { char: '\u2663', entity: '&clubs;', code: '&#9827;', desc: 'Club' },
    { char: '\u2665', entity: '&hearts;', code: '&#9829;', desc: 'Heart' },
    { char: '\u2666', entity: '&diams;', code: '&#9830;', desc: 'Diamond' },
    { char: '\u2605', entity: '&#9733;', code: '&#9733;', desc: 'Black star' },
    { char: '\u2713', entity: '&#10003;', code: '&#10003;', desc: 'Check mark' },
    { char: '\u2717', entity: '&#10007;', code: '&#10007;', desc: 'Ballot X' },
    { char: '\u266A', entity: '&#9834;', code: '&#9834;', desc: 'Musical note' },
  ];

  function escapeHTML(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function buildTable(filter) {
    var lowerFilter = (filter || '').toLowerCase();
    var html = '';
    for (var i = 0; i < ENTITIES.length; i++) {
      var e = ENTITIES[i];
      var searchable = (e.char + ' ' + e.entity + ' ' + e.code + ' ' + e.desc).toLowerCase();
      if (lowerFilter && searchable.indexOf(lowerFilter) === -1) continue;
      html +=
        '<tr data-entity="' + escapeHTML(e.entity) + '">' +
        '<td class="entity-char">' + escapeHTML(e.char) + '</td>' +
        '<td class="entity-name">' + escapeHTML(e.entity) + '</td>' +
        '<td class="entity-code">' + escapeHTML(e.code) + '</td>' +
        '<td>' + escapeHTML(e.desc) + '</td>' +
        '</tr>';
    }
    entityTableBody.innerHTML = html || '<tr><td colspan="4" style="text-align:center;padding:20px;color:var(--text-muted)">No entities match your search</td></tr>';
  }

  entityTableBody.addEventListener('click', function (e) {
    var row = e.target.closest('tr');
    if (!row || !row.dataset.entity) return;
    copyToClipboard(row.dataset.entity).then(function () {
      showToast('Copied ' + row.dataset.entity, 'success');
    });
  });

  entitySearch.addEventListener('input', function () {
    buildTable(entitySearch.value);
  });

  // ── Init ──
  buildTable();
  updateCounts();
})();
