# SVAR Visualizer Style Guide

This guide outlines the design system and styling conventions for the SVAR Visualizer project. The goal is to create a clean, modern, minimalistic, and mobile-responsive interface.

## 1. Color Palette

The color palette provides a consistent and visually appealing look.

- **Dark Background (`--color-background-dark`):** `#222831` (Very dark, almost black blue. For primary backgrounds.)
- **Light Background / Card Color (`--color-background-light`):** `#393E46` (Dark grey. For cards, containers, and secondary backgrounds.)
- **Primary Accent (`--color-primary`):** `#00ADB5` (A vibrant teal. For interactive elements like buttons, links, and highlights.)
- **Secondary Accent / Warning (`--color-accent`):** `#B83B5E` (A muted magenta/rose. For warnings or secondary call-to-actions.)
- **Text & Borders (`--color-text`):** `#EEEEEE` (Off-white. For all primary text, labels, and borders to ensure high contrast against dark backgrounds.)

## 2. Typography

We will use fonts from Google Fonts for a clean and modern look.

- **Primary Font:** `Lato` (For body text, labels, and paragraphs. It's clean and highly readable.)
- **Heading Font:** `Montserrat` (For all headings (`h1`, `h2`, `h3`). It's a modern, geometric sans-serif that pairs well with Lato.)

### Font Sizing (Mobile First)

- `h1`: `2rem`
- `h2`: `1.75rem`
- `h3`: `1.5rem`
- `p` / body: `1rem` (base size)
- labels / small text: `0.875rem`

Font sizes will be responsive and may be adjusted slightly for larger screens using media queries.

## 3. Layout & Spacing

- **Grid System:** We will use CSS Flexbox and Grid for layout to ensure responsiveness and alignment.
- **Main Layout:** A single-column layout for mobile, expanding to a more complex grid on larger screens.
- **Spacing:** A consistent spacing scale based on `rem` units will be used for margins and padding (e.g., `0.5rem`, `1rem`, `1.5rem`, `2rem`). This ensures visual rhythm.
- **Containers:** Content sections will be wrapped in "cards" with the `--color-background-light` background, rounded corners, and consistent padding.

## 4. Component Styles

- **Buttons:**
  - **Primary:** Solid `--color-primary` background, `--color-text` text. Subtle box-shadow on hover.
  - **Secondary:** Outlined with `--color-primary`, transparent background.
- **Sliders:** Custom-styled sliders to match the color palette. The track will be `--color-background-light` and the thumb will be `--color-primary`.
- **Switches/Toggles:** Custom-styled to match the primary accent color.
- **Cards:** As described in Layout, with `border-radius: 8px;` and `padding: 1.5rem;`.

## 5. CSS Structure & Methodology

To avoid a single, monolithic `style.css` file, we will adopt a more modular and organized structure.

1.  **`style.css` (Main/Entry Point):** This file will import all other CSS files. It will also contain the root definitions for CSS variables (colors, fonts).
2.  **`base.css`:** Contains global styles, resets (like `box-sizing: border-box`), typography rules for `body`, `h1`, `p`, etc., and basic link styling.
3.  **`layout.css`:** Styles for major page containers, such as the header, main content area, sections, and footer. Defines the primary grid or flexbox containers.
4.  **`components.css`:** Contains styles for all reusable UI components: buttons, sliders, cards, forms, toggles, etc. Each component will have its own clear section.
5.  **`mobile.css`:** This file will be renamed to `responsive.css` and will contain all `@media` queries. We will follow a mobile-first approach, meaning the default styles in the other files are for mobile, and this file adds rules for larger screens.

### Implementation Plan:

1.  **Create `guide_style.md`:** (This file).
2.  **Create new CSS files:** `base.css`, `layout.css`, `components.css`.
3.  **Rename `mobile.css` to `responsive.css`**.
4.  **Refactor `style.css`:**
    - Move all root variables (`:root`), resets, and base typography to `base.css`.
    - Move layout-specific styles to `layout.css`.
    - Move component-specific styles (buttons, sliders) to `components.css`.
    - Move media queries to `responsive.css`.
    - Update `style.css` to use `@import` to include the new files in the correct order (`base`, `layout`, `components`, `responsive`).
5.  **Update `index.html`:** Ensure the link to `style.css` remains, as it will now act as the entry point for all other stylesheets.
