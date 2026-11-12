// ABOUTME: Helpers shared by the 6th grade page and the archive page
// ABOUTME: Audio playback (MP3 with browser-voice fallback), file names, theme toggle, safe storage

const SpellingBee = (() => {
    let currentAudio = null;

    // Must stay in sync with sanitize_filename() in generate_all_audio.py
    function sanitizeFileName(word) {
        return word
            .toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/['’]/g, '')
            .replace(/[àâä]/g, 'a')
            .replace(/[éèêë]/g, 'e')
            .replace(/[îï]/g, 'i')
            .replace(/[ôö]/g, 'o')
            .replace(/[ùûü]/g, 'u')
            .replace(/[^a-z0-9_]/g, '');
    }

    function setButtonBusy(button, busy) {
        if (!button) return;
        if (busy) {
            button.classList.add('is-playing');
            button.setAttribute('aria-busy', 'true');
        } else {
            button.classList.remove('is-playing');
            button.removeAttribute('aria-busy');
        }
    }

    function speak(word, button, rate = 1) {
        if (!('speechSynthesis' in window)) {
            setButtonBusy(button, false);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'en-US';
        utterance.rate = 0.85 * rate;
        const done = () => setButtonBusy(button, false);
        utterance.onend = done;
        utterance.onerror = done;
        setTimeout(done, 4000);
        window.speechSynthesis.speak(utterance);
    }

    // Plays the word's MP3; falls back to the browser voice if the file is missing.
    function playWord(word, audioPath, button, rate = 1) {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio = null;
        }
        setButtonBusy(button, true);

        const audio = new Audio(audioPath);
        currentAudio = audio;
        audio.playbackRate = rate;
        audio.onended = () => setButtonBusy(button, false);
        audio.onpause = () => setButtonBusy(button, false);

        let fellBack = false;
        const fallback = () => {
            if (fellBack) return;
            fellBack = true;
            console.warn(`Audio unavailable for "${word}", using browser voice`);
            speak(word, button, rate);
        };
        audio.onerror = fallback;
        audio.play().catch(error => {
            // NotAllowedError means autoplay was blocked, not a missing file
            if (error && error.name === 'NotAllowedError') {
                setButtonBusy(button, false);
            } else {
                fallback();
            }
        });
    }

    const storage = {
        get(key, fallback) {
            try {
                const raw = localStorage.getItem(key);
                return raw === null ? fallback : JSON.parse(raw);
            } catch (e) {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                return false;
            }
        }
    };

    function initThemeToggle() {
        const button = document.getElementById('theme-toggle');
        if (!button) return;
        const icon = button.querySelector('.theme-icon');

        let saved = 'light';
        try {
            saved = localStorage.getItem('spellingbee-theme') || 'light';
        } catch (e) { /* storage blocked */ }

        const apply = isDark => {
            document.body.classList.toggle('dark-theme', isDark);
            icon.textContent = isDark ? '☀️' : '🌙';
            button.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        };
        apply(saved === 'dark');

        button.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark-theme');
            apply(isDark);
            try {
                localStorage.setItem('spellingbee-theme', isDark ? 'dark' : 'light');
            } catch (e) { /* storage blocked */ }
        });
    }

    return { sanitizeFileName, playWord, storage, initThemeToggle };
})();
