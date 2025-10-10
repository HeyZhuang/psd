# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Polotno Studio PSD Enhanced Editor - A professional design editor built on the Polotno SDK with advanced PSD import capabilities, particularly focused on editable text layers with effects support. This is a React-based application that allows users to import PSD files and edit them with full text editing capabilities while preserving layer effects.

**Project Context**: This is a Chinese-focused project with bilingual documentation. The main README.md is in Chinese (中文), while code comments and variable names use a mix of Chinese and English. The application supports multiple languages including Chinese (zh-ch), English (en), French (fr), Indonesian (id), Russian (ru), and Portuguese (pt-br).

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

**Server Configuration**: The server is configured to listen on `0.0.0.0:3002` with HMR support. For remote access, update the HMR host in `vite.config.js` to match your external IP address.

### Production Deployment

For production deployment with persistent process management:

```bash
# Install PM2 globally (if not installed)
npm install -g pm2

# Start with PM2
pm2 start npm --name "polotno-studio" -- start

# Save PM2 process list for auto-restart on boot
pm2 save

# Setup auto-restart on server reboot
pm2 startup

# View logs
pm2 logs polotno-studio

# Restart/stop/delete
pm2 restart polotno-studio
pm2 stop polotno-studio
pm2 delete polotno-studio
```

**Note**: The application uses Vite dev server even in PM2 deployment. For true production, serve the built files from `dist/` using a static file server (nginx, serve, etc.).

### Repository Structure

The repository has a unique structure where the actual application code is in a subdirectory:
- `/polotno-studio-psd-main/` - Repository root (contains CLAUDE.md, git repository)
- `/polotno-studio-psd-main/polotno-studio-master/` - **Working directory** (contains src/, package.json, vite.config.js, etc.)

**Important**: When running git commands, navigate to the repository root (`/polotno-studio-psd-main/`). When running npm/development commands, navigate to the working directory (`/polotno-studio-psd-main/polotno-studio-master/`).

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
3. My Templates (`sections/my-templates-section.jsx`) - User's saved templates
4. Upload (`sections/upload-section.jsx`) - PSD import entry point with text layer detection
5. Text (Polotno default TextSection) - Native text section with font management
6. My Fonts (`sections/my-fonts-section.jsx`) - Custom font library with upload and preset fonts
7. Photos (Polotno default PhotosSection)
8. Shapes (`sections/shapes-section.jsx`) - Custom shapes
9. Resize (`sections/resize-section.jsx`) - Canvas resizing

Note: Videos and Layers sections are explicitly excluded from DEFAULT_SECTIONS.

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

### My Fonts System

- `utils/my-fonts-manager.js`: Custom font library management
- Supports two types of fonts:
  - **Preset Fonts**: Pre-configured fonts loaded from `/fonts` directory via URL references (first startup auto-load)
  - **User Uploads**: Custom fonts uploaded by users, stored as Base64 in localStorage
- Font validation using `@font-face` and test rendering
- Automatic font loading on store initialization via `store.addFont()`
- Storage optimization: Preset fonts use URL references to avoid localStorage quota issues

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

- `window.store`: Direct access to Polotno store
- `window.project`: Project management instance
- `window.psdTextManager`: Access text editing functionality
- `window.psdDebugger`: Access debug logging and conversion logs
- `window.psdImportOptions`: Configure import behavior (e.g., `{rasterizeText: false}`)
- `window.debugFonts()`: View current font list in console

## Important Development Notes

### Polotno SDK Integration

- Uses Polotno SDK with license key configured in `index.jsx` (key: `JtaT2TQRl_EqM_V0SXL0`)
- Development environment has domain check disabled (`disableDomainCheck: true` when hostname is localhost/127.0.0.1)
- Custom sections extend Polotno's default sections
- Store is initialized with one page by default and exposed globally via `window.store`

### Error Handling

- React Error Boundary wraps the entire app with Sentry integration
- Fallback UI provides cache clearing functionality
- Logger configured in `logger.js`

### Translation Support

Internationalization configured via `setTranslations()` with support for:
- English (en), French (fr), Indonesian (id), Russian (ru), Portuguese (pt-br), Chinese (zh-ch)
- Translation files in `translations/` directory
- Language preference stored in localStorage (`polotno-language`)

### Storage Architecture

- **LocalStorage**: User preferences, design autosave, templates, custom elements
- **LocalForage**: Persistent storage via `storage.js` for designs and templates
- **Cloud Storage**: Optional cloud sync via Puter.js integration
- **Storage Keys**:
  - `polotno-language`: Language preference
  - `polotno-last-design-id`: Last opened design
  - `my-fonts`: Custom fonts library (with quota optimization)
  - `my-elements`: User's saved elements
  - `my-templates`: User's saved templates

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
- **LocalStorage Quota**: Preset fonts use URL references instead of Base64 to avoid QuotaExceededError (see DEPLOYMENT_NOTE.md for details).

## Known Issues & Solutions

### LocalStorage Quota Exceeded
**Issue**: Large font files stored as Base64 can exceed localStorage quota (~5-10MB).
**Solution**: Preset fonts now use URL references from `/fonts` directory. Only user-uploaded fonts are stored as Base64.

### Font Loading Timing
**Issue**: Custom fonts may not be immediately available on first render.
**Solution**: Fonts are loaded in `index.jsx` via `store.addFont()` with validation delays. The `FontManager` handles fallbacks gracefully.

### PSD Import Performance
**Issue**: Large PSD files with many layers can cause UI freezes during import.
**Solution**: Import process uses `parsePSDFile()` with optimized settings. Consider implementing progress indicators for files >20MB.

## Debugging and Troubleshooting

### Workspace Not Showing Elements

If the canvas appears blank or elements aren't visible:

1. **Check browser console** for errors and initialization logs
2. **Verify DOM structure** - Look for `.polotno-workspace-container` and `.konvajs-content`
3. **Run diagnostic commands** in console:
   ```javascript
   // Check store state
   console.log('Store:', window.store);
   console.log('Active page:', window.store.activePage);
   console.log('Elements:', window.store.activePage?.children);

   // Check canvas
   const canvas = document.querySelector('canvas');
   console.log('Canvas:', canvas?.width, 'x', canvas?.height);
   ```

4. **Test element visibility** - Add a colored element to verify rendering:
   ```javascript
   window.store.activePage.addElement({
     type: 'text',
     x: 200,
     y: 200,
     fontSize: 60,
     text: '🎨 Test',
     fill: '#FF0000'
   });
   ```

5. **Clear cache** - Use Ctrl+Shift+R (Cmd+Shift+R on Mac) or try incognito mode

See `WORKSPACE_DEBUG_GUIDE.md` for detailed debugging steps.

### Environment Variables Warning

The build process may show warnings about `%VITE_PLAUSIBLE_DOMAIN%` not being defined. This is expected and can be safely ignored unless you're setting up Plausible analytics.

### Port Conflicts

If port 3002 is already in use, the server will fail to start due to `strictPort: true` in vite.config.js. Either stop the conflicting process or change the port in vite.config.js.
