(function () {
  'use strict';

  // DOM references
  const $ = (id) => document.getElementById(id);

  const fields = {
    title: $('meta-title'),
    description: $('meta-description'),
    keywords: $('meta-keywords'),
    author: $('meta-author'),
    charset: $('meta-charset'),
    viewport: $('meta-viewport'),
    robots: $('meta-robots'),
    canonical: $('meta-canonical'),
    favicon: $('meta-favicon'),
    ogTitle: $('og-title'),
    ogDescription: $('og-description'),
    ogImage: $('og-image'),
    ogUrl: $('og-url'),
    ogType: $('og-type'),
    ogSiteName: $('og-site-name'),
    twitterCard: $('twitter-card'),
    twitterTitle: $('twitter-title'),
    twitterDescription: $('twitter-description'),
    twitterImage: $('twitter-image'),
    twitterSite: $('twitter-site'),
  };

  const titleCount = $('title-count');
  const descCount = $('desc-count');
  const codeOutput = $('code-output');
  const btnCopy = $('btn-copy');

  // Preview elements
  const googleTitle = $('google-title');
  const googleDesc = $('google-desc');
  const googleUrl = $('google-url');
  const socialImage = $('social-image');
  const socialTitle = $('social-title');
  const socialDesc = $('social-desc');
  const socialSite = $('social-site');

  // Toast system
  function showToast(message, type) {
    type = type || 'success';
    var container = $('toast-container');
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(function () {
      toast.classList.add('fade-out');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 200);
    }, 2800);
  }

  // Character count updater
  function updateCharCount(input, counter, limit) {
    var len = input.value.length;
    counter.textContent = len + ' / ' + limit;
    counter.classList.remove('warn', 'danger');
    if (len > limit) {
      counter.classList.add('danger');
    } else if (len > limit * 0.85) {
      counter.classList.add('warn');
    }
  }

  // Escape HTML for display
  function esc(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Generate meta tags string
  function generateTags() {
    var lines = [];
    var v = {};
    for (var key in fields) {
      v[key] = fields[key].value.trim();
    }

    // Charset
    lines.push('<meta charset="' + (v.charset || 'UTF-8') + '">');

    // Viewport
    if (v.viewport) {
      lines.push('<meta name="viewport" content="' + v.viewport + '">');
    }

    // Title
    if (v.title) {
      lines.push('<title>' + v.title + '</title>');
    }

    // Description
    if (v.description) {
      lines.push('<meta name="description" content="' + v.description + '">');
    }

    // Keywords
    if (v.keywords) {
      lines.push('<meta name="keywords" content="' + v.keywords + '">');
    }

    // Author
    if (v.author) {
      lines.push('<meta name="author" content="' + v.author + '">');
    }

    // Robots
    lines.push('<meta name="robots" content="' + (v.robots || 'index, follow') + '">');

    // Canonical
    if (v.canonical) {
      lines.push('<link rel="canonical" href="' + v.canonical + '">');
    }

    // Favicon
    if (v.favicon) {
      lines.push('<link rel="icon" href="' + v.favicon + '">');
    }

    // Open Graph
    var hasOg = false;
    var ogPairs = [
      ['og:title', v.ogTitle || v.title],
      ['og:description', v.ogDescription || v.description],
      ['og:image', v.ogImage],
      ['og:url', v.ogUrl || v.canonical],
      ['og:type', v.ogType],
      ['og:site_name', v.ogSiteName],
    ];

    for (var i = 0; i < ogPairs.length; i++) {
      if (ogPairs[i][1]) {
        if (!hasOg) {
          lines.push('');
          hasOg = true;
        }
        lines.push('<meta property="' + ogPairs[i][0] + '" content="' + ogPairs[i][1] + '">');
      }
    }

    // Twitter Card
    var hasTw = false;
    var twPairs = [
      ['twitter:card', v.twitterCard],
      ['twitter:title', v.twitterTitle || v.ogTitle || v.title],
      ['twitter:description', v.twitterDescription || v.ogDescription || v.description],
      ['twitter:image', v.twitterImage || v.ogImage],
      ['twitter:site', v.twitterSite],
    ];

    for (var j = 0; j < twPairs.length; j++) {
      if (twPairs[j][1]) {
        if (!hasTw) {
          lines.push('');
          hasTw = true;
        }
        lines.push('<meta name="' + twPairs[j][0] + '" content="' + twPairs[j][1] + '">');
      }
    }

    return lines.join('\n');
  }

  // Update previews
  function updatePreviews() {
    var v = {};
    for (var key in fields) {
      v[key] = fields[key].value.trim();
    }

    // Google preview
    var displayTitle = v.title || 'Page Title';
    var displayDesc = v.description || 'Page description will appear here. Write a compelling description to improve click-through rates from search results.';
    var displayUrl = v.canonical || v.ogUrl || 'https://example.com';

    googleTitle.textContent = displayTitle;
    googleDesc.textContent = displayDesc;
    googleUrl.textContent = displayUrl;

    // Social preview
    var ogT = v.ogTitle || v.title || 'Page Title';
    var ogD = v.ogDescription || v.description || 'Page description will appear here.';
    var ogI = v.ogImage;
    var siteUrl = v.ogUrl || v.canonical || 'example.com';

    socialTitle.textContent = ogT;
    socialDesc.textContent = ogD;

    // Extract domain for site name display
    var siteName = v.ogSiteName;
    if (!siteName) {
      try {
        var urlObj = new URL(siteUrl);
        siteName = urlObj.hostname;
      } catch (e) {
        siteName = siteUrl.replace(/https?:\/\//, '').split('/')[0] || 'example.com';
      }
    }
    socialSite.textContent = siteName;

    // Social image
    if (ogI) {
      socialImage.innerHTML = '';
      var img = document.createElement('img');
      img.src = ogI;
      img.alt = 'Social preview';
      img.onerror = function () {
        socialImage.innerHTML = '<span>Image failed to load</span>';
      };
      socialImage.appendChild(img);
    } else {
      socialImage.innerHTML = '<span>No image set</span>';
    }
  }

  // Render code output
  function render() {
    var raw = generateTags();
    codeOutput.textContent = raw;
    updatePreviews();
  }

  // Attach listeners
  function init() {
    for (var key in fields) {
      fields[key].addEventListener('input', render);
      fields[key].addEventListener('change', render);
    }

    // Character count for title
    fields.title.addEventListener('input', function () {
      updateCharCount(fields.title, titleCount, 60);
    });

    // Character count for description
    fields.description.addEventListener('input', function () {
      updateCharCount(fields.description, descCount, 160);
    });

    // Copy button
    btnCopy.addEventListener('click', function () {
      var tags = generateTags();
      if (!tags || tags.split('\n').length < 2) {
        showToast('Fill in some fields first', 'warning');
        return;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tags).then(function () {
          showToast('Meta tags copied to clipboard', 'success');
        }, function () {
          fallbackCopy(tags);
        });
      } else {
        fallbackCopy(tags);
      }
    });

    // Initial render
    render();
  }

  function fallbackCopy(text) {
    var textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('Meta tags copied to clipboard', 'success');
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(textarea);
  }

  init();
})();
