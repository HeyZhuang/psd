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

- **Entry Point**: `src/index.jsx` - Initializes the Polotno store, sets up PSD precision systems, and renders the main App
  - Creates Polotno store with license key and domain check configuration
  - Loads custom fonts from `/public/fonts/` directory (11 preset fonts including Chinese fonts)
  - Initializes precision rendering, text rendering, and debugging systems
  - Sets up React Error Boundary with Sentry integration
- **Main App**: `src/App.jsx` - Defines the side panel sections in a specific order and sets up the overall layout
  - Custom SidePanel with MutationObserver to filter unwanted sections (videos, photos)
  - Right-click context menu for saving elements to My Elements library
  - Dynamic layout system with collapsible right panel (320px ↔ 50px)
  - Font selector styling applied via `applyFontSelectStyles()` after 2000ms delay
- **Build System**: Vite 6 with React plugin, includes Sentry integration for error tracking and bundle analyzer

### PSD Import System

The PSD import system is the core feature of this application:

1. **PSD Parsing** (`src/psd-utils.js`, 64KB largest file): Uses `ag-psd` library to parse PSD files with high precision settings for image quality
   - `parsePSDFile()`: Main entry point for PSD parsing
   - `layerToPolotnoElement()`: Converts PSD layers to Polotno elements with effect preservation
   - `flattenLayers()`: Recursively processes layer hierarchies including groups and hidden layers
   - Supports text effects: stroke, outer glow, drop shadow, color overlay, inner shadow, bevel & emboss
   - Returns conversion log with detailed layer information for debugging

2. **Text Import Modes**: Controlled via `window.psdImportOptions.rasterizeText`
   - `false` (default): Import text as editable with full editing capabilities
   - `true`: Import text as rasterized images for exact visual fidelity

3. **Text Editing System**:
   - `utils/PSDTextManager.js`: Manages text editing lifecycle, double-click handlers, and keyboard shortcuts (Enter key)
     - Uses MobX `autorun` to watch `selectedElements` (avoids polling)
     - Exposes global `window.psdTextManager` for debugging
   - `components/PSDTextEditor.jsx`: Full-featured text editor with font, size, color, alignment, line height, letter spacing, and text effects controls
   - `utils/FontManager.js`: Smart font loading and fallback system with 200+ professional font mappings

4. **Precision Rendering**:
   - `utils/PrecisionRenderer.js`: Pixel-perfect rendering with high-DPI screen support and 2x supersampling
     - Uses 5000ms polling interval for element change detection
   - `utils/PolotnoTextRenderer.js`: Enhanced text rendering integrated with Konva
     - Uses 3000ms and 5000ms intervals for text enhancement
   - `utils/PSDDebugger.js`: Debug system (activate with Ctrl+Shift+D)
     - Exposes global `window.psdDebugger` for debugging
   - `styles/psd-precision.css`: CSS injected for precise text effects

### Side Panel Sections (Order Matters)

The section order is explicitly configured in `App.jsx`:
1. My Designs (`sections/my-designs-section.jsx`) - User's saved designs with cloud sync
2. My Elements (`sections/my-elements-section.jsx`) - Custom element library with right-click save
3. My Templates (`sections/my-templates-section.jsx`) - User-created template management
4. Upload (`sections/upload-section.jsx`) - PSD import entry point with text layer detection
5. Text (Polotno default TextSection) - Native text section with font management
6. Shapes (`sections/shapes-section.jsx`) - Shape elements
7. Resize (`sections/resize-section.jsx`) - Canvas resizing tools

Additional sections available but not in default order:
- Icons (`sections/icons-section.jsx`)
- QR Code (`sections/qr-section.jsx`)
- Quotes (`sections/quotes-section.jsx`)
- Stable Diffusion (`sections/stable-diffusion-section.jsx`)
- Layers (`sections/layers-section.jsx`)

Note: Videos and Photos sections are explicitly excluded via MutationObserver and filtered arrays in `CustomSidePanel`.

### State Management

- **Polotno Store**: Global store accessible via `window.store`
  - Created with `createStore()` from `polotno/model/store`
  - Domain check disabled in development environment
  - Custom fonts added via `store.addFont()`
- **Project Context**: Project management accessible via `window.project`
  - Created with `createProject({ store })`
  - Handles cloud sync with 2000ms polling interval (see `src/project.js:4731`)
- **MobX**: Used for reactive state management with observer pattern
- **Local Storage**: Used for persisting user templates and assets via `storage.js`
  - My Elements: localStorage key for element library
  - My Fonts: localStorage key for custom fonts (Base64 for uploads, URLs for presets)
  - Templates: localStorage key for user templates

