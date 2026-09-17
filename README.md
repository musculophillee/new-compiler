# ⚡ Zero Compiler & Cloud IDE

An aesthetic, neo-brutalist online compiler and cloud IDE featuring Monaco Editor, multi-language execution, 8-bit sound effects, pixel-art themes, and **Cloud AI Agent** integration.

![Zero Compiler IDE](compiler/assets/duck.jpg)

---

## ✨ Features

- **Multi-Language Execution**: Run C (GCC), C++ (G++), Python 3.11, JavaScript, TypeScript, Java 21, and Go locally with stdin support.
- **Monaco Editor**: VS Code-grade editing experience with syntax highlighting, autocomplete, code minimap, and auto-formatting.
- **🤖 Cloud AI Agent Integration**:
  - **1-Click Auto-Fix**: Diagnoses and repairs crashed or broken code directly in the editor.
  - **AI Assistant**: Explain code, optimize time & space complexity, add documentation comments, and audit security.
  - Seamlessly powered by fast Cloud AI with offline fallback.
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

## 🔑 Adding Cloud AI Key
1. Click the **✨ AI Assistant** tab in the right pane, or open **Settings (⚙️)** in the top right.
2. Enter your **Cloud AI API Key**.
3. Click **SAVE** — the status indicator will turn green and enable real-time cloud intelligence!

---

## 🌐 Deploy to the Cloud (Render / Fly.io)

### Option A: Render.com (1-Click Deployment)
1. Go to [dashboard.render.com](https://dashboard.render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `https://github.com/musculophillee/new-compiler`.
4. Render will automatically detect the **Dockerfile** and configure the service.
5. Click **Deploy Web Service** — your compiler is live on your free `.onrender.com` domain!

### Option B: Fly.io
```bash
# Install flyctl
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Launch and deploy
fly launch
fly deploy
```

---

## 👨‍💻 Creator & Contact
- **Made by**: RITIK SONI
- **Contact Email**: [hrithik.codes@gmail.com](mailto:hrithik.codes@gmail.com)

---

## 📄 License
MIT License
