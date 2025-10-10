# 🎨 PSD Studio Design System

## Overview

This design system combines **Figma's precision** and **Canva's simplicity** to create a professional, lightweight, and intuitive design experience.

### Design Philosophy

> **"比 Canva 更轻量，比普通编辑工具更专业"**
>
> _More lightweight than Canva, more professional than ordinary editing tools_

- **Figma-inspired Precision**: Professional-grade controls and pixel-perfect layouts
- **Canva-style Simplicity**: Component-based operations and template-driven design
- **Modern Minimalism**: Clean interfaces with purposeful use of space
- **Performance-First**: Smooth animations without sacrificing responsiveness

---

## 🎨 Color System

### Primary Colors (Professional Blue)

```css
--primary-500: #3276FF  /* Main brand color */
--primary-600: #1764EA  /* Hover states */
--primary-700: #0D4FC2  /* Active states */
```

**Usage:**
- Primary actions and CTAs
- Selected states and focus rings
- Brand elements and logos

### Neutral Colors (Clean Grays)

```css
--neutral-0:   #FFFFFF  /* Pure white backgrounds */
--neutral-50:  #FAFAFA  /* Secondary backgrounds */
--neutral-100: #F5F5F5  /* Tertiary backgrounds */
--neutral-200: #EEEEEE  /* Borders and dividers */
--neutral-900: #212121  /* Primary text */
```

**Usage:**
- UI backgrounds and surfaces
- Text content (900, 600, 500)
- Borders and separators (200, 300)

### Semantic Colors

```css
--success-500: #4CAF50  /* Success states */
--warning-500: #FF9800  /* Warning states */
--error-500:   #F44336  /* Error states */
--info-500:    #2196F3  /* Info states */
```

---

## 📐 Spacing System (8px Grid)

All spacing follows an 8px base grid for consistency:

```css
--space-1: 4px    /* Tight spacing */
--space-2: 8px    /* Base unit */
--space-3: 12px   /* Compact spacing */
--space-4: 16px   /* Standard spacing */
--space-6: 24px   /* Generous spacing */
--space-8: 32px   /* Section spacing */
```

### Usage Examples

- **Padding**: Use space-4 (16px) for standard card padding
- **Gaps**: Use space-3 (12px) for element gaps
- **Margins**: Use space-6 (24px) for section separation

---

## 🔤 Typography

