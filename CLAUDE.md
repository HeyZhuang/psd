# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Working Directory**: Always run commands from `polotno-studio-master/` subdirectory

- **Start development server**: `cd polotno-studio-master && npm start` (runs on port 3002 via Vite, configured to bind to 0.0.0.0 for external access)
- **Build for production**: `cd polotno-studio-master && npm run build`
- **Bundle analysis**: Built-in via `vite-bundle-analyzer` plugin

## Project Architecture

This is a React-based design editor built on the Polotno SDK. The application follows a modular architecture:

### Core Structure
- **Entry point**: `polotno-studio-master/src/index.jsx` - Sets up the store, project context, and error boundaries
- **Main app**: `polotno-studio-master/src/App.jsx` - Configures the Polotno editor with custom sections and handles drag/drop
- **Store setup**: Uses Polotno's store with API key `JtaT2TQRl_EqM_V0SXL0` and development mode domain check bypass
- **Global access**: Store and project exposed via `window.store` and `window.project` for debugging

### Custom Sections Architecture
The app follows a consistent section pattern where each section exports `{ name, Tab, Panel }`:
```javascript
export const SectionName = {
  name: 'section-id',
  Tab: (props) => <SectionTab {...props}><Icon /></SectionTab>,
  Panel: ObserverComponent
};
```

Custom sections in `polotno-studio-master/src/sections/` (in order of appearance):
- `upload-section.jsx` - File uploads (PSD, images, JSON)
- `my-designs-section.jsx` - Cloud-synced user designs with Puter.com integration
- `icons-section.jsx` - Icon library
- `shapes-section.jsx` - Shape tools (replaces default Polotno elements section)
- `quotes-section.jsx` - Text quotes
- `qr-section.jsx` - QR code generation
- `layers-section.jsx` - Layer management
- `stable-diffusion-section.jsx` - AI image generation

### Topbar Components
Located in `polotno-studio-master/src/topbar/`:
- `topbar.jsx` - Main toolbar container
- `file-menu.jsx` - File operations
- `download-button.jsx` - Export functionality
- `user-menu.jsx` - User account features
- `psd-export-button.jsx` - PSD export functionality
- `debug-button.jsx` - Development debugging tools
- `postprocess.jsx` - Post-processing effects
- `post-process-button.jsx` - Post-process UI component

### Key Utilities
- `polotno-studio-master/src/project.js` - Project state management, auto-save (5s debounce), cloud sync
- `polotno-studio-master/src/file.js` - File loading with smart type detection (PSD/image/JSON routing)
- `polotno-studio-master/src/api.js` - Puter.com cloud storage integration with fallback handling
- `polotno-studio-master/src/storage.js` - LocalForage wrapper with IndexedDB/LocalStorage fallback
- `polotno-studio-master/src/psd-export.js` - Polotno → PSD export functionality
- `polotno-studio-master/src/psd-utils.js` - Comprehensive PSD parsing and conversion (1773 lines)

### PSD Processing System
The application includes sophisticated PSD handling:
- **Import**: High-fidelity PSD parsing with font/color/positioning preservation
- **Export**: Convert Polotno designs back to PSD format
- **Precision Rendering**: Real-time CSS injection for accurate display (`utils/PrecisionRenderer.js`)
- **Debug Tools**: Development utilities for PSD processing (`utils/PSDDebugger.js`)

### Internationalization
Multi-language support with translations in `polotno-studio-master/src/translations/` for: English (`en.json`), French (`fr.json`), Indonesian (`id.json`), Russian (`ru.json`), Portuguese (Brazil) (`pt-br.json`), and Chinese (`zh-ch.json`).

### Build Configuration
- Uses Vite with React plugin (`@vitejs/plugin-react`)
- Includes Sentry for error tracking and monitoring
- Bundle analyzer for build optimization (`vite-bundle-analyzer`)
- Development server runs on port 3002
- Source maps enabled for production builds

### State Management and Architecture Patterns
- **MobX Integration**: Observer pattern for reactive UI updates across all components
- **React Context**: Project context provides global access to design state
- **Dual Storage Strategy**: Local (IndexedDB/LocalStorage) + Cloud (Puter.com) with automatic sync
- **Error Handling**: Sentry integration, timeout handling (8s), graceful degradation
- **Auto-save**: 5-second debounced saving with optimistic updates

### Development Mode Features
- Domain check bypass for localhost/127.0.0.1
- Global store and project access via `window.store` and `window.project`
- Error boundary with cache clearing functionality
- Comprehensive debugging tools via debug button in topbar
- Real-time precision rendering system for accurate PSD display

## Important Instructions

### Working Directory Structure
- The main application code is in `polotno-studio-master/` subdirectory
- Always navigate to this directory before running npm commands
- The root directory contains project documentation and configuration

### PSD Processing System
This project includes a sophisticated high-precision PSD import system with the following key features:
- **Ultra-precise conversion**: Achieves 99.9%+ font consistency and ±0.1px size accuracy
- **Visual comparison tool**: Press Ctrl/Cmd+K to overlay original PSD for pixel-perfect comparison
- **Debug mode**: Press Ctrl+Shift+D to enable detailed conversion logging
- **Console commands**: Use `window.psdDebugger.*` methods for advanced debugging
- **Automatic style application**: System automatically applies precision CSS to imported PSD elements

### Special Configuration Notes
- Uses Sentry for error tracking (configured in vite.config.js)
- Development server runs on port 3002 (not standard 3000)
- Includes Chinese language comments in some files (particularly index.jsx)
- PSD API key is hardcoded: `JtaT2TQRl_EqM_V0SXL0` with domain check bypass in development

### Key Debugging Features
- Access `window.store` and `window.project` for runtime debugging
- PSD comparison tool available via Ctrl/Cmd+K shortcut
- Comprehensive logging system for PSD conversion process
- Debug panel accessible via Ctrl+Shift+D
