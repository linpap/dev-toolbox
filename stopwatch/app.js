document.addEventListener('DOMContentLoaded', () => {
    const timeDisplay = document.getElementById('timeDisplay');
    const startBtn = document.getElementById('startBtn');
    const lapBtn = document.getElementById('lapBtn');
    const resetBtn = document.getElementById('resetBtn');
    const progressRing = document.getElementById('progressRing');
    const lapList = document.getElementById('lapList');
    const exportBtn = document.getElementById('exportBtn');

    const CIRCUMFERENCE = 2 * Math.PI * 110; // 691.15
    const RING_CYCLE = 60000; // one full rotation per 60 seconds

    let running = false;
    let startTime = 0;
    let elapsed = 0;
    let animationId = null;
    let laps = [];
    let lastLapTime = 0;

    // Format time in HH:MM:SS.ms
    function formatTime(ms, includeHtml) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        const hh = String(hours).padStart(2, '0');
        const mm = String(minutes).padStart(2, '0');
        const ss = String(seconds).padStart(2, '0');
        const cs = String(centiseconds).padStart(2, '0');

        if (includeHtml) {
            return `${hh}:${mm}:${ss}<span class="ms">.${cs}</span>`;
        }
        return `${hh}:${mm}:${ss}.${cs}`;
    }

    // Update display
    function updateDisplay() {
        const current = running ? elapsed + (performance.now() - startTime) : elapsed;
        timeDisplay.innerHTML = formatTime(current, true);

        // Update ring: one full rotation every 60 seconds
        const progress = (current % RING_CYCLE) / RING_CYCLE;
        progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);

        document.title = `${formatTime(current, false)} - Stopwatch`;

        if (running) {
            animationId = requestAnimationFrame(updateDisplay);
        }
    }

    // Start / Pause
    function toggleStart() {
        if (running) {
            pause();
        } else {
            start();
        }
    }

    function start() {
        running = true;
        startTime = performance.now();
        startBtn.textContent = 'Pause';
        startBtn.classList.add('running');
        lapBtn.disabled = false;
        animationId = requestAnimationFrame(updateDisplay);
    }

    function pause() {
        running = false;
        elapsed += performance.now() - startTime;
        cancelAnimationFrame(animationId);
        startBtn.textContent = 'Resume';
        startBtn.classList.remove('running');
        updateDisplay();
    }

    function reset() {
        running = false;
        cancelAnimationFrame(animationId);
        elapsed = 0;
        startTime = 0;
        laps = [];
        lastLapTime = 0;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('running');
        lapBtn.disabled = true;
        exportBtn.style.display = 'none';
        progressRing.style.strokeDashoffset = CIRCUMFERENCE;
        timeDisplay.innerHTML = formatTime(0, true);
        document.title = 'Stopwatch';
        renderLaps();
    }

    // Lap
    function recordLap() {
        if (!running && elapsed === 0) return;

        const current = running ? elapsed + (performance.now() - startTime) : elapsed;
        const split = current - lastLapTime;
        lastLapTime = current;

        laps.push({
            number: laps.length + 1,
            split: split,
            total: current
        });

        renderLaps();
        exportBtn.style.display = 'inline-block';
    }

    function renderLaps() {
        if (laps.length === 0) {
            lapList.innerHTML = '<div class="lap-empty">Press Lap to record split times</div>';
            return;
        }

        // Find fastest and slowest lap splits (only when 2+ laps)
        let fastestIdx = -1;
        let slowestIdx = -1;

        if (laps.length >= 2) {
            let minSplit = Infinity;
            let maxSplit = -Infinity;

            laps.forEach((lap, i) => {
                if (lap.split < minSplit) {
                    minSplit = lap.split;
                    fastestIdx = i;
                }
                if (lap.split > maxSplit) {
                    maxSplit = lap.split;
                    slowestIdx = i;
                }
            });
        }

        // Column labels + lap items (newest first)
        let html = `
            <div class="lap-labels">
                <span>Lap</span>
                <span>Split</span>
                <span>Total</span>
            </div>
        `;

        for (let i = laps.length - 1; i >= 0; i--) {
            const lap = laps[i];
            let cls = 'lap-item';
            if (i === fastestIdx) cls += ' fastest';
            if (i === slowestIdx) cls += ' slowest';

            html += `
                <div class="${cls}">
                    <span class="lap-number">${lap.number}</span>
                    <span class="lap-split">${formatTime(lap.split, false)}</span>
                    <span class="lap-total">${formatTime(lap.total, false)}</span>
                </div>
            `;
        }

        lapList.innerHTML = html;
    }

    // Export CSV
    function exportCSV() {
        if (laps.length === 0) return;

        let csv = 'Lap,Split Time,Total Time\n';
        laps.forEach(lap => {
            csv += `${lap.number},${formatTime(lap.split, false)},${formatTime(lap.total, false)}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stopwatch-laps-${new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Event listeners
    startBtn.addEventListener('click', toggleStart);
    lapBtn.addEventListener('click', recordLap);
    resetBtn.addEventListener('click', reset);
    exportBtn.addEventListener('click', exportCSV);

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ignore if user is in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                toggleStart();
                break;
            case 'KeyL':
                if (!lapBtn.disabled) recordLap();
                break;
            case 'KeyR':
                reset();
                break;
        }
    });

    // Init
    progressRing.style.strokeDasharray = CIRCUMFERENCE;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE;
    updateDisplay();
});
