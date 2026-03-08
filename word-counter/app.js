(function () {
    'use strict';

    const textInput = document.getElementById('textInput');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');
    const caseButtons = document.querySelectorAll('.case-btn');

    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const charNoSpaceCountEl = document.getElementById('charNoSpaceCount');
    const sentenceCountEl = document.getElementById('sentenceCount');
    const paragraphCountEl = document.getElementById('paragraphCount');
    const avgWordLengthEl = document.getElementById('avgWordLength');
    const readingTimeEl = document.getElementById('readingTime');
    const speakingTimeEl = document.getElementById('speakingTime');

    const topWordsEl = document.getElementById('topWords');
    const keywordDensityEl = document.getElementById('keywordDensity');

    const toast = document.getElementById('toast');

    // Common words to exclude from keyword density
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'shall', 'can', 'it', 'its', 'this', 'that',
        'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him',
        'her', 'us', 'them', 'my', 'your', 'his', 'our', 'their', 'not', 'no',
        'so', 'if', 'as', 'from', 'up', 'out', 'about', 'into', 'than', 'then',
        'just', 'also', 'more', 'very', 'what', 'which', 'who', 'when', 'where',
        'how', 'all', 'each', 'both', 'few', 'some', 'any', 'most', 'other'
    ]);

    function getWords(text) {
        const trimmed = text.trim();
        if (!trimmed) return [];
        return trimmed.match(/[\w'-]+/g) || [];
    }

    function countSentences(text) {
        const trimmed = text.trim();
        if (!trimmed) return 0;
        const matches = trimmed.match(/[.!?]+[\s\n]+|[.!?]+$/g);
        return matches ? matches.length : 0;
    }

    function countParagraphs(text) {
        const trimmed = text.trim();
        if (!trimmed) return 0;
        return trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
    }

    function formatTime(minutes) {
        if (minutes < 1) {
            const seconds = Math.round(minutes * 60);
            return seconds + 's';
        }
        if (minutes < 60) {
            const mins = Math.floor(minutes);
            const secs = Math.round((minutes - mins) * 60);
            if (secs === 0) return mins + 'min';
            return mins + 'min ' + secs + 's';
        }
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        if (mins === 0) return hours + 'h';
        return hours + 'h ' + mins + 'min';
    }

    function getWordFrequencies(words) {
        const freq = {};
        words.forEach(w => {
            const lower = w.toLowerCase().replace(/^['-]+|['-]+$/g, '');
            if (lower.length === 0) return;
            freq[lower] = (freq[lower] || 0) + 1;
        });
        return freq;
    }

    function analyze() {
        const text = textInput.value;
        const words = getWords(text);
        const wordCount = words.length;
        const charCount = text.length;
        const charNoSpace = text.replace(/\s/g, '').length;
        const sentences = countSentences(text);
        const paragraphs = countParagraphs(text);

        const totalWordLength = words.reduce((sum, w) => sum + w.replace(/['-]/g, '').length, 0);
        const avgLen = wordCount > 0 ? (totalWordLength / wordCount).toFixed(1) : '0';

        const readMins = wordCount / 200;
        const speakMins = wordCount / 130;

        // Update stats
        wordCountEl.textContent = wordCount.toLocaleString();
        charCountEl.textContent = charCount.toLocaleString();
        charNoSpaceCountEl.textContent = charNoSpace.toLocaleString();
        sentenceCountEl.textContent = sentences.toLocaleString();
        paragraphCountEl.textContent = paragraphs.toLocaleString();
        avgWordLengthEl.textContent = avgLen;
        readingTimeEl.textContent = formatTime(readMins);
        speakingTimeEl.textContent = formatTime(speakMins);

        // Word frequencies
        const freq = getWordFrequencies(words);
        const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);

        // Top 10 words
        renderTopWords(sorted.slice(0, 10), sorted.length > 0 ? sorted[0][1] : 0);

        // Keyword density (exclude stop words)
        const keywords = sorted.filter(([word]) => !stopWords.has(word) && word.length > 1);
        renderKeywordDensity(keywords.slice(0, 10), wordCount);
    }

    function renderTopWords(top10, maxCount) {
        if (top10.length === 0) {
            topWordsEl.innerHTML = '<div class="empty-state">Enter text to see frequent words</div>';
            return;
        }

        topWordsEl.innerHTML = top10.map(([word, count], i) => {
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return '<div class="word-row">' +
                '<span class="word-rank">' + (i + 1) + '</span>' +
                '<span class="word-text">' + escapeHtml(word) + '</span>' +
                '<div class="word-bar-container"><div class="word-bar" style="width:' + pct + '%"></div></div>' +
                '<span class="word-count">' + count + '</span>' +
                '</div>';
        }).join('');
    }

    function renderKeywordDensity(keywords, totalWords) {
        if (keywords.length === 0) {
            keywordDensityEl.innerHTML = '<div class="empty-state">Enter text to see keyword density</div>';
            return;
        }

        const maxCount = keywords[0][1];

        keywordDensityEl.innerHTML = keywords.map(([word, count], i) => {
            const density = totalWords > 0 ? ((count / totalWords) * 100).toFixed(1) : '0.0';
            const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
            return '<div class="word-row">' +
                '<span class="word-rank">' + (i + 1) + '</span>' +
                '<span class="word-text">' + escapeHtml(word) + '</span>' +
                '<div class="word-bar-container"><div class="word-bar" style="width:' + pct + '%"></div></div>' +
                '<span class="word-count">' + count + '</span>' +
                '<span class="word-density">' + density + '%</span>' +
                '</div>';
        }).join('');
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // Case transformations
    function toTitleCase(text) {
        return text.replace(/\b\w/g, c => c.toUpperCase());
    }

    function toSentenceCase(text) {
        return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\w)/g, (match, sep, char) => {
            return sep + char.toUpperCase();
        });
    }

    function transformCase(type) {
        const text = textInput.value;
        if (!text) return;

        switch (type) {
            case 'upper':
                textInput.value = text.toUpperCase();
                break;
            case 'lower':
                textInput.value = text.toLowerCase();
                break;
            case 'title':
                textInput.value = toTitleCase(text);
                break;
            case 'sentence':
                textInput.value = toSentenceCase(text);
                break;
        }
        analyze();
    }

    // Event listeners
    textInput.addEventListener('input', analyze);

    clearBtn.addEventListener('click', () => {
        textInput.value = '';
        analyze();
        textInput.focus();
        showToast('Text cleared');
    });

    copyBtn.addEventListener('click', () => {
        const text = textInput.value;
        if (!text) {
            showToast('Nothing to copy');
            return;
        }
        navigator.clipboard.writeText(text).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            // Fallback
            textInput.select();
            document.execCommand('copy');
            showToast('Copied to clipboard');
        });
    });

    caseButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            transformCase(btn.dataset.case);
        });
    });

    // Initialize
    analyze();
})();
