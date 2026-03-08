document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.getElementById('timeDisplay');
    const sessionLabel = document.getElementById('sessionLabel');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressRing = document.getElementById('progressRing');
    const taskInput = document.getElementById('taskInput');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPanel = document.getElementById('settingsPanel');
    const logList = document.getElementById('logList');
    const totalSessions = document.getElementById('totalSessions');
    const totalTime = document.getElementById('totalTime');

    const CIRCUMFERENCE = 2 * Math.PI * 110; // 691.15

    let mode = 'work'; // work, short, long
    let running = false;
    let timeLeft = 25 * 60;
    let totalDuration = 25 * 60;
    let interval = null;
    let sessionCount = 1;
    let sessionStartTime = null;

    const today = () => new Date().toISOString().split('T')[0];

    // Settings
    function getSetting(id, fallback) {
        return parseInt(document.getElementById(id).value) || fallback;
    }

    function getDuration(m) {
        switch (m) {
            case 'work': return getSetting('workDuration', 25) * 60;
            case 'short': return getSetting('shortDuration', 5) * 60;
            case 'long': return getSetting('longDuration', 15) * 60;
        }
    }

    // Display
    function updateDisplay() {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timeDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        document.title = `${timeDisplay.textContent} - Focus`;

        const progress = 1 - (timeLeft / totalDuration);
        progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
    }

    function updateRingColor() {
        const colors = { work: '#ff6b6b', short: '#4ecdc4', long: '#6c5ce7' };
        progressRing.style.stroke = colors[mode];
    }

    function setMode(m) {
        mode = m;
        modeBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.mode === m));
        stop();
        totalDuration = getDuration(m);
        timeLeft = totalDuration;
        updateRingColor();
        updateDisplay();
    }

    // Timer
    function start() {
        if (running) {
            pause();
            return;
        }
        running = true;
        startBtn.textContent = 'Pause';
        startBtn.classList.add('running');
        sessionStartTime = sessionStartTime || new Date();

        interval = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                complete();
            }
        }, 1000);
    }

    function pause() {
        running = false;
        clearInterval(interval);
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('running');
    }

    function stop() {
        running = false;
        clearInterval(interval);
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        sessionStartTime = null;
        progressRing.style.strokeDashoffset = 0;
    }

    function complete() {
        clearInterval(interval);
        running = false;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        playSound();

        if (mode === 'work') {
            logSession();
            const maxSessions = getSetting('sessionsCount', 4);
            if (sessionCount % maxSessions === 0) {
                setMode('long');
            } else {
                setMode('short');
            }
            sessionCount++;
        } else {
            setMode('work');
        }
        sessionLabel.textContent = `Session ${sessionCount}`;
    }

    // Sound
    function playSound() {
        if (document.getElementById('soundToggle').value === 'off') return;
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + i * 0.2);
            osc.stop(ctx.currentTime + i * 0.2 + 0.4);
        });
    }

    // Log
    function getLog() {
        const logs = JSON.parse(localStorage.getItem('pomodoroLog') || '{}');
        return logs[today()] || [];
    }

    function saveLog(entries) {
        const logs = JSON.parse(localStorage.getItem('pomodoroLog') || '{}');
        logs[today()] = entries;
        localStorage.setItem('pomodoroLog', JSON.stringify(logs));
    }

    function logSession() {
        const entries = getLog();
        const duration = getSetting('workDuration', 25);
        const task = taskInput.value.trim() || 'Untitled';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        entries.push({ task, duration, time });
        saveLog(entries);
        sessionStartTime = null;
        renderLog();
    }

    function renderLog() {
        const entries = getLog();

        if (entries.length === 0) {
            logList.innerHTML = '<div class="log-empty">No sessions yet. Start focusing!</div>';
            totalSessions.textContent = '0 sessions';
            totalTime.textContent = '0m focused';
            return;
        }

        logList.innerHTML = entries.map(e => `
            <div class="log-item">
                <span class="log-task">${escapeHtml(e.task)}</span>
                <span class="log-time">${e.time}</span>
                <span class="log-duration">${e.duration}m</span>
            </div>
        `).join('');

        const total = entries.reduce((sum, e) => sum + e.duration, 0);
        totalSessions.textContent = `${entries.length} session${entries.length !== 1 ? 's' : ''}`;
        totalTime.textContent = `${total}m focused`;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Events
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });

    startBtn.addEventListener('click', start);
    resetBtn.addEventListener('click', () => {
        stop();
        totalDuration = getDuration(mode);
        timeLeft = totalDuration;
        updateDisplay();
    });

    settingsBtn.addEventListener('click', () => {
        settingsPanel.classList.toggle('hidden');
    });

    // Update timer when settings change
    ['workDuration', 'shortDuration', 'longDuration'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            if (!running) {
                totalDuration = getDuration(mode);
                timeLeft = totalDuration;
                updateDisplay();
            }
        });
    });

    // Init
    sessionLabel.textContent = `Session ${sessionCount}`;
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    updateRingColor();
    updateDisplay();
    renderLog();
});
