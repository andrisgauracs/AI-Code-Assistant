# AI Code Assistant

A real-time AI-powered code completion assistant using the Granite-4.0 model and WebGPU acceleration.

## Features

- **Real-time Code Suggestions**: Get AI-powered code completions as you type
- **WebGPU Acceleration**: Fast inference using your GPU
- **Dark Theme**: Modern, easy-on-the-eyes interface
- **Cursor-aware Suggestions**: Suggestions appear next to your cursor
- **Keyboard Shortcuts**:
  - **Tab**: Accept suggestion
  - **Esc**: Dismiss suggestion

## Requirements

- Modern browser with WebGPU support (Chrome/Edge 113+, Firefox with experimental features)
- At least 2GB of VRAM for the model
- Internet connection (for model download on first run)

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

This will start Vite dev server at `http://localhost:5173` with hot module reloading.

### Build for Production

```bash
npm run build
```

This creates an optimized bundle in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Alternative: Simple HTTP Server

If you prefer not to use Vite, you can serve the files directly:

```bash
npm run serve
```

## How to Use

1. Open the app in your browser
2. Wait for the model to load (first time may take 2-3 minutes as the model is downloaded)
3. Start typing JavaScript code in the textarea
4. After 1 second of inactivity, an AI suggestion will appear
5. Press **Tab** to accept the suggestion or **Esc** to dismiss it
6. Continue typing!

## Architecture

- **Model**: IBM Granite-4.0 1B (ONNX format)
- **Inference Library**: @huggingface/transformers via npm (v3.7.6+)
- **Bundler**: Vite for fast dev server and optimized production builds
- **Acceleration**: WebGPU
- **Frontend**: Vanilla JavaScript with minimal dependencies

## Browser Support

- ✅ Chrome/Chromium 113+
- ✅ Edge 113+
- ⚠️ Firefox (requires experimental WebGPU feature flag)
- ❌ Safari (WebGPU support in progress)

## Troubleshooting

### Model Loading Issues

- Ensure WebGPU is available: Open DevTools (F12) and check console for WebGPU errors
- Try Chrome/Edge if using Firefox
- Clear browser cache if model partially downloads

### Suggestions Not Appearing

- Check browser console (F12) for errors
- Ensure model has finished loading
- Try typing more code before the model responds

### Performance Issues

- Enable hardware acceleration in browser settings
- Close other GPU-intensive applications
- Try reducing browser window size

## Notes

- The model is cached in the browser's cache storage, so subsequent uses are much faster
- All processing happens locally in your browser - no data is sent to external servers
- WebGPU fallback to CPU is not implemented; the model requires WebGPU support

## License

MIT
