document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('markdownInput');
    const preview = document.getElementById('preview');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const fileInput = document.getElementById('fileInput');
    const dropOverlay = document.getElementById('dropOverlay');
    const themeBtns = document.querySelectorAll('.theme-btn');
    const hljsLight = document.getElementById('hljs-light');
    const hljsDark = document.getElementById('hljs-dark');

    let currentTheme = 'clean';

    // Configure marked
    marked.setOptions({
        breaks: true,
        gfm: true,
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return hljs.highlightAuto(code).value;
        }
    });

    // Generate table of contents
    function generateTOC(markdown) {
        const headings = [];
        const lines = markdown.split('\n');
        for (const line of lines) {
            const match = line.match(/^(#{2,4})\s+(.+)/);
            if (match) {
                const level = match[1].length;
                const text = match[2].replace(/[*_`\[\]]/g, '');
                const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                headings.push({ level, text, id });
            }
        }

        if (headings.length < 3) return '';

        let toc = '<div class="toc"><div class="toc-title">Table of Contents</div><ul>';
        let prevLevel = 2;

        for (const h of headings) {
            if (h.level > prevLevel) {
                toc += '<ul>'.repeat(h.level - prevLevel);
            } else if (h.level < prevLevel) {
                toc += '</ul>'.repeat(prevLevel - h.level);
            }
            toc += `<li><a href="#${h.id}">${h.text}</a></li>`;
            prevLevel = h.level;
        }

        toc += '</ul>'.repeat(prevLevel - 1) + '</div>';
        return toc;
    }

    // Add IDs to headings in rendered HTML
    function addHeadingIds(html) {
        return html.replace(/<h([2-4])>(.*?)<\/h[2-4]>/g, (match, level, text) => {
            const plainText = text.replace(/<[^>]*>/g, '');
            const id = plainText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
            return `<h${level} id="${id}">${text}</h${level}>`;
        });
    }

    // Render markdown
    function render() {
        const md = input.value;
        if (!md.trim()) {
            preview.innerHTML = '<div class="empty-state"><p>Your rendered HTML will appear here</p></div>';
            return;
        }

        let html = marked.parse(md);
        html = addHeadingIds(html);
        const toc = generateTOC(md);
        preview.innerHTML = toc + html;
    }

    // Debounced render
    let renderTimeout;
    input.addEventListener('input', () => {
        clearTimeout(renderTimeout);
        renderTimeout = setTimeout(render, 150);
    });

    // Theme switching
    themeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            themeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentTheme = btn.dataset.theme;

            preview.className = 'preview-content theme-' + currentTheme;

            // Switch highlight.js theme
            if (currentTheme === 'dark') {
                hljsLight.disabled = true;
                hljsDark.disabled = false;
            } else {
                hljsLight.disabled = false;
                hljsDark.disabled = true;
            }

            render();
        });
    });

    // Build full HTML document for export
    function buildFullHTML() {
        const md = input.value;
        if (!md.trim()) return '';

        let html = marked.parse(md);
        html = addHeadingIds(html);
        const toc = generateTOC(md);

        const themeClass = 'theme-' + currentTheme;
        const bgColor = currentTheme === 'dark' ? '#1e1e2e' : '#fff';

        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11/styles/${currentTheme === 'dark' ? 'github-dark' : 'github'}.min.css">
    <style>
        body {
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: ${bgColor};
        }
        ${getThemeCSS()}
    </style>
</head>
<body class="${themeClass}">
${toc}
${html}
</body>
</html>`;
    }

    function getThemeCSS() {
        const styleSheet = document.querySelector('link[href="style.css"]');
        if (!styleSheet || !styleSheet.sheet) return '';

        const themePrefix = '.theme-' + currentTheme;
        let css = '';

        try {
            for (const rule of styleSheet.sheet.cssRules) {
                const text = rule.cssText;
                if (text.includes(themePrefix) || text.includes('.toc')) {
                    // Replace .theme-X with body.theme-X for standalone
                    css += text.replace(new RegExp('\\.' + themePrefix.slice(1), 'g'), 'body.' + themePrefix.slice(1)) + '\n';
                }
            }
        } catch (e) {
            // CORS may block reading stylesheet rules; use inline fallback
            return '';
        }

        return css;
    }

    // Copy HTML
    function showToast(message) {
        let toast = document.querySelector('.copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.className = 'copy-toast';
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2000);
    }

    copyBtn.addEventListener('click', () => {
        const html = buildFullHTML();
        if (!html) {
            showToast('Nothing to copy');
            return;
        }
        navigator.clipboard.writeText(html).then(() => {
            showToast('HTML copied to clipboard!');
        }).catch(() => {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = html;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('HTML copied to clipboard!');
        });
    });

    // Download HTML
    downloadBtn.addEventListener('click', () => {
        const html = buildFullHTML();
        if (!html) {
            showToast('Nothing to download');
            return;
        }
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
        showToast('Downloaded!');
    });

    // File upload
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        readFile(file);
    });

    function readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            input.value = e.target.result;
            render();
            showToast('File loaded!');
        };
        reader.readAsText(file);
    }

    // Drag and drop
    let dragCounter = 0;

    document.addEventListener('dragenter', (e) => {
        e.preventDefault();
        dragCounter++;
        dropOverlay.classList.add('active');
    });

    document.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dragCounter--;
        if (dragCounter === 0) {
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
        if (file) readFile(file);
    });

    // Tab key support in textarea
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = input.selectionStart;
            const end = input.selectionEnd;
            input.value = input.value.substring(0, start) + '    ' + input.value.substring(end);
            input.selectionStart = input.selectionEnd = start + 4;
            render();
        }
    });
});
