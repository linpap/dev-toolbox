(function () {
  'use strict';

  const SIZES = [16, 32, 48, 180, 192];
  const DISPLAY_LIMITS = { 16: 48, 32: 64, 48: 72, 180: 96, 192: 96 };

  // DOM refs
  const $ = (s) => document.querySelector(s);
  const faviconText = $('#favicon-text');
  const bgColor = $('#bg-color');
  const bgColorHex = $('#bg-color-hex');
  const textColor = $('#text-color');
  const textColorHex = $('#text-color-hex');
  const fontSelect = $('#font-select');
  const borderRadius = $('#border-radius');
  const radiusValue = $('#radius-value');
  const fontSize = $('#font-size');
  const fontSizeValue = $('#font-size-value');
  const previewGrid = $('#preview-grid');
  const htmlTags = $('#html-tags');
  const renderCanvas = $('#render-canvas');
  const uploadArea = $('#upload-area');
  const fileInput = $('#file-input');
  const clearUpload = $('#clear-upload');
  const toastContainer = $('#toast-container');

  let uploadedImage = null;

  // --- Toast ---
  function toast(message, type) {
    type = type || 'success';
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.textContent = message;
    toastContainer.appendChild(el);
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3100);
  }

  // --- Render favicon to a canvas at given size ---
  function renderToCanvas(canvas, size) {
    var ctx = canvas.getContext('2d');
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    if (uploadedImage) {
      // Draw uploaded image, clipped with border radius
      var r = (borderRadius.value / 100) * size;
      drawRoundedRect(ctx, 0, 0, size, size, r);
      ctx.clip();
      // Cover-fit the image
      var iw = uploadedImage.naturalWidth || uploadedImage.width;
      var ih = uploadedImage.naturalHeight || uploadedImage.height;
      var scale = Math.max(size / iw, size / ih);
      var sw = iw * scale;
      var sh = ih * scale;
      var sx = (size - sw) / 2;
      var sy = (size - sh) / 2;
      ctx.drawImage(uploadedImage, sx, sy, sw, sh);
      return;
    }

    var bg = bgColor.value;
    var fg = textColor.value;
    var font = fontSelect.value;
    var rad = (borderRadius.value / 100) * size;
    var fsize = (fontSize.value / 100) * size;
    var text = faviconText.value || 'A';

    // Background
    ctx.beginPath();
    drawRoundedRect(ctx, 0, 0, size, size, rad);
    ctx.fillStyle = bg;
    ctx.fill();

    // Text
    ctx.fillStyle = fg;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold ' + fsize + 'px ' + font;
    ctx.fillText(text, size / 2, size / 2 + fsize * 0.04);
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // --- Render all previews ---
  function renderAll() {
    previewGrid.innerHTML = '';
    SIZES.forEach(function (size) {
      var item = document.createElement('div');
      item.className = 'preview-item';

      var canvas = document.createElement('canvas');
      var displaySize = DISPLAY_LIMITS[size] || size;
      renderToCanvas(canvas, size);
      canvas.style.width = displaySize + 'px';
      canvas.style.height = displaySize + 'px';

      var label = document.createElement('span');
      label.className = 'preview-label';
      label.textContent = size + 'x' + size;

      item.appendChild(canvas);
      item.appendChild(label);
      previewGrid.appendChild(item);
    });

    updateHTMLTags();
  }

  // --- HTML tags ---
  function updateHTMLTags() {
    var lines = [
      '<link rel="icon" type="image/x-icon" href="/favicon.ico">',
      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">',
      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">',
      '<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png">',
      '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">',
      '<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">'
    ];
    htmlTags.textContent = lines.join('\n');
  }

  // --- Download helpers ---
  function getRenderedCanvas(size) {
    var c = document.createElement('canvas');
    renderToCanvas(c, size);
    return c;
  }

  function downloadBlob(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadPNG(size) {
    var c = getRenderedCanvas(size);
    c.toBlob(function (blob) {
      if (!blob) { toast('Failed to generate PNG', 'error'); return; }
      var name = size === 180 ? 'apple-touch-icon.png'
        : size === 192 ? 'android-chrome-192x192.png'
        : 'favicon-' + size + 'x' + size + '.png';
      downloadBlob(blob, name);
      toast('Downloaded ' + name);
    }, 'image/png');
  }

  // --- ICO generation (multi-size, BMP-based) ---
  function generateICO() {
    var icoSizes = [16, 32, 48];
    var images = [];

    icoSizes.forEach(function (size) {
      var c = getRenderedCanvas(size);
      var ctx = c.getContext('2d');
      var imageData = ctx.getImageData(0, 0, size, size);
      images.push({ size: size, data: imageData });
    });

    var headerSize = 6;
    var dirEntrySize = 16;
    var numImages = images.length;
    var offset = headerSize + dirEntrySize * numImages;

    var bmpDataArr = [];
    var totalSize = offset;

    images.forEach(function (img) {
      var s = img.size;
      var rowBytes = s * 4;
      var pixelDataSize = rowBytes * s;
      var maskRowBytes = Math.ceil(s / 8);
      // Pad mask rows to 4-byte boundary
      if (maskRowBytes % 4 !== 0) maskRowBytes += 4 - (maskRowBytes % 4);
      var maskDataSize = maskRowBytes * s;
      var bmpInfoHeaderSize = 40;
      var dataSize = bmpInfoHeaderSize + pixelDataSize + maskDataSize;

      // BMP info header
      var buf = new ArrayBuffer(dataSize);
      var view = new DataView(buf);
      view.setUint32(0, 40, true); // header size
      view.setInt32(4, s, true); // width
      view.setInt32(8, s * 2, true); // height (doubled for ICO)
      view.setUint16(12, 1, true); // planes
      view.setUint16(14, 32, true); // bpp
      view.setUint32(16, 0, true); // compression
      view.setUint32(20, pixelDataSize + maskDataSize, true); // image size
      // rest zeros

      // Pixel data (bottom-up, BGRA)
      var pixels = new Uint8Array(buf);
      for (var y = 0; y < s; y++) {
        for (var x = 0; x < s; x++) {
          var srcIdx = ((s - 1 - y) * s + x) * 4;
          var dstIdx = bmpInfoHeaderSize + (y * s + x) * 4;
          pixels[dstIdx] = img.data.data[srcIdx + 2]; // B
          pixels[dstIdx + 1] = img.data.data[srcIdx + 1]; // G
          pixels[dstIdx + 2] = img.data.data[srcIdx]; // R
          pixels[dstIdx + 3] = img.data.data[srcIdx + 3]; // A
        }
      }

      // AND mask (all zeros = fully opaque)
      // Already zeroed from ArrayBuffer

      bmpDataArr.push(new Uint8Array(buf));
      totalSize += dataSize;
    });

    // Build ICO file
    var ico = new ArrayBuffer(totalSize);
    var icoView = new DataView(ico);

    // Header
    icoView.setUint16(0, 0, true); // reserved
    icoView.setUint16(2, 1, true); // type (1 = ICO)
    icoView.setUint16(4, numImages, true); // count

    var currentOffset = offset;
    images.forEach(function (img, i) {
      var dirOff = headerSize + i * dirEntrySize;
      var s = img.size;
      var dataLen = bmpDataArr[i].length;
      icoView.setUint8(dirOff, s < 256 ? s : 0); // width
      icoView.setUint8(dirOff + 1, s < 256 ? s : 0); // height
      icoView.setUint8(dirOff + 2, 0); // palette
      icoView.setUint8(dirOff + 3, 0); // reserved
      icoView.setUint16(dirOff + 4, 1, true); // planes
      icoView.setUint16(dirOff + 6, 32, true); // bpp
      icoView.setUint32(dirOff + 8, dataLen, true); // data size
      icoView.setUint32(dirOff + 12, currentOffset, true); // data offset

      // Copy BMP data
      var icoBytes = new Uint8Array(ico);
      icoBytes.set(bmpDataArr[i], currentOffset);
      currentOffset += dataLen;
    });

    var blob = new Blob([ico], { type: 'image/x-icon' });
    downloadBlob(blob, 'favicon.ico');
    toast('Downloaded favicon.ico');
  }

  // --- SVG generation ---
  function generateSVG() {
    var size = 512;
    var bg = bgColor.value;
    var fg = textColor.value;
    var font = fontSelect.value.split(',')[0].replace(/'/g, '');
    var rad = (borderRadius.value / 100) * size;
    var fsize = (fontSize.value / 100) * size;
    var text = faviconText.value || 'A';

    if (uploadedImage) {
      // For uploaded images, export the 192px canvas as a data URL embedded in SVG
      var c = getRenderedCanvas(192);
      var dataUrl = c.toDataURL('image/png');
      var svg = '<?xml version="1.0" encoding="UTF-8"?>\n'
        + '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="192" height="192" viewBox="0 0 192 192">\n'
        + '  <image width="192" height="192" xlink:href="' + dataUrl + '"/>\n'
        + '</svg>';
      var blob = new Blob([svg], { type: 'image/svg+xml' });
      downloadBlob(blob, 'favicon.svg');
      toast('Downloaded favicon.svg');
      return;
    }

    // Escape XML entities in text
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var svg = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<svg xmlns="http://www.w3.org/2000/svg" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">\n'
      + '  <rect width="' + size + '" height="' + size + '" rx="' + rad + '" fill="' + bg + '"/>\n'
      + '  <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" '
      + 'fill="' + fg + '" font-family="' + font + ', sans-serif" font-weight="bold" font-size="' + fsize + '">'
      + escaped + '</text>\n'
      + '</svg>';

    var blob = new Blob([svg], { type: 'image/svg+xml' });
    downloadBlob(blob, 'favicon.svg');
    toast('Downloaded favicon.svg');
  }

  // --- File upload ---
  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) {
      toast('Please upload an image file', 'error');
      return;
    }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        uploadedImage = img;
        clearUpload.style.display = '';
        renderAll();
        toast('Image loaded');
      };
      img.onerror = function () {
        toast('Failed to load image', 'error');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  uploadArea.addEventListener('click', function () {
    fileInput.click();
  });

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  uploadArea.addEventListener('dragover', function (e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', function () {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', function (e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });

  clearUpload.addEventListener('click', function () {
    uploadedImage = null;
    fileInput.value = '';
    clearUpload.style.display = 'none';
    renderAll();
    toast('Upload cleared');
  });

  // --- Event bindings ---
  faviconText.addEventListener('input', renderAll);

  bgColor.addEventListener('input', function () {
    bgColorHex.textContent = bgColor.value;
    renderAll();
  });

  textColor.addEventListener('input', function () {
    textColorHex.textContent = textColor.value;
    renderAll();
  });

  fontSelect.addEventListener('change', renderAll);

  borderRadius.addEventListener('input', function () {
    radiusValue.textContent = borderRadius.value + '%';
    renderAll();
  });

  fontSize.addEventListener('input', function () {
    fontSizeValue.textContent = fontSize.value + '%';
    renderAll();
  });

  // Download buttons
  $('#download-ico').addEventListener('click', generateICO);
  $('#download-png-16').addEventListener('click', function () { downloadPNG(16); });
  $('#download-png-32').addEventListener('click', function () { downloadPNG(32); });
  $('#download-png-48').addEventListener('click', function () { downloadPNG(48); });
  $('#download-png-180').addEventListener('click', function () { downloadPNG(180); });
  $('#download-png-192').addEventListener('click', function () { downloadPNG(192); });
  $('#download-svg').addEventListener('click', generateSVG);

  // Copy HTML
  $('#copy-html').addEventListener('click', function () {
    var text = htmlTags.textContent;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        toast('HTML tags copied to clipboard');
      }, function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  });

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      toast('HTML tags copied to clipboard');
    } catch (e) {
      toast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  // --- Init ---
  renderAll();
})();
