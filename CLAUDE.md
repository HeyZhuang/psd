# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polotno Studio PSD Enhanced Editor - A professional design editor built on the Polotno SDK with advanced PSD import capabilities, particularly focused on editable text layers with effects support. This is a React-based application that allows users to import PSD files and edit them with full text editing capabilities while preserving layer effects.

## Development Commands

**Important**: All commands must be run from the `polotno-studio-master/` subdirectory, not the repository root.

```bash
# Navigate to working directory
cd polotno-studio-master

# Install dependencies
npm install

# Start development server (runs on port 3002)
npm start

# Build for production
npm run build
```

The development server runs on `http://localhost:3002` (port configured in vite.config.js).

### Repository Structure

The repository has a unique structure where the actual application code is in a subdirectory:
- `/polotno-studio-psd-main/` - Repository root (contains CLAUDE.md)
- `/polotno-studio-psd-main/polotno-studio-master/` - **Working directory** (contains src/, package.json, etc.)

## Core Architecture

### Main Application Structure

- **Entry Point**: `polotno-studio-master/src/index.jsx` - Initializes the Polotno store, sets up PSD precision systems, and renders the main App
- **Main App**: `polotno-studio-master/src/App.jsx` - Defines the side panel sections in a specific order and sets up the overall layout
- **Build System**: Vite 6 with React plugin, includes Sentry integration for error tracking and bundle analyzer

### PSD Import System

The PSD import system is the core feature of this application:

1. **PSD Parsing** (`psd-utils.js`): Uses `ag-psd` library to parse PSD files with high precision settings for image quality
   - `parsePSDFile()`: Main entry point for PSD parsing
   - `layerToPolotnoElement()`: Converts PSD layers to Polotno elements with effect preservation
   - `flattenLayers()`: Recursively processes layer hierarchies including groups and hidden layers
   - Supports text effects: stroke, outer glow, drop shadow, color overlay, inner shadow, bevel & emboss

2. **Text Import Modes**: Controlled via `window.psdImportOptions.rasterizeText`
   - `false` (default): Import text as editable with full editing capabilities
   - `true`: Import text as rasterized images for exact visual fidelity

3. **Text Editing System**:
   - `utils/PSDTextManager.js`: Manages text editing lifecycle, double-click handlers, and keyboard shortcuts (Enter key)
   - `components/PSDTextEditor.jsx`: Full-featured text editor with font, size, color, alignment, line height, letter spacing, and text effects controls
   - `utils/FontManager.js`: Smart font loading and fallback system with 200+ professional font mappings

4. **Precision Rendering**:
   - `utils/PrecisionRenderer.js`: Pixel-perfect rendering with high-DPI screen support and 2x supersampling
   - `utils/PolotnoTextRenderer.js`: Enhanced text rendering integrated with Konva
   - `utils/PSDDebugger.js`: Debug system (activate with Ctrl+Shift+D)
   - `styles/psd-precision.css`: CSS injected for precise text effects

### Side Panel Sections (Order Matters)

The section order is explicitly configured in `App.jsx`:
1. My Designs (`sections/my-designs-section.jsx`)
2. My Elements (`sections/my-elements-section.jsx`) - Custom element library with right-click save
3. Upload (`sections/upload-section.jsx`) - PSD import entry point with text layer detection
4. Text (Polotno default TextSection) - Native text section with font management
5. Photos (Polotno default)
6. Shapes (`sections/shapes-section.jsx`)
7. Resize (`sections/resize-section.jsx`)

Note: Videos and UserTemplates sections are explicitly excluded.

### State Management

- **Polotno Store**: Global store accessible via `window.store`
- **Project Context**: Project management accessible via `window.project`
- **MobX**: Used for reactive state management with observer pattern
- **Local Storage**: Used for persisting user templates and assets via `storage.js`

### Layout System

- **Left Panel**: Side panel with tool sections (My Designs, Upload, Text, Photos, etc.)
- **Center**: Main workspace canvas with toolbar, zoom controls, and pages timeline
- **Right Panel**: `RightLayersPanel` component provides collapsible layer management
  - Toggles between 320px (open) and 50px (collapsed)
  - Window resize events are dispatched during transitions to ensure Polotno recalculates canvas size
  - Multiple resize triggers at intervals (50ms, 100ms, 150ms, 200ms, 250ms, 300ms, 350ms) ensure smooth transitions


