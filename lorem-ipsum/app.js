(() => {
    // --- Word Banks ---

    const WORDS = {
        classic: [
            'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
            'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
            'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
            'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
            'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
            'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
            'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
            'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'pellentesque', 'habitant',
            'morbi', 'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'ac', 'turpis',
            'egestas', 'maecenas', 'accumsan', 'lacus', 'vel', 'facilisis', 'volutpat',
            'vitae', 'auctor', 'augue', 'mauris', 'massa', 'sagittis', 'elementum',
            'pulvinar', 'etiam', 'feugiat', 'vivamus', 'at', 'dignissim', 'cras',
            'tincidunt', 'lobortis', 'felis', 'proin', 'nibh', 'nisl', 'condimentum',
            'blandit', 'arcu', 'dictum', 'varius', 'duis', 'ultricies', 'lacinia',
            'porta', 'suspendisse', 'potenti', 'nunc', 'congue', 'ornare', 'diam',
            'phasellus', 'vestibulum', 'cursus', 'risus', 'integer', 'faucibus', 'scelerisque',
            'eleifend', 'donec', 'pretium', 'vulputate', 'sapien', 'rhoncus', 'imperdiet'
        ],
        hipster: [
            'artisan', 'aesthetic', 'avocado', 'banjo', 'bespoke', 'bicycle', 'biodiesel',
            'blog', 'brooklyn', 'brunch', 'bushwick', 'cardigan', 'chambray', 'charcoal',
            'chicharrones', 'cold-pressed', 'craft', 'cred', 'cronut', 'crucifix',
            'disrupt', 'dreamcatcher', 'drinking', 'edison', 'everyday', 'farm-to-table',
            'fingerstache', 'flannel', 'flexitarian', 'forage', 'freerange', 'gastropub',
            'gentrify', 'gluten-free', 'heirloom', 'helvetica', 'hoodie', 'iceland',
            'intelligentsia', 'irony', 'jean', 'kale', 'keytar', 'kickstarter', 'kinfolk',
            'knausgaard', 'kombucha', 'letterpress', 'listicle', 'locavore', 'lumbersexual',
            'man-braid', 'marfa', 'meditation', 'microdosing', 'migas', 'mixtape',
            'mustache', 'narwhal', 'normcore', 'occupy', 'offal', 'organic', 'paleo',
            'pabst', 'photo-booth', 'pinterest', 'pitchfork', 'plaid', 'polaroid',
            'pop-up', 'portland', 'post-ironic', 'pour-over', 'poutine', 'quinoa',
            'raw-denim', 'raclette', 'retro', 'roof-party', 'salvia', 'schlitz',
            'selvage', 'seitan', 'shabby-chic', 'shoreditch', 'single-origin', 'skateboard',
            'slow-carb', 'small-batch', 'snackwave', 'sriracha', 'stumptown', 'subway-tile',
            'sustainable', 'swag', 'synth', 'tacos', 'tattooed', 'thundercats',
            'tofu', 'tote-bag', 'truffaut', 'tumblr', 'typewriter', 'umami',
            'unicorn', 'vaporwave', 'vegan', 'venmo', 'vice', 'vinyl', 'viral',
            'wayfarers', 'williamsburg', 'wolf', 'yolo', 'yr', 'copper-mug', 'cold-brew'
        ],
        tech: [
            'algorithm', 'api', 'agile', 'backend', 'bandwidth', 'benchmark', 'binary',
            'bitcoin', 'blockchain', 'boolean', 'bootstrap', 'buffer', 'bug', 'byte',
            'cache', 'callback', 'cloud', 'cluster', 'codebase', 'compiler', 'component',
            'container', 'continuous', 'crypto', 'css', 'daemon', 'database', 'debug',
            'deploy', 'devops', 'distributed', 'docker', 'domain', 'ecosystem', 'encrypt',
            'endpoint', 'ethernet', 'event-driven', 'firmware', 'framework', 'frontend',
            'fullstack', 'function', 'gateway', 'git', 'graphql', 'hash', 'heroku',
            'html', 'http', 'hypervisor', 'immutable', 'infrastructure', 'instance',
            'integration', 'interface', 'iot', 'iterate', 'javascript', 'json', 'kernel',
            'kubernetes', 'lambda', 'latency', 'legacy', 'library', 'linux', 'load-balancer',
            'localhost', 'machine-learning', 'metadata', 'microservice', 'middleware',
            'migration', 'module', 'mongodb', 'mutex', 'namespace', 'neural-network',
            'nginx', 'node', 'npm', 'object', 'open-source', 'orchestration', 'overload',
            'packet', 'pagination', 'paradigm', 'parse', 'payload', 'pipeline', 'pixel',
            'platform', 'plugin', 'pointer', 'postgres', 'protocol', 'proxy', 'python',
            'query', 'queue', 'react', 'redis', 'refactor', 'regex', 'render',
            'repository', 'responsive', 'restful', 'runtime', 'rust', 'saas', 'sandbox',
            'scalar', 'schema', 'scrum', 'sdk', 'server', 'serverless', 'sprint',
            'sql', 'ssh', 'stack', 'startup', 'stateless', 'streaming', 'subnet',
            'syntax', 'terraform', 'thread', 'throughput', 'token', 'typescript', 'ubuntu',
            'ui', 'unix', 'upstream', 'url', 'variable', 'version', 'virtual-machine',
            'vpc', 'webhook', 'webpack', 'websocket', 'yaml', 'zero-downtime'
        ],
        pirate: [
            'ahoy', 'anchor', 'aye', 'avast', 'barnacle', 'batten', 'bilge', 'blackbeard',
            'blimey', 'boatswain', 'bounty', 'bow', 'buccaneer', 'cannon', 'captain',
            'cargo', 'chest', 'compass', 'corsair', 'crew', 'crow-nest', 'cutlass',
            'dagger', 'davy-jones', 'deck', 'doubloon', 'dread', 'figurehead', 'first-mate',
            'flag', 'fleet', 'forecastle', 'frigate', 'galleon', 'gangplank', 'grog',
            'gunwale', 'harbor', 'hoist', 'horizon', 'hull', 'island', 'jib', 'jolly-roger',
            'keelhaul', 'knot', 'lagoon', 'landlubber', 'loot', 'mainsail', 'marauder',
            'maroon', 'mast', 'matey', 'mizzen', 'mutiny', 'navigator', 'ocean',
            'overboard', 'parley', 'parrot', 'pegleg', 'pillage', 'pirate', 'plank',
            'plunder', 'port', 'privateer', 'quartermaster', 'raid', 'reef', 'rigging',
            'rope', 'rudder', 'rum', 'sail', 'scallywag', 'schooner', 'scurvy',
            'sea-dog', 'shanty', 'shipwreck', 'shore', 'skull', 'sloop', 'smuggler',
            'spyglass', 'squall', 'starboard', 'stern', 'storm', 'stowaway', 'swagger',
            'swashbuckler', 'sword', 'tavern', 'tide', 'timber', 'trade-winds', 'treasure',
            'vessel', 'voyage', 'walk-the-plank', 'weapons', 'whirlpool', 'wind',
            'wench', 'yardarm', 'yo-ho-ho', 'seaworthy', 'broadside', 'booty', 'gale'
        ]
    };

    const LOREM_OPENER = {
        classic: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        hipster: 'Artisan aesthetic avocado craft cold-pressed organic sustainable.',
        tech: 'Algorithm api cloud container deploy distributed framework serverless.',
        pirate: 'Ahoy matey, avast ye scurvy sea-dog sailing the seven seas.'
    };

    // --- State ---
    let currentStyle = 'classic';
    let currentType = 'paragraphs';
    let generatedText = '';

    // --- DOM ---
    const output = document.getElementById('output');
    const countInput = document.getElementById('countInput');
    const countDown = document.getElementById('countDown');
    const countUp = document.getElementById('countUp');
    const generateBtn = document.getElementById('generateBtn');
    const copyBtn = document.getElementById('copyBtn');
    const loremToggle = document.getElementById('loremToggle');
    const htmlToggle = document.getElementById('htmlToggle');
    const wordCountEl = document.getElementById('wordCount');
    const charCountEl = document.getElementById('charCount');
    const toastEl = document.getElementById('toast');

    // --- Helpers ---

    function rand(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function generateWord(style) {
        return rand(WORDS[style]);
    }

    function generateSentence(style, minWords, maxWords) {
        const len = minWords + Math.floor(Math.random() * (maxWords - minWords + 1));
        const words = [];
        for (let i = 0; i < len; i++) {
            words.push(generateWord(style));
        }
        words[0] = capitalize(words[0]);

        // Add a comma somewhere in longer sentences
        if (len > 6 && Math.random() > 0.4) {
            const commaPos = 2 + Math.floor(Math.random() * (len - 4));
            words[commaPos] = words[commaPos] + ',';
        }

        return words.join(' ') + '.';
    }

    function generateParagraph(style, startWithLorem, isFirst) {
        const sentenceCount = 4 + Math.floor(Math.random() * 5); // 4-8 sentences
        const sentences = [];

        for (let i = 0; i < sentenceCount; i++) {
            if (i === 0 && isFirst && startWithLorem) {
                sentences.push(LOREM_OPENER[style]);
            } else {
                sentences.push(generateSentence(style, 5, 15));
            }
        }

        return sentences.join(' ');
    }

    function generateContent() {
        const count = Math.max(1, Math.min(100, parseInt(countInput.value) || 1));
        const startWithLorem = loremToggle.checked;
        const wrapHtml = htmlToggle.checked;
        let result = '';
        let displayHtml = '';

        if (currentType === 'paragraphs') {
            const paragraphs = [];
            for (let i = 0; i < count; i++) {
                paragraphs.push(generateParagraph(currentStyle, startWithLorem, i === 0));
            }
            if (wrapHtml) {
                result = paragraphs.map(p => '<p>' + p + '</p>').join('\n\n');
                displayHtml = '<code>' + escapeHtml(result) + '</code>';
            } else {
                result = paragraphs.join('\n\n');
                displayHtml = paragraphs.map(p => '<p>' + escapeHtml(p) + '</p>').join('');
            }
        } else if (currentType === 'sentences') {
            const sentences = [];
            for (let i = 0; i < count; i++) {
                if (i === 0 && startWithLorem) {
                    sentences.push(LOREM_OPENER[currentStyle]);
                } else {
                    sentences.push(generateSentence(currentStyle, 5, 15));
                }
            }
            result = sentences.join(' ');
            if (wrapHtml) {
                result = '<p>' + result + '</p>';
                displayHtml = '<code>' + escapeHtml(result) + '</code>';
            } else {
                displayHtml = '<p>' + escapeHtml(result) + '</p>';
            }
        } else { // words
            const words = [];
            if (startWithLorem) {
                const openerWords = LOREM_OPENER[currentStyle].replace('.', '').split(' ');
                for (let i = 0; i < Math.min(count, openerWords.length); i++) {
                    words.push(openerWords[i]);
                }
            }
            while (words.length < count) {
                words.push(generateWord(currentStyle));
            }
            // Capitalize first word
            if (words.length > 0) {
                words[0] = capitalize(words[0]);
            }
            result = words.join(' ');
            if (wrapHtml) {
                result = '<p>' + result + '</p>';
                displayHtml = '<code>' + escapeHtml(result) + '</code>';
            } else {
                displayHtml = '<p>' + escapeHtml(result) + '</p>';
            }
        }

        generatedText = result;
        output.innerHTML = displayHtml;
        updateStats();
        copyBtn.disabled = false;
    }

    function escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function updateStats() {
        if (!generatedText) {
            wordCountEl.textContent = '0 words';
            charCountEl.textContent = '0 characters';
            return;
        }
        const plainText = generatedText.replace(/<[^>]*>/g, '');
        const words = plainText.trim().split(/\s+/).filter(w => w.length > 0);
        wordCountEl.textContent = words.length + ' word' + (words.length !== 1 ? 's' : '');
        charCountEl.textContent = plainText.length + ' character' + (plainText.length !== 1 ? 's' : '');
    }

    function showToast(msg) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2000);
    }

    // --- Events ---

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.style-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentStyle = btn.dataset.style;
        });
    });

    // Type buttons
    document.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.dataset.type;
        });
    });

    // Count controls
    countDown.addEventListener('click', () => {
        const val = parseInt(countInput.value) || 1;
        if (val > 1) countInput.value = val - 1;
    });

    countUp.addEventListener('click', () => {
        const val = parseInt(countInput.value) || 1;
        if (val < 100) countInput.value = val + 1;
    });

    // Generate
    generateBtn.addEventListener('click', generateContent);

    // Copy
    copyBtn.addEventListener('click', () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText).then(() => {
            showToast('Copied to clipboard');
        }).catch(() => {
            // Fallback
            const ta = document.createElement('textarea');
            ta.value = generatedText;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            showToast('Copied to clipboard');
        });
    });

    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && document.activeElement !== countInput) {
            generateContent();
        }
    });
})();
