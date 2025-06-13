# SVAR Visualizer Style Guide

## 1. Introduction

This style guide outlines the visual design principles for the SVAR Visualizer project. The goal is to create a clean, modern, and professional user interface that prioritizes readability, usability, and a consistent aesthetic for data visualization.

## 2. Color Palette and Roles (Light Theme)

These colors form the foundation of the light theme, ensuring a bright and clear interface.

*   `--color-background-page: #F8F9FA;` (Very Light Gray) - Main page background, providing a subtle contrast to white elements.
*   `--color-background-card: #FFFFFF;` (White) - Background for content cards, sections, and primary control areas.
*   `--color-text-primary: #212529;` (Almost Black/Very Dark Gray) - Main text color for headings, body copy, and important labels.
*   `--color-text-secondary: #6C757D;` (Medium Gray) - Secondary text, less important labels, placeholders, and descriptive captions.
*   `--color-accent-primary: #17A2B8;` (Teal/Cyan) - Primary interactive elements, highlights, buttons, slider thumbs, and main data points in plots.
*   `--color-accent-primary-darker: #138496;` (Darker Teal) - For hover/active states of primary accent elements.
*   `--color-accent-secondary-plot-loss: #E83E8C;` (Pink/Magenta) - Used for specific plot elements like the loss function curve.
*   `--color-accent-secondary-plot-phi: #28A745;` (Green) - Used for specific plot elements like the estimated phi line (dashed).
*   `--color-border: #DEE2E6;` (Light Gray) - Borders for cards (if pronounced), input fields, and plot axes/gridlines.
*   `--color-text-on-accent: #FFFFFF;` (White) - Text color for elements with `--color-accent-primary` backgrounds (e.g., buttons).
*   `--color-slider-track: #E9ECEF;` (Light Gray) - Background color for slider tracks.
*   `--color-hero-background: linear-gradient(to bottom right, #E0F7FA, #F8F9FA);` (Very Light Cyan to Very Light Gray gradient) - Subtle background for the hero section.

### Usage:

*   **Page Background**: Use `--color-background-page`.
*   **Card/Section Backgrounds**: Use `--color-background-card`.
*   **Primary Text**: Use `--color-text-primary`.
*   **Secondary & Caption Text**: Use `--color-text-secondary`.
*   **Borders**: Use `--color-border` for subtle separation.
*   **Interactive Elements (Buttons, Active Slider Parts)**: Use `--color-accent-primary`. Text on these should be `--color-text-on-accent`.
*   **Plot Specific Accents**: Use `--color-accent-secondary-plot-loss` and `--color-accent-secondary-plot-phi` as defined.

## 3. Typography

Clean and readable typography enhances user experience and data comprehension.

*   **Font Families:**
    *   Headings: 'Montserrat', sans-serif (Import from Google Fonts: `https://fonts.googleapis.com/css2?family=Montserrat:wght@500;700&display=swap`)
    *   Body Text & Labels: 'Open Sans', sans-serif (Import from Google Fonts: `https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600&display=swap`)
*   **Font Weights:**
    *   Headings (e.g., Hero Title, Section Titles): Bold (700 for Montserrat)
    *   Sub-headings/Emphasized Text: Medium (500 for Montserrat) or Semibold (600 for Open Sans)
    *   Body & Regular Labels: Regular (400 for Open Sans)
*   **Font Sizes (Base: 16px for `p`):**
    *   Hero Title (`h1` equivalent): ~2.8rem - 3rem (e.g., 48px), with part of the title using `--color-accent-primary`.
    *   Section Titles (`h2` equivalent): ~1.75rem (e.g., 28px), using `--color-accent-primary`.
    *   Section Super-titles (e.g., "DATA EXPLORATION"): ~0.8rem (e.g., 13px), uppercase, `--color-text-secondary`.
    *   Body Paragraphs (`p`): 1rem (16px).
    *   Control Labels & Slider Values: ~0.875rem (14px).
    *   Plot Titles/Labels: ~0.875rem - 0.9rem.
    *   Footer Text: ~0.8rem (13px).
*   **Line Height:**
    *   Body text: ~1.6
    *   Headings: ~1.3 - 1.4
*   **Text Color:**
    *   Default: `--color-text-primary`.
    *   Secondary/Captions: `--color-text-secondary`.
    *   Links (if any standalone): `--color-accent-primary`.

## 4. Layout & Spacing

Consistent layout and spacing create visual harmony and improve readability.

*   **Overall Layout:** Full-width hero section followed by content sections organized in cards.
*   **Spacing Unit:** Base unit of `8px`. Use multiples for margins and paddings (e.g., `8px, 16px, 24px, 32px`).
    *   `space-xs`: 4px
    *   `space-sm`: 8px
    *   `space-md`: 16px
    *   `space-lg`: 24px
    *   `space-xl`: 32px
    *   `space-xxl`: 48px
*   **Hero Section:**
    *   Background: `--color-hero-background`.
    *   Padding: `space-xl` or `space-xxl` top/bottom.
    *   Text Alignment: Centered.
*   **Content Sections (Cards):**
    *   Background: `--color-background-card`.
    *   Padding: `space-lg` (24px) or `space-xl` (32px).
    *   Border Radius: `8px` (for a modern, softer look).
    *   Shadows: Subtle `box-shadow` for depth, e.g., `0 4px 12px rgba(0, 0, 0, 0.05)`.
    *   Margins: `space-lg` or `space-xl` between cards.
