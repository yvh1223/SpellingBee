# SpellingBee Project

## Team Names
- Claude: Spelling Sorceress

## Project Overview
Building a pronunciation-driven spelling practice website for Vihaan's School Spelling Bee (Grades 6-8). The focus is on simplicity, elegance, and a calm learning experience.

## Key Design Principles
1. **Pronunciation First**: Each word has audio pronunciation that must be played
2. **Progressive Reveal**: Words are masked until the learner chooses to reveal them
3. **Calm UI**: Soft teal/blue/grey colors, large readable typography, no clutter
4. **Offline-Capable**: Everything works locally with no external dependencies
5. **Mobile-Friendly**: Responsive design for tablets and phones

## Technical Stack
- Pure HTML5, CSS3, and vanilla JavaScript
- Data stored in `words.json`
- Audio files in `/audio` directory as MP3s
- Deployable to GitHub Pages

## Data Source
- Word list from `schoolBee_3.txt` (146 words total)
- Words include accented characters and special formatting (e.g., "maître d'", "au revoir")

## Project Structure
```
/spellingbee
  index.html
  /css
    style.css
  /js
    app.js
  /audio
    <word>.mp3 (generated later)
  words.json
  README.md
  PRD.md
  CLAUDE.md
```

## Important Notes
- No tracking, analytics, or data storage
- Personal GitHub repo only
- Focus on accessibility with proper contrast and fonts
- Future enhancements may include bee simulation mode, random challenges, dark mode

## Implementation Status
Work in progress - building initial version with all core features.
