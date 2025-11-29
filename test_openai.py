#!/usr/bin/env python3
# ABOUTME: Test script to verify OpenAI API connection
# ABOUTME: Generates a single test audio file to verify credentials and connectivity

import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv
import certifi

# Fix SSL certificate verification issue on macOS
os.environ['SSL_CERT_FILE'] = certifi.where()
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()

# Load environment variables
load_dotenv()

# Get API key
api_key = os.environ.get('OPENAI_API_KEY')

if not api_key:
    print("❌ OPENAI_API_KEY not found in .env file")
    exit(1)

print(f"✅ API key found (starts with: {api_key[:7]}...)")
print(f"   Key length: {len(api_key)} characters")
print("Testing OpenAI connection...")

try:
    # TEMPORARY WORKAROUND for Python 3.14 SSL certificate issue on macOS
    # This disables SSL verification - only use for local audio generation
    import httpx
    print("⚠️  Using SSL verification bypass due to Python 3.14 certificate issue")

    http_client = httpx.Client(verify=False)
    client = OpenAI(http_client=http_client)

    print("Generating test audio for word 'test'...")
    speech_file_path = Path(__file__).parent / "audio" / "test.mp3"

    with client.audio.speech.with_streaming_response.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input="test"
    ) as response:
        response.stream_to_file(speech_file_path)

    print(f"✅ Success! Test audio file created at {speech_file_path}")
    print("Connection is working properly.")

except Exception as e:
    print(f"❌ Error: {type(e).__name__}: {e}")

    # Print full error details for debugging
    import traceback
    print("\nFull error traceback:")
    traceback.print_exc()

    # Check if it's a connection error with underlying cause
    if hasattr(e, '__cause__'):
        print(f"\nUnderlying cause: {e.__cause__}")

    print("\nPossible issues:")
    print("1. VPN or proxy blocking OpenAI API")
    print("2. Firewall blocking HTTPS connections")
    print("3. Corporate network restrictions")
    print("4. SSL/TLS certificate issues")
    print("5. Try with a simple curl test:")
    print('   curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"')
