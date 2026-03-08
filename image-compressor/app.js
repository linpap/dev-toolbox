(() => {
  'use strict';

  // ── State ──
  const images = new Map(); // id -> { file, originalUrl, compressedBlob, compressedUrl, origWidth, origHeight }
  let idCounter = 0;
  let selectedFormat = 'jpeg';

  // ── DOM refs ──
  const dropzone       = document.getElementById('dropzone');
  const fileInput       = document.getElementById('fileInput');
  const browseBtn       = document.getElementById('browseBtn');
  const controlsSection = document.getElementById('controlsSection');
  const imageList       = document.getElementById('imageList');
  const qualitySlider   = document.getElementById('qualitySlider');
  const qualityValue    = document.getElementById('qualityValue');
  const resizeWidth     = document.getElementById('resizeWidth');
  const resizeHeight    = document.getElementById('resizeHeight');
  const resizeScale     = document.getElementById('resizeScale');
  const keepAspect      = document.getElementById('keepAspect');
  const compressAllBtn  = document.getElementById('compressAllBtn');
  const downloadAllBtn  = document.getElementById('downloadAllBtn');
  const clearAllBtn     = document.getElementById('clearAllBtn');
  const formatBtns      = document.querySelectorAll('.format-btn');
  const template        = document.getElementById('imageCardTemplate');

  // ── Helpers ──
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 2) + ' ' + units[i];
  }

  function getMimeType(format) {
    const map = { jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
    return map[format] || 'image/jpeg';
  }

  function getExtension(format) {
    const map = { jpeg: '.jpg', png: '.png', webp: '.webp' };
    return map[format] || '.jpg';
  }

  function stripExtension(name) {
    return name.replace(/\.[^.]+$/, '');
  }

  // ── File handling ──
  function handleFiles(fileList) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
    const files = Array.from(fileList).filter(f => validTypes.includes(f.type) || f.type.startsWith('image/'));
    if (!files.length) return;

    files.forEach(file => addImage(file));
    controlsSection.classList.remove('hidden');
  }

  function addImage(file) {
    const id = ++idCounter;
    const url = URL.createObjectURL(file);

    const entry = {
      id, file, originalUrl: url,
      compressedBlob: null, compressedUrl: null,
      origWidth: 0, origHeight: 0
    };
    images.set(id, entry);

    // Load image to get dimensions
    const img = new Image();
    img.onload = () => {
      entry.origWidth = img.naturalWidth;
      entry.origHeight = img.naturalHeight;
      renderCard(entry);
    };
    img.src = url;
  }

  // ── Card rendering ──
  function renderCard(entry) {
    const clone = template.content.cloneNode(true);
    const card = clone.querySelector('.image-card');
    card.dataset.id = entry.id;

    // Filename
    card.querySelector('.card-filename').textContent = entry.file.name;

    // Original preview
    card.querySelector('.original-pane .preview-img').src = entry.originalUrl;

    // Stats
    card.querySelector('.original-size').textContent = formatBytes(entry.file.size);
    card.querySelector('.dimensions-value').textContent =
      entry.origWidth + ' x ' + entry.origHeight;

    // Remove button
    card.querySelector('.card-remove').addEventListener('click', () => removeImage(entry.id));

    // Preview mode toggle
    const toggleBtns = card.querySelectorAll('.preview-toggle-btn');
    const previewSide = card.querySelector('.preview-side');
    const previewSlider = card.querySelector('.preview-slider');

    toggleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        toggleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.mode === 'side') {
          previewSide.classList.remove('hidden');
          previewSlider.classList.add('hidden');
        } else {
          previewSide.classList.add('hidden');
          previewSlider.classList.remove('hidden');
        }
      });
    });

    // Comparison slider
    setupComparisonSlider(card);

    // Individual compress
    card.querySelector('.card-compress-btn').addEventListener('click', () => compressOne(entry.id));

    // Individual download
    card.querySelector('.card-download-btn').addEventListener('click', () => downloadOne(entry.id));

    imageList.appendChild(clone);
  }

  function setupComparisonSlider(card) {
    const slider = card.querySelector('.comparison-slider');
    const clip = card.querySelector('.slider-img-after-clip');
    const line = card.querySelector('.slider-line');
    const badgeLeft = card.querySelector('.slider-badge-left');
    const badgeRight = card.querySelector('.slider-badge-right');

    function update(val) {
      clip.style.width = val + '%';
      line.style.left = val + '%';
      badgeLeft.style.right = 'calc(' + (100 - val) + '% + .75rem)';
      badgeRight.style.left = 'calc(' + val + '% + .75rem)';
    }

    slider.addEventListener('input', () => update(slider.value));
    update(50);
  }

  function getCard(id) {
    return imageList.querySelector(`.image-card[data-id="${id}"]`);
  }

  function removeImage(id) {
    const entry = images.get(id);
    if (!entry) return;
    URL.revokeObjectURL(entry.originalUrl);
    if (entry.compressedUrl) URL.revokeObjectURL(entry.compressedUrl);
    images.delete(id);

    const card = getCard(id);
    if (card) card.remove();

    if (images.size === 0) {
      controlsSection.classList.add('hidden');
      downloadAllBtn.classList.add('hidden');
    }
  }

  // ── Compression ──
  function getTargetDimensions(origW, origH) {
    const scaleVal = parseInt(resizeScale.value) || 100;
    let w = parseInt(resizeWidth.value) || 0;
    let h = parseInt(resizeHeight.value) || 0;

    // If scale is not 100, use it
    if (scaleVal !== 100 && !w && !h) {
      const factor = scaleVal / 100;
      return { width: Math.round(origW * factor), height: Math.round(origH * factor) };
    }

    // Explicit dimensions
    if (w && h) {
      if (keepAspect.checked) {
        const ratio = origW / origH;
        // Fit within the box
        if (w / h > ratio) {
          w = Math.round(h * ratio);
        } else {
          h = Math.round(w / ratio);
        }
      }
      return { width: w, height: h };
    }

    if (w && !h) {
      h = keepAspect.checked ? Math.round(w * (origH / origW)) : origH;
      return { width: w, height: h };
    }

    if (!w && h) {
      w = keepAspect.checked ? Math.round(h * (origW / origH)) : origW;
      return { width: w, height: h };
    }

    // No resize: apply scale (which is 100)
    return { width: origW, height: origH };
  }

  function compressImage(entry) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = getTargetDimensions(img.naturalWidth, img.naturalHeight);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        // For PNG with transparency, don't fill background
        if (selectedFormat !== 'png') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
        }

        ctx.drawImage(img, 0, 0, width, height);

        const quality = parseInt(qualitySlider.value) / 100;
        const mime = getMimeType(selectedFormat);

        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Compression failed')); return; }
          resolve({ blob, width, height });
        }, mime, quality);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = entry.originalUrl;
    });
  }

  async function compressOne(id) {
    const entry = images.get(id);
    if (!entry) return;

    const card = getCard(id);
    const compressBtn = card.querySelector('.card-compress-btn');
    compressBtn.disabled = true;
    compressBtn.textContent = 'Compressing...';

    try {
      const { blob, width, height } = await compressImage(entry);

      // Clean up previous
      if (entry.compressedUrl) URL.revokeObjectURL(entry.compressedUrl);

      entry.compressedBlob = blob;
      entry.compressedUrl = URL.createObjectURL(blob);

      // Update card UI
      const compressedPane = card.querySelector('.compressed-pane');
      compressedPane.classList.add('has-image');
      compressedPane.querySelector('.preview-img').src = entry.compressedUrl;

      // Slider images
      card.querySelector('.slider-img-before').src = entry.originalUrl;
      card.querySelector('.slider-img-after').src = entry.compressedUrl;

      // Sync after image width with before image for proper slider comparison
      const beforeImg = card.querySelector('.slider-img-before');
      const afterImg = card.querySelector('.slider-img-after');
      beforeImg.onload = () => {
        afterImg.style.width = beforeImg.offsetWidth + 'px';
        afterImg.style.height = beforeImg.offsetHeight + 'px';
      };

      // Stats
      card.querySelector('.compressed-size').textContent = formatBytes(blob.size);
      card.querySelector('.dimensions-value').textContent = width + ' x ' + height;

      const savings = ((1 - blob.size / entry.file.size) * 100);
      const savingsEl = card.querySelector('.savings-value');
      savingsEl.textContent = (savings >= 0 ? '-' : '+') + Math.abs(savings).toFixed(1) + '%';
      savingsEl.className = 'stat-value savings-value ' + (savings >= 0 ? 'positive' : 'negative');

      // Show download
      card.querySelector('.card-download-btn').classList.remove('hidden');

      // Check if all have been compressed
      checkAllCompressed();

    } catch (err) {
      console.error('Compression error:', err);
    } finally {
      compressBtn.disabled = false;
      compressBtn.textContent = 'Compress';
    }
  }

  async function compressAll() {
    compressAllBtn.disabled = true;
    compressAllBtn.textContent = 'Compressing...';

    const promises = [];
    for (const [id] of images) {
      promises.push(compressOne(id));
    }
    await Promise.all(promises);

    compressAllBtn.disabled = false;
    compressAllBtn.textContent = 'Compress All';
  }

  function checkAllCompressed() {
    let allDone = true;
    for (const [, entry] of images) {
      if (!entry.compressedBlob) { allDone = false; break; }
    }
    if (allDone && images.size > 0) {
      downloadAllBtn.classList.remove('hidden');
    }
  }

  // ── Download ──
  function triggerDownload(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function downloadOne(id) {
    const entry = images.get(id);
    if (!entry || !entry.compressedUrl) return;
    const name = stripExtension(entry.file.name) + '_compressed' + getExtension(selectedFormat);
    triggerDownload(entry.compressedUrl, name);
  }

  function downloadAll() {
    for (const [, entry] of images) {
      if (entry.compressedUrl) {
        const name = stripExtension(entry.file.name) + '_compressed' + getExtension(selectedFormat);
        triggerDownload(entry.compressedUrl, name);
      }
    }
  }

  function clearAll() {
    for (const [id] of images) {
      removeImage(id);
    }
  }

  // ── Resize field sync (aspect ratio) ──
  let aspectRatioLocked = true;

  resizeWidth.addEventListener('input', () => {
    if (!keepAspect.checked) return;
    // Clear scale when manually entering dimensions
    resizeScale.value = '';
  });

  resizeHeight.addEventListener('input', () => {
    if (!keepAspect.checked) return;
    resizeScale.value = '';
  });

  resizeScale.addEventListener('input', () => {
    // Clear explicit dimensions when using scale
    resizeWidth.value = '';
    resizeHeight.value = '';
  });

  // ── Event listeners ──

  // Drag & drop
  dropzone.addEventListener('click', (e) => {
    if (e.target !== browseBtn) fileInput.click();
  });
  browseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput.click();
  });
  fileInput.addEventListener('change', () => {
    handleFiles(fileInput.files);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('drag-over');
  });
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('drag-over');
  });
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
  });

  // Quality slider
  qualitySlider.addEventListener('input', () => {
    qualityValue.textContent = qualitySlider.value + '%';
  });

  // Format buttons
  formatBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      formatBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedFormat = btn.dataset.format;
    });
  });

  // Action buttons
  compressAllBtn.addEventListener('click', compressAll);
  downloadAllBtn.addEventListener('click', downloadAll);
  clearAllBtn.addEventListener('click', clearAll);

  // Prevent default drag behavior on the whole page
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

})();