### Layout System

- **Left Panel**: Side panel with tool sections (My Designs, Upload, Text, Shapes, etc.) - 280px width
- **Center**: Main workspace canvas with toolbar, zoom controls, and pages timeline
  - Uses memoized components: `MemoizedToolbar`, `MemoizedWorkspace`, `MemoizedZoomButtons`, `MemoizedPagesTimeline`
  - Custom toolbar: `CustomToolbar` component with PSD text controls
- **Right Panel**: `RightLayersPanel` component provides collapsible layer management
  - Toggles between 320px (open) and 50px (collapsed)
  - Window resize events are dispatched during transitions to ensure Polotno recalculates canvas size
  - Reduced resize triggers from 7 to 2 times (100ms, 300ms intervals) for performance
  - Uses `cubic-bezier(0.4, 0, 0.2, 1)` transition curve for smooth animation

### Custom Asset Management

**My Elements System**:
- `utils/my-elements-manager.js`: Manages user's custom element library
- Right-click context menu on any element to "Save to My Elements"
- Elements stored in localStorage with preview thumbnails
- Supports all element types with full property preservation
- Drag-and-drop from My Elements panel to canvas
- Maximum 100 elements stored (FIFO overflow)
- Toast notification system with slide-down animation on save

**My Fonts System**:
- `utils/my-fonts-manager.js`: Custom font library manager (8474 bytes)
- Preset fonts loaded from `/public/fonts/` directory
- Users can upload additional fonts (TTF, OTF formats)
- Fonts stored in localStorage (user uploads use Base64, presets use URL references)
- Maximum 50 custom fonts
- Preset fonts include Brudoni, Alex Brush, CAT fonts, and Chinese fonts (華康 series)
- Font selector integration via `utils/font-select-fixer.js` (8736 bytes, 2000ms and 3000ms intervals)

**My Templates System**:
- `utils/template-manager.js`: User template management (6856 bytes)
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
- 200+ professional font mappings (including Chinese fonts like DFPPop1, DFSuper)

### Image Quality Optimization

The codebase implements multiple quality enhancement techniques:
- High-DPI screen adaptation with device pixel ratio detection
- 2x supersampling anti-aliasing
- Canvas high-quality rendering with imageSmoothingQuality: 'high'
- PNG lossless output

### Global Debugging Interface

- `window.psdTextManager`: Access text editing functionality
  - `getAllPSDTextElements()`: Get all PSD text elements
  - `batchEditPSDText()`: Batch edit all text
- `window.psdDebugger`: Access debug logging and conversion logs
  - `showConversionLog()`: Display PSD conversion details
- `window.psdImportOptions`: Configure import behavior
  - `rasterizeText`: boolean to control text import mode
- `window.debugFonts()`: View current font list (exposed after 2000ms delay)
- `window.store`: Direct access to Polotno store
- `window.project`: Direct access to project context

## Important Development Notes

### Polotno SDK Integration

- Uses Polotno SDK with license key configured in `index.jsx`: `JtaT2TQRl_EqM_V0SXL0`
- Development environment has domain check disabled via `disableDomainCheck: true` (when hostname is localhost or 127.0.0.1)
- Custom sections extend Polotno's default sections
- Custom fonts are added to store via `store.addFont()` in `index.jsx`
- Animations enabled via `unstable_setAnimationsEnabled(true)`
- 11 preset fonts loaded on initialization (华康系列, CAT, Brudoni, Alex Brush, etc.)

### Error Handling

- React Error Boundary wraps the entire app with Sentry integration
- Fallback UI provides cache clearing functionality
- Logger configured in `logger.js` (3417 bytes)
- Sentry error tracking for production errors

### Translation Support

Internationalization configured via `setTranslations()` with support for:
- English (en), French (fr), Indonesian (id), Russian (ru), Portuguese (pt-br), Chinese (zh-ch)
- Translation files in `translations/` directory
- Language detection based on `project.language` property

## Debugging Features

- **Ctrl+Shift+D**: Toggle debug mode to see detailed PSD conversion logs
- **Ctrl/Cmd+K**: Enable PSD comparison tool (overlay original vs. rendered)
- **Double-click or Enter**: Edit PSD text elements
- Console logging for PSD parsing, font loading, and precision rendering
- Debug button in topbar (`topbar/debug-button.jsx`) for quick access to debugging tools
- Conversion logs stored in `window.psdDebugger` for later inspection

### Key Topbar Components

