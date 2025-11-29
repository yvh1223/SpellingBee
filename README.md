# SpellingBee for Vihaan

A clean, modern, pronunciation-first spelling practice website designed
to help Vihaan prepare for his School Spelling Bee (Grades 6-8).

## 🎯 Purpose

To create a distraction-free, beautiful practice experience where:
- Each word is hidden until Vihaan reveals it
- Pronunciation comes first
- Learning happens gracefully, one word at a time

## ✨ Features

- Full word list displayed in order (146 words)
- Pronunciation Play button for each word
- Masked spelling until Reveal is clicked
- Calm, modern design with soothing teal/blue/grey colors
- Mobile-friendly and responsive
- No logins, tracking, or ads
- Fully offline-capable

## 🧱 Tech Stack

- HTML5
- CSS3 (custom, no frameworks)
- Vanilla JavaScript
- Local `words.json` data file
- Audio files in `/audio` directory

## 📂 Project Structure

```
/spellingbee
  index.html          # Main page
  /css
    style.css         # All styling
  /js
    app.js            # Application logic
  /audio
    *.mp3             # Pronunciation audio files
    README.md         # Audio file naming guide
  words.json          # Word data (146 words)
  schoolBee_3.txt     # Original word list
  README.md
  PRD.md
  CLAUDE.md
  .gitignore
```

## 🚀 Getting Started

### Local Development

1. Clone the project:
   ```bash
   git clone https://github.com/yvh1223/spellingbee
   cd spellingbee
   ```

2. Open in browser:
   ```bash
   open index.html
   ```

### Adding Audio Files

Audio files need to be generated for each word. See `audio/README.md` for naming conventions and generation instructions.

## 🌐 GitHub Pages Deployment

To deploy to GitHub Pages:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yvh1223/spellingbee.git
   git push -u origin main
   ```

2. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Source: Deploy from branch
   - Branch: main, folder: / (root)
   - Click Save

3. Access at: `https://yvh1223.github.io/spellingbee/`

## 📝 Word List

Contains 146 words from the School Spelling Bee list, including:
- Standard English words
- Words with accented characters (pâtisserie, fräulein, protégé)
- Multi-word phrases (au revoir, hors d'oeuvres, boll weevil)
- Proper nouns (Kilimanjaro, Tucson, Erie)

## 🎨 Design Philosophy

- **Calm Colors**: Soft teal (#4A90A4) and blue (#67B7D1) for a soothing experience
- **Large Typography**: 2rem word display for easy reading
- **Rounded Buttons**: Friendly, approachable UI elements
- **Smooth Animations**: Gentle fade-in effects when revealing words
- **No Clutter**: Clean, focused interface with only essential elements

## 📜 License

Personal use only - built lovingly for Vihaan's learning journey.
