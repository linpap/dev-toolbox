(function () {
  'use strict';

  // Elements
  const widthInput = document.getElementById('width');
  const heightInput = document.getElementById('height');
  const lockToggle = document.getElementById('lockToggle');
  const ratioValueEl = document.getElementById('ratioValue');
  const ratioDecimalEl = document.getElementById('ratioDecimal');
  const previewBox = document.getElementById('previewBox');
  const previewLabel = document.getElementById('previewLabel');
  const cssAspectRatio = document.getElementById('cssAspectRatio');
  const cssPadding = document.getElementById('cssPadding');
  const resTableBody = document.getElementById('resTableBody');
  const toast = document.getElementById('toast');
  const chips = document.querySelectorAll('.chip');

  // Compare elements
  const compareW1 = document.getElementById('compareW1');
  const compareH1 = document.getElementById('compareH1');
  const compareW2 = document.getElementById('compareW2');
  const compareH2 = document.getElementById('compareH2');
  const compareRatio1 = document.getElementById('compareRatio1');
  const compareRatio2 = document.getElementById('compareRatio2');
  const comparePreview1 = document.getElementById('comparePreview1');
  const comparePreview2 = document.getElementById('comparePreview2');

  // State
  let locked = false;
  let lockedRatioW = 16;
  let lockedRatioH = 9;
  let lastChanged = 'width';

  // Utility: GCD
  function gcd(a, b) {
    a = Math.abs(Math.round(a));
    b = Math.abs(Math.round(b));
    while (b) {
      var t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  // Simplify ratio
  function simplify(w, h) {
    if (w <= 0 || h <= 0) return { w: 0, h: 0 };
    var d = gcd(w, h);
    return { w: w / d, h: h / d };
  }

  // Format ratio string
  function ratioString(w, h) {
    var s = simplify(w, h);
    return s.w + ':' + s.h;
  }

  // Known resolution sets keyed by simplified ratio string
  var resolutions = {
    '1:1': [
      { name: 'Icon Small', w: 64, h: 64 },
      { name: 'Icon Medium', w: 256, h: 256 },
      { name: 'Instagram Post', w: 1080, h: 1080 },
      { name: 'Square 2K', w: 2048, h: 2048 },
      { name: 'Square 4K', w: 4096, h: 4096 },
    ],
    '4:3': [
      { name: 'VGA', w: 640, h: 480 },
      { name: 'SVGA', w: 800, h: 600 },
      { name: 'XGA', w: 1024, h: 768 },
      { name: 'UXGA', w: 1600, h: 1200 },
      { name: 'QXGA', w: 2048, h: 1536 },
    ],
    '16:9': [
      { name: 'nHD', w: 640, h: 360 },
      { name: 'HD', w: 1280, h: 720 },
      { name: 'Full HD', w: 1920, h: 1080 },
      { name: 'QHD', w: 2560, h: 1440 },
      { name: '4K UHD', w: 3840, h: 2160 },
      { name: '8K UHD', w: 7680, h: 4320 },
    ],
    '21:9': [
      { name: 'UWFHD', w: 2560, h: 1080 },
      { name: 'UWQHD', w: 3440, h: 1440 },
      { name: 'UW 4K', w: 5040, h: 2160 },
    ],
    '3:2': [
      { name: 'HVGA', w: 480, h: 320 },
      { name: 'Surface 3', w: 1920, h: 1280 },
      { name: 'Surface Pro', w: 2160, h: 1440 },
      { name: 'Pixel Slate', w: 3000, h: 2000 },
    ],
    '2:3': [
      { name: 'Portrait SD', w: 320, h: 480 },
      { name: 'Portrait HD', w: 640, h: 960 },
      { name: 'Portrait FHD', w: 1080, h: 1620 },
    ],
    '9:16': [
      { name: 'Mobile SD', w: 360, h: 640 },
      { name: 'Mobile HD', w: 720, h: 1280 },
      { name: 'Mobile FHD', w: 1080, h: 1920 },
      { name: 'Instagram Story', w: 1080, h: 1920 },
    ],
    '3:4': [
      { name: 'Portrait VGA', w: 480, h: 640 },
      { name: 'Portrait XGA', w: 768, h: 1024 },
      { name: 'iPad', w: 1536, h: 2048 },
    ],
  };

  // Generate resolutions for an arbitrary ratio
  function generateResolutions(rw, rh) {
    var results = [];
    var multipliers = [1, 2, 4, 8, 10, 16, 20, 30, 40, 60, 80, 120, 160, 240];
    for (var i = 0; i < multipliers.length; i++) {
      var w = rw * multipliers[i];
      var h = rh * multipliers[i];
      if (w >= 100 && h >= 100 && w <= 10000 && h <= 10000) {
        results.push({ name: w + ' \u00d7 ' + h, w: w, h: h });
      }
      if (results.length >= 6) break;
    }
    return results;
  }

  // Update everything
  function update() {
    var w = parseInt(widthInput.value, 10) || 0;
    var h = parseInt(heightInput.value, 10) || 0;
    if (w <= 0 || h <= 0) return;

    var ratio = simplify(w, h);
    var rStr = ratio.w + ':' + ratio.h;
    var decimal = (w / h).toFixed(4);

    ratioValueEl.textContent = rStr;
    ratioDecimalEl.textContent = decimal;

    // Preview
    updatePreview(previewBox, w, h, 240);
    previewLabel.textContent = rStr;

    // CSS output
    cssAspectRatio.textContent = 'aspect-ratio: ' + ratio.w + ' / ' + ratio.h + ';';
    var padPct = ((h / w) * 100).toFixed(4).replace(/\.?0+$/, '');
    cssPadding.textContent = 'padding-bottom: ' + padPct + '%;';

    // Active chip
    chips.forEach(function (chip) {
      var cw = parseInt(chip.dataset.w, 10);
      var ch = parseInt(chip.dataset.h, 10);
      chip.classList.toggle('active', ratio.w === cw && ratio.h === ch);
    });

    // Resolution table
    var key = rStr;
    var rows = resolutions[key] || generateResolutions(ratio.w, ratio.h);
    resTableBody.innerHTML = '';
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      var mp = ((r.w * r.h) / 1000000).toFixed(2);
      tr.innerHTML =
        '<td class="res-name">' + r.name + '</td>' +
        '<td>' + r.w + '</td>' +
        '<td>' + r.h + '</td>' +
        '<td class="res-mp">' + mp + ' MP</td>';
      resTableBody.appendChild(tr);
    });

    // Update locked ratio
    if (locked) {
      lockedRatioW = ratio.w;
      lockedRatioH = ratio.h;
    }
  }

  function updatePreview(el, w, h, maxSize) {
    var scale;
    if (w >= h) {
      scale = maxSize / w;
      var pw = maxSize;
      var ph = Math.round(h * scale);
      if (ph < 20) ph = 20;
      el.style.width = pw + 'px';
      el.style.height = ph + 'px';
    } else {
      scale = maxSize / h;
      var ph2 = maxSize;
      var pw2 = Math.round(w * scale);
      if (pw2 < 20) pw2 = 20;
      el.style.width = pw2 + 'px';
      el.style.height = ph2 + 'px';
    }
  }

  // Lock toggle
  lockToggle.addEventListener('click', function () {
    locked = !locked;
    lockToggle.classList.toggle('active', locked);
    if (locked) {
      var w = parseInt(widthInput.value, 10) || 1;
      var h = parseInt(heightInput.value, 10) || 1;
      var s = simplify(w, h);
      lockedRatioW = s.w;
      lockedRatioH = s.h;
    }
  });

  // Width input
  widthInput.addEventListener('input', function () {
    lastChanged = 'width';
    if (locked) {
      var w = parseInt(widthInput.value, 10) || 0;
      if (w > 0) {
        var newH = Math.round((w * lockedRatioH) / lockedRatioW);
        heightInput.value = newH;
      }
    }
    update();
  });

  // Height input
  heightInput.addEventListener('input', function () {
    lastChanged = 'height';
    if (locked) {
      var h = parseInt(heightInput.value, 10) || 0;
      if (h > 0) {
        var newW = Math.round((h * lockedRatioW) / lockedRatioH);
        widthInput.value = newW;
      }
    }
    update();
  });

  // Chips
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var rw = parseInt(chip.dataset.w, 10);
      var rh = parseInt(chip.dataset.h, 10);

      // Find a nice default resolution for this ratio
      var key = rw + ':' + rh;
      var known = resolutions[key];
      if (known && known.length > 0) {
        // Pick a resolution near 1920 width or pick the 3rd entry
        var pick = known.length >= 3 ? known[2] : known[known.length - 1];
        widthInput.value = pick.w;
        heightInput.value = pick.h;
      } else {
        // Generate something reasonable
        var mult = Math.max(1, Math.round(1000 / Math.max(rw, rh)));
        widthInput.value = rw * mult;
        heightInput.value = rh * mult;
      }

      if (locked) {
        lockedRatioW = rw;
        lockedRatioH = rh;
      }

      update();
    });
  });

  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.dataset.target;
      var el = document.getElementById(targetId);
      if (!el) return;
      var text = el.textContent;
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied to clipboard');
      }).catch(function () {
        // Fallback
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied to clipboard');
      });
    });
  });

  // Toast
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2000);
  }

  // Compare
  function updateCompare() {
    var w1 = parseInt(compareW1.value, 10) || 0;
    var h1 = parseInt(compareH1.value, 10) || 0;
    var w2 = parseInt(compareW2.value, 10) || 0;
    var h2 = parseInt(compareH2.value, 10) || 0;

    if (w1 > 0 && h1 > 0) {
      compareRatio1.textContent = ratioString(w1, h1);
      updatePreview(comparePreview1, w1, h1, 140);
    }
    if (w2 > 0 && h2 > 0) {
      compareRatio2.textContent = ratioString(w2, h2);
      updatePreview(comparePreview2, w2, h2, 140);
    }
  }

  compareW1.addEventListener('input', updateCompare);
  compareH1.addEventListener('input', updateCompare);
  compareW2.addEventListener('input', updateCompare);
  compareH2.addEventListener('input', updateCompare);

  // Init
  update();
  updateCompare();
})();