- `topbar/topbar.jsx`: Main topbar layout (50px height)
- `topbar/download-button.jsx`: Export functionality for various formats
- `topbar/psd-text-button.jsx`: PSD text editing controls (batch edit, export text data)
- `topbar/psd-export.jsx`: Export back to PSD format (see `src/psd-export.js`)
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
   - `App.jsx`: MutationObserver for section filtering (1000ms interval as backup)

2. **Use MobX Reactions Instead of Polling**: When monitoring Polotno store changes, prefer MobX `autorun` or `reaction` over `setInterval`. Example: `PSDTextManager.js` uses `autorun` to watch `selectedElements`.

3. **Throttle MutationObservers**: DOM observers should use throttling/debouncing to prevent excessive callbacks. See `force-option-black.js` for an example with 200ms throttling.

4. **Avoid Heavy Operations on Panel Mount**: Loading data or making network requests when panels open can cause UI freezes. Always load from local cache first, then sync in background if needed.

5. **Context-Specific Observers**: Limit MutationObserver scope to specific containers (e.g., `.polotno-panel-container`) rather than `document.body` to reduce callback frequency.

6. **Reduced Resize Triggers**: Right panel transitions now trigger only 2 resize events (was 7) at 100ms and 300ms intervals for better performance.

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

- `utils/PSDTextManager.js` (11717 bytes): Manages text editing lifecycle with MobX autorun
- `utils/FontManager.js` (6281 bytes): Font loading, validation, and fallback mapping
- `utils/PrecisionRenderer.js` (9864 bytes): Pixel-perfect rendering with supersampling
- `utils/PolotnoTextRenderer.js` (7900 bytes): Enhanced text rendering with Konva integration
- `utils/PSDDebugger.js` (11140 bytes): Comprehensive debugging system with conversion logs
- `utils/my-elements-manager.js` (7998 bytes): Element library management
- `utils/my-fonts-manager.js` (8474 bytes): Custom font library management
- `utils/template-manager.js` (6856 bytes): Template storage and retrieval
- `utils/font-select-fixer.js` (8736 bytes): Font selector styling and behavior fixes
- `utils/force-option-black.js` (3282 bytes): CSS selector color enforcement with throttled MutationObserver

### Core Files

- `src/psd-utils.js` (64KB): Core PSD parsing engine - largest utility file
- `src/psd-export.js` (10477 bytes): Export Polotno designs back to PSD format
- `src/file.js` (7153 bytes): File loading and handling
- `src/api.js` (7882 bytes): API communication layer
- `src/project.js` (4731 bytes): Cloud project management
- `src/storage.js` (642 bytes): LocalStorage wrapper utilities
- `src/logger.js` (3417 bytes): Logging configuration

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
- `styles/premium-effects.css`: Premium visual effects
- `styles/layers-premium.css`: Premium layer panel styles

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
import './styles/premium-effects.css';               // 6. Premium effects
import './styles/layers-premium.css';                // 7. Premium layers
import './index.css';                                // 8. Application styles
import './styles/psd-precision.css';                 // 9. PSD precision
import './styles/font-select-override.css';          // 10. Font overrides
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
- **Layer Panel**: Collapsible 280px ↔ 48px with smooth transitions (optimized from 320px)
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

## Known Issues and Troubleshooting

### HMR Configuration for Remote Development

If experiencing WebSocket connection issues in remote development:
- `vite.config.js` line 25 has hardcoded HMR host: `54.189.143.120`
- This may cause issues if your server IP changes
- Consider making it configurable via environment variable:
  ```javascript
  hmr: {
    protocol: 'ws',
    host: process.env.VITE_HMR_HOST || '0.0.0.0',
    port: 3002,
  }
  ```

### Environment Variables

- `%VITE_PLAUSIBLE_DOMAIN%` warning in console is non-critical (analytics configuration)
- Can be safely ignored or added to `.env` file if needed

### Font Loading

- Custom fonts load with 2000ms delay to ensure Polotno is ready
- Font selector styles applied after 2000ms delay in `App.jsx`
- If fonts don't appear, check console for loading errors
- Use `window.debugFonts()` to inspect loaded fonts

### LocalStorage Quota

- Preset fonts use URL references to avoid quota issues
- User-uploaded fonts use Base64 encoding and count toward quota
- Maximum 50 custom fonts to prevent quota exceeded errors
- Maximum 100 elements in My Elements library

### Section Filtering

- Videos and Photos sections are removed via MutationObserver
- If these sections reappear, check `App.jsx` CustomSidePanel implementation
- 1000ms interval checks as backup if observer fails
