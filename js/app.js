// ABOUTME: 6th grade (2026-27) practice page: lists, per-word progress, review flags and practice mode
// ABOUTME: Progress lives in localStorage and can be saved to / loaded from a backup file

(() => {
    const DATA_URL = 'data/words_6th.json';
    const AUDIO_DIR = 'audio/6th';
    const KEYS = {
        progress: 'spellingbee-6th-progress-v1',
        collapsed: 'spellingbee-6th-collapsed-v1',
        filter: 'spellingbee-6th-filter-v1'
    };
    const { storage } = SpellingBee;

    // ---------- State ----------
    let words = [];          // [{id, word, group, alt?, altNote?}]
    let groups = [];         // [{id, name, source, count}]
    let progress = {};       // { wordKey: {s: 'done'|'review', m: misses, t: timestamp} }
    let filter = storage.get(KEYS.filter, 'all');
    let collapsed = new Set(storage.get(KEYS.collapsed, null) || []);
    let firstVisit = storage.get(KEYS.collapsed, null) === null;
    let showAll = false;
    const revealed = new Set();   // ids revealed one by one

    const $ = id => document.getElementById(id);
    const keyOf = w => w.word.toLowerCase();
    const statusOf = w => (progress[keyOf(w)] || {}).s || 'todo';
    const missesOf = w => (progress[keyOf(w)] || {}).m || 0;

    // ---------- Progress ----------
    function loadProgress() {
        const saved = storage.get(KEYS.progress, null);
        progress = saved && saved.words ? saved.words : {};
    }

    function saveProgress() {
        const ok = storage.set(KEYS.progress, { version: 1, words: progress });
        if (!ok) toast('Could not save progress in this browser (private mode?)');
    }

    function setStatus(w, status, { miss = false } = {}) {
        const key = keyOf(w);
        const entry = progress[key] || {};
        if (miss) entry.m = (entry.m || 0) + 1;
        if (status === 'todo') {
            delete entry.s;
        } else {
            entry.s = status;
        }
        entry.t = Date.now();
        if (!entry.s && !entry.m) {
            delete progress[key];
        } else {
            progress[key] = entry;
        }
        saveProgress();
        updateCard(w);
        updateCounts();
    }

    function counts(list) {
        const c = { all: list.length, done: 0, review: 0, todo: 0, notStarted: 0 };
        list.forEach(w => {
            const s = statusOf(w);
            if (s === 'done') c.done++;
            else {
                c.todo++;
                if (s === 'review') c.review++;
                else c.notStarted++;
            }
        });
        return c;
    }

    function matchesFilter(w, f) {
        const s = statusOf(w);
        if (f === 'done') return s === 'done';
        if (f === 'review') return s === 'review';
        if (f === 'todo') return s !== 'done';
        return true;
    }

    // ---------- Masking ----------
    // Letters become dots; spaces stay so multi-word entries read as two words.
    function maskWord(word) {
        return word.split(' ').map(part => '•'.repeat(part.length)).join('  ');
    }

    function fillWord(el, w) {
        el.innerHTML = '';
        const main = document.createElement('span');
        main.className = 'word-revealed';
        main.textContent = w.word;
        el.appendChild(main);
        if (w.alt) {
            const alt = document.createElement('span');
            alt.className = 'word-alt';
            alt.textContent = `or ${w.alt}` + (w.altNote ? ` (${w.altNote})` : '');
            el.appendChild(alt);
        }
    }

    function fillMask(el, w) {
        el.innerHTML = '';
        const mask = document.createElement('span');
        mask.className = 'word-masked';
        mask.textContent = maskWord(w.word);
        el.appendChild(mask);
        const sr = document.createElement('span');
        sr.className = 'visually-hidden';
        sr.textContent = 'Hidden word';
        el.appendChild(sr);
    }

    // ---------- Rendering ----------
    function renderLists() {
        const container = $('lists');
        container.innerHTML = '';

        groups.forEach(g => {
            const section = document.createElement('section');
            section.className = 'list-section';
            section.dataset.group = g.id;

            const header = document.createElement('div');
            header.className = 'list-header';

            const toggle = document.createElement('button');
            toggle.className = 'list-toggle';
            toggle.setAttribute('aria-controls', `list-body-${g.id}`);
            toggle.innerHTML = `
                <span class="chevron" aria-hidden="true">▸</span>
                <span class="list-title">
                    <span class="list-name"></span>
                    <span class="list-source"><span class="list-words"></span><span class="hide-sm list-page"></span></span>
                </span>
                <span class="list-stats">
                    <span class="list-count"></span>
                    <span class="mini-bar" aria-hidden="true"><span class="progress-done"></span><span class="progress-review"></span></span>
                </span>`;
            toggle.querySelector('.list-name').textContent = g.name;
            toggle.querySelector('.list-words').textContent = `${g.count} words`;
            toggle.querySelector('.list-page').textContent = ` · ${g.source}`;
            toggle.addEventListener('click', () => toggleGroup(g.id));

            const practiceBtn = document.createElement('button');
            practiceBtn.className = 'btn-ghost list-practice';
            practiceBtn.textContent = 'Practice';
            practiceBtn.setAttribute('aria-label', `Practice ${g.name}`);
            practiceBtn.addEventListener('click', () => openPractice({ lists: [g.id] }));

            header.appendChild(toggle);
            header.appendChild(practiceBtn);

            const body = document.createElement('div');
            body.className = 'list-body';
            body.id = `list-body-${g.id}`;

            const grid = document.createElement('div');
            grid.className = 'word-grid';
            words.filter(w => w.group === g.id).forEach(w => grid.appendChild(createCard(w)));

            const empty = document.createElement('p');
            empty.className = 'list-empty';
            empty.hidden = true;

            body.appendChild(grid);
            body.appendChild(empty);
            section.appendChild(header);
            section.appendChild(body);
            container.appendChild(section);
        });

        applyCollapsed();
    }

    function createCard(w) {
        const card = document.createElement('article');
        card.className = 'card';
        card.id = `card-${w.id}`;

        card.innerHTML = `
            <div class="card-top">
                <span class="card-num"></span>
                <span class="card-badge"></span>
            </div>
            <button class="card-word" aria-label="Show or hide word ${w.id}"></button>
            <div class="card-actions">
                <button class="act act-play" aria-label="Play word ${w.id}">🔊<span>Play</span></button>
                <button class="act act-done" aria-pressed="false" aria-label="Mark word ${w.id} as done">✓<span>Got it</span></button>
                <button class="act act-review" aria-pressed="false" aria-label="Flag word ${w.id} for review">⚑<span>Review</span></button>
            </div>`;
        card.querySelector('.card-num').textContent = w.id;

        card.querySelector('.card-word').addEventListener('click', () => {
            if (revealed.has(w.id)) revealed.delete(w.id); else revealed.add(w.id);
            updateCard(w);
        });
        card.querySelector('.act-play').addEventListener('click', e => playWord(w, e.currentTarget));
        card.querySelector('.act-done').addEventListener('click', () => {
            setStatus(w, statusOf(w) === 'done' ? 'todo' : 'done');
        });
        card.querySelector('.act-review').addEventListener('click', () => {
            setStatus(w, statusOf(w) === 'review' ? 'todo' : 'review');
        });

        updateCard(w, card);
        return card;
    }

    function updateCard(w, card = $(`card-${w.id}`)) {
        if (!card) return;
        const s = statusOf(w);
        const m = missesOf(w);
        card.classList.toggle('is-done', s === 'done');
        card.classList.toggle('is-review', s === 'review');

        const badge = card.querySelector('.card-badge');
        const parts = [];
        if (s === 'done') parts.push('✓ Done');
        if (s === 'review') parts.push('⚑ Review');
        if (m > 0) parts.push(`missed ${m}×`);
        badge.textContent = parts.join(' · ');

        card.querySelector('.act-done').setAttribute('aria-pressed', String(s === 'done'));
        card.querySelector('.act-review').setAttribute('aria-pressed', String(s === 'review'));

        const display = card.querySelector('.card-word');
        const show = showAll || revealed.has(w.id);
        display.classList.toggle('is-shown', show);
        if (show) fillWord(display, w); else fillMask(display, w);

        card.hidden = !matchesFilter(w, filter);
    }

    function updateCounts() {
        const c = counts(words);
        $('done-count').textContent = c.done;
        $('total-count').textContent = c.all;
        $('legend-done').textContent = c.done;
        $('legend-review').textContent = c.review;
        $('legend-todo').textContent = c.notStarted;
        setBar($('overall-bar'), c);
        $('overall-bar').setAttribute('aria-label', `${c.done} of ${c.all} done, ${c.review} flagged for review`);

        const left = c.all - c.done;
        $('summary-sub').textContent = c.done === 0 && c.review === 0
            ? 'Spell a word correctly to mark it done. Flag tricky ones for review.'
            : left === 0
                ? 'Every word is done. Great work! Keep reviewing to stay sharp.'
                : `${left} to go${c.review ? ` · ${c.review} flagged for review` : ''}`;

        document.querySelectorAll('[data-count]').forEach(el => {
            el.textContent = c[el.dataset.count];
        });

        groups.forEach(g => {
            const section = document.querySelector(`.list-section[data-group="${g.id}"]`);
            if (!section) return;
            const gw = words.filter(w => w.group === g.id);
            const gc = counts(gw);
            section.querySelector('.list-count').textContent =
                `${gc.done}/${gc.all} done` + (gc.review ? ` · ${gc.review} ⚑` : '');
            setBar(section.querySelector('.mini-bar'), gc);
            section.classList.toggle('is-complete', gc.done === gc.all);

            const visible = gw.filter(w => matchesFilter(w, filter)).length;
            const empty = section.querySelector('.list-empty');
            empty.hidden = visible > 0;
            empty.textContent = {
                done: 'No words done in this list yet.',
                review: 'Nothing flagged for review in this list.',
                todo: 'Every word in this list is done!'
            }[filter] || '';
        });
    }

    function setBar(bar, c) {
        const pct = n => (c.all ? (n / c.all) * 100 : 0);
        bar.querySelector('.progress-done').style.width = `${pct(c.done)}%`;
        bar.querySelector('.progress-review').style.width = `${pct(c.review)}%`;
    }

    function refreshAllCards() {
        words.forEach(w => updateCard(w));
        updateCounts();
    }

    // ---------- Collapsing ----------
    function applyCollapsed() {
        document.querySelectorAll('.list-section').forEach(section => {
            const id = Number(section.dataset.group);
            const isCollapsed = collapsed.has(id);
            section.classList.toggle('is-collapsed', isCollapsed);
            section.querySelector('.list-toggle').setAttribute('aria-expanded', String(!isCollapsed));
            section.querySelector('.list-body').hidden = isCollapsed;
        });
        const allCollapsed = groups.every(g => collapsed.has(g.id));
        $('toggle-expand-all').textContent = allCollapsed ? 'Expand all' : 'Collapse all';
    }

    function toggleGroup(id) {
        if (collapsed.has(id)) collapsed.delete(id); else collapsed.add(id);
        storage.set(KEYS.collapsed, [...collapsed]);
        applyCollapsed();
    }

    // ---------- Toolbar ----------
    function setFilter(f) {
        filter = f;
        storage.set(KEYS.filter, f);
        document.querySelectorAll('#filter-chips .chip').forEach(chip => {
            chip.setAttribute('aria-pressed', String(chip.dataset.filter === f));
        });
        refreshAllCards();
    }

    function initToolbar() {
        document.querySelectorAll('#filter-chips .chip').forEach(chip => {
            chip.addEventListener('click', () => setFilter(chip.dataset.filter));
        });

        $('toggle-show-all').addEventListener('click', e => {
            showAll = !showAll;
            if (!showAll) revealed.clear();
            e.currentTarget.setAttribute('aria-pressed', String(showAll));
            e.currentTarget.textContent = showAll ? 'Hide all words' : 'Show all words';
            refreshAllCards();
        });

        $('toggle-expand-all').addEventListener('click', () => {
            const allCollapsed = groups.every(g => collapsed.has(g.id));
            collapsed = allCollapsed ? new Set() : new Set(groups.map(g => g.id));
            storage.set(KEYS.collapsed, [...collapsed]);
            applyCollapsed();
        });

        $('start-practice').addEventListener('click', () => openPractice());
    }

    // ---------- Audio ----------
    function audioPath(w) {
        return `${AUDIO_DIR}/${SpellingBee.sanitizeFileName(w.word)}.mp3`;
    }

    function playWord(w, button, rate = 1) {
        SpellingBee.playWord(w.word, audioPath(w), button, rate);
    }

    // ---------- Backup ----------
    function initBackup() {
        $('backup-save').addEventListener('click', () => {
            const payload = {
                app: 'SpellingBee',
                list: '6th-2026-27',
                savedAt: new Date().toISOString(),
                version: 1,
                words: progress
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `spellingbee-6th-progress-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            toast('Backup saved');
        });

        $('backup-load').addEventListener('change', async e => {
            const file = e.target.files[0];
            e.target.value = '';
            if (!file) return;
            try {
                const data = JSON.parse(await file.text());
                if (!data || data.app !== 'SpellingBee' || typeof data.words !== 'object') {
                    throw new Error('Not a SpellingBee backup');
                }
                const known = new Set(words.map(keyOf));
                const incoming = {};
                Object.entries(data.words).forEach(([k, v]) => {
                    if (!known.has(k) || !v || typeof v !== 'object') return;
                    const entry = {};
                    if (v.s === 'done' || v.s === 'review') entry.s = v.s;
                    if (Number.isFinite(v.m) && v.m > 0) entry.m = Math.floor(v.m);
                    if (Number.isFinite(v.t)) entry.t = v.t;
                    if (entry.s || entry.m) incoming[k] = entry;
                });
                const n = Object.keys(incoming).length;
                if (!confirm(`Load this backup (${n} words with progress)? It replaces the progress saved in this browser.`)) return;
                progress = incoming;
                saveProgress();
                refreshAllCards();
                toast('Backup loaded');
            } catch (err) {
                console.error(err);
                alert('That file is not a SpellingBee progress backup.');
            }
        });

        $('progress-reset').addEventListener('click', () => {
            if (!confirm('Reset all progress? Done words, review flags and missed counts will be cleared.')) return;
            progress = {};
            saveProgress();
            refreshAllCards();
            toast('Progress reset');
        });
    }

    // ---------- Toast ----------
    let toastTimer = null;
    function toast(message) {
        const el = $('toast');
        el.textContent = message;
        el.classList.add('is-visible');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
    }

    // ---------- Practice ----------
    const practice = {
        pool: 'todo',
        lists: [],      // empty = all lists
        size: 20,
        queue: [],
        index: 0,
        results: [],    // [{w, correct, skipped}]
        answered: false,
        lastFocus: null
    };

    function normalize(text) {
        return text
            .normalize('NFD').replace(/[̀-ͯ]/g, '')
            .replace(/[’‘]/g, "'")
            .replace(/\s+/g, ' ')
            .trim()
            .toLowerCase();
    }

    function isCorrect(w, typed) {
        const t = normalize(typed);
        return t === normalize(w.word) || (w.alt && t === normalize(w.alt));
    }

    function practicePool() {
        return words.filter(w =>
            (practice.lists.length === 0 || practice.lists.includes(w.group)) &&
            matchesFilter(w, practice.pool));
    }

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function showView(id) {
        ['practice-setup', 'practice-question', 'practice-summary'].forEach(v => {
            $(v).hidden = v !== id;
        });
    }

    function openPractice({ lists } = {}) {
        practice.lastFocus = document.activeElement;
        if (lists) practice.lists = lists;
        // Default to review words when there are some and no to-do pool is chosen yet
        renderSetup();
        $('practice').hidden = false;
        document.body.classList.add('no-scroll');
        $('practice-step').textContent = '';
        showView('practice-setup');
        $('setup-start').focus();
    }

    function closePractice() {
        $('practice').hidden = true;
        document.body.classList.remove('no-scroll');
        if (practice.lastFocus && practice.lastFocus.focus) practice.lastFocus.focus();
    }

    function renderSetup() {
        const listWrap = $('setup-lists');
        listWrap.innerHTML = '';
        const opts = [{ id: 0, name: 'All lists' }].concat(groups);
        opts.forEach(g => {
            const b = document.createElement('button');
            b.textContent = g.name;
            const pressed = g.id === 0 ? practice.lists.length === 0 : practice.lists.includes(g.id);
            b.setAttribute('aria-pressed', String(pressed));
            b.addEventListener('click', () => {
                if (g.id === 0) {
                    practice.lists = [];
                } else {
                    const set = new Set(practice.lists);
                    if (set.has(g.id)) set.delete(g.id); else set.add(g.id);
                    practice.lists = set.size === groups.length ? [] : [...set];
                }
                renderSetup();
            });
            listWrap.appendChild(b);
        });

        document.querySelectorAll('#setup-pool button').forEach(b => {
            b.setAttribute('aria-pressed', String(b.dataset.pool === practice.pool));
        });
        document.querySelectorAll('#setup-size button').forEach(b => {
            b.setAttribute('aria-pressed', String(Number(b.dataset.size) === practice.size));
        });

        const scoped = words.filter(w => practice.lists.length === 0 || practice.lists.includes(w.group));
        const c = counts(scoped);
        document.querySelectorAll('[data-pool-count]').forEach(el => {
            el.textContent = `(${c[el.dataset.poolCount]})`;
        });

        const available = practicePool().length;
        const n = practice.size ? Math.min(practice.size, available) : available;
        $('setup-summary').textContent = available === 0
            ? {
                todo: 'Every word here is done. Pick “All” to keep practicing.',
                review: 'No review words here. Missed words get flagged automatically.',
                all: 'No words selected.'
            }[practice.pool]
            : `${n} word${n === 1 ? '' : 's'} in random order.`;
        $('setup-start').disabled = available === 0;
    }

    function startPractice(queue) {
        practice.queue = queue;
        practice.index = 0;
        practice.results = [];
        showView('practice-question');
        showQuestion();
    }

    function currentWord() {
        return practice.queue[practice.index];
    }

    function showQuestion() {
        const w = currentWord();
        practice.answered = false;
        $('practice-step').textContent = `${practice.index + 1} of ${practice.queue.length}`;
        $('q-mask').textContent = maskWord(w.word);
        const group = groups.find(g => g.id === w.group);
        const letters = w.word.replace(/[^\p{L}]/gu, '').length;
        $('q-meta').textContent = `${group ? group.name + ' · ' : ''}${letters} letters` +
            (w.word.includes(' ') ? ' · two words' : '') +
            (statusOf(w) === 'review' ? ' · ⚑ review word' : '');
        $('q-input').value = '';
        $('q-input').disabled = false;
        $('q-form').hidden = false;
        $('q-result').hidden = true;
        $('q-self').hidden = true;
        $('q-next-row').hidden = true;
        $('q-override').hidden = true;
        $('q-input').focus();
        playWord(w, $('q-play'));
    }

    function showAnswerBlock(w) {
        $('q-result').hidden = false;
        $('q-answer').textContent = w.word;
        $('q-alt').textContent = w.alt ? `also correct: ${w.alt}${w.altNote ? ` (${w.altNote})` : ''}` : '';
        $('q-alt').hidden = !w.alt;
    }

    function record(w, correct, { skipped = false } = {}) {
        practice.results.push({ w, correct, skipped });
        if (skipped) return;
        if (correct) setStatus(w, 'done');
        else setStatus(w, 'review', { miss: true });
    }

    function checkAnswer() {
        if (practice.answered) {
            nextQuestion();
            return;
        }
        const w = currentWord();
        const typed = $('q-input').value;
        if (!typed.trim()) {
            $('q-input').focus();
            return;
        }
        practice.answered = true;
        const ok = isCorrect(w, typed);
        record(w, ok);

        $('q-form').hidden = true;
        showAnswerBlock(w);
        $('q-result').className = `q-result ${ok ? 'is-correct' : 'is-wrong'}`;
        $('q-verdict').textContent = ok ? '✓ Correct!' : '✗ Not quite. Flagged for review.';
        $('q-typed').textContent = ok ? '' : `You typed: ${typed.trim()}`;
        $('q-typed').hidden = ok;
        $('q-next-row').hidden = false;
        $('q-override').hidden = ok;
        $('q-next').focus();
    }

    function showAnswer() {
        const w = currentWord();
        practice.answered = true;
        $('q-form').hidden = true;
        showAnswerBlock(w);
        $('q-result').className = 'q-result';
        $('q-verdict').textContent = 'Did you spell it right?';
        $('q-typed').hidden = true;
        $('q-self').hidden = false;
        $('q-got').focus();
    }

    function selfMark(correct) {
        const w = currentWord();
        record(w, correct);
        nextQuestion();
    }

    function overrideCorrect() {
        const w = currentWord();
        const last = practice.results[practice.results.length - 1];
        if (last && last.w === w) {
            last.correct = true;
            // Undo the miss that was just counted
            const entry = progress[keyOf(w)];
            if (entry && entry.m) entry.m -= 1;
            setStatus(w, 'done');
        }
        nextQuestion();
    }

    function nextQuestion() {
        practice.index++;
        if (practice.index >= practice.queue.length) {
            showSummary();
        } else {
            showQuestion();
        }
    }

    function showSummary() {
        const answered = practice.results.filter(r => !r.skipped);
        const right = answered.filter(r => r.correct).length;
        const missed = answered.filter(r => !r.correct);
        const skipped = practice.results.length - answered.length;

        $('practice-step').textContent = 'Finished';
        $('s-score').textContent = answered.length
            ? `${right} of ${answered.length} correct`
            : 'No words answered';
        const c = counts(words);
        $('s-detail').textContent = [
            missed.length ? `${missed.length} flagged for review` : 'Nothing missed!',
            skipped ? `${skipped} skipped` : '',
            `${c.done} of ${c.all} done overall`
        ].filter(Boolean).join(' · ');

        const list = $('s-missed');
        list.innerHTML = '';
        missed.forEach(r => {
            const li = document.createElement('li');
            li.textContent = r.w.word;
            list.appendChild(li);
        });
        list.hidden = missed.length === 0;
        $('s-again').hidden = missed.length === 0;
        showView('practice-summary');
        (missed.length ? $('s-again') : $('s-done')).focus();
    }

    function initPractice() {
        document.querySelectorAll('#setup-pool button').forEach(b => {
            b.addEventListener('click', () => { practice.pool = b.dataset.pool; renderSetup(); });
        });
        document.querySelectorAll('#setup-size button').forEach(b => {
            b.addEventListener('click', () => { practice.size = Number(b.dataset.size); renderSetup(); });
        });
        $('setup-start').addEventListener('click', () => {
            const pool = shuffle(practicePool());
            if (!pool.length) return;
            startPractice(practice.size ? pool.slice(0, practice.size) : pool);
        });

        $('q-play').addEventListener('click', e => playWord(currentWord(), e.currentTarget));
        $('q-slow').addEventListener('click', e => playWord(currentWord(), e.currentTarget, 0.7));
        $('q-form').addEventListener('submit', e => { e.preventDefault(); checkAnswer(); });
        $('q-show').addEventListener('click', showAnswer);
        $('q-skip').addEventListener('click', () => {
            record(currentWord(), false, { skipped: true });
            nextQuestion();
        });
        $('q-got').addEventListener('click', () => selfMark(true));
        $('q-missed').addEventListener('click', () => selfMark(false));
        $('q-next').addEventListener('click', nextQuestion);
        $('q-override').addEventListener('click', overrideCorrect);

        $('s-again').addEventListener('click', () => {
            const missed = practice.results.filter(r => !r.skipped && !r.correct).map(r => r.w);
            startPractice(shuffle(missed));
        });
        $('s-done').addEventListener('click', closePractice);
        $('practice-close').addEventListener('click', closePractice);

        $('practice').addEventListener('click', e => {
            if (e.target === $('practice')) closePractice();
        });
        document.addEventListener('keydown', e => {
            if ($('practice').hidden) return;
            if (e.key === 'Escape') {
                closePractice();
                return;
            }
            // Keep keyboard focus inside the dialog
            if (e.key === 'Tab') {
                const focusable = [...$('practice').querySelectorAll('button, input, [tabindex]')]
                    .filter(el => !el.disabled && el.offsetParent !== null);
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        });
    }

    // ---------- Start ----------
    async function init() {
        SpellingBee.initThemeToggle();
        initToolbar();
        initBackup();
        initPractice();
        loadProgress();

        try {
            const response = await fetch(DATA_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            words = data.words;
            groups = data.groups;
        } catch (error) {
            console.error('Error loading words:', error);
            $('lists').innerHTML = '<p class="list-empty">Could not load the word list. Please refresh the page.</p>';
            return;
        }

        // First visit: open List 1, keep the others tidy
        if (firstVisit) {
            collapsed = new Set(groups.slice(1).map(g => g.id));
        }
        if (!['all', 'todo', 'review', 'done'].includes(filter)) filter = 'all';

        renderLists();
        setFilter(filter);
    }

    document.addEventListener('DOMContentLoaded', init);
})();
