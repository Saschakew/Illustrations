# SVAR Visualizer Style Guide

## 1. Introduction

This style guide outlines the visual design principles for the SVAR Visualizer project. The goal is to create a clean, minimalistic, modern, and professional user interface that prioritizes readability, usability, and mobile-first responsiveness.

## 2. Color Palette

The color palette is designed for a dark theme, offering clarity and reducing eye strain.

*   **Obsidian (`#222831`)**: Primary background color for the entire application.
*   **Gunmetal (`#393E46`)**: Secondary background color for containers like cards, modals, sidebars, and the main navigation menu.
*   **Turquoise (`#00ADB5`)**: Primary accent color. Used for interactive elements (buttons, links, active states, highlights) and calls to action.
*   **Rose Taupe (`#B83B5E`)**: Secondary accent color. Used sparingly for specific highlights, warnings, or destructive actions to draw attention.
*   **Platinum (`#EEEEEE`)**: Primary text color for content on dark backgrounds. Also used for icons.

## 3. Typography

Clear and legible typography is crucial for a good user experience.

*   **Font Families:**
    *   Headings: 'Montserrat', sans-serif (Import from Google Fonts)
    *   Body Text: 'Open Sans', sans-serif (Import from Google Fonts)
*   **Font Weights:**
    *   Headings: Bold (700), Medium (500)
    *   Body: Regular (400), Semibold (600)
*   **Font Sizes (Base: 16px):**
    *   `h1`: 2.5rem (40px)
    *   `h2`: 2rem (32px)
    *   `h3`: 1.75rem (28px)
    *   `h4`: 1.5rem (24px)
    *   `p` (paragraph): 1rem (16px)
    *   Small text: 0.875rem (14px)
*   **Line Height:**
    *   Body text: 1.6
    *   Headings: 1.3
*   **Text Color:**
    *   Primary: `Platinum (#EEEEEE)` on `Obsidian` or `Gunmetal` backgrounds.
    *   Links: `Turquoise (#00ADB5)` for unvisited, `Platinum (#EEEEEE)` for visited (or maintain Turquoise).

## 4. Layout & Spacing

A consistent layout and spacing system improves visual harmony.

*   **Grid System:** Utilize CSS Flexbox and Grid for flexible and responsive layouts.
*   **Spacing Unit:** Base unit of `8px`. Use multiples for margins and paddings (e.g., `8px, 16px, 24px, 32px`).
    *   `xs`: 4px
    *   `sm`: 8px
    *   `md`: 16px
    *   `lg`: 24px
    *   `xl`: 32px
*   **Containers/Cards:**
    *   Background: `Gunmetal (#393E46)`
    *   Text: `Platinum (#EEEEEE)`
    *   Padding: `md` (16px) or `lg` (24px)
    *   Border Radius: `4px` or `8px` for a softer look.
    *   Shadows: Subtle `box-shadow` for depth, e.g., `0 2px 10px rgba(0, 0, 0, 0.2)`.

## 5. Interactive Elements

*   **Buttons:**
    *   Primary:
        *   Background: `Turquoise (#00ADB5)`
        *   Text: `Obsidian (#222831)` or `Platinum (#EEEEEE)` if contrast is better.
        *   Padding: `sm` top/bottom, `md` left/right (e.g., 8px 16px).
        *   Border Radius: `4px`.
        *   Hover/Focus: Slightly darker `Turquoise` or subtle scale/shadow effect.
    *   Secondary/Outline:
        *   Background: Transparent or `Gunmetal (#393E46)`.
        *   Text: `Turquoise (#00ADB5)`.
        *   Border: `1px solid #00ADB5`.
        *   Hover/Focus: Background `Turquoise` (text `Obsidian`), or border/text color intensifies.
*   **Sliders:**
    *   Track: Darker shade of `Gunmetal (#393E46)` or `Obsidian (#222831)`.
    *   Thumb: `Turquoise (#00ADB5)`.
    *   Value Display: `Platinum (#EEEEEE)`.
*   **Switches/Toggles:**
    *   Inactive Background: `Obsidian (#222831)` or darker `Gunmetal`.
    *   Active Background: `Turquoise (#00ADB5)`.
    *   Thumb: `Platinum (#EEEEEE)`.
*   **Input Fields:**
    *   Background: `Obsidian (#222831)` or a slightly darker shade of `Gunmetal (#393E46)`.
    *   Text: `Platinum (#EEEEEE)`.
    *   Border: `1px solid #393E46` (or a slightly lighter shade for visibility).
    *   Focus State: Border color `Turquoise (#00ADB5)`.
    *   Padding: `sm` (8px).
    *   Border Radius: `4px`.

## 6. Navigation Menu (Top Sticky Bar)

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
