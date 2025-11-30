# SpellingBee Project

## Team Names
- Claude: Spelling Sorceress
- DD: Desi Deadpool

## Project Overview
Building a pronunciation-driven spelling practice website for Vihaan's School Spelling Bee. The focus is on simplicity, elegance, and a calm learning experience with support for three difficulty levels.

## Key Design Principles
1. **Pronunciation First**: Each word has audio pronunciation that must be played
2. **Progressive Reveal**: Words are masked until the learner chooses to reveal them
3. **Calm UI**: Soft teal/blue/grey colors, large readable typography, no clutter
4. **Offline-Capable**: Everything works locally with no external dependencies
5. **Mobile-Friendly**: Responsive design for tablets and phones
6. **Multi-Level Support**: Three difficulty levels (1B, 2B, 3B) with collapsible sections

## Technical Stack
- Pure HTML5, CSS3, and vanilla JavaScript
- Data organized in `/data` directory as JSON files
- Audio files in `/audio` directory organized by level
- Python 3.13+ for audio generation (SSL workaround needed on macOS)
- Deployed to GitHub Pages

## Data Sources
- **1B (Basic)**: `schoolBee_1.txt` - 145 words (e.g., "tag", "send", "elephant")
- **2B (Intermediate)**: `schoolBee_2.txt` - 158 words (e.g., "almanac", "archipelago", "eccentric")
- **3B (Advanced)**: `schoolBee_3.txt` - 145 words (e.g., "apocalypse", "silhouette", "tuberculosis")
- Total: 448 words with accented characters and special formatting

## Project Structure
```
/spellingbee
  index.html                    # Main landing page with collapsible sections
  /css
    style.css                   # Apple-inspired minimalist styling
  /js
    app.js                      # Multi-level word loading and pronunciation logic
  /audio                        # Organized audio files
    /1B                         # 145 MP3 files for 1B words
    /2B                         # 158 MP3 files for 2B words
    /3B                         # 145 MP3 files for 3B words
  /data                         # JSON word data
    words_1B.json               # 145 words with IDs
    words_2B.json               # 158 words with IDs
    words_3B.json               # 145 words with IDs
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
- All 448 audio files generated (1B: 145, 2B: 158, 3B: 145)
- Progressive reveal/hide functionality per word
- Mobile-responsive design with Apple-inspired aesthetics
- Collapsible sections for each bee level
- Smooth expand/collapse animations
- Level-specific audio path loading
- Dynamic word count statistics
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

## Key Files to Archive
- `generate_audio.py` - Old single-level script (replaced by `generate_all_audio.py`)
- `words.json` - Old single-level data (replaced by `data/words_*.json`)
- `AUDIO_GENERATION.md` - Old docs (replaced by `AUDIO_GENERATION_MULTI.md`)

## Future Enhancements
- Bee simulation mode (timed challenges)
- Random word practice mode
- Dark mode toggle
- Progress tracking across sessions
- Print-friendly study sheets
- Pronunciation speed control