### Font Stack

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
```

### Type Scale (Modular Scale 1.2)

```css
--text-xs:   11px  /* Small labels */
--text-sm:   12px  /* Secondary text */
--text-base: 14px  /* Body text */
--text-lg:   16px  /* Emphasis */
--text-xl:   18px  /* Subtitles */
--text-2xl:  22px  /* Headings */
```

### Font Weights

```css
--font-normal:   400  /* Body text */
--font-medium:   500  /* UI labels */
--font-semibold: 600  /* Headings */
--font-bold:     700  /* Strong emphasis */
```

---

## 🎭 Shadows & Elevation

### Elevation Levels

```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06)      /* Level 1: Cards */
--shadow-md: 0 4px 6px rgba(0,0,0,0.07)      /* Level 2: Dropdowns */
--shadow-lg: 0 10px 15px rgba(0,0,0,0.08)    /* Level 3: Modals */
--shadow-xl: 0 20px 25px rgba(0,0,0,0.1)     /* Level 4: Overlays */
```

### Usage

- **Level 1 (sm)**: Static cards, panels
- **Level 2 (md)**: Hover states, popovers
- **Level 3 (lg)**: Modals, dialogs
- **Level 4 (xl)**: Full-screen overlays

---

## 📦 Border Radius

### Radius Scale

```css
--radius-sm:   4px    /* Small buttons */
--radius-md:   6px    /* Standard buttons, inputs */
--radius-lg:   8px    /* Cards, panels */
--radius-xl:   12px   /* Large cards */
--radius-2xl:  16px   /* Hero sections */
--radius-full: 9999px /* Pills, avatars */
```

---

## ⚡ Transitions & Animations

### Duration

```css
--transition-fast: 100ms  /* Icon changes */
--transition-base: 200ms  /* Standard interactions */
--transition-slow: 300ms  /* Panel transitions */
```

### Easing Functions

```css
--ease-out:     cubic-bezier(0, 0, 0.2, 1)      /* Default easing */
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1)    /* Smooth both ways */
--ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1) /* Bouncy effect */
```

### Animation Principles

1. **Purposeful**: Every animation serves a functional purpose
2. **Fast**: Most animations complete in 200-300ms
3. **Natural**: Use easing functions for organic movement
4. **Respectful**: Honor prefers-reduced-motion settings

---

## 🎯 Component Patterns

### 1. Topbar (Figma-inspired)

**Height**: 56px
**Background**: White with subtle shadow
**Elements**: Logo, File menu, Project name, Actions

```css
.topbar {
  height: 56px;
  background: var(--neutral-0);
  border-bottom: 1px solid var(--neutral-200);
  box-shadow: var(--shadow-xs);
}
```

### 2. Side Panel (Canva-style)

**Width**: 280px
**Layout**: Grid-based card layout
**Interactions**: Hover lift, smooth transitions

```css
.polotno-side-panel-container {
  width: 280px;
  background: var(--neutral-50);
  border-right: 1px solid var(--neutral-200);
}
```

**Card Grid**:
```css
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}
```

### 3. Toolbar (Contextual)

**Height**: 48px
**Style**: Minimal with icon buttons
**Behavior**: Contextual to selected element

```css
.polotno-toolbar {
  height: 48px;
  background: var(--neutral-0);
  border-bottom: 1px solid var(--neutral-200);
}
```

### 4. Layer Panel (Figma-inspired)

**Width**: 280px (open) / 48px (collapsed)
**Hierarchy**: Tree-based with indentation
**Interactions**: Drag & drop reordering

```css
.right-layers-panel {
  width: 280px;
  background: var(--neutral-0);
  border-left: 1px solid var(--neutral-200);
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 🎨 Micro-interactions

### Button States

```css
/* Default */
.bp5-button {
  background: transparent;
  transition: all 200ms ease;
}

/* Hover */
.bp5-button:hover {
  background: var(--state-hover-bg);
}

/* Active (with bounce) */
.bp5-button:active {
  animation: scaleBounce 200ms ease-out;
}
```

### Card Hover

```css
.card {
  transition: all 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-300);
}
```

### Focus Ring

```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(50, 118, 255, 0.15);
}
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
xs: 0-639px      /* Mobile devices */
sm: 640px+       /* Large phones */
md: 768px+       /* Tablets */
lg: 1024px+      /* Laptops */
xl: 1280px+      /* Desktops */
2xl: 1536px+     /* Large screens */
```

### Responsive Panel Widths

```css
/* Desktop */
--sidepanel-width: 280px;
--layer-panel-width: 280px;

/* Tablet (md) */
@media (max-width: 768px) {
  --sidepanel-width: 240px;
  --layer-panel-width: 240px;
}

/* Mobile (sm) */
@media (max-width: 480px) {
  --sidepanel-width: 200px;
  /* Layer panel collapses to icon only */
}
```

---

## ♿ Accessibility

### Color Contrast

All text meets WCAG AA standards:
- **Large text (18px+)**: 3:1 contrast ratio
- **Normal text (14px)**: 4.5:1 contrast ratio

### Focus Indicators

All interactive elements have visible focus states:
```css
button:focus-visible {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### Reduced Motion

Respect user preferences:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Semantic HTML

- Use proper heading hierarchy (h1 → h2 → h3)
- Include ARIA labels for icon-only buttons
- Maintain logical tab order

---

## 🎯 Best Practices

### Do's ✅

- Use design tokens for all colors and spacing
- Apply consistent border radius to related components
- Animate transform and opacity (GPU-accelerated)
- Use semantic color names (primary, success, error)
- Maintain 8px grid alignment
- Provide hover/active states for all interactive elements

### Don'ts ❌

- Hard-code color values
- Mix spacing units (stick to 8px grid)
- Animate width/height (causes reflow)
- Use transitions longer than 400ms
- Override design tokens without reason
- Forget mobile responsiveness

---

## 📚 Resources

### Design Files
- Figma: [PSD Studio Design System](#)
- Design Tokens: `src/styles/design-tokens.css`

### Code References
- Modern UI: `src/styles/modern-ui.css`
- Side Panel: `src/styles/enhanced-sidepanel.css`
- Animations: `src/styles/animations.css`

### Inspiration
- [Figma](https://figma.com) - Professional precision
- [Canva](https://canva.com) - Component-based simplicity
- [Vercel](https://vercel.com) - Clean minimalism

---

## 🚀 Getting Started

### For Developers

1. **Import Design Tokens**:
   ```jsx
   import './styles/design-tokens.css';
   import './styles/modern-ui.css';
   ```

2. **Use CSS Variables**:
   ```css
   .my-component {
     padding: var(--space-4);
     background: var(--bg-primary);
     border-radius: var(--radius-md);
   }
   ```

3. **Apply Utility Classes**:
   ```jsx
   <div className="rounded-lg elevation-2 animate-fade-in">
     Content
   </div>
   ```

### For Designers

1. Use the 8px grid for all spacing
2. Stick to the defined color palette
3. Apply consistent shadows for elevation
4. Use Inter font family for UI text
5. Design mobile-first, then scale up

---

## 📝 Changelog

### Version 1.0.0 (2025-01-08)
- ✨ Initial design system release
- 🎨 Design tokens implementation
- 🎭 Animation system
- 📱 Responsive framework
- ♿ Accessibility features

---

**Built with ❤️ for professional designers who value both precision and simplicity**
