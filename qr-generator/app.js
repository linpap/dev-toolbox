document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('textInput');
    const generateBtn = document.getElementById('generateBtn');
    const downloadPNG = document.getElementById('downloadPNG');
    const downloadSVG = document.getElementById('downloadSVG');
    const qrCanvas = document.getElementById('qrCanvas');
    const placeholder = document.getElementById('placeholder');
    const previewArea = document.getElementById('previewArea');
    const metaInfo = document.getElementById('metaInfo');
    const fgColor = document.getElementById('fgColor');
    const bgColor = document.getElementById('bgColor');
    const fgHex = document.getElementById('fgHex');
    const bgHex = document.getElementById('bgHex');
    const swapColors = document.getElementById('swapColors');
    const ecHint = document.getElementById('ecHint');
    const toast = document.getElementById('toast');

    let currentSize = 400;
    let currentEC = 'M';
    let qrGenerated = false;
    let currentText = '';

    // EC level descriptions
    const ecDescriptions = {
        L: '~7% error recovery',
        M: '~15% error recovery',
        Q: '~25% error recovery',
        H: '~30% error recovery'
    };

    // EC level map for qrcode library
    const ecLevelMap = {
        L: QRCode.ErrorCorrectionLevel ? undefined : 0,
        M: QRCode.ErrorCorrectionLevel ? undefined : 1,
        Q: QRCode.ErrorCorrectionLevel ? undefined : 2,
        H: QRCode.ErrorCorrectionLevel ? undefined : 3
    };

    // ===== SIZE BUTTONS =====
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSize = parseInt(btn.dataset.size);
            if (qrGenerated) generateQR();
        });
    });

    // ===== ERROR CORRECTION BUTTONS =====
    document.querySelectorAll('.ec-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ec-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentEC = btn.dataset.level;
            ecHint.textContent = ecDescriptions[currentEC];
            if (qrGenerated) generateQR();
        });
    });

    // ===== COLOR SYNC =====
    fgColor.addEventListener('input', () => {
        fgHex.value = fgColor.value;
        if (qrGenerated) generateQR();
    });

    bgColor.addEventListener('input', () => {
        bgHex.value = bgColor.value;
        if (qrGenerated) generateQR();
    });

    fgHex.addEventListener('change', () => {
        const val = fgHex.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            fgColor.value = val;
            if (qrGenerated) generateQR();
        } else {
            fgHex.value = fgColor.value;
        }
    });

    bgHex.addEventListener('change', () => {
        const val = bgHex.value.trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            bgColor.value = val;
            if (qrGenerated) generateQR();
        } else {
            bgHex.value = bgColor.value;
        }
    });

    swapColors.addEventListener('click', () => {
        const tmpColor = fgColor.value;
        const tmpHex = fgHex.value;
        fgColor.value = bgColor.value;
        fgHex.value = bgHex.value;
        bgColor.value = tmpColor;
        bgHex.value = tmpHex;
        if (qrGenerated) generateQR();
    });

    // ===== GENERATE =====
    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim();
        if (!text) {
            showToast('Please enter some text or a URL');
            textInput.focus();
            return;
        }
        currentText = text;
        generateQR();
    });

    // Generate on Enter (Ctrl/Cmd+Enter for textarea)
    textInput.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generateBtn.click();
        }
    });

    function generateQR() {
        const text = currentText || textInput.value.trim();
        if (!text) return;

        const fg = fgColor.value;
        const bg = bgColor.value;

        // Determine display size (capped for the preview)
        const displaySize = Math.min(currentSize, 500);

        // Use higher resolution for rendering, then scale canvas display
        const renderSize = currentSize;

        QRCode.toCanvas(qrCanvas, text, {
            width: renderSize,
            margin: 2,
            color: {
                dark: fg,
                light: bg
            },
            errorCorrectionLevel: currentEC
        }, (error) => {
            if (error) {
                showToast('Error generating QR code: ' + error.message);
                return;
            }

            // Scale canvas display size
            qrCanvas.style.width = displaySize + 'px';
            qrCanvas.style.height = displaySize + 'px';

            placeholder.style.display = 'none';
            qrCanvas.classList.add('visible');
            qrGenerated = true;

            downloadPNG.disabled = false;
            downloadSVG.disabled = false;

            // Update meta info
            updateMeta(text);
        });
    }

    function updateMeta(text) {
        const type = detectType(text);
        const charCount = text.length;

        metaInfo.innerHTML = `
            <div class="meta-tag">Type: <span>${type}</span></div>
            <div class="meta-tag">Characters: <span>${charCount}</span></div>
            <div class="meta-tag">Size: <span>${currentSize}x${currentSize}</span></div>
            <div class="meta-tag">EC Level: <span>${currentEC}</span></div>
        `;
    }

    function detectType(text) {
        if (/^https?:\/\//i.test(text)) return 'URL';
        if (/^mailto:/i.test(text)) return 'Email';
        if (/^tel:/i.test(text)) return 'Phone';
        if (/^BEGIN:VCARD/i.test(text)) return 'vCard';
        if (/^WIFI:/i.test(text)) return 'WiFi';
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return 'Email';
        return 'Text';
    }

    // ===== DOWNLOAD PNG =====
    downloadPNG.addEventListener('click', () => {
        if (!qrGenerated) return;

        const link = document.createElement('a');
        link.download = 'qrcode.png';
        link.href = qrCanvas.toDataURL('image/png');
        link.click();
        showToast('PNG downloaded');
    });

    // ===== DOWNLOAD SVG =====
    downloadSVG.addEventListener('click', () => {
        if (!qrGenerated) return;

        const text = currentText || textInput.value.trim();
        if (!text) return;

        QRCode.toString(text, {
            type: 'svg',
            width: currentSize,
            margin: 2,
            color: {
                dark: fgColor.value,
                light: bgColor.value
            },
            errorCorrectionLevel: currentEC
        }, (error, svgString) => {
            if (error) {
                showToast('Error generating SVG');
                return;
            }

            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'qrcode.svg';
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            showToast('SVG downloaded');
        });
    });

    // ===== TOAST =====
    let toastTimeout;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // ===== INIT =====
    // Focus the input on load
    textInput.focus();
});
