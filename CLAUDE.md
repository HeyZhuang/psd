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
1. My Designs (`sections/my-designs-section.jsx`) - User's saved designs with cloud sync
2. My Elements (`sections/my-elements-section.jsx`) - Custom element library with right-click save
3. My Templates (`sections/my-templates-section.jsx`) - User-created template management
4. Upload (`sections/upload-section.jsx`) - PSD import entry point with text layer detection
5. Text (Polotno default TextSection) - Native text section with font management
6. My Fonts (`sections/my-fonts-section.jsx`) - Custom font library management with preset fonts
7. Photos (Polotno default PhotosSection) - Image assets
8. Shapes (`sections/shapes-section.jsx`) - Shape elements
9. Resize (`sections/resize-section.jsx`) - Canvas resizing tools

Additional sections available but not in default order:
- Icons (`sections/icons-section.jsx`)
- QR Code (`sections/qr-section.jsx`)
- Quotes (`sections/quotes-section.jsx`)
- Stable Diffusion (`sections/stable-diffusion-section.jsx`)
- Layers (`sections/layers-section.jsx`)

Note: Videos and UserTemplates sections are explicitly excluded from the default panel.

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


### Custom Asset Management

**My Elements System**:
- `utils/my-elements-manager.js`: Manages user's custom element library
- Right-click context menu on any element to "Save to My Elements"
- Elements stored in localStorage with preview thumbnails
- Supports all element types with full property preservation
- Drag-and-drop from My Elements panel to canvas
- Maximum 100 elements stored (FIFO overflow)

**My Fonts System**:
- `utils/my-fonts-manager.js`: Custom font library manager
- Preset fonts loaded from `/public/fonts/` directory
- Users can upload additional fonts (TTF, OTF formats)
- Fonts stored in localStorage (user uploads use Base64, presets use URL references)
- Maximum 50 custom fonts
- Preset fonts include Brudoni, Alex Brush, CAT fonts, and Chinese fonts (華康 series)
- Font selector integration via `utils/font-select-fixer.js`

**My Templates System**:
- `utils/template-manager.js`: User template management
- Save entire designs as reusable templates
- Templates stored in localStorage with thumbnails
- Support for template categories and organization

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
- Development environment has domain check disabled via `disableDomainCheck: true`
- Custom sections extend Polotno's default sections
- Custom fonts are added to store via `store.addFont()` in `index.jsx`
- Animations enabled via `unstable_setAnimationsEnabled(true)`

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
- Debug button in topbar (`topbar/debug-button.jsx`) for quick access to debugging tools

### Key Topbar Components

- `topbar/topbar.jsx`: Main topbar layout
- `topbar/download-button.jsx`: Export functionality for various formats
- `topbar/psd-text-button.jsx`: PSD text editing controls (batch edit, export text data)
- `topbar/psd-export-button.jsx`: Export back to PSD format
- `topbar/debug-button.jsx`: Toggle debugging features
- `topbar/file-menu.jsx`: File operations menu
- `topbar/user-menu.jsx`: User account and settings

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
- **LocalStorage Quota**: Preset fonts use URL references instead of Base64 to avoid QuotaExceededError. Only user-uploaded fonts are stored as Base64.

## Component Architecture

### Main Components

- `components/CustomToolbar.jsx`: Customized Polotno toolbar with additional PSD text controls
- `components/CustomFontSelector.jsx`: Enhanced font selector integrated into toolbar
- `components/PSDTextEditor.jsx`: Full-featured text editor with effects controls
- `components/PreciseTextRenderer.jsx`: Precise text rendering component
- `components/RightLayersPanel.jsx`: Collapsible layer management panel (320px ↔ 50px)

### Utilities

- `utils/PSDTextManager.js`: Manages text editing lifecycle with MobX autorun
- `utils/FontManager.js`: Font loading, validation, and fallback mapping
- `utils/PrecisionRenderer.js`: Pixel-perfect rendering with supersampling
- `utils/PolotnoTextRenderer.js`: Enhanced text rendering with Konva integration
- `utils/PSDDebugger.js`: Comprehensive debugging system with conversion logs
- `utils/my-elements-manager.js`: Element library management
- `utils/my-fonts-manager.js`: Custom font library management
- `utils/template-manager.js`: Template storage and retrieval
- `utils/font-select-fixer.js`: Font selector styling and behavior fixes
- `utils/force-option-black.js`: CSS selector color enforcement with throttled MutationObserver

## Build and Deployment

### Vite Configuration

- Server runs on `0.0.0.0:3002` with HMR support
- Public directory explicitly set to `public/`
- Sentry integration for error tracking (org: 'polotno', project: 'polotno-studio')
- Bundle analyzer plugin for build optimization
- Source maps enabled in production builds

### Important Files

