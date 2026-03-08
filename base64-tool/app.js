(() => {
    // DOM elements
    const inputArea = document.getElementById('inputArea');
    const outputArea = document.getElementById('outputArea');
    const encodeBtn = document.getElementById('encodeBtn');
    const decodeBtn = document.getElementById('decodeBtn');
    const swapBtn = document.getElementById('swapBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const realtimeToggle = document.getElementById('realtimeToggle');
    const urlSafeToggle = document.getElementById('urlSafeToggle');
    const inputCount = document.getElementById('inputCount');
    const outputCount = document.getElementById('outputCount');
    const statusBar = document.getElementById('statusBar');
    const statusMessage = document.getElementById('statusMessage');
    const toast = document.getElementById('toast');
    const dropOverlay = document.getElementById('dropOverlay');
    const fileInput = document.getElementById('fileInput');

    // State
    let mode = 'encode'; // 'encode' or 'decode'
    let toastTimeout = null;

    // --- Utility functions ---

    function toUrlSafe(b64) {
        return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    function fromUrlSafe(b64) {
        let s = b64.replace(/-/g, '+').replace(/_/g, '/');
        const pad = s.length % 4;
        if (pad === 2) s += '==';
        else if (pad === 3) s += '=';
        return s;
    }

    function isLikelyBase64(str) {
        str = str.trim();
        if (str.length === 0) return false;
        // URL-safe base64 pattern
        if (/^[A-Za-z0-9\-_]+$/.test(str) && str.length >= 4) {
            return true;
        }
        // Standard base64 pattern
        if (/^[A-Za-z0-9+/]+={0,2}$/.test(str) && str.length >= 4 && str.length % 4 === 0) {
            return true;
        }
        return false;
    }

    function encode(text) {
        try {
            // Handle Unicode properly
            const bytes = new TextEncoder().encode(text);
            let binary = '';
            bytes.forEach(b => binary += String.fromCharCode(b));
            let result = btoa(binary);
            if (urlSafeToggle.checked) {
                result = toUrlSafe(result);
            }
            return { success: true, result };
        } catch (e) {
            return { success: false, error: 'Encoding failed: ' + e.message };
        }
    }

    function decode(text) {
        try {
            let input = text.trim();
            // Auto-detect URL-safe and convert
            if (/[-_]/.test(input) && !/[+/]/.test(input)) {
                input = fromUrlSafe(input);
            }
            const binary = atob(input);
            const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
            const result = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
            return { success: true, result };
        } catch (e) {
            // Try with lenient decoding (binary data might not be valid UTF-8)
            try {
                let input = text.trim();
                if (/[-_]/.test(input) && !/[+/]/.test(input)) {
                    input = fromUrlSafe(input);
                }
                const binary = atob(input);
                const result = new TextDecoder('utf-8', { fatal: false }).decode(
                    Uint8Array.from(binary, c => c.charCodeAt(0))
                );
                return { success: true, result };
            } catch (e2) {
                return { success: false, error: 'Decoding failed: invalid Base64 input' };
            }
        }
    }

    function encodeFile(arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        let result = btoa(binary);
        if (urlSafeToggle.checked) {
            result = toUrlSafe(result);
        }
        return result;
    }

    // --- UI updates ---

    function setStatus(type, message) {
        statusBar.className = 'status-bar ' + type;
        statusMessage.textContent = message;
    }

    function updateCharCounts() {
        const ic = inputArea.value.length;
        const oc = outputArea.value.length;
        inputCount.textContent = ic.toLocaleString() + ' char' + (ic !== 1 ? 's' : '');
        outputCount.textContent = oc.toLocaleString() + ' char' + (oc !== 1 ? 's' : '');
    }

    function setMode(newMode) {
        mode = newMode;
        if (mode === 'encode') {
            encodeBtn.classList.add('primary');
            decodeBtn.classList.remove('primary');
        } else {
            decodeBtn.classList.add('primary');
            encodeBtn.classList.remove('primary');
        }
    }

    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // --- Core actions ---

    function doConvert() {
        const input = inputArea.value;
        if (!input.trim()) {
            outputArea.value = '';
            setStatus('', 'Ready');
            updateCharCounts();
            return;
        }

        let result;
        if (mode === 'encode') {
            result = encode(input);
        } else {
            result = decode(input);
        }

        if (result.success) {
            outputArea.value = result.result;
            const label = mode === 'encode' ? 'Encoded' : 'Decoded';
            setStatus('success', label + ' successfully (' + result.result.length.toLocaleString() + ' chars)');
        } else {
            outputArea.value = '';
            setStatus('error', result.error);
        }

        updateCharCounts();
    }

    function autoDetectAndConvert() {
        const input = inputArea.value.trim();
        if (!input) {
            setMode('encode');
            doConvert();
            return;
        }
        if (isLikelyBase64(input)) {
            setMode('decode');
        } else {
            setMode('encode');
        }
        doConvert();
    }

    // --- Event listeners ---

    inputArea.addEventListener('input', () => {
        if (realtimeToggle.checked) {
            autoDetectAndConvert();
        }
        updateCharCounts();
    });

    encodeBtn.addEventListener('click', () => {
        setMode('encode');
        doConvert();
    });

    decodeBtn.addEventListener('click', () => {
        setMode('decode');
        doConvert();
    });

    swapBtn.addEventListener('click', () => {
        const tmp = outputArea.value;
        inputArea.value = tmp;
        outputArea.value = '';
        // Flip mode
        setMode(mode === 'encode' ? 'decode' : 'encode');
        doConvert();
    });

    clearBtn.addEventListener('click', () => {
        inputArea.value = '';
        outputArea.value = '';
        setMode('encode');
        setStatus('', 'Ready');
        updateCharCounts();
        inputArea.focus();
    });

    copyBtn.addEventListener('click', () => {
        const text = outputArea.value;
        if (!text) {
            showToast('Nothing to copy');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            // Fallback
            outputArea.select();
            document.execCommand('copy');
            showToast('Copied to clipboard');
        });
    });

    urlSafeToggle.addEventListener('change', () => {
        if (inputArea.value.trim()) {
            doConvert();
        }
    });

    realtimeToggle.addEventListener('change', () => {
        if (realtimeToggle.checked && inputArea.value.trim()) {
            autoDetectAndConvert();
        }
    });

    // --- File handling ---

    function handleFile(file) {
        if (!file) return;
        setMode('encode');

        const reader = new FileReader();
        reader.onload = (e) => {
            const encoded = encodeFile(e.target.result);
            inputArea.value = '[File: ' + file.name + ' (' + formatBytes(file.size) + ')]';
            outputArea.value = encoded;
            setStatus('success', 'File encoded: ' + file.name + ' (' + encoded.length.toLocaleString() + ' chars)');
            updateCharCounts();
        };
        reader.onerror = () => {
            setStatus('error', 'Failed to read file');
        };
        reader.readAsArrayBuffer(file);
    }

    function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    fileInput.addEventListener('change', (e) => {
        handleFile(e.target.files[0]);
        fileInput.value = '';
    });

    // Drag and drop on the whole page
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        dropOverlay.classList.add('active');
    });

    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter <= 0) {
            dragCounter = 0;
            dropOverlay.classList.remove('active');
        }
    });

    document.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();
        dragCounter = 0;
        dropOverlay.classList.remove('active');

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // --- Keyboard shortcut ---
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to convert
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            doConvert();
        }
    });

    // Initialize
    updateCharCounts();
})();
