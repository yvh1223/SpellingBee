# SpellingBee Project

## Team Names
- Claude: Spelling Sorceress
- DD: Desi Deadpool

## Project Overview
Building a pronunciation-driven spelling practice website for Vihaan's School Spelling Bee. The focus is on simplicity, elegance, and a calm learning experience with support for three difficulty levels.

## Key Design Principles
1. **Pronunciation First**: Each word has audio pronunciation that must be played
2. **Progressive Reveal**: Words are masked until the learner chooses to reveal them
3. **Calm UI**: Warm cream-based colors for light theme, dark mode for low-light environments
4. **Offline-Capable**: Everything works locally with no external dependencies
5. **Mobile-Friendly**: Responsive design for tablets and phones
6. **Multi-Level Support**: Three difficulty levels (1B, 2B, 3B) with collapsible sections
7. **Theme Support**: Light and dark themes with localStorage persistence

## Technical Stack
- Pure HTML5, CSS3, and vanilla JavaScript
- Data organized in `/data` directory as JSON files
- Audio files in `/audio` directory organized by level
- Python 3.13+ for audio generation (SSL workaround needed on macOS)
- Deployed to GitHub Pages

## Data Sources
- **1B (Basic)**: `schoolBee_1.txt` - 140 words (e.g., "tag", "send", "elephant")
- **2B (Intermediate)**: `schoolBee_2.txt` - 152 words (e.g., "almanac", "archipelago", "eccentric")
- **3B (Advanced)**: `schoolBee_3.txt` - 156 words (e.g., "apocalypse", "silhouette", "tuberculosis")
- Total: 448 words with accented characters and special formatting
- **3B New Words**: 11 words highlighted in yellow for focused practice

## Project Structure
```
/spellingbee
  index.html                    # Main landing page with collapsible sections
  /css
    style.css                   # Apple-inspired minimalist styling
  /js
    app.js                      # Multi-level word loading and pronunciation logic
  /audio                        # Organized audio files
    /1B                         # 140 MP3 files for 1B words
    /2B                         # 152 MP3 files for 2B words
    /3B                         # 156 MP3 files for 3B words
  /data                         # JSON word data
    words_1B.json               # 140 words with IDs
    words_2B.json               # 152 words with IDs
    words_3B.json               # 156 words with IDs
    words_3B_new.json           # 11 newly added 3B words for highlighting
  generate_all_audio.py         # Multi-level audio generation script
  generate_audio.py             # [ARCHIVED] Old single-level script
  words.json                    # [ARCHIVED] Old single-level data
  requirements.txt              # Python dependencies
  .env.example                  # API key template
  AUDIO_GENERATION_MULTI.md     # Multi-level audio generation docs
  AUDIO_GENERATION.md           # [ARCHIVED] Old single-level docs
  README.md
  PRD.md
  CLAUDE.md
  schoolBee_1.txt              # Source word list for 1B
  schoolBee_2.txt              # Source word list for 2B
  schoolBee_3.txt              # Source word list for 3B
```

## Repository
- GitHub: https://github.com/yvh1223/SpellingBee
- Live Site: https://yvh1223.github.io/SpellingBee/
- Personal account: yvh1223@gmail.com
- GPG signed commits with key: 98CE179940DF710F

## Implementation Status
✅ **Fully Implemented**:
- Website with pronunciation-driven interface
- All 448 audio files generated (1B: 140, 2B: 152, 3B: 156)
- Progressive reveal/hide functionality per word
- Master "Reveal All/Hide All" toggle per section
- Mobile-responsive design with warm, eye-friendly aesthetics
- Collapsible sections for each bee level (click anywhere on header)
- Smooth expand/collapse animations
- Level-specific audio path loading
- Dynamic word count statistics
- Dark/Light theme toggle with localStorage persistence
- Yellow highlight for 11 newly added 3B words
- Warm cream-based color palette for comfortable reading
- Deployed to GitHub Pages

## Technical Learnings

### 1. Multi-Level Architecture
**Challenge**: Needed to support three different word lists with separate audio files.

**Solution**:
- Organized audio into subdirectories (`/audio/1B`, `/audio/2B`, `/audio/3B`)
- Created separate JSON files in `/data` folder for each level
- Updated JavaScript to dynamically load all three levels in parallel using `Promise.all()`
- Modified `createWordCard()` and `playPronunciation()` to accept `beeLevel` parameter

**Code Pattern**:
```javascript
// Load all levels in parallel
const responses = await Promise.all([
    fetch('data/words_1B.json'),
    fetch('data/words_2B.json'),
    fetch('data/words_3B.json')
]);

// Audio path includes level
const audioPath = `audio/${beeLevel}/${audioFileName}.mp3`;
```

### 2. CSS Collapsible Sections with Smooth Animations
**Challenge**: Needed smooth expand/collapse without cutting off content or preventing scrolling.

**Initial Approach** (FAILED):
```css
.section-content {
    max-height: 5000px;  /* Fixed height - caused truncation */
    overflow: hidden;     /* Prevented scrolling */
}
```

**Problem**: With 145+ words in a section, content exceeded 5000px and was cut off.

**Final Solution**:
```css
.section-content {
    max-height: none;      /* No height limit when expanded */
    overflow: visible;      /* Allow scrolling */
    opacity: 1;
}

.section-content.collapsed {
    max-height: 0;         /* Collapse to zero */
    overflow: hidden;       /* Hide when collapsed */
    opacity: 0;            /* Fade out */
}
```