- `vite.config.js`: Build configuration with Sentry and analyzer plugins
- `index.jsx`: Application entry point with store initialization
- `App.jsx`: Main layout and section configuration
- `project.js`: Cloud project management with 2000ms polling interval
- `api.js`: API communication layer
- `storage.js`: LocalStorage wrapper utilities
- `file.js`: File loading and handling
- `psd-utils.js`: Core PSD parsing engine (64KB, largest utility file)
- `psd-export.js`: Export Polotno designs back to PSD format

### CSS Architecture

**Modern Design System** (Added 2025-01-08):
- `styles/design-tokens.css`: Design tokens system (colors, spacing, typography, shadows, transitions)
- `styles/modern-ui.css`: Modern UI components (topbar, toolbar, buttons, inputs, cards)
- `styles/enhanced-sidepanel.css`: Canva-style side panel with card grids and modern search
- `styles/animations.css`: Smooth animations and micro-interactions (fade, slide, scale, bounce)

**Legacy Styles**:
- `index.css`: Main application styles (53KB) - includes global resets and base styles
- `styles/psd-precision.css`: Injected CSS for precise text effects rendering
- `styles/font-select-override.css`: Font selector styling customizations
- `styles/force-black-option.css`: Color enforcement for select options

**IMPORTANT - CSS Import Order** (in `index.jsx`):
```javascript
import '@blueprintjs/core/lib/css/blueprint.css';   // 1. Blueprint base
import './styles/design-tokens.css';                 // 2. Design tokens (variables)
import './styles/modern-ui.css';                     // 3. Modern UI components
import './styles/enhanced-sidepanel.css';            // 4. Side panel enhancements
import './styles/animations.css';                    // 5. Animations
import './index.css';                                // 6. Application styles
import './styles/psd-precision.css';                 // 7. PSD precision
import './styles/font-select-override.css';          // 8. Font overrides
```
This order is critical: design tokens must load first, then UI components that use those tokens, then app-specific overrides.

### Modern UI Design System

The application now uses a comprehensive design system that combines Figma's precision with Canva's simplicity:

**Design Philosophy**: "比 Canva 更轻量，比普通编辑工具更专业" (More lightweight than Canva, more professional than ordinary editing tools)

**Key Features**:
- **Design Tokens**: 100+ CSS custom properties for colors, spacing, typography, shadows
- **8px Grid System**: All spacing aligned to 8px grid for consistency
- **Color System**: Professional blue (#3276FF) primary + 10-level neutral grays
- **Typography**: Inter font family with modular scale (11px - 32px)
- **Shadows**: 4-level elevation system for depth and hierarchy
- **Animations**: 60fps GPU-accelerated animations with prefers-reduced-motion support

**Component Updates**:
- **Topbar**: 56px height, Figma-inspired with logo and project name editor
- **Side Panel**: 280px width, Canva-style card grids with hover effects
- **Toolbar**: 48px compact height with contextual controls
- **Layer Panel**: Collapsible 280px ↔ 48px with smooth transitions
- **Buttons**: Rounded corners, hover states, click bounce animations
- **Cards**: Grid layout, hover lift effect, shadow transitions

**Reference Documentation**:
- Full design system: `polotno-studio-master/DESIGN_SYSTEM.md`
- UI improvements: `polotno-studio-master/UI_IMPROVEMENTS.md`
- Quick start guide: `polotno-studio-master/QUICK_START.md`

## Deployment

### Production Deployment

The application is currently deployed on port 3002. See `polotno-studio-master/DEPLOYMENT_INFO.md` for details.

**Quick Deployment**:
```bash
cd polotno-studio-master

# Build for production
npm run build

# Serve on port 3002 (background)
nohup npx serve -s dist -l 3002 > /tmp/psd-studio-3002.log 2>&1 &

# Check status
lsof -i :3002
tail -f /tmp/psd-studio-3002.log
```

**Server Configuration**:
- Port: 3002 (configured in vite.config.js)
- Host: 0.0.0.0 (listens on all interfaces)
- Static files served from: `dist/` directory
- Logs: `/tmp/psd-studio-3002.log`

**Restarting Service**:
```bash
# Stop existing service
sudo fuser -k 3002/tcp

# Start new service
cd polotno-studio-master
nohup npx serve -s dist -l 3002 > /tmp/psd-studio-3002.log 2>&1 &
```

### Development vs Production

- **Development** (`npm start`): Vite dev server with HMR, runs on 0.0.0.0:3002
- **Production** (`npm run build` + serve): Optimized build served via static file server

### Build Output

Production build generates:
- Total size: ~3.60 MB (gzip: ~1.34 MB)
- Main CSS: ~383 KB (gzip: ~47 KB)
- Output directory: `dist/`
- Build time: ~20-25 seconds