### My Elements System

- `utils/my-elements-manager.js`: Manages user's custom element library
- Right-click context menu on any element to "Save to My Elements"
- Elements stored in localStorage with preview thumbnails
- Supports all element types with full property preservation
- Drag-and-drop from My Elements panel to canvas
- Maximum 100 elements stored (FIFO overflow)

## Key Technical Details

### PSD Text Effects Parsing

Text effects are parsed from PSD layer effects and stored in element.custom.textEffects:
- Each effect has an `enabled` flag that can be toggled
- Effects are converted to CSS (text-shadow, -webkit-text-stroke, etc.)
- Original PSD text is preserved in `element.custom.originalText`
- Effects can be edited and re-applied via PSDTextEditor

### Font System

The FontManager provides:
- Intelligent font fallback mapping (Adobe fonts, system fonts, CJK fonts)
- Font loading validation and caching
- Font family chain generation with appropriate fallbacks

### Image Quality Optimization

The codebase implements multiple quality enhancement techniques:
- High-DPI screen adaptation with device pixel ratio detection
- 2x supersampling anti-aliasing
- Canvas high-quality rendering with imageSmoothingQuality: 'high'
- PNG lossless output

### Global Debugging Interface

- `window.psdTextManager`: Access text editing functionality
- `window.psdDebugger`: Access debug logging and conversion logs
- `window.psdImportOptions`: Configure import behavior

## Important Development Notes

### Polotno SDK Integration

- Uses Polotno SDK with license key configured in `index.jsx`
- Development environment has domain check disabled
- Custom sections extend Polotno's default sections

### Error Handling

- React Error Boundary wraps the entire app with Sentry integration
- Fallback UI provides cache clearing functionality
- Logger configured in `logger.js`

### Translation Support

Internationalization configured via `setTranslations()` with support for:
- English (en), French (fr), Indonesian (id), Russian (ru), Portuguese (pt-br), Chinese (zh-ch)
- Translation files in `translations/` directory

## Debugging Features

- **Ctrl+Shift+D**: Toggle debug mode to see detailed PSD conversion logs
- **Ctrl/Cmd+K**: Enable PSD comparison tool (overlay original vs. rendered)
- **Double-click or Enter**: Edit PSD text elements
- Console logging for PSD parsing, font loading, and precision rendering

## Performance Optimization Notes

### Critical Performance Considerations

The codebase uses several periodic timers and observers that can impact performance. When making changes:

1. **Avoid Frequent setInterval**: Multiple files use `setInterval` for polling. These have been optimized to run at reasonable intervals:
   - `project.js`: Cloud state check (2000ms)
   - `font-select-fixer.js`: Font style application (2000ms and 3000ms)
   - `PrecisionRenderer.js`: Element change polling (5000ms)
   - `PolotnoTextRenderer.js`: Text enhancement (3000ms and 5000ms)

2. **Use MobX Reactions Instead of Polling**: When monitoring Polotno store changes, prefer MobX `autorun` or `reaction` over `setInterval`. Example: `PSDTextManager.js` uses `autorun` to watch `selectedElements`.

3. **Throttle MutationObservers**: DOM observers should use throttling/debouncing to prevent excessive callbacks. See `force-option-black.js` for an example with 200ms throttling.

4. **Avoid Heavy Operations on Panel Mount**: Loading data or making network requests when panels open can cause UI freezes. Always load from local cache first, then sync in background if needed.

5. **Context-Specific Observers**: Limit MutationObserver scope to specific containers (e.g., `.polotno-panel-container`) rather than `document.body` to reduce callback frequency.

### Common Performance Issues

- **Network Requests on Mount**: Avoid automatic cloud sync when components mount. Let users trigger sync manually.
- **Excessive Console Logging**: Remove or disable verbose console logs in production code, especially in loops or frequent callbacks.
- **Global CSS Selectors**: Be specific with CSS selectors (use class names) to avoid affecting entire application.