**Learning**: Use `overflow: visible` when expanded, only apply `overflow: hidden` when collapsed.

### 3. Python Audio Generation at Scale
**Challenge**: Generate 448 audio files efficiently without rate limiting issues.

**Solution**:
- Built `generate_all_audio.py` to process all three levels sequentially
- Added retry logic with exponential backoff (3 attempts per word)
- Implemented 0.5s delay between requests to avoid rate limits
- Skip existing files for incremental generation

**Cost**: ~$0.09 total for 448 words at $0.0002/word

### 4. Filename Sanitization Consistency
**Challenge**: Ensure Python filename generation matches JavaScript audio path lookups.

**Solution**: Identical sanitization logic in both Python and JavaScript:
- Lowercase
- Spaces → underscores
- Remove apostrophes
- Normalize accented characters (à→a, é→e, ñ→n, etc.)
- Remove special characters except underscores

**Example**: `"maître d'"` → `maitre_d.mp3`

### 5. Dynamic Word Count Statistics
**Challenge**: Show total word count and per-level breakdown in header.

**Solution**:
```javascript
function updateStats() {
    const totalWords = wordsData['1B'].length + wordsData['2B'].length + wordsData['3B'].length;
    wordCount.textContent = `${totalWords} words total (1B: ${wordsData['1B'].length}, 2B: ${wordsData['2B'].length}, 3B: ${wordsData['3B'].length})`;
}
```

### 6. Unique Element IDs Across Levels
**Challenge**: Avoid ID collisions when rendering words from multiple levels.

**Solution**: Include `beeLevel` in all IDs:
```javascript
card.id = `word-${beeLevel}-${wordObj.id}`;  // e.g., "word-1B-42"
displayElement.id = `display-${beeLevel}-${wordObj.id}`;
```

### 7. Dark/Light Theme Implementation with CSS Variables
**Challenge**: Support theme switching without duplicating styles.

**Solution**: CSS variables with theme-specific values:
```css
:root {
    --bg-primary: #f8f7f4;
    --bg-secondary: #fffef9;
    --text-primary: #2c2821;
}

body.dark-theme {
    --bg-primary: #1c1c1e;
    --bg-secondary: #2c2c2e;
    --text-primary: #f5f5f7;
}
```

**Implementation**:
- Single event listener toggles `dark-theme` class on `body`
- localStorage persists user preference across sessions
- All components automatically update via CSS variables

### 8. Master Reveal/Hide Functionality
**Challenge**: Toggle all words in a section while preserving individual reveal state.

**Solution**:
```javascript
function toggleMasterReveal(button) {
    const beeLevel = button.getAttribute('data-level');
    const isRevealing = button.textContent === 'Reveal All';
    const wordCards = wordList.querySelectorAll('.word-card');

    wordCards.forEach(card => {
        // Update display and toggle buttons for each card
    });

    button.textContent = isRevealing ? 'Hide All' : 'Reveal All';
}
```

**Key Pattern**: Use `stopPropagation()` on button clicks to prevent triggering section collapse.

### 9. Clickable Section Headers with Event Delegation
**Challenge**: Make entire header clickable while preventing button clicks from collapsing section.

**Initial Approach** (TOO COMPLEX):
- Separate click handlers for h2, toggle button, and action buttons
- Lots of duplicate code

**Final Solution**:
```javascript
// Single click handler on entire header
header.addEventListener('click', () => {
    // Toggle collapse/expand
});

// Stop propagation only on action buttons
masterRevealBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMasterReveal(masterRevealBtn);
});
```

**Learning**: Attach one handler to parent, use `stopPropagation()` selectively on children.

### 10. Eye-Friendly Color Palette Design
**Challenge**: Replace harsh white backgrounds with more comfortable colors.

**Solution**: Warm cream-based palette inspired by natural paper:
```css
--bg-primary: #f8f7f4;    /* Warm beige background */
--bg-secondary: #fffef9;   /* Soft cream cards */
--bg-tertiary: #f1ede4;    /* Light tan sections */
--text-primary: #2c2821;   /* Warm dark brown text */
--border-color: #e5dfd3;   /* Soft tan borders */
```

**Benefits**:
- Reduced eye strain during extended practice sessions
- Natural, paper-like aesthetic
- Better readability than stark white (#ffffff)

### 11. New Word Highlighting System
**Challenge**: Highlight 11 newly added words without hardcoding them in JavaScript.

**Solution**:
- Created `words_3B_new.json` with newly added words
- Load separately and store as array of lowercase words
- Check during card creation and add `.word-card-new` class
- Style with subtle yellow gradient

```javascript
newWords3B = data3BNew.words.map(w => w.word.toLowerCase());

if (beeLevel === '3B' && newWords3B.includes(wordObj.word.toLowerCase())) {
    card.classList.add('word-card-new');
}
```

**Learning**: Separate data-driven approach is more maintainable than hardcoded lists.

## Key Files to Archive
- `generate_audio.py` - Old single-level script (replaced by `generate_all_audio.py`)
- `words.json` - Old single-level data (replaced by `data/words_*.json`)
- `AUDIO_GENERATION.md` - Old docs (replaced by `AUDIO_GENERATION_MULTI.md`)

## Future Enhancements
- Bee simulation mode (timed challenges)
- Random word practice mode
- Progress tracking across sessions
- Print-friendly study sheets
- Pronunciation speed control
- Word definitions and usage examples
- Practice mode with automatic audio playback
