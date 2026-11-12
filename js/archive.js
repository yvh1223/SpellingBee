// ABOUTME: Archive page for the 2025-26 School Spelling Bee lists (1B, 2B, 3B)
// ABOUTME: Loads the three levels with pronunciation playback and reveal/hide per word

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

function renderRevealed(displayElement, wordObj) {
    displayElement.innerHTML = '';

    const revealed = document.createElement('span');
    revealed.className = 'word-revealed';
    revealed.textContent = wordObj.word;
    displayElement.appendChild(revealed);

    if (wordObj.alt) {
        const alt = document.createElement('span');
        alt.className = 'word-alt';
        alt.textContent = `or ${wordObj.alt}` + (wordObj.altNote ? ` (${wordObj.altNote})` : '');
        displayElement.appendChild(alt);
    }
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
    SpellingBee.playWord(word, `audio/${beeLevel}/${SpellingBee.sanitizeFileName(word)}.mp3`, button);
}

function toggleReveal(beeLevel, wordId, reveal) {
    const wordObj = wordsData[beeLevel].find(w => w.id === wordId);
    if (!wordObj) return;

    const displayElement = document.getElementById(`display-${beeLevel}-${wordId}`);
    const wordCard = document.getElementById(`word-${beeLevel}-${wordId}`);
    const revealBtn = wordCard.querySelector('.btn-reveal');
    const hideBtn = wordCard.querySelector('.btn-hide');

    if (reveal) {
        renderRevealed(displayElement, wordObj);
        revealBtn.style.display = 'none';
        hideBtn.style.display = 'inline-block';
    } else {
        displayElement.innerHTML = `<span class="word-masked">${'•'.repeat(wordObj.word.length)}</span>`;
        revealBtn.style.display = 'inline-block';
        hideBtn.style.display = 'none';
    }
}

function updateStats() {
    const levels = Object.keys(wordsData);
    const totalWords = levels.reduce((sum, level) => sum + wordsData[level].length, 0);
    const breakdown = levels.map(level => `${level}: ${wordsData[level].length}`).join(', ');
    const wordCount = document.getElementById('word-count');
    wordCount.textContent = `${totalWords} words total (${breakdown})`;
}

function initializeSections() {
    const sections = document.querySelectorAll('.bee-section');

    sections.forEach(section => {
        const header = section.querySelector('.section-header');
        const toggleBtn = section.querySelector('.toggle-btn');
        const content = section.querySelector('.section-content');
        const masterRevealBtn = section.querySelector('.master-reveal-btn');

        // Click anywhere on header to expand/collapse
        header.addEventListener('click', () => {
            const isCollapsed = content.classList.contains('collapsed');

            if (isCollapsed) {
                content.classList.remove('collapsed');
                toggleBtn.classList.add('expanded');
            } else {
                content.classList.add('collapsed');
                toggleBtn.classList.remove('expanded');
            }
        });

        // Prevent section expand/collapse when clicking action buttons
        masterRevealBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMasterReveal(masterRevealBtn);
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
            renderRevealed(displayElement, wordObj);
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

document.addEventListener('DOMContentLoaded', () => {
    initializeSections();
    SpellingBee.initThemeToggle();
    loadWords();
});
