(function () {
  'use strict';

  // ---- DOM refs ----
  const $ = (sel) => document.querySelector(sel);
  const titleInput   = $('#og-title');
  const descInput    = $('#og-description');
  const imageInput   = $('#og-image');
  const urlInput     = $('#og-url');
  const siteInput    = $('#og-sitename');
  const titleCount   = $('#title-count');
  const descCount    = $('#desc-count');
  const btnGenerate  = $('#btn-generate');
  const btnCopy      = $('#btn-copy');
  const metaWrapper  = $('#meta-output-wrapper');
  const metaOutput   = $('#meta-output');

  // ---- Helpers ----
  function extractDomain(url) {
    if (!url) return 'example.com';
    try {
      const u = new URL(url.startsWith('http') ? url : 'https://' + url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url.replace(/^https?:\/\//, '').split('/')[0] || 'example.com';
    }
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.slice(0, len) + '...' : str;
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ---- Toast ----
  function showToast(message, type) {
    type = type || 'success';
    var container = $('#toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('fade-out');
      toast.addEventListener('animationend', function () {
        toast.remove();
      });
    }, 2500);
  }

  // ---- Character count ----
  function updateCharCount(input, counter, limit) {
    var len = input.value.length;
    counter.textContent = len + ' / ' + limit;
    counter.classList.remove('warn', 'over');
    if (len > limit) {
      counter.classList.add('over');
    } else if (len > limit * 0.85) {
      counter.classList.add('warn');
    }
  }

  // ---- Image handling ----
  function setImage(imgEl, placeholderEl, url) {
    if (!url) {
      imgEl.classList.remove('visible');
      imgEl.removeAttribute('src');
      placeholderEl.style.display = 'flex';
      return;
    }
    imgEl.src = url;
    imgEl.onload = function () {
      imgEl.classList.add('visible');
      placeholderEl.style.display = 'none';
    };
    imgEl.onerror = function () {
      imgEl.classList.remove('visible');
      imgEl.removeAttribute('src');
      placeholderEl.style.display = 'flex';
    };
  }

  // ---- Live preview update ----
  function updatePreviews() {
    var title = titleInput.value || 'Page Title';
    var desc  = descInput.value || 'Page description will appear here.';
    var image = imageInput.value.trim();
    var url   = urlInput.value.trim();
    var site  = siteInput.value || 'Example';
    var domain = extractDomain(url);

    // Facebook
    $('#fb-title').textContent = truncate(title, 65);
    $('#fb-desc').textContent  = truncate(desc, 155);
    $('#fb-domain').textContent = domain.toUpperCase();
    setImage($('#fb-img'), $('#fb-img-placeholder'), image);

    // Twitter
    $('#tw-title').textContent = truncate(title, 70);
    $('#tw-desc').textContent  = truncate(desc, 125);
    $('#tw-domain').textContent = domain;
    setImage($('#tw-img'), $('#tw-img-placeholder'), image);

    // LinkedIn
    $('#li-title').textContent = truncate(title, 70);
    $('#li-domain').textContent = domain;
    setImage($('#li-img'), $('#li-img-placeholder'), image);

    // Discord
    $('#dc-sitename').textContent = site;
    $('#dc-title').textContent    = truncate(title, 80);
    $('#dc-desc').textContent     = truncate(desc, 200);
    setImage($('#dc-img'), $('#dc-img-placeholder'), image);

    // Slack
    $('#sl-sitename').textContent = site;
    $('#sl-title').textContent    = truncate(title, 80);
    $('#sl-desc').textContent     = truncate(desc, 200);
    setImage($('#sl-img'), $('#sl-img-placeholder'), image);

    // iMessage / WhatsApp
    $('#im-domain').textContent = domain;
    $('#im-title').textContent  = truncate(title, 60);
    $('#im-desc').textContent   = truncate(desc, 100);
    setImage($('#im-img'), $('#im-img-placeholder'), image);
  }

  // ---- Generate meta tags ----
  function generateMetaTags() {
    var title = escapeHtml(titleInput.value);
    var desc  = escapeHtml(descInput.value);
    var image = escapeHtml(imageInput.value.trim());
    var url   = escapeHtml(urlInput.value.trim());
    var site  = escapeHtml(siteInput.value);

    var tags = [];
    tags.push('<!-- Open Graph Meta Tags -->');
    if (title) tags.push('<meta property="og:title" content="' + title + '">');
    if (desc)  tags.push('<meta property="og:description" content="' + desc + '">');
    if (image) tags.push('<meta property="og:image" content="' + image + '">');
    if (url)   tags.push('<meta property="og:url" content="' + url + '">');
    if (site)  tags.push('<meta property="og:site_name" content="' + site + '">');
    tags.push('<meta property="og:type" content="website">');

    tags.push('');
    tags.push('<!-- Twitter Card Meta Tags -->');
    tags.push('<meta name="twitter:card" content="summary_large_image">');
    if (title) tags.push('<meta name="twitter:title" content="' + title + '">');
    if (desc)  tags.push('<meta name="twitter:description" content="' + desc + '">');
    if (image) tags.push('<meta name="twitter:image" content="' + image + '">');

    return tags.join('\n');
  }

  // ---- Event listeners ----
  var inputs = [titleInput, descInput, imageInput, urlInput, siteInput];
  inputs.forEach(function (input) {
    input.addEventListener('input', updatePreviews);
  });

  titleInput.addEventListener('input', function () {
    updateCharCount(titleInput, titleCount, 60);
  });

  descInput.addEventListener('input', function () {
    updateCharCount(descInput, descCount, 155);
  });

  btnGenerate.addEventListener('click', function () {
    var tags = generateMetaTags();
    metaOutput.textContent = tags;
    metaWrapper.hidden = false;
    showToast('Meta tags generated');
  });

  btnCopy.addEventListener('click', function () {
    var tags = generateMetaTags();
    if (!navigator.clipboard) {
      // Fallback
      var ta = document.createElement('textarea');
      ta.value = tags;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        showToast('Copied to clipboard');
      } catch (e) {
        showToast('Failed to copy', 'error');
      }
      document.body.removeChild(ta);
      return;
    }
    navigator.clipboard.writeText(tags).then(function () {
      showToast('Copied to clipboard');
    }).catch(function () {
      showToast('Failed to copy', 'error');
    });

    // Also show the output
    metaOutput.textContent = tags;
    metaWrapper.hidden = false;
  });

  // Initial state
  updatePreviews();
})();
