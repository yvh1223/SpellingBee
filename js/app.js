// ABOUTME: Main application logic for SpellingBee practice website
// ABOUTME: Handles loading words, pronunciation playback, and reveal/hide functionality

let wordsData = {
    '1B': [],
    '2B': [],
    '3B': []
};

let newWords3B = [];

async function loadWords() {
    try {
        // Load all three bee levels
        const responses = await Promise.all([
            fetch('data/words_1B.json'),
            fetch('data/words_2B.json'),
            fetch('data/words_3B.json'),
            fetch('data/words_3B_new.json')
        ]);

        const [data1B, data2B, data3B, data3BNew] = await Promise.all(
            responses.map(r => r.json())
        );

        wordsData['1B'] = data1B.words;
        wordsData['2B'] = data2B.words;
        wordsData['3B'] = data3B.words;

        // Store new words for highlighting
        newWords3B = data3BNew.words.map(w => w.word.toLowerCase());

        renderWords('1B');
        renderWords('2B');
        renderWords('3B');
        updateStats();
    } catch (error) {
        console.error('Error loading words:', error);
        alert('Error loading words. Please refresh the page.');
    }
}

function renderWords(beeLevel) {
    const wordList = document.getElementById(`word-list-${beeLevel}`);
    if (!wordList) {
        console.error(`word-list-${beeLevel} element not found`);
        return;
    }
    wordList.innerHTML = '';

    const words = wordsData[beeLevel];
    words.forEach(wordObj => {
        const wordCard = createWordCard(wordObj, beeLevel);
        wordList.appendChild(wordCard);
    });
}

function createWordCard(wordObj, beeLevel) {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.id = `word-${beeLevel}-${wordObj.id}`;

    // Add special highlight for newly added words in 3B
    if (beeLevel === '3B' && newWords3B.includes(wordObj.word.toLowerCase())) {
        card.classList.add('word-card-new');
    }

    const header = document.createElement('div');
    header.className = 'word-header';

    const wordNumber = document.createElement('span');
    wordNumber.className = 'word-number';
    wordNumber.textContent = `${wordObj.id}`;

    const actions = document.createElement('div');
    actions.className = 'word-actions';

    const playBtn = document.createElement('button');
    playBtn.className = 'btn btn-play';
    playBtn.textContent = 'Play';
    playBtn.onclick = () => playPronunciation(wordObj.word, beeLevel, playBtn);

    const revealBtn = document.createElement('button');
    revealBtn.className = 'btn btn-reveal';
    revealBtn.textContent = 'Reveal';
    revealBtn.onclick = () => toggleReveal(beeLevel, wordObj.id, true);

    const hideBtn = document.createElement('button');
    hideBtn.className = 'btn btn-hide';
    hideBtn.textContent = 'Hide';
    hideBtn.style.display = 'none';
    hideBtn.onclick = () => toggleReveal(beeLevel, wordObj.id, false);

    actions.appendChild(playBtn);
    actions.appendChild(revealBtn);
    actions.appendChild(hideBtn);

    header.appendChild(wordNumber);
    header.appendChild(actions);

    const wordDisplay = document.createElement('div');
    wordDisplay.className = 'word-display';
    wordDisplay.id = `display-${beeLevel}-${wordObj.id}`;

    const maskedWord = document.createElement('span');
    maskedWord.className = 'word-masked';
    maskedWord.textContent = '•'.repeat(wordObj.word.length);

    wordDisplay.appendChild(maskedWord);

    card.appendChild(header);
    card.appendChild(wordDisplay);

    return card;
}

function playPronunciation(word, beeLevel, button) {
    const audioFileName = sanitizeFileName(word);
    const audioPath = `audio/${beeLevel}/${audioFileName}.mp3`;

    const audio = new Audio(audioPath);

    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Playing...';

    audio.play().catch(error => {
        console.error(`Audio error for "${word}":`, error);
        button.textContent = 'No Audio';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    });

    audio.onended = () => {
        button.textContent = originalText;
        button.disabled = false;
    };

    audio.onerror = () => {
        console.error(`Audio file not found: ${audioPath}`);
        button.textContent = 'No Audio';
        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 1500);
    };
}

