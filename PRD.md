# Product Requirements Document (PRD)

## Project: SpellingBee Practice Website for Vihaan

## 1. Vision

Design a pronunciation‑driven, reveal‑based spelling practice experience
that is simple, elegant, and crafted with intention. Every interaction
should help Vihaan grow more confident.

## 2. Goals

-   Provide accurate word pronunciations\
-   Hide spelling until the learner is ready\
-   Create a modern, calm UI that reduces strain\
-   Ensure easy maintainability for new words and audio

## 3. Core Requirements

### 3.1 Word Experience

-   Words listed vertically, in strict order\
-   Each entry includes:
    -   Play Pronunciation button
    -   Masked word
    -   Reveal button

### 3.2 Pronunciation

-   High‑quality MP3 files\
-   File naming: `audio/<word>.mp3`\
-   Play only; no auto‑reveal

### 3.3 Reveal Flow

-   Soft fade animation\
-   Word remains visible until hidden\
-   No jump in layout

### 3.4 Design & UX

-   Calm colors (soft teal/blue/grey)\
-   Large, readable typography\
-   Friendly, rounded buttons\
-   No clutter\
-   Works on mobile/tablet

## 4. Technical Architecture

-   HTML + CSS + JS frontend\
-   Data from `words.json`\
-   Local MP3 assets\
-   Expandable design for future modes

## 5. Non‑Functional Requirements

-   Instant page load\
-   Fully offline‑capable\
-   No tracking or data storage\
-   Personal GitHub only\
-   Accessible contrast & fonts

## 6. Future Enhancements

-   Bee simulation mode\
-   Random daily challenge\
-   Word statistics\
-   Speech‑to‑text for auto‑checking\
-   Dark mode

## 7. Success Criteria

-   Vihaan enjoys using it\
-   Accurate pronunciations\
-   Fast navigation\
-   Zero distractions
