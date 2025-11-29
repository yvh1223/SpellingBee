#!/usr/bin/env python3
# ABOUTME: Generates pronunciation audio files for spelling bee words using OpenAI TTS
# ABOUTME: Reads words from words.json and creates MP3 files in the audio directory

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

def generate_audio_files(api_key, force_regenerate=False):
    """
    Generate audio pronunciation files for all words in words.json.

    Args:
        api_key: OpenAI API key
        force_regenerate: If True, regenerate all files. If False, skip existing files.
    """
    # Initialize OpenAI client with SSL workaround for macOS
    # Python 3.13+ on macOS has SSL certificate verification issues
    import httpx
    http_client = httpx.Client(verify=False)
    client = OpenAI(api_key=api_key, http_client=http_client)

    # Load words from JSON
    words_file = Path(__file__).parent / 'words.json'
    with open(words_file, 'r') as f:
        data = json.load(f)

    words = data['words']
    audio_dir = Path(__file__).parent / 'audio'

    # Ensure audio directory exists
    audio_dir.mkdir(exist_ok=True)

    print(f"Generating audio for {len(words)} words using OpenAI TTS (alloy voice)...")
    print(f"Audio files will be saved to: {audio_dir}")
    print()

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
            print(f"[{word_id:3d}/146] ⏭️  Skipping '{word}' (already exists)")
            skipped += 1
            continue

        # Retry logic for network errors
        max_retries = 3
        retry_delay = 2

        for attempt in range(max_retries):
            try:
                # Generate speech using OpenAI TTS
                if attempt == 0:
                    print(f"[{word_id:3d}/146] 🔊 Generating '{word}' → {filename}.mp3")
                else:
                    print(f"[{word_id:3d}/146] 🔄 Retrying '{word}' (attempt {attempt + 1}/{max_retries})")

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
                    print(f"[{word_id:3d}/146] ⚠️  Error: {e}. Retrying in {retry_delay}s...")
                    time.sleep(retry_delay)
                    retry_delay *= 2
                else:
                    print(f"[{word_id:3d}/146] ❌ Failed to generate '{word}' after {max_retries} attempts: {e}")
                    failed += 1

    print()
    print("=" * 60)
    print(f"Audio generation complete!")
    print(f"  ✅ Generated: {generated}")
    print(f"  ⏭️  Skipped:   {skipped}")
    print(f"  ❌ Failed:    {failed}")
    print(f"  📁 Total:     {generated + skipped} files in {audio_dir}")
    print("=" * 60)

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

    try:
        generate_audio_files(api_key, force_regenerate)
    except KeyboardInterrupt:
        print("\n\nInterrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
