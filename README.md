# 🦆 Codédex Online Compiler & Cloud IDE

An aesthetic, retro-themed online compiler and cloud IDE inspired by **Codédex**, featuring Monaco Editor, multi-language execution, 8-bit sound effects, pixel-art themes, and **Google Gemini AI** integration.

![Codédex IDE](compiler/assets/duck.jpg)

---

## ✨ Features

- **Multi-Language Execution**: Run C (GCC), C++ (G++), Python 3.11, JavaScript, TypeScript, Java 21, and Go locally with stdin support.
- **Monaco Editor**: VS Code-grade editing experience with syntax highlighting, autocomplete, code minimap, and auto-formatting.
- **🤖 Gemini AI Integration**:
  - **1-Click Auto-Fix**: Diagnoses and repairs crashed or broken code directly in the editor.
  - **AI Assistant**: Explain code, optimize time & space complexity, add documentation comments, and audit security.
  - Seamlessly powered by **Google Gemini 1.5 Flash** with offline fallback.
- **🎨 Aesthetic Pixel Themes**:
  - 🌌 *Celeste Dusk*
  - 🌲 *Stardew Moss*
  - ☕ *Coffee Talk Espresso*
  - 🌸 *Ghibli Linen (Light)*
  - 🔮 *Hyper Light Synth*
  - ❄️ *Nordic Aurora*
  - 🕹️ *Game Boy Pocket 1989*
- **🔊 8-Bit Retro Audio**: Dynamic interactive Web Audio blips and celebratory soundscapes.
- **Tactile UI**: Draggable pane resizers, code snippet drawers, and keyboard shortcuts (`Ctrl + Enter` to run, `Shift + Alt + F` to format).

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (for local server and Python execution)
- Compilers (GCC/MinGW, Node.js, JDK, Go) installed and available in PATH.

### Run Locally
```bash
# Navigate to compiler directory
cd compiler

# Start the server daemon
python server.py
# or on Windows:
py server.py
```

Open your browser and visit:
```
http://localhost:4000
```

---

## 🔑 Adding Google Gemini AI Key
1. Click the **✨ AI Assistant** tab in the right pane, or open **Settings (⚙️)** in the top right.
2. Enter your **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).
3. Click **SAVE** — the status indicator will turn green and enable real-time cloud intelligence!

---

## 📄 License
MIT License
