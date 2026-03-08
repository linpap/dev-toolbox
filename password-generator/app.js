document.addEventListener('DOMContentLoaded', () => {
    const passwordText = document.getElementById('passwordText');
    const copyBtn = document.getElementById('copyBtn');
    const strengthFill = document.getElementById('strengthFill');
    const strengthLabel = document.getElementById('strengthLabel');
    const lengthSlider = document.getElementById('lengthSlider');
    const lengthValue = document.getElementById('lengthValue');
    const generateBtn = document.getElementById('generateBtn');
    const batchBtn = document.getElementById('batchBtn');
    const batchList = document.getElementById('batchList');
    const toast = document.getElementById('toast');

    const optUppercase = document.getElementById('optUppercase');
    const optLowercase = document.getElementById('optLowercase');
    const optNumbers = document.getElementById('optNumbers');
    const optSymbols = document.getElementById('optSymbols');
    const optExcludeAmbiguous = document.getElementById('optExcludeAmbiguous');

    const CHARS = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    const AMBIGUOUS = '0O1lI';

    // Slider update
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });

    // Ensure at least one option is checked
    function ensureAtLeastOne(changed) {
        const checkboxes = [optUppercase, optLowercase, optNumbers, optSymbols];
        const anyChecked = checkboxes.some(cb => cb.checked);
        if (!anyChecked) {
            changed.checked = true;
        }
    }

    [optUppercase, optLowercase, optNumbers, optSymbols].forEach(cb => {
        cb.addEventListener('change', () => ensureAtLeastOne(cb));
    });

    // Generate a single password
    function generatePassword(length) {
        let pool = '';
        const required = [];

        if (optUppercase.checked) {
            pool += CHARS.uppercase;
            required.push(CHARS.uppercase);
        }
        if (optLowercase.checked) {
            pool += CHARS.lowercase;
            required.push(CHARS.lowercase);
        }
        if (optNumbers.checked) {
            pool += CHARS.numbers;
            required.push(CHARS.numbers);
        }
        if (optSymbols.checked) {
            pool += CHARS.symbols;
            required.push(CHARS.symbols);
        }

        if (optExcludeAmbiguous.checked) {
            pool = pool.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
            required.forEach((set, i) => {
                required[i] = set.split('').filter(c => !AMBIGUOUS.includes(c)).join('');
            });
        }

        if (pool.length === 0) return '';

        // Use crypto.getRandomValues for secure randomness
        function secureRandom(max) {
            const arr = new Uint32Array(1);
            crypto.getRandomValues(arr);
            return arr[0] % max;
        }

        // Build password ensuring at least one char from each selected set
        let password = [];

        // Add one required char from each enabled set
        required.forEach(set => {
            if (set.length > 0) {
                password.push(set[secureRandom(set.length)]);
            }
        });

        // Fill remaining length from the full pool
        while (password.length < length) {
            password.push(pool[secureRandom(pool.length)]);
        }

        // Shuffle using Fisher-Yates
        for (let i = password.length - 1; i > 0; i--) {
            const j = secureRandom(i + 1);
            [password[i], password[j]] = [password[j], password[i]];
        }

        return password.join('');
    }

    // Strength calculation
    function calculateStrength(password) {
        if (!password || password === 'Click Generate') {
            return { score: 0, label: '--', color: '#666' };
        }

        let poolSize = 0;
        if (/[a-z]/.test(password)) poolSize += 26;
        if (/[A-Z]/.test(password)) poolSize += 26;
        if (/[0-9]/.test(password)) poolSize += 10;
        if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

        const entropy = password.length * Math.log2(poolSize || 1);

        if (entropy < 36) return { score: 25, label: 'Weak', color: '#ef4444' };
        if (entropy < 60) return { score: 50, label: 'Fair', color: '#f59e0b' };
        if (entropy < 80) return { score: 75, label: 'Strong', color: '#22c55e' };
        return { score: 100, label: 'Very Strong', color: '#a78bfa' };
    }

    function updateStrength(password) {
        const { score, label, color } = calculateStrength(password);
        strengthFill.style.width = score + '%';
        strengthFill.style.background = color;
        strengthLabel.textContent = label;
        strengthLabel.style.color = color;
    }

    // Generate main password
    function generate() {
        const length = parseInt(lengthSlider.value);
        const password = generatePassword(length);
        passwordText.textContent = password;
        updateStrength(password);
    }

    // Copy to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast();
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast();
        });
    }

    let toastTimeout;
    function showToast() {
        clearTimeout(toastTimeout);
        toast.classList.add('show');
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Batch generation
    function generateBatch() {
        const length = parseInt(lengthSlider.value);
        const passwords = [];
        for (let i = 0; i < 5; i++) {
            passwords.push(generatePassword(length));
        }

        const copyIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';

        batchList.innerHTML = passwords.map(pw => `
            <div class="batch-item">
                <span class="batch-item-text">${escapeHtml(pw)}</span>
                <button class="batch-copy-btn" data-pw="${escapeAttr(pw)}" title="Copy">${copyIcon}</button>
            </div>
        `).join('');

        // Attach copy handlers
        batchList.querySelectorAll('.batch-copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                copyToClipboard(btn.dataset.pw);
            });
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function escapeAttr(text) {
        return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Events
    generateBtn.addEventListener('click', generate);
    copyBtn.addEventListener('click', () => {
        const text = passwordText.textContent;
        if (text && text !== 'Click Generate') {
            copyToClipboard(text);
        }
    });
    batchBtn.addEventListener('click', generateBatch);

    // Generate on load
    generate();
});
