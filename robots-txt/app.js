(function () {
  'use strict';

  // ── State ──

  let ruleBlocks = [];
  let nextBlockId = 1;

  // ── DOM refs ──

  const ruleBlocksContainer = document.getElementById('ruleBlocks');
  const previewCode = document.getElementById('previewCode');
  const sitemapInput = document.getElementById('sitemapUrl');
  const crawlDelayInput = document.getElementById('crawlDelay');
  const addRuleBlockBtn = document.getElementById('addRuleBlock');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');
  const validateBtn = document.getElementById('validateBtn');
  const validationResults = document.getElementById('validationResults');
  const crawlerChips = document.getElementById('crawlerChips');
  const toastEl = document.getElementById('toast');

  // ── Toast ──

  let toastTimer = null;

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('visible'), 2200);
  }

  // ── Rule block helpers ──

  function createRuleBlock(userAgent, directives) {
    const id = nextBlockId++;
    const block = {
      id,
      userAgent: userAgent || '',
      directives: directives || [{ type: 'Disallow', path: '' }],
    };
    ruleBlocks.push(block);
    renderRuleBlocks();
    updatePreview();
    return id;
  }

  function removeRuleBlock(id) {
    ruleBlocks = ruleBlocks.filter((b) => b.id !== id);
    renderRuleBlocks();
    updatePreview();
  }

  function addDirective(blockId) {
    const block = ruleBlocks.find((b) => b.id === blockId);
    if (block) {
      block.directives.push({ type: 'Disallow', path: '' });
      renderRuleBlocks();
      updatePreview();
    }
  }

  function removeDirective(blockId, dirIdx) {
    const block = ruleBlocks.find((b) => b.id === blockId);
    if (block && block.directives.length > 1) {
      block.directives.splice(dirIdx, 1);
      renderRuleBlocks();
      updatePreview();
    }
  }

  // ── Render ──

  function renderRuleBlocks() {
    if (ruleBlocks.length === 0) {
      ruleBlocksContainer.innerHTML =
        '<div class="empty-state">' +
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none"><rect x="4" y="8" width="24" height="18" rx="3" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/><circle cx="20" cy="17" r="2" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="8" x2="16" y2="4" stroke="currentColor" stroke-width="1.5"/><circle cx="16" cy="4" r="1" fill="currentColor"/></svg>' +
        '<div>No rules yet. Add a rule block or pick a preset to get started.</div></div>';
      return;
    }

    ruleBlocksContainer.innerHTML = ruleBlocks
      .map(
        (block) =>
          '<div class="rule-block" data-block-id="' + block.id + '">' +
          '  <div class="rule-block-header">' +
          '    <div class="field">' +
          '      <label>User-Agent</label>' +
          '      <input type="text" class="ua-input" value="' + escapeAttr(block.userAgent) + '" placeholder="e.g. Googlebot or *">' +
          '    </div>' +
          '    <button class="btn-danger-ghost remove-block-btn" title="Remove block">' +
          '      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><line x1="4" y1="4" x2="12" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="12" y1="4" x2="4" y2="12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
          '    </button>' +
          '  </div>' +
          '  <div class="directive-rows">' +
          block.directives
            .map(
              (d, i) =>
                '<div class="directive-row" data-dir-idx="' + i + '">' +
                '  <select class="dir-type-select">' +
                '    <option value="Disallow"' + (d.type === 'Disallow' ? ' selected' : '') + '>Disallow</option>' +
                '    <option value="Allow"' + (d.type === 'Allow' ? ' selected' : '') + '>Allow</option>' +
                '  </select>' +
                '  <input type="text" class="dir-path-input" value="' + escapeAttr(d.path) + '" placeholder="/">' +
                '  <button class="btn-danger-ghost remove-dir-btn" title="Remove directive">' +
                '    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
                '  </button>' +
                '</div>'
            )
            .join('') +
          '  </div>' +
          '  <button class="add-directive-btn" data-block-id="' + block.id + '">' +
          '    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><line x1="6" y1="1" x2="6" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="1" y1="6" x2="11" y2="6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
          '    Add directive' +
          '  </button>' +
          '</div>'
      )
      .join('');

    // Bind events
    ruleBlocksContainer.querySelectorAll('.rule-block').forEach((el) => {
      const blockId = parseInt(el.dataset.blockId, 10);
      const block = ruleBlocks.find((b) => b.id === blockId);

      el.querySelector('.ua-input').addEventListener('input', function () {
        block.userAgent = this.value;
        updatePreview();
      });

      el.querySelector('.remove-block-btn').addEventListener('click', function () {
        removeRuleBlock(blockId);
      });

      el.querySelectorAll('.directive-row').forEach((row) => {
        const dirIdx = parseInt(row.dataset.dirIdx, 10);

        row.querySelector('.dir-type-select').addEventListener('change', function () {
          block.directives[dirIdx].type = this.value;
          updatePreview();
        });

        row.querySelector('.dir-path-input').addEventListener('input', function () {
          block.directives[dirIdx].path = this.value;
          updatePreview();
        });

        row.querySelector('.remove-dir-btn').addEventListener('click', function () {
          removeDirective(blockId, dirIdx);
        });
      });

      el.querySelector('.add-directive-btn').addEventListener('click', function () {
        addDirective(blockId);
      });
    });
  }

  // ── Generate output ──

  function generateOutput() {
    const lines = [];

    ruleBlocks.forEach((block, idx) => {
      if (idx > 0) lines.push('');
      lines.push('User-agent: ' + (block.userAgent || '*'));
      block.directives.forEach((d) => {
        lines.push(d.type + ': ' + d.path);
      });
    });

    const crawlDelay = crawlDelayInput.value.trim();
    if (crawlDelay && parseInt(crawlDelay, 10) > 0) {
      // Attach crawl-delay to each block if we have blocks, else standalone
      if (ruleBlocks.length > 0) {
        // Rebuild with crawl-delay after directives
        const newLines = [];
        ruleBlocks.forEach((block, idx) => {
          if (idx > 0) newLines.push('');
          newLines.push('User-agent: ' + (block.userAgent || '*'));
          block.directives.forEach((d) => {
            newLines.push(d.type + ': ' + d.path);
          });
          newLines.push('Crawl-delay: ' + crawlDelay);
        });
        lines.length = 0;
        lines.push(...newLines);
      }
    }

    const sitemap = sitemapInput.value.trim();
    if (sitemap) {
      if (lines.length > 0) lines.push('');
      lines.push('Sitemap: ' + sitemap);
    }

    return lines.join('\n');
  }

  function updatePreview() {
    const output = generateOutput();
    if (output.length === 0) {
      previewCode.textContent = '# Your robots.txt will appear here\n# Add rules to get started';
    } else {
      previewCode.textContent = output;
    }
  }

  // ── Presets ──

  const presets = {
    'allow-all': function () {
      ruleBlocks = [];
      nextBlockId = 1;
      createRuleBlock('*', [{ type: 'Allow', path: '/' }]);
    },
    'block-all': function () {
      ruleBlocks = [];
      nextBlockId = 1;
      createRuleBlock('*', [{ type: 'Disallow', path: '/' }]);
    },
    'block-ai': function () {
      ruleBlocks = [];
      nextBlockId = 1;
      const aiCrawlers = [
        'GPTBot',
        'ChatGPT-User',
        'CCBot',
        'Google-Extended',
        'anthropic-ai',
        'Bytespider',
        'Omgilibot',
        'FacebookBot',
      ];
      aiCrawlers.forEach((crawler) => {
        createRuleBlock(crawler, [{ type: 'Disallow', path: '/' }]);
      });
    },
    'standard-seo': function () {
      ruleBlocks = [];
      nextBlockId = 1;
      createRuleBlock('*', [
        { type: 'Allow', path: '/' },
        { type: 'Disallow', path: '/admin/' },
        { type: 'Disallow', path: '/private/' },
        { type: 'Disallow', path: '/tmp/' },
        { type: 'Disallow', path: '/*.json$' },
      ]);
      sitemapInput.value = 'https://example.com/sitemap.xml';
      updatePreview();
    },
  };

  document.querySelectorAll('.preset-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      const preset = this.dataset.preset;
      if (presets[preset]) {
        presets[preset]();
        showToast('Preset applied');
      }
    });
  });

  // ── Quick add crawler ──

  crawlerChips.addEventListener('click', function (e) {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const crawler = chip.dataset.crawler;
    createRuleBlock(crawler, [{ type: 'Disallow', path: '' }]);
    showToast(crawler + ' added');
  });

  // ── Add rule block button ──

  addRuleBlockBtn.addEventListener('click', function () {
    createRuleBlock('', [{ type: 'Disallow', path: '' }]);
  });

  // ── Sitemap & crawl delay inputs ──

  sitemapInput.addEventListener('input', updatePreview);
  crawlDelayInput.addEventListener('input', updatePreview);

  // ── Copy ──

  copyBtn.addEventListener('click', function () {
    const output = generateOutput();
    if (!output) {
      showToast('Nothing to copy');
      return;
    }
    navigator.clipboard.writeText(output).then(
      function () {
        showToast('Copied to clipboard');
      },
      function () {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = output;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('Copied to clipboard');
      }
    );
  });

  // ── Download ──

  downloadBtn.addEventListener('click', function () {
    const output = generateOutput();
    if (!output) {
      showToast('Nothing to download');
      return;
    }
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Downloaded robots.txt');
  });

  // ── Validate ──

  validateBtn.addEventListener('click', function () {
    const messages = validate();
    renderValidation(messages);
  });

  function validate() {
    const msgs = [];

    if (ruleBlocks.length === 0) {
      msgs.push({ type: 'warning', text: 'No user-agent rules defined. The file will be empty or only contain a sitemap.' });
    }

    const seenAgents = {};
    ruleBlocks.forEach(function (block) {
      const ua = block.userAgent.trim().toLowerCase();
      if (!ua) {
        msgs.push({ type: 'error', text: 'A rule block has an empty User-Agent field.' });
      }
      if (seenAgents[ua]) {
        msgs.push({ type: 'warning', text: 'Duplicate User-Agent: "' + block.userAgent + '". Consider merging into one block.' });
      }
      seenAgents[ua] = true;

      block.directives.forEach(function (d) {
        if (d.path === '') {
          // Empty disallow is valid (means allow all), but warn if it looks unintentional
          if (d.type === 'Allow') {
            msgs.push({ type: 'warning', text: '"Allow:" with an empty path in ' + (block.userAgent || '*') + ' has no effect.' });
          }
        }
        if (d.path && !d.path.startsWith('/') && !d.path.startsWith('*')) {
          msgs.push({ type: 'error', text: 'Path "' + d.path + '" should start with "/" in ' + (block.userAgent || '*') + '.' });
        }
      });

      // Check if block allows and disallows the same path
      const allows = block.directives.filter((d) => d.type === 'Allow').map((d) => d.path);
      const disallows = block.directives.filter((d) => d.type === 'Disallow').map((d) => d.path);
      allows.forEach(function (p) {
        if (disallows.indexOf(p) !== -1) {
          msgs.push({ type: 'warning', text: 'Path "' + p + '" is both allowed and disallowed for ' + (block.userAgent || '*') + '.' });
        }
      });
    });

    const sitemap = sitemapInput.value.trim();
    if (sitemap) {
      if (!sitemap.startsWith('http://') && !sitemap.startsWith('https://')) {
        msgs.push({ type: 'error', text: 'Sitemap URL should start with http:// or https://.' });
      }
      if (!sitemap.includes('.xml') && !sitemap.includes('sitemap')) {
        msgs.push({ type: 'warning', text: 'Sitemap URL does not appear to point to an XML sitemap.' });
      }
    }

    const crawlDelay = crawlDelayInput.value.trim();
    if (crawlDelay) {
      const val = parseInt(crawlDelay, 10);
      if (isNaN(val) || val < 0) {
        msgs.push({ type: 'error', text: 'Crawl-delay must be a non-negative integer.' });
      } else if (val > 60) {
        msgs.push({ type: 'warning', text: 'Crawl-delay of ' + val + 's is very high. Most crawlers may ignore it.' });
      }
    }

    // Check for wildcard block that disallows everything
    const wildcardBlock = ruleBlocks.find(
      (b) => b.userAgent.trim() === '*' && b.directives.some((d) => d.type === 'Disallow' && d.path === '/')
    );
    if (wildcardBlock) {
      const hasAllow = wildcardBlock.directives.some((d) => d.type === 'Allow' && d.path);
      if (!hasAllow) {
        msgs.push({ type: 'warning', text: 'Wildcard User-Agent blocks all crawlers from the entire site.' });
      }
    }

    if (msgs.length === 0) {
      msgs.push({ type: 'success', text: 'No issues found. Your robots.txt looks good!' });
    }

    return msgs;
  }

  function renderValidation(msgs) {
    const icons = {
      success:
        '<svg class="validation-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><path d="M5 8.5l2 2 4-4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      warning:
        '<svg class="validation-icon" viewBox="0 0 16 16" fill="none"><path d="M8 2L1.5 13.5h13L8 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><line x1="8" y1="6.5" x2="8" y2="9.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/><circle cx="8" cy="11.5" r="0.7" fill="currentColor"/></svg>',
      error:
        '<svg class="validation-icon" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="1.5"/><line x1="5.5" y1="5.5" x2="10.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10.5" y1="5.5" x2="5.5" y2="10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    };

    validationResults.innerHTML = msgs
      .map(function (m) {
        return '<div class="validation-msg ' + m.type + '">' + icons[m.type] + '<span>' + escapeHtml(m.text) + '</span></div>';
      })
      .join('');
  }

  // ── Utilities ──

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ── Init ──

  renderRuleBlocks();
  updatePreview();
})();
