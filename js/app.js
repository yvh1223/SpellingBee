// ABOUTME: Main application logic for SpellingBee practice website
// ABOUTME: Handles loading words, pronunciation playback, and reveal/hide functionality

let wordsData = [];

async function loadWords() {
    try {
        const response = await fetch('words.json');
        const data = await response.json();
        wordsData = data.words;
        renderWords();
        updateStats();
    } catch (error) {
        console.error('Error loading words:', error);
        document.getElementById('word-list').innerHTML = '<p style="text-align: center; color: #86868b;">Error loading words. Please refresh.</p>';
    }
}

function renderWords() {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';

    wordsData.forEach(wordObj => {
        const wordCard = createWordCard(wordObj);
        wordList.appendChild(wordCard);
    });
}

function createWordCard(wordObj) {
    const card = document.createElement('div');
    card.className = 'word-card';
    card.id = `word-${wordObj.id}`;

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
    playBtn.onclick = () => playPronunciation(wordObj.word, playBtn);

    const revealBtn = document.createElement('button');
    revealBtn.className = 'btn btn-reveal';
    revealBtn.textContent = 'Reveal';
    revealBtn.onclick = () => toggleReveal(wordObj.id, true);

    const hideBtn = document.createElement('button');
    hideBtn.className = 'btn btn-hide';
    hideBtn.textContent = 'Hide';
    hideBtn.style.display = 'none';
    hideBtn.onclick = () => toggleReveal(wordObj.id, false);

    actions.appendChild(playBtn);
    actions.appendChild(revealBtn);
    actions.appendChild(hideBtn);

    header.appendChild(wordNumber);
    header.appendChild(actions);

    const wordDisplay = document.createElement('div');
    wordDisplay.className = 'word-display';
    wordDisplay.id = `display-${wordObj.id}`;

    const maskedWord = document.createElement('span');
    maskedWord.className = 'word-masked';
    maskedWord.textContent = '•'.repeat(wordObj.word.length);

    wordDisplay.appendChild(maskedWord);

    card.appendChild(header);
    card.appendChild(wordDisplay);

    return card;
}

function playPronunciation(word, button) {
    const audioFileName = sanitizeFileName(word);
    const audioPath = `audio/${audioFileName}.mp3`;

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

function toggleReveal(wordId, reveal) {
    const wordObj = wordsData.find(w => w.id === wordId);
    if (!wordObj) return;

    const displayElement = document.getElementById(`display-${wordId}`);
    const wordCard = document.getElementById(`word-${wordId}`);
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
    const wordCount = document.getElementById('word-count');
    wordCount.textContent = `${wordsData.length} words`;
}

document.addEventListener('DOMContentLoaded', loadWords);