function sanitizeFileName(word) {
    return word
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/['']/g, '')
        .replace(/[àâä]/g, 'a')
        .replace(/[éèêë]/g, 'e')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/[ùûü]/g, 'u')
        .replace(/[^a-z0-9_]/g, '');
}

function toggleReveal(beeLevel, wordId, reveal) {
    const wordObj = wordsData[beeLevel].find(w => w.id === wordId);
    if (!wordObj) return;

    const displayElement = document.getElementById(`display-${beeLevel}-${wordId}`);
    const wordCard = document.getElementById(`word-${beeLevel}-${wordId}`);
    const revealBtn = wordCard.querySelector('.btn-reveal');
    const hideBtn = wordCard.querySelector('.btn-hide');

    if (reveal) {
        displayElement.innerHTML = `<span class="word-revealed">${wordObj.word}</span>`;
        revealBtn.style.display = 'none';
        hideBtn.style.display = 'inline-block';
    } else {
        displayElement.innerHTML = `<span class="word-masked">${'•'.repeat(wordObj.word.length)}</span>`;
        revealBtn.style.display = 'inline-block';
        hideBtn.style.display = 'none';
    }
}

function updateStats() {
    const totalWords = wordsData['1B'].length + wordsData['2B'].length + wordsData['3B'].length;
    const wordCount = document.getElementById('word-count');
    wordCount.textContent = `${totalWords} words total (1B: ${wordsData['1B'].length}, 2B: ${wordsData['2B'].length}, 3B: ${wordsData['3B'].length})`;
}

function initializeSections() {
    const sections = document.querySelectorAll('.bee-section');

    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        const toggleBtn = section.querySelector('.toggle-btn');
        const content = section.querySelector('.section-content');
        const masterRevealBtn = section.querySelector('.master-reveal-btn');

        // Prevent section expand/collapse when clicking action buttons
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isCollapsed = content.classList.contains('collapsed');

            if (isCollapsed) {
                content.classList.remove('collapsed');
                toggleBtn.classList.add('expanded');
            } else {
                content.classList.add('collapsed');
                toggleBtn.classList.remove('expanded');
            }
        });

        // Master reveal/hide button
        masterRevealBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMasterReveal(masterRevealBtn);
        });

        // Click on h2 to expand/collapse
        const h2 = header.querySelector('h2');
        h2.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');

            if (isCollapsed) {
                content.classList.remove('collapsed');
                toggleBtn.classList.add('expanded');
            } else {
                content.classList.add('collapsed');
                toggleBtn.classList.remove('expanded');
            }
        });
    });
}

function toggleMasterReveal(button) {
    const beeLevel = button.getAttribute('data-level');
    const isRevealing = button.textContent === 'Reveal All';

    // Get all word cards for this level
    const wordList = document.getElementById(`word-list-${beeLevel}`);
    const wordCards = wordList.querySelectorAll('.word-card');

    wordCards.forEach(card => {
        const wordId = parseInt(card.id.split('-').pop());
        const revealBtn = card.querySelector('.btn-reveal');
        const hideBtn = card.querySelector('.btn-hide');
        const displayElement = card.querySelector('.word-display');
        const wordObj = wordsData[beeLevel].find(w => w.id === wordId);

        if (!wordObj) return;

        if (isRevealing) {
            // Reveal this word
            displayElement.innerHTML = `<span class="word-revealed">${wordObj.word}</span>`;
            revealBtn.style.display = 'none';
            hideBtn.style.display = 'inline-block';
        } else {
            // Hide this word
            displayElement.innerHTML = `<span class="word-masked">${'•'.repeat(wordObj.word.length)}</span>`;
            revealBtn.style.display = 'inline-block';
            hideBtn.style.display = 'none';
        }
    });

    // Toggle button text
    button.textContent = isRevealing ? 'Hide All' : 'Reveal All';
}

function initializeThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn.querySelector('.theme-icon');

    // Load saved theme preference
    const savedTheme = localStorage.getItem('spellingbee-theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeIcon.textContent = '☀️';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        // Update icon
        themeIcon.textContent = isDark ? '☀️' : '🌙';

        // Save preference
        localStorage.setItem('spellingbee-theme', isDark ? 'dark' : 'light');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeSections();
    initializeThemeToggle();
    loadWords();
});
