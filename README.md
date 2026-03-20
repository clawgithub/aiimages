# AI Image Generator & Editor

Desktop application for AI-powered image generation and editing using Gemini 2.5 Flash via Puter.js. No API keys required.

## Features

- **Text-to-image** — describe what you want, get an image
- **Image editing** — attach an image and describe changes
- **Concurrent generation** — fire off multiple prompts at once
- **Download** — save any generated image as PNG

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/clawgithub/aiimages.git
cd aiimages
```

### 2. Install dependencies

```bash
npm install
```

This installs Electron and electron-builder.

### 3. Run the app in development mode

```bash
npm start
```

The app window will open and you're ready to go — type a prompt and generate images.

### 4. (Optional) Build a standalone executable

Pick the command for your operating system:

| OS      | Command              | Output                        |
|---------|----------------------|-------------------------------|
| Windows | `npm run build:win`  | `.exe` installer in `dist/`   |
| macOS   | `npm run build:mac`  | `.dmg` file in `dist/`        |
| Linux   | `npm run build:linux`| `.AppImage` file in `dist/`   |

After building, open the installer/file from the `dist/` folder to install or run the app like any native application.

## Usage

1. Launch the app (`npm start` or open the built executable).
2. Type a description of the image you want (e.g. "A cat astronaut on Mars") and press **Enter**.
3. Wait a few seconds while the AI generates your image.
4. Click **Download** to save the result as a PNG.
5. To **edit** an existing image, click the paperclip icon to attach it, then describe the changes you want.

## How It Works

The app uses [Puter.js](https://docs.puter.com/) to access the Gemini 2.5 Flash image generation model directly from the browser/Electron renderer — no backend server or API key needed. On first use, you'll authenticate through Puter's free tier.
