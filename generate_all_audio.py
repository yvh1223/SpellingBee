#!/usr/bin/env python3
# ABOUTME: Generates pronunciation audio files for all spelling bee levels (1B, 2B, 3B)
# ABOUTME: Reads words from text files and creates organized MP3 files using OpenAI TTS

import json
import os
import ssl
import time
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import certifi

# Fix SSL certificate verification issue on macOS
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

def sanitize_filename(word):
    """
    Convert word to filename format matching the JavaScript implementation.
    """
    return (word
        .lower()
        .replace(' ', '_')
        .replace("'", '')
        .replace("'", '')
        .replace('à', 'a').replace('â', 'a').replace('ä', 'a')
        .replace('é', 'e').replace('è', 'e').replace('ê', 'e').replace('ë', 'e')
        .replace('î', 'i').replace('ï', 'i')
        .replace('ô', 'o').replace('ö', 'o')
        .replace('ù', 'u').replace('û', 'u').replace('ü', 'u')
        .translate(str.maketrans('', '', ''.join(c for c in '!"#$%&()*+,-./:;<=>?@[\\]^`{|}~' if c not in '_')))
    )

def parse_word_file(file_path):
    """
    Parse a word file and return list of words (ignoring empty lines).
    """
    words = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            word = line.strip()
            if word:  # Skip empty lines
                words.append(word)
    return words

def create_words_json(words, output_path):
    """
    Create a words.json file from a list of words.
    """
    words_data = {
        "words": [
            {"id": idx + 1, "word": word}
            for idx, word in enumerate(words)
        ]
    }

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(words_data, f, indent=2, ensure_ascii=False)

    return words_data

def generate_audio_for_bee(client, bee_level, words, audio_dir, force_regenerate=False):
    """
    Generate audio files for a specific bee level.

    Args:
        client: OpenAI client instance
        bee_level: Bee level (1B, 2B, 3B)
        words: List of word dictionaries with 'id' and 'word'
        audio_dir: Directory to save audio files
        force_regenerate: If True, regenerate all files
    """
    # Ensure audio directory exists
    audio_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n{'='*70}")
    print(f"Processing {bee_level}: {len(words)} words")
    print(f"Audio directory: {audio_dir}")
    print(f"{'='*70}\n")

    generated = 0
    skipped = 0
    failed = 0

    for word_obj in words:
        word = word_obj['word']
        word_id = word_obj['id']
        filename = sanitize_filename(word)
        output_path = audio_dir / f"{filename}.mp3"

        # Skip if file exists and not forcing regeneration
        if output_path.exists() and not force_regenerate:
            print(f"[{bee_level}] [{word_id:3d}/{len(words)}] ⏭️  Skipping '{word}' (already exists)")
            skipped += 1
            continue

        # Retry logic for network errors
        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                # Generate speech using OpenAI TTS
                if attempt == 0:
                    print(f"[{bee_level}] [{word_id:3d}/{len(words)}] 🔊 Generating '{word}' → {filename}.mp3")
                else:
                    print(f"[{bee_level}] [{word_id:3d}/{len(words)}] 🔄 Retrying '{word}' (attempt {attempt + 1}/{max_retries})")

                with client.audio.speech.with_streaming_response.create(
                    model="gpt-4o-mini-tts",
                    voice="alloy",
                    input=word
                ) as response:
                    response.stream_to_file(output_path)
                generated += 1

                # Small delay to avoid rate limiting
                time.sleep(0.5)
                break

            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"[{bee_level}] [{word_id:3d}/{len(words)}] ⚠️  Error: {e}. Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print(f"[{bee_level}] [{word_id:3d}/{len(words)}] ❌ Failed '{word}' after {max_retries} attempts: {e}")
                    failed += 1

    print(f"\n{bee_level} Summary:")
    print(f"  ✅ Generated: {generated}")
    print(f"  ⏭️  Skipped:   {skipped}")
    print(f"  ❌ Failed:    {failed}")
    print(f"  📁 Total:     {generated + skipped} files")

    return {"generated": generated, "skipped": skipped, "failed": failed}

def main():
    """Main entry point."""
    import sys

    # Load environment variables from .env file
    load_dotenv()

    # Get API key from environment or prompt
    api_key = os.environ.get('OPENAI_API_KEY')

    if not api_key:
        print("OpenAI API key not found in environment.")
        api_key = input("Please enter your OpenAI API key: ").strip()

        if not api_key:
            print("Error: API key is required")
            sys.exit(1)

    # Check for force regenerate flag
    force_regenerate = '--force' in sys.argv or '-f' in sys.argv

    if force_regenerate:
        print("Force regeneration enabled - will overwrite existing files")
        confirm = input("Continue? (y/n): ").strip().lower()
        if confirm != 'y':
            print("Aborted")
            sys.exit(0)

    # Initialize OpenAI client with SSL workaround for macOS
    import httpx
    http_client = httpx.Client(verify=False)
    client = OpenAI(api_key=api_key, http_client=http_client)

    project_root = Path(__file__).parent

    # Create data directory for JSON files
    data_dir = project_root / 'data'
    data_dir.mkdir(exist_ok=True)

    # Create audio directory structure
    audio_root = project_root / 'audio'

    # Process each bee level
    bee_configs = [
        {
            'level': '1B',
            'source_file': project_root / 'schoolBee_1.txt',
            'json_file': data_dir / 'words_1B.json',
            'audio_dir': audio_root / '1B'
        },
        {
            'level': '2B',
            'source_file': project_root / 'schoolBee_2.txt',
            'json_file': data_dir / 'words_2B.json',
            'audio_dir': audio_root / '2B'
        },
        {
            'level': '3B',
            'source_file': project_root / 'schoolBee_3.txt',
            'json_file': data_dir / 'words_3B.json',
            'audio_dir': audio_root / '3B'
        }
    ]

    total_stats = {"generated": 0, "skipped": 0, "failed": 0}

    try:
        for config in bee_configs:
            level = config['level']
            source_file = config['source_file']
            json_file = config['json_file']
            audio_dir = config['audio_dir']

            # Parse words from text file
            print(f"\nParsing {source_file.name}...")
            words_list = parse_word_file(source_file)
            print(f"Found {len(words_list)} words")

            # Create JSON file
            print(f"Creating {json_file.name}...")
            words_data = create_words_json(words_list, json_file)

            # Generate audio files
            stats = generate_audio_for_bee(
                client,
                level,
                words_data['words'],
                audio_dir,
                force_regenerate
            )

            # Accumulate stats
            for key in total_stats:
                total_stats[key] += stats[key]

        # Print final summary
        print(f"\n{'='*70}")
        print("🎉 ALL BEES COMPLETE!")
        print(f"{'='*70}")
        print(f"Total across all bees:")
        print(f"  ✅ Generated: {total_stats['generated']}")
        print(f"  ⏭️  Skipped:   {total_stats['skipped']}")
        print(f"  ❌ Failed:    {total_stats['failed']}")
        print(f"  📁 Total:     {total_stats['generated'] + total_stats['skipped']} audio files")
        print(f"{'='*70}\n")

    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
