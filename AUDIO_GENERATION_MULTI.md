# Audio Generation for Multiple Bee Levels

This guide explains how to generate audio files for all three spelling bee levels (1B, 2B, 3B).

## Folder Structure

After running the generation script, you'll have:

```
/spellingbee
  /audio
    /1B              # 145 audio files for 1B words
    /2B              # 158 audio files for 2B words
    /3B              # 145 audio files for 3B words
  /data
    words_1B.json    # Word data for 1B
    words_2B.json    # Word data for 2B
    words_3B.json    # Word data for 3B
  schoolBee_1.txt    # Source words for 1B
  schoolBee_2.txt    # Source words for 2B
  schoolBee_3.txt    # Source words for 3B
```

## Quick Start

### 1. Ensure Virtual Environment is Active

```bash
source venv/bin/activate
```

### 2. Generate All Audio Files

```bash
python generate_all_audio.py
```

This will:
- Parse all three `schoolBee_*.txt` files
- Create `words_1B.json`, `words_2B.json`, `words_3B.json` in `/data` folder
- Generate audio files in `/audio/1B`, `/audio/2B`, `/audio/3B`
- Skip existing files (incremental generation)

### 3. Force Regenerate All Files

```bash
python generate_all_audio.py --force
```

## What the Script Does

1. **Parses Word Files**: Reads `schoolBee_1.txt`, `schoolBee_2.txt`, `schoolBee_3.txt`
2. **Creates JSON Files**: Generates structured JSON with word IDs in `/data` folder
3. **Generates Audio**: Uses OpenAI TTS (gpt-4o-mini-tts, Alloy voice) to create MP3s
4. **Organizes by Level**: Separates audio files into `1B`, `2B`, `3B` subdirectories

## Cost Estimate

- **1B**: 145 words × $0.0002/word ≈ $0.029
- **2B**: 158 words × $0.0002/word ≈ $0.032
- **3B**: 145 words × $0.0002/word ≈ $0.029
- **Total**: ~$0.09 for all 448 words

## Technical Details

- **Model**: `gpt-4o-mini-tts`
- **Voice**: Alloy (US English)
- **Format**: MP3
- **Retry Logic**: 3 attempts with exponential backoff
- **Rate Limiting**: 0.5s delay between requests
- **SSL Workaround**: Required for Python 3.13+ on macOS

## Word Counts

- **1B**: 145 words (basic spelling words)
- **2B**: 158 words (intermediate/advanced words)
- **3B**: 145 words (school bee words)
- **Total**: 448 words

## Filename Sanitization

Words are converted to filenames using the same logic as the JavaScript code:
- Lowercase
- Spaces → underscores
- Remove apostrophes
- Normalize accented characters (à→a, é→e, etc.)
- Remove special characters except underscores

Examples:
- `"maître d'"` → `maitre_d.mp3`
- `"au revoir"` → `au_revoir.mp3`
- `"señor"` → `senor.mp3`