*   **Footer:**
    *   Background: `--color-background-page` or slightly darker if separation is needed.
    *   Padding: `space-md` or `space-lg`.
    *   Text: Centered, `--color-text-secondary`.

## 5. Interactive Elements & Components

*   **Buttons (e.g., "NEW DATA")**
    *   Background: `--color-accent-primary`.
    *   Text: `--color-text-on-accent`.
    *   Padding: `~10px 20px` (adjust for visual balance).
    *   Border Radius: `4px` or `6px`.
    *   Font Weight: Semibold (600 for Open Sans).
    *   Hover/Focus: Background `--color-accent-primary-darker`, subtle scale or shadow.
*   **Sliders:**
    *   Track: `--color-slider-track`.
    *   Thumb: `--color-accent-primary`, circular.
    *   Progress Fill (active part of track): `--color-accent-primary`.
    *   Value Display: `--color-text-primary` or `--color-text-secondary`, positioned near the slider.
    *   Height: Track ~`6-8px`, Thumb ~`16-18px` diameter.
*   **Mode Switch (Segmented Control for "RECURSIVE" / "NON-RECURSIVE")**
    *   Container: Rounded ends, light gray border (`--color-border`).
    *   Segments: Padding `space-sm`.
    *   Inactive Segment Background: `--color-background-page` or very light gray.
    *   Active Segment Background: `--color-text-secondary` or a slightly darker gray than inactive, with `--color-text-on-accent` (if dark) or `--color-text-primary` (if light active background).
    *   Text: `--color-text-primary` or `--color-text-secondary`.
    *   Border Radius: Matches container if segments fill it.
*   **Plots:**
    *   Background: `--color-background-card` (if within a card, or transparent if card provides background).
    *   Axes & Gridlines: `--color-border` or a slightly lighter gray.
    *   Data Points (Scatter): `--color-accent-primary`.
    *   Line Plots (Loss Function): Curve with `--color-accent-secondary-plot-loss`, estimated phi line dashed with `--color-accent-secondary-plot-phi`.
    *   Text (Titles, Labels): `--color-text-primary` or `--color-text-secondary`.
*   **Mathematical Notation (LaTeX):**
    *   Rendered using MathJax.
    *   Color: Inherits from surrounding text, typically `--color-text-primary`.
    *   Ensure sufficient spacing around complex formulas.

## 6. Responsiveness

*   The layout should adapt gracefully to different screen sizes.
*   Employ fluid typography and spacing where appropriate.
*   Consider how plots and complex controls reflow or resize on smaller screens.
*   Test on various devices or use browser developer tools for emulation.

## 7. Accessibility (A11y)

*   Ensure sufficient color contrast between text and background (WCAG AA minimum).
*   Provide ARIA attributes for custom controls (sliders, switches) if native HTML elements are not used or are heavily styled.
*   Ensure keyboard navigability for all interactive elements.
*   Provide alternative text for meaningful images/icons if any are used (not prominent in current design).

This style guide serves as a living document and should be updated as the project evolves.

*   **Background:** `Gunmetal (#393E46)`.
*   **Height:** Consistent height (e.g., 60px or 70px).
*   **Text (Links):** `Platinum (#EEEEEE)`.
*   **Link Hover/Focus:** Text color `Turquoise (#00ADB5)` or a subtle background highlight on the link.
*   **Active Link:** Text color `Turquoise (#00ADB5)` and/or a bottom border in `Turquoise (#00ADB5)`.
*   **Shadow:** Subtle `box-shadow` to distinguish from page content when scrolled, e.g., `0 2px 5px rgba(0,0,0,0.2)`.
*   **Mobile (Hamburger Menu):**
    *   Icon: `Platinum (#EEEEEE)`.
    *   Dropdown/Off-canvas Background: `Gunmetal (#393E46)`.
    *   Links: Same as desktop, stacked vertically.

## 7. Plots & Visualizations

*   **Colors:** Utilize the accent colors (`Turquoise`, `Rose Taupe`) strategically for data series. Ensure good contrast against `Gunmetal` or `Obsidian` backgrounds if plots are within cards.
*   **Axes/Labels/Legends:** `Platinum (#EEEEEE)`.
*   **Gridlines:** A very subtle, darker shade of `Gunmetal (#393E46)` or a highly transparent `Platinum (#EEEEEE)`.

## 8. Mobile Responsiveness

*   **Strategy:** Design mobile-first or ensure all components adapt gracefully to smaller screens.
*   **Breakpoints (Example):**
    *   Small (sm): up to 640px
    *   Medium (md): up to 768px
    *   Large (lg): up to 1024px
    *   Extra Large (xl): 1280px and above
*   **Key Adaptations:**
    *   Navigation: Hamburger menu.
    *   Layouts: Single column for content where appropriate.
    *   Touch Targets: Ensure buttons and interactive elements are large enough.
    *   Font Scaling: Use `rem` units for scalability.

## 9. Icons

*   **Source:** Prefer SVG icons for scalability and style control. Consider libraries like Font Awesome (SVG version), Material Icons, or custom SVGs.
*   **Color:** `Platinum (#EEEEEE)` for general use, `Turquoise (#00ADB5)` for interactive or highlighted icons.

## 10. General Principles

*   **Consistency:** Apply styles consistently across all sections and components.
*   **Simplicity:** Avoid clutter. Every element should serve a purpose.
*   **Accessibility (A11y):** Pay attention to color contrast, keyboard navigation, and semantic HTML.
