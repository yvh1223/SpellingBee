# Audio Generation Guide

This guide explains how to generate pronunciation audio files for the spelling bee words.

## Prerequisites

1. Python 3.13 or higher (NOTE: Python 3.13+ on macOS requires SSL workaround - already implemented in the script)
2. OpenAI API key (get one from https://platform.openai.com/api-keys)

## Setup

1. **Create and activate virtual environment:**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure API key:**

   Edit the `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   **IMPORTANT:** Never commit the `.env` file to git. It's already in `.gitignore`.

## Usage

### Generate all audio files

```bash
source venv/bin/activate
python generate_audio.py
```

This will:
- Read all 146 words from `words.json`
- Generate MP3 files using OpenAI TTS with the "alloy" voice (gpt-4o-mini-tts model)
- Save files to the `audio/` directory
- **Skip files that already exist** (only generates missing files)

### Force regenerate all files

To regenerate files that already exist:

```bash
python generate_audio.py --force
```

You'll be prompted to confirm before overwriting existing files.

## Output

Audio files are saved with sanitized filenames:
- Lowercase
- Spaces replaced with underscores
- Special characters removed
- Accents normalized

Examples:
- "tuberculosis" → `tuberculosis.mp3`
- "au revoir" → `au_revoir.mp3`
- "maître d'" → `maitre_d.mp3`
- "hors d'oeuvres" → `hors_doeuvres.mp3`
- "pâtisserie" → `patisserie.mp3`

## Cost Estimate

OpenAI TTS pricing (as of 2024):
- Model: tts-1
- Price: $0.015 per 1,000 characters
- Average word length: ~12 characters
- Total for 146 words: ~1,752 characters
- **Estimated cost: ~$0.03** (3 cents)

## Troubleshooting

### API Key Not Found
Make sure your `.env` file exists and contains:
```
OPENAI_API_KEY=sk-your-actual-key-here
```

### Permission Denied
Make sure the script is executable:
```bash
chmod +x generate_audio.py
```

### Import Error
Make sure you've activated the virtual environment:
```bash
source venv/bin/activate
```

## Voice Options

The script uses the "alloy" voice (US English, neutral). Other available voices:
- alloy (default - neutral)
- echo (male)
- fable (British accent)
- onyx (male, deep)
- nova (female, energetic)
- shimmer (female, warm)

To change the voice, edit line 75 in `generate_audio.py`:
```python
voice="alloy",  # Change to desired voice
```
