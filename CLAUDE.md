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
- Python 3.13+ for audio generation (SSL workaround needed on macOS)
- Deployable to GitHub Pages

## Data Source
- Word list from `schoolBee_3.txt` (146 words total)
- Words include accented characters and special formatting (e.g., "maître d'", "au revoir")

## Project Structure
```
/spellingbee
  index.html              # Main spelling practice interface
  /css
    style.css             # Calm teal/blue styling
  /js
    app.js                # Word loading and pronunciation logic
  /audio                  # 146 MP3 pronunciation files
    <word>.mp3
  words.json              # All 146 words with IDs
  generate_audio.py       # OpenAI TTS audio generation script
  requirements.txt        # Python dependencies
  .env.example            # API key template
  AUDIO_GENERATION.md     # Audio generation documentation
  README.md
  PRD.md
  CLAUDE.md
```

## Repository
- GitHub: https://github.com/yvh1223/SpellingBee
- Personal account: yvh1223@gmail.com
- GPG signed commits with key: 98CE179940DF710F

## Important Notes
- No tracking, analytics, or data storage
- Personal GitHub repo only
- Focus on accessibility with proper contrast and fonts
- All 146 audio files generated using OpenAI TTS (gpt-4o-mini-tts, Alloy voice)
- Future enhancements may include bee simulation mode, random challenges, dark mode

## Implementation Status
Core implementation complete:
- ✅ Website with pronunciation-driven interface
- ✅ All 146 audio files generated
- ✅ Progressive reveal/hide functionality
- ✅ Mobile-responsive design
- ✅ Pushed to GitHub with GPG signatures
- 🔄 GitHub Pages deployment pending
