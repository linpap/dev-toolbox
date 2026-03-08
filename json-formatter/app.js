document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('jsonInput');
    const output = document.getElementById('output');
    const formatBtn = document.getElementById('formatBtn');
    const minifyBtn = document.getElementById('minifyBtn');
    const copyBtn = document.getElementById('copyBtn');
    const clearBtn = document.getElementById('clearBtn');
    const validationBar = document.getElementById('validationBar');
    const toast = document.getElementById('toast');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const viewBtns = document.querySelectorAll('.view-btn');

    let tabSize = 2;
    let currentView = 'code';
    let lastParsed = null;
    let lastFormatted = '';

    // Validate and parse JSON
    function validate(text) {
        if (!text.trim()) {
            validationBar.className = 'validation-bar';
            validationBar.querySelector('.validation-message').textContent = 'Paste JSON to validate';
            lastParsed = null;
            lastFormatted = '';
            return null;
        }

        try {
            const parsed = JSON.parse(text);
            validationBar.className = 'validation-bar valid';
            validationBar.querySelector('.validation-message').textContent = 'Valid JSON';
            lastParsed = parsed;
            return parsed;
        } catch (e) {
            validationBar.className = 'validation-bar invalid';
            validationBar.querySelector('.validation-message').textContent = e.message;
            lastParsed = null;
            lastFormatted = '';
            return null;
        }
    }

    // Syntax highlight JSON string
    function highlightJSON(jsonStr) {
        return jsonStr.replace(
            /("(?:\\.|[^"\\])*")\s*:/g,
            '<span class="json-key">$1</span>:'
        ).replace(
            /:\s*("(?:\\.|[^"\\])*")/g,
            (match, str) => ': <span class="json-string">' + str + '</span>'
        ).replace(
            /(?<=[\[,\n]\s*)"(?:\\.|[^"\\])*"(?=\s*[,\]\n])/g,
            (match) => '<span class="json-string">' + match + '</span>'
        ).replace(
            /\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g,
            '<span class="json-number">$1</span>'
        ).replace(
            /\b(true|false)\b/g,
            '<span class="json-boolean">$1</span>'
        ).replace(
            /\bnull\b/g,
            '<span class="json-null">null</span>'
        ).replace(
            /([{}\[\]])/g,
            '<span class="json-bracket">$1</span>'
        );
    }

    // Manual syntax highlighter (more reliable, no lookbehind)
    function highlightJSONManual(jsonStr) {
        let result = '';
        let i = 0;
        const len = jsonStr.length;

        while (i < len) {
            const ch = jsonStr[i];

            if (ch === '"') {
                // Read full string
                let str = '"';
                i++;
                while (i < len) {
                    if (jsonStr[i] === '\\') {
                        str += jsonStr[i] + (jsonStr[i + 1] || '');
                        i += 2;
                    } else if (jsonStr[i] === '"') {
                        str += '"';
                        i++;
                        break;
                    } else {
                        str += jsonStr[i];
                        i++;
                    }
                }

                // Check if it's a key (followed by colon)
                let j = i;
                while (j < len && (jsonStr[j] === ' ' || jsonStr[j] === '\t')) j++;
                if (jsonStr[j] === ':') {
                    result += '<span class="json-key">' + escapeHTML(str) + '</span>';
                } else {
                    result += '<span class="json-string">' + escapeHTML(str) + '</span>';
                }
            } else if (ch === '-' || (ch >= '0' && ch <= '9')) {
                let num = '';
                while (i < len && /[0-9eE.+\-]/.test(jsonStr[i])) {
                    num += jsonStr[i];
                    i++;
                }
                result += '<span class="json-number">' + escapeHTML(num) + '</span>';
            } else if (jsonStr.substring(i, i + 4) === 'true') {
                result += '<span class="json-boolean">true</span>';
                i += 4;
            } else if (jsonStr.substring(i, i + 5) === 'false') {
                result += '<span class="json-boolean">false</span>';
                i += 5;
            } else if (jsonStr.substring(i, i + 4) === 'null') {
                result += '<span class="json-null">null</span>';
                i += 4;
            } else if (ch === '{' || ch === '}' || ch === '[' || ch === ']') {
                result += '<span class="json-bracket">' + ch + '</span>';
                i++;
            } else if (ch === ',') {
                result += '<span class="json-comma">,</span>';
                i++;
            } else {
                result += ch;
                i++;
            }
        }

        return result;
    }

    function escapeHTML(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Render code view with line numbers
    function renderCodeView(formatted) {
        const lines = formatted.split('\n');
        const lineNumbersHTML = lines.map((_, i) =>
            '<span class="line-number">' + (i + 1) + '</span>'
        ).join('');

        const highlighted = highlightJSONManual(formatted);

        output.innerHTML =
            '<div class="code-view">' +
                '<div class="line-numbers">' + lineNumbersHTML + '</div>' +
                '<div class="code-content">' + highlighted + '</div>' +
            '</div>';
    }

    // Build tree view
    function renderTreeView(data) {
        output.innerHTML = '<div class="tree-view">' + buildTreeNode(data, '', true) + '</div>';

        // Attach toggle listeners
        output.querySelectorAll('.tree-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                btn.classList.toggle('collapsed');
                const children = btn.parentElement.querySelector('.tree-children');
                const ellipsis = btn.parentElement.querySelector('.tree-ellipsis');
                if (children) {
                    children.classList.toggle('collapsed');
                }
                if (ellipsis) {
                    ellipsis.style.display = children.classList.contains('collapsed') ? 'inline' : 'none';
                }
            });
        });
    }

    function buildTreeNode(value, key, isRoot) {
        const keyHTML = key !== '' ? '<span class="tree-key">"' + escapeHTML(key) + '"</span>: ' : '';

        if (value === null) {
            return '<div class="tree-node">' + keyHTML + '<span class="tree-value-null">null</span></div>';
        }

        if (typeof value === 'string') {
            return '<div class="tree-node">' + keyHTML + '<span class="tree-value-string">"' + escapeHTML(value) + '"</span></div>';
        }

        if (typeof value === 'number') {
            return '<div class="tree-node">' + keyHTML + '<span class="tree-value-number">' + value + '</span></div>';
        }

        if (typeof value === 'boolean') {
            return '<div class="tree-node">' + keyHTML + '<span class="tree-value-boolean">' + value + '</span></div>';
        }

        if (Array.isArray(value)) {
            if (value.length === 0) {
                return '<div class="tree-node">' + keyHTML + '<span class="json-bracket">[]</span></div>';
            }

            let html = '<div class="tree-node">';
            html += '<button class="tree-toggle">\u25BC</button>';
            html += keyHTML;
            html += '<span class="json-bracket">[</span>';
            html += '<span class="tree-type-badge">Array(' + value.length + ')</span>';
            html += '<span class="tree-ellipsis" style="display:none"> ... </span>';
            html += '<div class="tree-children">';
            value.forEach((item, idx) => {
                html += buildTreeNode(item, String(idx), false);
            });
            html += '</div>';
            html += '<span class="json-bracket">]</span>';
            html += '</div>';
            return html;
        }

        if (typeof value === 'object') {
            const keys = Object.keys(value);
            if (keys.length === 0) {
                return '<div class="tree-node">' + keyHTML + '<span class="json-bracket">{}</span></div>';
            }

            let html = '<div class="tree-node">';
            html += '<button class="tree-toggle">\u25BC</button>';
            html += keyHTML;
            html += '<span class="json-bracket">{</span>';
            html += '<span class="tree-type-badge">Object(' + keys.length + ')</span>';
            html += '<span class="tree-ellipsis" style="display:none"> ... </span>';
            html += '<div class="tree-children">';
            keys.forEach(k => {
                html += buildTreeNode(value[k], k, false);
            });
            html += '</div>';
            html += '<span class="json-bracket">}</span>';
            html += '</div>';
            return html;
        }

        return '<div class="tree-node">' + keyHTML + escapeHTML(String(value)) + '</div>';
    }

    // Render output based on current view
    function renderOutput() {
        if (lastParsed === null) {
            output.innerHTML = '<div class="empty-state">Formatted output will appear here</div>';
            return;
        }

        if (currentView === 'tree') {
            renderTreeView(lastParsed);
        } else {
            const formatted = JSON.stringify(lastParsed, null, tabSize);
            lastFormatted = formatted;
            renderCodeView(formatted);
        }
    }

    // Format action
    function formatJSON() {
        const text = input.value.trim();
        if (!text) return;

        const parsed = validate(text);
        if (parsed === null) return;

        const formatted = JSON.stringify(parsed, null, tabSize);
        lastFormatted = formatted;
        input.value = formatted;
        renderOutput();
    }

    // Minify action
    function minifyJSON() {
        const text = input.value.trim();
        if (!text) return;

        const parsed = validate(text);
        if (parsed === null) return;

        const minified = JSON.stringify(parsed);
        lastFormatted = minified;
        input.value = minified;
        renderOutput();
    }

    // Auto-validate on input
    let validateTimeout;
    input.addEventListener('input', () => {
        clearTimeout(validateTimeout);
        validateTimeout = setTimeout(() => {
            const parsed = validate(input.value);
            if (parsed !== null) {
                renderOutput();
            } else if (!input.value.trim()) {
                output.innerHTML = '<div class="empty-state">Formatted output will appear here</div>';
            }
        }, 200);
    });

    // Format button
    formatBtn.addEventListener('click', formatJSON);

    // Minify button
    minifyBtn.addEventListener('click', minifyJSON);

    // Copy button
    copyBtn.addEventListener('click', () => {
        let textToCopy = '';
        if (lastParsed !== null) {
            textToCopy = currentView === 'tree'
                ? JSON.stringify(lastParsed, null, tabSize)
                : lastFormatted || JSON.stringify(lastParsed, null, tabSize);
        } else {
            textToCopy = input.value;
        }

        if (!textToCopy.trim()) {
            showToast('Nothing to copy');
            return;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Copied to clipboard!');
        }).catch(() => {
            const ta = document.createElement('textarea');
            ta.value = textToCopy;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Copied to clipboard!');
        });
    });

    // Clear button
    clearBtn.addEventListener('click', () => {
        input.value = '';
        lastParsed = null;
        lastFormatted = '';
        validationBar.className = 'validation-bar';
        validationBar.querySelector('.validation-message').textContent = 'Paste JSON to validate';
        output.innerHTML = '<div class="empty-state">Formatted output will appear here</div>';
    });

    // Tab size buttons
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            tabSize = parseInt(btn.dataset.size);
            if (lastParsed !== null) {
                lastFormatted = JSON.stringify(lastParsed, null, tabSize);
                renderOutput();
            }
        });
    });

    // View toggle buttons
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderOutput();
        });
    });

    // Toast
    let toastTimer;
    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // Keyboard shortcuts
    input.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to format
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            formatJSON();
        }

        // Tab key inserts spaces
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const spaces = ' '.repeat(tabSize);
            input.value = input.value.substring(0, start) + spaces + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + tabSize;
        }
    });
});
