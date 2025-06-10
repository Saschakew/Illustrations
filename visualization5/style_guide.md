# SVAR Visualizer Style Guide

This document outlines the design and styling conventions for the SVAR Visualizer project to ensure a consistent and professional look and feel.

## 1. Color Palette

We use a specific color palette for all UI elements, including text, backgrounds, and data visualizations.

- **Page Background**: `#EEEEEE` (Light Gray)
- **Primary Accent / Links**: `#00ADB5` (Teal)
- **Text & Headers**: `#222831` (Dark Gray)
- **Secondary Accent / Plots**: `#ff7f0e` (Orange)
- **Content Background**: `#FFFFFF` (White)

### CSS Variables

These colors are implemented as CSS custom properties in `public/css/style.css` for easy reuse:

```css
:root {
  --color-background: #EEEEEE;
  --color-primary: #00ADB5;
  --color-text: #222831;
  --color-accent: #ff7f0e;
  --color-white: #FFFFFF;
}
```

## 2. Typography

- **Primary Font**: `Lato`, served from Google Fonts.
- **Font Weights**: Use `400` for regular text and `700` for headings.
- **Base Font Size**: `16px`.
- **Line Height**: `1.6` for body text to ensure readability.

## 3. Layout

- **Max Width**: The main content area should not exceed `1200px`.
- **Spacing**: Use consistent padding and margins. Base unit is `1rem` (16px).
- **Sections**: Each content section should be clearly delineated with a background and box shadow to create a card-like effect.

## 4. Components

### Buttons

- **Primary Button**: Solid background (`--color-primary`), white text.
- **Secondary Button**: Border of `--color-primary`, text of `--color-primary`, transparent background.
- **Hover State**: Buttons should have a clear hover effect, such as a change in background color or brightness.

### Navigation

- The main navigation bar should have a dark background (`--color-text`).
- Links should be clearly visible.
- The active link or hover state should use the primary accent color (`--color-primary`).

## 5. Windsurf Rules (Project Conventions)

1.  **Always use CSS variables** for colors. Do not hard-code hex values in the CSS.
2.  All new UI components must be styled according to the rules in this guide.
3.  Data visualizations (plots) should prioritize the use of `--color-primary` and `--color-accent` to represent different data series.
4.  Maintain the modular structure: section-specific logic and content remain in their respective files.

## 6. Responsive Design

The website is designed to be fully responsive. Specific styles for smaller screens are handled in `public/css/mobile.css` and applied using media queries.

-   **Breakpoint 1 (Tablet & Large Phones)**: `max-width: 768px`
    -   Navigation stacks vertically.
    -   Font sizes and padding are reduced.
-   **Breakpoint 2 (Small Phones)**: `max-width: 480px`
    -   Further reduction in heading font sizes.
