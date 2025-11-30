# Audio Files

This directory should contain MP3 pronunciation files for each word.

## File Naming Convention

Files should be named using the sanitized version of each word:
- Convert to lowercase
- Replace spaces with underscores
- Remove apostrophes and special punctuation
- Replace accented characters with their base equivalents

## Examples

- "tuberculosis" → `tuberculosis.mp3`
- "au revoir" → `au_revoir.mp3`
- "maître d'" → `maitre_d.mp3`
- "hors d'oeuvres" → `hors_doeuvres.mp3`
- "pâtisserie" → `patisserie.mp3`

## Generating Audio Files

Audio files can be generated using:
1. Text-to-Speech (TTS) services (Google Cloud TTS, Amazon Polly, etc.)
2. Manual recordings
3. Online pronunciation dictionaries

## Status

Audio files need to be generated and added to this directory. The website will work without them, but will show "No Audio" when the play button is clicked.
