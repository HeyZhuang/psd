# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polotno Studio PSD Enhanced Editor - A professional design editor built on the Polotno SDK with advanced PSD import capabilities, particularly focused on editable text layers with effects support. This is a React-based application that allows users to import PSD files and edit them with full text editing capabilities while preserving layer effects.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on port 3002)
npm start

# Build for production
npm run build
```

The development server runs on `http://localhost:3002` (port configured in vite.config.js).

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
2. Upload (`sections/upload-section.jsx`) - PSD import entry point with text layer detection
3. Templates (`sections/user-templates-section.jsx`) - Template management with preview generation
4. Text (`sections/text-section.jsx`) - Polotno native text section
5. My Fonts (`sections/fonts-section.jsx`) - Custom font upload and management
6. Photos (Polotno default)
7. Shapes (`sections/shapes-section.jsx`)
8. Resize (`sections/resize-section.jsx`)

Note: Videos section is explicitly excluded.

### State Management

- **Polotno Store**: Global store accessible via `window.store`
- **Project Context**: Project management accessible via `window.project`
- **MobX**: Used for reactive state management with observer pattern
- **Local Storage**: Used for persisting user templates and assets via `storage.js`

### Template System

- `utils/template-manager.js`: Handles template CRUD operations with metadata
- Templates include preview generation, thumbnail creation, and custom metadata
- Integration with cloud storage via `api.js`

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

### Working Directory

All source code is in `polotno-studio-master/` subdirectory, not the repository root.

## Debugging Features

- **Ctrl+Shift+D**: Toggle debug mode to see detailed PSD conversion logs
- **Ctrl/Cmd+K**: Enable PSD comparison tool (overlay original vs. rendered)
- **Double-click or Enter**: Edit PSD text elements
- Console logging for PSD parsing, font loading, and precision rendering
