(function () {
  'use strict';

  // ── State ──
  let selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // ── DOM refs ──
  const liveTimestamp = document.getElementById('live-timestamp');
  const liveDate = document.getElementById('live-date');
  const timezoneSelect = document.getElementById('timezone-select');
  const tsInput = document.getElementById('ts-input');
  const tsConvertBtn = document.getElementById('ts-convert-btn');
  const tsResults = document.getElementById('ts-results');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const dateConvertBtn = document.getElementById('date-convert-btn');
  const dateResults = document.getElementById('date-results');
  const commonContainer = document.getElementById('common-timestamps');
  const toastContainer = document.getElementById('toast-container');

  // ── Timezones ──
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'America/Sao_Paulo',
    'America/Argentina/Buenos_Aires',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Moscow',
    'Africa/Cairo',
    'Africa/Lagos',
    'Asia/Dubai',
    'Asia/Kolkata',
    'Asia/Bangkok',
    'Asia/Shanghai',
    'Asia/Tokyo',
    'Asia/Seoul',
    'Australia/Sydney',
    'Pacific/Auckland',
  ];

  function populateTimezones() {
    const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzList = timezones.includes(localTz) ? timezones : [localTz, ...timezones];

    tzList.forEach(function (tz) {
      const opt = document.createElement('option');
      opt.value = tz;
      opt.textContent = tz.replace(/_/g, ' ');
      if (tz === localTz) opt.selected = true;
      timezoneSelect.appendChild(opt);
    });
  }

  // ── Toast ──
  function showToast(message, type) {
    type = type || 'success';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.textContent = message;
    toastContainer.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2200);
  }

  // ── Clipboard ──
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        showToast('Copied: ' + text);
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      showToast('Copied: ' + text);
    } catch (e) {
      showToast('Failed to copy', 'error');
    }
    document.body.removeChild(ta);
  }

  // ── Formatting helpers ──
  function formatInTimezone(date, tz, options) {
    try {
      return date.toLocaleString('en-US', Object.assign({ timeZone: tz }, options));
    } catch (e) {
      return date.toLocaleString('en-US', options);
    }
  }

  function toISO8601(date) {
    return date.toISOString();
  }

  function toRFC2822(date) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var parts = formatInTimezone(date, selectedTimezone, {
      weekday: 'short', year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false, timeZoneName: 'shortOffset'
    });

    // Build manually for accuracy
    var d = new Date(date.toLocaleString('en-US', { timeZone: selectedTimezone }));
    var dayName = days[d.getDay()];
    var day = String(d.getDate()).padStart(2, '0');
    var month = months[d.getMonth()];
    var year = d.getFullYear();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    var s = String(d.getSeconds()).padStart(2, '0');

    // Get offset
    var offset = getTimezoneOffset(date, selectedTimezone);

    return dayName + ', ' + day + ' ' + month + ' ' + year + ' ' + h + ':' + m + ':' + s + ' ' + offset;
  }

  function getTimezoneOffset(date, tz) {
    try {
      var str = date.toLocaleString('en-US', { timeZone: tz, timeZoneName: 'shortOffset' });
      var match = str.match(/GMT([+-]\d{1,2}(?::\d{2})?)/);
      if (match) {
        var parts = match[1].split(':');
        var hours = parts[0];
        var mins = parts[1] || '00';
        var sign = hours.charAt(0);
        hours = String(Math.abs(parseInt(hours))).padStart(2, '0');
        return sign + hours + mins;
      }
    } catch (e) {}
    return '+0000';
  }

  function toUTCString(date) {
    return date.toUTCString();
  }

  function toLocalString(date) {
    return formatInTimezone(date, selectedTimezone, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  }

  function relativeTime(date) {
    var now = Date.now();
    var diff = now - date.getTime();
    var abs = Math.abs(diff);
    var future = diff < 0;
    var suffix = future ? 'from now' : 'ago';

    var seconds = Math.floor(abs / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    var months = Math.floor(days / 30.44);
    var years = Math.floor(days / 365.25);

    var text;
    if (seconds < 5) text = 'just now';
    else if (seconds < 60) text = seconds + ' seconds ' + suffix;
    else if (minutes === 1) text = '1 minute ' + suffix;
    else if (minutes < 60) text = minutes + ' minutes ' + suffix;
    else if (hours === 1) text = '1 hour ' + suffix;
    else if (hours < 24) text = hours + ' hours ' + suffix;
    else if (days === 1) text = '1 day ' + suffix;
    else if (days < 31) text = days + ' days ' + suffix;
    else if (months === 1) text = '1 month ' + suffix;
    else if (months < 12) text = months + ' months ' + suffix;
    else if (years === 1) text = '1 year ' + suffix;
    else text = years + ' years ' + suffix;

    return text;
  }

  // ── Live clock ──
  function updateLiveClock() {
    var now = Math.floor(Date.now() / 1000);
    liveTimestamp.textContent = now;
    liveDate.textContent = toLocalString(new Date());
  }

  // ── Timestamp to Date ──
  function convertTimestampToDate() {
    var raw = tsInput.value.trim();
    if (!raw) {
      showToast('Please enter a timestamp', 'error');
      return;
    }

    var ts = Number(raw);
    if (isNaN(ts)) {
      showToast('Invalid timestamp', 'error');
      return;
    }

    // Auto-detect seconds vs milliseconds
    var ms;
    if (Math.abs(ts) > 1e12) {
      ms = ts;
    } else {
      ms = ts * 1000;
    }

    var date = new Date(ms);
    if (isNaN(date.getTime())) {
      showToast('Invalid timestamp', 'error');
      return;
    }

    tsResults.classList.remove('hidden');
    tsResults.querySelector('[data-field="iso"]').textContent = toISO8601(date);
    tsResults.querySelector('[data-field="rfc"]').textContent = toRFC2822(date);
    tsResults.querySelector('[data-field="utc"]').textContent = toUTCString(date);
    tsResults.querySelector('[data-field="local"]').textContent = toLocalString(date);
    tsResults.querySelector('[data-field="relative"]').textContent = relativeTime(date);
  }

  // ── Date to Timestamp ──
  function convertDateToTimestamp() {
    var dVal = dateInput.value;
    var tVal = timeInput.value || '00:00:00';

    if (!dVal) {
      showToast('Please select a date', 'error');
      return;
    }

    // Build date in selected timezone
    var dateStr = dVal + 'T' + tVal;
    var date;

    if (selectedTimezone === 'UTC') {
      date = new Date(dateStr + 'Z');
    } else {
      // Create the date as if it were in the selected timezone
      var localDate = new Date(dateStr);
      // Get the offset difference
      var targetStr = localDate.toLocaleString('en-US', { timeZone: selectedTimezone });
      var localStr = localDate.toLocaleString('en-US');
      var targetDate = new Date(targetStr);
      var localParsed = new Date(localStr);
      var offsetDiff = localParsed.getTime() - targetDate.getTime();
      date = new Date(localDate.getTime() + offsetDiff);
    }

    if (isNaN(date.getTime())) {
      showToast('Invalid date', 'error');
      return;
    }

    var secs = Math.floor(date.getTime() / 1000);
    var millis = date.getTime();

    dateResults.classList.remove('hidden');
    dateResults.querySelector('[data-field="seconds"]').textContent = secs;
    dateResults.querySelector('[data-field="milliseconds"]').textContent = millis;
    dateResults.querySelector('[data-field="d-iso"]').textContent = toISO8601(date);
    dateResults.querySelector('[data-field="d-rfc"]').textContent = toRFC2822(date);
    dateResults.querySelector('[data-field="d-relative"]').textContent = relativeTime(date);
  }

  // ── Common Timestamps ──
  function buildCommonTimestamps() {
    var now = new Date();
    var currentYear = now.getFullYear();

    var entries = [
      { name: 'Unix Epoch', value: 0, note: 'Jan 1, 1970' },
      { name: 'Y2K', value: 946684800, note: 'Jan 1, 2000' },
      { name: 'Year ' + currentYear + ' Start', value: Math.floor(new Date(currentYear, 0, 1).getTime() / 1000), note: 'Jan 1, ' + currentYear },
      { name: 'Year ' + (currentYear + 1) + ' Start', value: Math.floor(new Date(currentYear + 1, 0, 1).getTime() / 1000), note: 'Jan 1, ' + (currentYear + 1) },
      { name: '32-bit Overflow', value: 2147483647, note: 'Jan 19, 2038' },
      { name: '1 Billion', value: 1000000000, note: 'Sep 9, 2001' },
      { name: '2 Billion', value: 2000000000, note: 'May 18, 2033' },
    ];

    commonContainer.innerHTML = '';
    entries.forEach(function (entry) {
      var row = document.createElement('div');
      row.className = 'common-row';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'common-name';
      nameSpan.textContent = entry.name;
      nameSpan.title = entry.note;

      var valueSpan = document.createElement('span');
      valueSpan.className = 'common-value clickable';
      valueSpan.textContent = entry.value;
      valueSpan.addEventListener('click', function () {
        copyToClipboard(String(entry.value));
      });

      row.appendChild(nameSpan);
      row.appendChild(valueSpan);
      commonContainer.appendChild(row);
    });
  }

  // ── Click-to-copy delegation ──
  function setupClickToCopy() {
    document.addEventListener('click', function (e) {
      var el = e.target;
      if (el.classList.contains('clickable') && el.textContent && el.textContent !== '-') {
        copyToClipboard(el.textContent.trim());
      }
    });
  }

  // ── Set default date/time ──
  function setDefaultDateTime() {
    var now = new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    dateInput.value = y + '-' + m + '-' + d;

    var h = String(now.getHours()).padStart(2, '0');
    var min = String(now.getMinutes()).padStart(2, '0');
    var sec = String(now.getSeconds()).padStart(2, '0');
    timeInput.value = h + ':' + min + ':' + sec;
  }

  // ── Events ──
  function bindEvents() {
    tsConvertBtn.addEventListener('click', convertTimestampToDate);
    tsInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') convertTimestampToDate();
    });

    dateConvertBtn.addEventListener('click', convertDateToTimestamp);
    dateInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') convertDateToTimestamp();
    });
    timeInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') convertDateToTimestamp();
    });

    timezoneSelect.addEventListener('change', function () {
      selectedTimezone = timezoneSelect.value;
      // Re-run conversions if results are visible
      if (!tsResults.classList.contains('hidden')) {
        convertTimestampToDate();
      }
      if (!dateResults.classList.contains('hidden')) {
        convertDateToTimestamp();
      }
    });
  }

  // ── Init ──
  function init() {
    populateTimezones();
    buildCommonTimestamps();
    setDefaultDateTime();
    setupClickToCopy();
    bindEvents();
    updateLiveClock();
    setInterval(updateLiveClock, 1000);
  }

  init();
})();
