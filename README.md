# SpellingBee Practice

A minimalist, pronunciation-driven spelling practice website for grades 6-8.

**🌐 Live Site:** https://yvh1223.github.io/SpellingBee/

![SpellingBee Interface](images/screenshot.png)

## Features

- 145 pronunciation-driven spelling words
- Audio playback for each word (OpenAI TTS - Alloy voice)
- Progressive reveal/hide functionality
- Apple-inspired minimalist design
- Fully responsive (mobile/tablet/desktop)
- No tracking, ads, or logins

## Quick Start

```bash
# Clone and open
git clone https://github.com/yvh1223/SpellingBee
cd SpellingBee
open index.html
```

## Project Structure

```
/SpellingBee
  index.html              # Main interface
  /css
    style.css             # Minimalist styling
  /js
    app.js                # Word loading & playback logic
  /audio                  # 145 MP3 pronunciation files
  words.json              # All words with IDs
  generate_audio.py       # Audio generation script
  requirements.txt        # Python dependencies
  .env.example            # API key template
  AUDIO_GENERATION.md     # Audio generation guide
```

## Development Workflow

```mermaid
flowchart TD
    A[Start] --> B[Word List Source]
    B --> C[Parse schoolBee_3.txt]
    C --> D[Generate words.json]
    D --> E[Setup Python venv]
    E --> F[Install OpenAI SDK]
    F --> G[Configure .env with API key]
    G --> H[Run generate_audio.py]
    H --> I[Generate 145 MP3 files]
    I --> J[Build HTML/CSS/JS Interface]
    J --> K[Implement Audio Playback]
    K --> L[Add Reveal/Hide Logic]
    L --> M[Apply Apple-inspired Styling]
    M --> N[Responsive Grid Layout]
    N --> O[Test Locally]
    O --> P{All Working?}
    P -->|No| Q[Debug & Fix]
    Q --> O
    P -->|Yes| R[Git Commit with GPG]
    R --> S[Push to GitHub]
    S --> T[Enable GitHub Pages]
    T --> U[Deploy to Production]
    U --> V[Live at yvh1223.github.io/SpellingBee]

    style A fill:#e8e8ed
    style V fill:#34c759
    style I fill:#007aff
    style M fill:#ff9500
    style U fill:#34c759
```

## Audio Generation

See [AUDIO_GENERATION.md](AUDIO_GENERATION.md) for detailed instructions.

**Quick Generate:**
```bash
source venv/bin/activate
python generate_audio.py
```

- Uses OpenAI `gpt-4o-mini-tts` model
- Voice: Alloy (US English)
- Cost: ~$0.03 for all 145 files
- Skips existing files (use `--force` to regenerate)

## Design Principles

- **Pronunciation First**: Audio-driven learning experience
- **Progressive Reveal**: Words masked until revealed
- **Minimalist UI**: Apple-inspired clean design
- **Calm Colors**: Neutral grays (#fafafa, #e8e8ed, #1d1d1f)
- **Space Efficient**: Grid layout with large readable fonts
- **Mobile Friendly**: Responsive breakpoints at 768px and 480px

## Tech Stack

- Pure HTML5, CSS3, Vanilla JavaScript
- No frameworks or dependencies
- OpenAI TTS for audio generation
- Python 3.13+ (with SSL workaround for macOS)
- GitHub Pages deployment

## License

Personal use only - built for Vihaan's spelling bee preparation.
