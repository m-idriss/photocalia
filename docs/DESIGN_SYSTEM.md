# Design System

> Design system documentation for the Photocalia calendar converter SaaS.

## Table of Contents

- [Overview](#overview)
- [Design Principles](#design-principles)
- [Color System](#color-system)
- [Typography](#typography)
- [Spacing](#spacing)
- [Components](#components)
- [Animations](#animations)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)

---

## 🎨 Design Principles

The Photocalia application uses a **modern design** with **glassmorphism** effects to create a clean, immersive experience. The design system is built with CSS custom properties for easy theming and maintainability.

### Key Features

- **Glassmorphism UI**: Translucent frosted-glass effect
- **Space Theme**: Dark backgrounds with particle effects
- **Multiple Themes**: Dark, Light, and Glass themes
- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 AA compliance goals

---

## Design Principles

### 1. Visual Hierarchy

- Clear separation between sections
- Prominent headings with gradient effects
- Consistent spacing rhythm
- Strategic use of color for emphasis

### 2. Consistency

- Unified component styling
- Consistent spacing scale
- Standardized border radius
- Predictable animations

### 3. Minimalism

- Clean, uncluttered interfaces
- Focus on content
- Purposeful use of effects
- Whitespace for breathing room

### 4. Accessibility First

- Sufficient color contrast
- Keyboard navigation support
- Screen reader compatibility
- Reduced motion support

---

## Color System

### Theme Modes

The application supports three theme modes:

1. **Glass Theme** (default)
2. **Dark Theme**
3. **White Theme**

### CSS Custom Properties

All colors are defined as CSS custom properties in `src/styles.scss`:

```scss
:root {
  // Primary Text Colors
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);

  // Accent Colors
  --accent-color: #3b82f6; // Primary blue
  --accent-color-hover: #2563eb; // Darker blue for hover

  // Background Colors
  --body-bg: #000000;

  // Glassmorphism
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-blur: blur(16px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);

  // Borders
  --border-color: rgba(255, 255, 255, 0.1);
}
```

### Theme-Specific Colors

#### Glass Theme

- Background: Dark with video overlay
- Text: White with high opacity
- Glass effect: Low opacity white with blur

#### Dark Theme

- Background: Pure black (#000000)
- Text: White (rgba(255, 255, 255, 0.95))
- Accents: Blue (#3b82f6)

#### White Theme

- Background: Pure white (#ffffff)
- Text: Dark gray (rgba(0, 0, 0, 0.87))
- Accents: Blue (#3b82f6)

### Background Modes

1. **Video Background**: Animated space video
2. **Black Background**: Solid black (#000000)
3. **White Background**: Solid white (#ffffff)

### Color Contrast

All color combinations meet WCAG 2.1 AA standards:

- **Normal text**: 4.5:1 contrast ratio minimum
- **Large text**: 3:1 contrast ratio minimum
- **UI components**: 3:1 contrast ratio minimum

---

## Typography

### Font Family

Primary font stack:

```scss
--font-family:
  -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### Font Sizes

```scss
--font-size-base: 1.125rem; // 18px (body text)
--font-size-lg: 1.375rem; // 22px (headings)
--font-size-xl: 1.625rem; // 26px (large headings)
```

### Font Size Modes

Users can adjust font sizes:

- **Normal**: Default sizes
- **Large**: 1.2x multiplier
- **Small**: 0.9x multiplier

### Typography Scale

| Element | Size     | Weight | Usage               |
| ------- | -------- | ------ | ------------------- |
| H1      | 2.5rem   | 700    | Page title          |
| H2      | 2rem     | 700    | Section headings    |
| H3      | 1.625rem | 600    | Subsection headings |
| H4      | 1.375rem | 600    | Card titles         |
| Body    | 1.125rem | 400    | Paragraph text      |
| Small   | 0.875rem | 400    | Captions, labels    |

### Line Height

- **Headings**: 1.2
- **Body text**: 1.6
- **Small text**: 1.5

### Font Weights

- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

---

## Spacing

### Spacing Scale

Consistent spacing using CSS custom properties:

```scss
--space-xs: 0.5rem; // 8px
--space-sm: 0.75rem; // 12px
--space-md: 1rem; // 16px
--space-lg: 1.5rem; // 24px
--space-xl: 2rem; // 32px
```

### Usage Guidelines

- **Component padding**: `--space-md` (16px)
- **Section spacing**: `--space-xl` (32px)
- **Element margin**: `--space-sm` to `--space-lg`
- **Grid gaps**: `--space-md` to `--space-lg`

### Responsive Spacing

Spacing adjusts on mobile devices:

```scss
@media (max-width: 768px) {
  .container {
    padding: var(--space-sm); // Reduced from var(--space-md)
  }
}
```

---

## Components

### Glassmorphism Cards

Base card styling with glass effect:

```scss
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

### Border Radius

```scss
--border-radius: 16px;
--border-radius-sm: 8px;
--border-radius-lg: 24px;
```

### Shadows

Layered shadows for depth:

```scss
// Light shadow
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

// Medium shadow
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);

// Heavy shadow
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
```

### Buttons

```scss
.button {
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--border-radius-sm);
  background: var(--accent-color);
  color: white;
  border: none;
  cursor: pointer;
  transition: all var(--t-fast) var(--ease);

  &:hover {
    background: var(--accent-color-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}
```

### Section Headers

```scss
.section-header {
  text-align: center;
  margin-bottom: var(--space-xl);

  h2 {
    font-size: 2rem;
    font-weight: 700;
    background: linear-gradient(135deg, var(--text-primary), rgba(59, 130, 246, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
    }
  }
}
```

### Section Toggle

Collapsible section controls:

```scss
.section-toggle {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s var(--ease);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
  }

  &::after {
    content: '▼';
    transition: transform 0.2s var(--ease);
  }

  &.collapsed::after {
    transform: rotate(-90deg);
  }
}
```

---

## Animations

### Transition Timings

```scss
--t-fast: 0.15s;
--t-medium: 0.3s;
--t-slow: 0.5s;
--ease: cubic-bezier(0.4, 0, 0.2, 1);
```

### Common Transitions

#### Fade In

```scss
.fade-in {
  animation: fadeIn var(--t-medium) var(--ease);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

#### Slide Up

```scss
.slide-up {
  animation: slideUp var(--t-medium) var(--ease);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Hover Lift

```scss
.lift-on-hover {
  transition: transform var(--t-fast) var(--ease);

  &:hover {
    transform: translateY(-4px);
  }
}
```

### Reduced Motion

Respect user preferences:

```scss
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Responsive Design

### Breakpoints

```scss
// Mobile
@media (max-width: 480px) {
}

// Tablet
@media (max-width: 768px) {
}

// Desktop
@media (min-width: 769px) {
}

// Large Desktop
@media (min-width: 1200px) {
}
```

### Mobile-First Approach

Write base styles for mobile, enhance for larger screens:

```scss
.grid {
  display: grid;
  grid-template-columns: 1fr; // Single column on mobile
  gap: var(--space-md);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); // Two columns on tablet
  }

  @media (min-width: 1200px) {
    grid-template-columns: repeat(3, 1fr); // Three columns on desktop
  }
}
```

### Container Width

```scss
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-lg);

  @media (max-width: 768px) {
    padding: var(--space-md);
  }
}
```

---

## Accessibility

### Focus Indicators

Visible focus states for keyboard navigation:

```scss
*:focus-visible {
  outline: 2px solid var(--accent-color);
  outline-offset: 2px;
  border-radius: var(--border-radius-sm);
}

button:focus-visible,
a:focus-visible {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}
```

### Color Contrast

All text meets WCAG 2.1 AA standards:

- White text on dark backgrounds: >12:1 ratio
- Blue accent on dark backgrounds: >7:1 ratio
- Links have sufficient contrast and additional indicators

### Semantic HTML

Use proper HTML5 elements:

```html
<article>
  <header>
    <h2>Section Title</h2>
  </header>

  <section aria-labelledby="section-title">
    <!-- Content -->
  </section>
</article>
```

### ARIA Labels

Add labels for screen readers:

```html
<button aria-label="Toggle theme">
  <i class="fa fa-moon"></i>
</button>

<section aria-labelledby="about-heading">
  <h2 id="about-heading">About Me</h2>
  <!-- Content -->
</section>
```

### Keyboard Navigation

- **Tab**: Move to next focusable element
- **Shift+Tab**: Move to previous focusable element
- **Enter/Space**: Activate buttons and links
- **Escape**: Close modals and menus

### Screen Reader Support

- Semantic HTML structure
- ARIA labels and roles
- Alt text for images
- Descriptive link text

---

## Design Tokens

### Complete Token Reference

```scss
:root {
  // Colors
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --accent-color: #3b82f6;
  --accent-color-hover: #2563eb;
  --body-bg: #000000;

  // Glassmorphism
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-blur: blur(16px);
  --glass-border: 1px solid rgba(255, 255, 255, 0.1);

  // Spacing
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  // Typography
  --font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-size-base: 1.125rem;
  --font-size-lg: 1.375rem;
  --font-size-xl: 1.625rem;

  // Border Radius
  --border-radius: 16px;
  --border-radius-sm: 8px;
  --border-radius-lg: 24px;

  // Transitions
  --t-fast: 0.15s;
  --t-medium: 0.3s;
  --t-slow: 0.5s;
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## Usage Examples

### Creating a New Section

```html
<section class="section" aria-labelledby="section-title">
  <div class="container">
    <header class="section-header">
      <h2 id="section-title">Section Title</h2>
    </header>

    <div class="grid">
      <article class="card">
        <h3>Card Title</h3>
        <p>Card content...</p>
      </article>
    </div>
  </div>
</section>
```

```scss
.section {
  padding: var(--space-xl) 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-lg);
}

.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--border-radius);
  padding: var(--space-lg);
  transition: transform var(--t-fast) var(--ease);

  &:hover {
    transform: translateY(-4px);
  }

  h3 {
    color: var(--text-primary);
    margin-bottom: var(--space-sm);
  }

  p {
    color: var(--text-secondary);
    line-height: 1.6;
  }
}
```

---

## Additional Resources

- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Material Design](https://material.io/design)
- [Glassmorphism in UI Design](https://blog.logrocket.com/ux-design/what-is-glassmorphism/)
