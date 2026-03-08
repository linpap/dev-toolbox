document.addEventListener('DOMContentLoaded', () => {
    const regexInput = document.getElementById('regexInput');
    const testString = document.getElementById('testString');
    const highlightLayer = document.getElementById('highlightLayer');
    const matchCount = document.getElementById('matchCount');
    const matchTime = document.getElementById('matchTime');
    const matchResults = document.getElementById('matchResults');
    const replaceInput = document.getElementById('replaceInput');
    const replaceOutput = document.getElementById('replaceOutput');
    const regexError = document.getElementById('regexError');
    const copyRegex = document.getElementById('copyRegex');
    const toast = document.getElementById('toast');
    const flagBtns = document.querySelectorAll('.flag-btn');

    let flags = { g: true, i: false, m: false, s: false };

    // ===== FLAGS =====
    flagBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const flag = btn.dataset.flag;
            flags[flag] = !flags[flag];
            btn.classList.toggle('active');
            evaluate();
        });
    });

    function getFlags() {
        return Object.entries(flags).filter(([, v]) => v).map(([k]) => k).join('');
    }

    // ===== COPY REGEX =====
    copyRegex.addEventListener('click', () => {
        const pattern = regexInput.value;
        const f = getFlags();
        const full = `/${pattern}/${f}`;
        navigator.clipboard.writeText(full).then(() => {
            showToast('Copied: ' + full);
        }).catch(() => {
            showToast('Failed to copy');
        });
    });

    // ===== CHEATSHEET CLICK =====
    document.querySelectorAll('.cheat-item.insertable').forEach(item => {
        item.addEventListener('click', () => {
            regexInput.value = item.dataset.pattern;
            regexInput.focus();
            evaluate();
        });
    });

    document.querySelectorAll('.cheat-item:not(.insertable)').forEach(item => {
        item.addEventListener('click', () => {
            const pattern = item.dataset.pattern;
            const input = regexInput;
            const start = input.selectionStart;
            const end = input.selectionEnd;
            const val = input.value;
            input.value = val.slice(0, start) + pattern + val.slice(end);
            input.focus();
            input.setSelectionRange(start + pattern.length, start + pattern.length);
            evaluate();
        });
    });

    // ===== SYNC SCROLL =====
    testString.addEventListener('scroll', () => {
        highlightLayer.scrollTop = testString.scrollTop;
        highlightLayer.scrollLeft = testString.scrollLeft;
    });

    // ===== EVALUATE =====
    function evaluate() {
        const pattern = regexInput.value;
        const text = testString.value;
        const replacement = replaceInput.value;

        // Clear error
        regexError.classList.remove('visible');
        regexError.textContent = '';

        if (!pattern) {
            clearResults();
            highlightLayer.innerHTML = escapeHtml(text);
            return;
        }

        let regex;
        try {
            regex = new RegExp(pattern, getFlags());
        } catch (e) {
            regexError.textContent = e.message;
            regexError.classList.add('visible');
            clearResults();
            highlightLayer.innerHTML = escapeHtml(text);
            return;
        }

        if (!text) {
            clearResults();
            highlightLayer.innerHTML = '';
            return;
        }

        // Find all matches
        const startTime = performance.now();
        const matches = [];
        let match;
        const isGlobal = flags.g;

        if (isGlobal) {
            regex.lastIndex = 0;
            let safety = 0;
            while ((match = regex.exec(text)) !== null && safety < 10000) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    end: match.index + match[0].length,
                    groups: match.slice(1),
                    namedGroups: match.groups || null
                });
                // Prevent infinite loop on zero-length matches
                if (match[0].length === 0) {
                    regex.lastIndex++;
                }
                safety++;
            }
        } else {
            match = regex.exec(text);
            if (match) {
                matches.push({
                    value: match[0],
                    index: match.index,
                    end: match.index + match[0].length,
                    groups: match.slice(1),
                    namedGroups: match.groups || null
                });
            }
        }
        const elapsed = performance.now() - startTime;

        // Update match count
        const count = matches.length;
        matchCount.textContent = count === 1 ? '1 match' : count + ' matches';
        matchCount.className = 'match-count' + (count > 0 ? ' has-matches' : (pattern ? ' no-matches' : ''));
        matchTime.textContent = elapsed < 1 ? '<1ms' : Math.round(elapsed) + 'ms';

        // Highlight matches in test string
        renderHighlights(text, matches);

        // Render match results
        renderMatchResults(matches);

        // Render replacement
        renderReplacement(text, regex, replacement, matches);
    }

    function clearResults() {
        matchCount.textContent = '0 matches';
        matchCount.className = 'match-count';
        matchTime.textContent = '';
        matchResults.innerHTML = '<div class="empty-state">Enter a pattern and test string to see matches</div>';
        replaceOutput.innerHTML = '<span class="empty-state-inline">Enter a replacement string above</span>';
    }

    // ===== HIGHLIGHT =====
    function renderHighlights(text, matches) {
        if (matches.length === 0) {
            highlightLayer.innerHTML = escapeHtml(text);
            return;
        }

        let html = '';
        let lastIndex = 0;

        // Sort matches by index
        const sorted = [...matches].sort((a, b) => a.index - b.index);

        sorted.forEach((m, i) => {
            // Text before match
            if (m.index > lastIndex) {
                html += escapeHtml(text.slice(lastIndex, m.index));
            }
            // The match
            html += '<mark class="match-highlight">' + escapeHtml(m.value) + '</mark>';
            lastIndex = m.end;
        });

        // Remaining text
        if (lastIndex < text.length) {
            html += escapeHtml(text.slice(lastIndex));
        }

        highlightLayer.innerHTML = html;
    }

    // ===== MATCH RESULTS =====
    function renderMatchResults(matches) {
        if (matches.length === 0) {
            matchResults.innerHTML = '<div class="empty-state">No matches found</div>';
            return;
        }

        let html = '';
        matches.forEach((m, i) => {
            html += '<div class="match-card">';
            html += '<div class="match-card-header">';
            html += `<span class="match-index">Match ${i + 1}</span>`;
            html += `<span class="match-range">${m.index}\u2013${m.end}</span>`;
            html += '</div>';
            html += `<div class="match-value">${escapeHtml(m.value) || '<em style="color:#555">empty string</em>'}</div>`;

            // Capture groups
            const hasGroups = m.groups.length > 0 && m.groups.some(g => g !== undefined);
            const hasNamedGroups = m.namedGroups && Object.keys(m.namedGroups).length > 0;

            if (hasGroups || hasNamedGroups) {
                html += '<div class="match-groups">';

                if (hasNamedGroups) {
                    for (const [name, value] of Object.entries(m.namedGroups)) {
                        html += '<div class="match-group">';
                        html += `<span class="group-label">${escapeHtml(name)}</span>`;
                        html += `<span class="group-value">${value !== undefined ? escapeHtml(value) : '<em style="color:#555">undefined</em>'}</span>`;
                        html += '</div>';
                    }
                } else {
                    m.groups.forEach((g, gi) => {
                        html += '<div class="match-group">';
                        html += `<span class="group-label">Group ${gi + 1}</span>`;
                        html += `<span class="group-value">${g !== undefined ? escapeHtml(g) : '<em style="color:#555">undefined</em>'}</span>`;
                        html += '</div>';
                    });
                }

                html += '</div>';
            }

            html += '</div>';
        });

        matchResults.innerHTML = html;
    }

    // ===== REPLACEMENT =====
    function renderReplacement(text, regex, replacement, matches) {
        if (!replacement && replacement !== '') {
            replaceOutput.innerHTML = '<span class="empty-state-inline">Enter a replacement string above</span>';
            return;
        }

        if (matches.length === 0) {
            replaceOutput.textContent = text;
            return;
        }

        try {
            // Reset lastIndex for the replacement
            regex.lastIndex = 0;
            const replaced = text.replace(regex, replacement);

            // Build highlighted output showing what changed
            // Do a diff-style display by re-running the match and replacing piece by piece
            const isGlobal = flags.g;
            regex.lastIndex = 0;

            let html = '';
            let lastIdx = 0;
            let m;
            let safety = 0;

            if (isGlobal) {
                while ((m = regex.exec(text)) !== null && safety < 10000) {
                    // Text before this match
                    html += escapeHtml(text.slice(lastIdx, m.index));

                    // The replaced part
                    const replacedPart = m[0].replace(new RegExp(regex.source, regex.flags.replace('g', '')), replacement);
                    html += '<span class="replaced-part">' + escapeHtml(replacedPart) + '</span>';

                    lastIdx = m.index + m[0].length;

                    if (m[0].length === 0) {
                        regex.lastIndex++;
                    }
                    safety++;
                }
            } else {
                m = regex.exec(text);
                if (m) {
                    html += escapeHtml(text.slice(0, m.index));
                    const replacedPart = m[0].replace(new RegExp(regex.source, regex.flags.replace('g', '')), replacement);
                    html += '<span class="replaced-part">' + escapeHtml(replacedPart) + '</span>';
                    lastIdx = m.index + m[0].length;
                }
            }

            html += escapeHtml(text.slice(lastIdx));
            replaceOutput.innerHTML = html;
        } catch (e) {
            replaceOutput.textContent = text;
        }
    }

    // ===== UTILITY =====
    function escapeHtml(str) {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // ===== TOAST =====
    let toastTimeout;
    function showToast(msg) {
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove('show'), 2000);
    }

    // ===== EVENT LISTENERS =====
    regexInput.addEventListener('input', evaluate);
    testString.addEventListener('input', evaluate);
    replaceInput.addEventListener('input', evaluate);

    // Keep highlight layer in sync with textarea size
    const resizeObserver = new ResizeObserver(() => {
        highlightLayer.style.width = testString.offsetWidth + 'px';
        highlightLayer.style.height = testString.offsetHeight + 'px';
    });
    resizeObserver.observe(testString);

    // ===== INIT WITH EXAMPLE =====
    regexInput.value = '(\\w+)@(\\w+\\.\\w+)';
    testString.value = 'Contact us at hello@example.com or support@company.org for help.\nYou can also reach admin@test.net anytime.';
    replaceInput.value = '[$1 at $2]';
    evaluate();
});
