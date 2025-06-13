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

## 5. Data Visualizations (Charts)

Consistent styling for Plotly charts is crucial for a cohesive user experience. The following guidelines are based on the styles implemented in `svar_setup.js` and `estimation_restrictions.js`.

### General Principles

- **Clarity and Readability**: Ensure titles, axis labels, and data points are clear and easy to understand.
- **Consistent Sizing**: Aim for square aspect ratios for scatter plots where appropriate. Use helper functions (e.g., `getSquareSize` in the JavaScript files) that derive dimensions from the container's `offsetWidth` to ensure responsiveness and consistency.
- **Color Usage**: Utilize the defined color palette. Primary data series should use `--color-primary` (`#00ADB5`), and secondary series or accents can use `--color-accent` (`#ff7f0e`). Text elements within charts (titles, labels) should use `--color-text` (`#222831`).

### Default Styles for Scatter Plots

These defaults should be adapted as needed for specific chart types or data representations.

**Marker Style (Example for a primary data series):**
```javascript
marker: {
    size: 6,                            // Standard marker size
    color: '#00ADB5',                   // --color-primary (Teal)
    opacity: 0.7,
    line: { width: 1, color: '#222831' } // --color-text (Dark border for contrast)
}
```

**Layout Configuration (Example):**
```javascript
layout: {
    title: {
        text: 'Chart Title Text',
        font: { size: 18, color: '#222831' } // --color-text
    },
    xaxis: {
        title: { text: 'X-Axis Label', font: { size: 14, color: '#222831' } }, // --color-text
        zeroline: true,
        zerolinecolor: '#DDDDDD',            // Light gray for zero line
        gridcolor: '#EEEEEE'                 // Lighter gray for grid lines
    },
    yaxis: {
        title: { text: 'Y-Axis Label', font: { size: 14, color: '#222831' } }, // --color-text
        zeroline: true,
        zerolinecolor: '#DDDDDD',
        gridcolor: '#EEEEEE',
        scaleanchor: "x",                    // Anchors y-axis scaling to x-axis
        scaleratio: 1                      // Ensures a 1:1 aspect ratio (square plot)
    },
    // width: dynamically_calculated_size,  // e.g., from getSquareSize(plotDivElement)
    // height: dynamically_calculated_size, // e.g., from getSquareSize(plotDivElement)
    margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 }, // Standard margins
    paper_bgcolor: '#f8f9fa',             // Light neutral background for the entire chart area
    plot_bgcolor: '#ffffff',              // --color-white for the plot area itself
    hoverinfo: 'x+y',                     // Default hover information
    // Example hovertemplate for precise formatting:
    // hovertemplate: 'Value X: %{x:.3f}<br>Value Y: %{y:.3f}<extra></extra>'
}
```

**Responsiveness:**
- Plotly charts should be configured with `{responsive: true}`.
- Dynamic sizing (as mentioned with `getSquareSize`) is preferred.

## 6. Windsurf Rules (Project Conventions)

1.  **Always use CSS variables** for colors. Do not hard-code hex values in the CSS.
2.  All new UI components must be styled according to the rules in this guide.
3.  Data visualizations (plots) should adhere to the guidelines in section '5. Data Visualizations (Charts)' and prioritize the use of `--color-primary` and `--color-accent` to represent different data series.
4.  Maintain the modular structure: section-specific logic and content remain in their respective files.

## 7. Responsive Design

The website is designed to be fully responsive. Specific styles for smaller screens are handled in `public/css/mobile.css` and applied using media queries.

-   **Breakpoint 1 (Tablet & Large Phones)**: `max-width: 768px`
    -   Navigation stacks vertically.
    -   Font sizes and padding are reduced.
-   **Breakpoint 2 (Small Phones)**: `max-width: 480px`
    -   Further reduction in heading font sizes.

---

## 9. Hero & Loading Screen Creative Style (Implemented June 2025)

The enhanced visual style of the hero and loading pages, implemented in June 2025, revolves around these core principles:

### 9.1. Core Stylistic Elements

1.  **Typography & Hierarchy:**
    *   **Kicker Text:** A small, often uppercase, introductory line above main titles (e.g., "SVAR VISUALIZATION").
    *   **Split Headlines/Titles:** Main titles are broken into two distinct parts, with one part emphasized using an accent color (e.g., "Unveiling Patterns, **Illuminating Insights.**"). This creates strong visual interest and guides the eye.
    *   **Font Weights:** Clear differentiation in font weights to establish hierarchy.
    *   **Animations:** Subtle fade-in and fade-in-up animations on text elements for a polished entrance.

2.  **Background & Depth:**
    *   **Base Gradient:** A soft, full-area linear gradient provides a subtle, modern base (e.g., `var(--color-hero-bg-start)` to `var(--color-hero-bg-end)`).
    *   **Abstract Blurred Shape:** A large, centrally-placed radial gradient, blurred and semi-transparent, layered behind the content. This adds a sense of depth and a contemporary, abstract visual element. It also features a gentle fade-in animation.
    *   **Particle Animation (Hero/Loading Only):** A dynamic layer of slowly drifting particles creates subtle movement and visual texture. This specific element is intentionally limited to the hero and loading screens to maintain focus on content elsewhere.

3.  **Color Palette:**
    *   **Primary Backgrounds:** Light, often desaturated, and clean.
    *   **Primary Text:** Dark and highly legible.
    *   **Accent Color:** A vibrant color (currently `var(--color-accent)`, a teal/cyan) used strategically for emphasis in titles and potentially interactive elements.

4.  **Layout & Polish:**
    *   **Generous Spacing:** Ample padding and margins.
    *   **Smooth Transitions:** CSS transitions for opacity and visibility ensure smooth appearance and disappearance of elements.

### 9.2. Extending the Creative Style to General Page Elements

To create a cohesive visual experience, elements from the hero and loading screen style can be thoughtfully applied to the rest of the page:

1.  **Section Titles (within Content Cards):**
    *   **Current:** Section titles (`h2`) currently use the accent color and a bottom border.
    *   **Proposed:** Adapt the kicker/split-title approach. For example:
        *   Add a small kicker text above the `h2` (e.g., "Analysis Module," "Data Insights").
        *   Split the `h2` text itself, using the accent color for one part.
        *   Remove or soften the bottom border if the new typographic hierarchy is strong enough.

2.  **Content Cards (`.content-section` / `div` with class `card`):
    *   **Current:** White background, border, and box shadow.
    *   **Proposed:** 
        *   Option A (Subtle Depth): Introduce a very faint, scaled-down version of the abstract blurred radial gradient behind the card's content, ensuring it doesn't interfere with readability. This would be significantly more subtle than in the hero.
        *   Option B (Gradient Background): Instead of plain white, use a very subtle linear gradient for the card background, similar to the hero's base but lighter (e.g., from white to a very light tint of `var(--color-background)` or `var(--color-hero-bg-start)`).
        *   Maintain soft box shadows for separation.

3.  **Buttons and Interactive Elements:**
    *   **Current:** Buttons use primary accent color.
    *   **Proposed:** Ensure all interactive elements (sliders, dropdowns, links) consistently use the established accent color for their primary interactive state. Enhance hover/focus states with subtle scale transforms or brighter/darker shades of the accent color for better feedback, moving beyond simple color changes if appropriate.

4.  **Overall Page Background & Cohesion:**
    *   **Current:** Page background is `var(--color-background)` (#EEEEEE).
    *   **Proposed:** Consider if the main page background (`body`) should also adopt a very subtle version of the linear gradient used in the hero's base to tie the whole page together. This would need to be extremely faint to ensure content cards still stand out.

5.  **Animations & Transitions:**
    *   Apply subtle fade-in animations to content sections as they become visible or as data loads, similar to the hero text animations, to enhance the feeling of polish.

These extensions aim to bring the modern, engaging feel of the hero and loading screens to the entire application without overwhelming the user or distracting from the data visualizations. The key is subtlety and consistency.

---

## 8. Previous Design Enhancement Ideas (Archived June 2025)

Based on a review of the UI (screenshots provided June 13, 2025), the following enhancements are proposed to increase visual appeal, creativity, and overall polish.

### 8.1 Hero Section Enhancements

The current hero section is clean but can be made more engaging.

1.  **Background Gradient & Subtle Pattern:**
    *   Introduce a very subtle linear gradient for the hero background. For example, from `var(--color-page-background)` at the top to a slightly lighter or subtly tinted version at the bottom (e.g., a very light shade of `var(--color-primary-accent)` mixed with white).
    *   Consider overlaying a very faint, abstract geometric pattern (e.g., subtle diagonal lines, a soft grid, or faint data-like particles) to add texture without being distracting. This could be an SVG background image.
2.  **Typography & Emphasis:**
    *   **Headline (`h1`):**
        *   Increase font size slightly (e.g., from `2.5rem` to `2.8rem` or `3rem`).
        *   Use a heavier font-weight if available (e.g., `700` or `800` if the font supports it, currently `700`).
        *   Consider a text shadow for a slight lift: `text-shadow: 1px 1px 3px rgba(0,0,0,0.1);`
        *   Emphasize key words like "Unveiling Patterns" and "Illuminating Insights" perhaps with a slightly different color (e.g., a darker shade of `var(--color-primary-text)`) or by wrapping them in `<span>` tags for specific styling if needed (though CSS pseudo-elements might also work for subtle effects).
    *   **Subtitle (`p`):**
        *   Ensure sufficient contrast and readability. Current `1.125rem` is good.
        *   Slightly increase `line-height` if text feels cramped (e.g., to `1.8`).
3.  **Visual Motif (Optional):**
    *   Introduce a small, abstract SVG icon related to data or insights (e.g., a stylized growing line graph, interconnected nodes, or a magnifying glass over data points).
    *   This could be positioned to the left of the text block or subtly in the background.
4.  **Spacing & Layout:**
    *   Increase top and bottom padding for a more spacious feel (e.g., `padding: var(--spacing-xl) var(--spacing-md);` to `padding: calc(var(--spacing-xl) * 1.5) var(--spacing-md);`).

### 8.2 Content Section (`.content-section`) Refinements

The content cards are functional but could be visually softer and more integrated.

1.  **Softer Shadows & Borders:**
    *   The current `box-shadow: var(--card-box-shadow);` and `border: 1px solid var(--color-border);` are good.
    *   Ensure the shadow is soft and diffused. The current `0 2px 10px rgba(0,0,0,0.1)` is appropriate for a light theme.
    *   The border color `var(--color-border)` (`#D0D0D0`) is also good.
2.  **Section Header (`h2`) Styling:**
    *   The current teal accent color for `h2` is good for drawing attention.
    *   Consider reducing the thickness or opacity of the `border-bottom` for a lighter touch, or changing it to a dotted/dashed line.
3.  **Internal Spacing:**
    *   Ensure consistent padding within each section. `padding: var(--spacing-lg);` seems appropriate.

### 8.3 Plot Area (`.plot-area`) Integration

1.  **Background & Border:**
    *   The current `background-color: var(--color-card-background);` and `border: 1px dashed var(--color-border);` are okay.
    *   To make it more "creative" or integrated, the dashed border could be made finer or changed to a solid, very light border.
    *   Alternatively, remove the explicit background and border for the `.plot-area` itself if the plots within have their own distinct backgrounds (`paper_bgcolor`, `plot_bgcolor`), allowing them to sit more directly on the card background. This depends on how Plotly is configured.
2.  **Placeholder Text/Icon:**
    *   If a plot area can be empty before data is loaded, consider a more engaging placeholder than just text – perhaps a faint icon representing a chart type.

### 8.4 Overall Consistency & Polish

1.  **Interactive Element Feedback:**
    *   Ensure all interactive elements (buttons, inputs, future links) have clear `:hover`, `:focus`, and `:active` states consistent with the light theme. The current button styles seem to cover this well.
2.  **Font Rendering:**
    *   Ensure smooth font rendering. `text-rendering: optimizeLegibility;` and `-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;` can be added to the `body` for crisper text on supported browsers.
3.  **Footer Styling:**
    *   The current footer is minimal, which is fine. Ensure its text color (`var(--color-secondary-text)`) has enough contrast against `var(--color-page-background)`. The `opacity: 0.8;` might be slightly too low for some accessibility guidelines; consider `opacity: 1;` and relying on the color itself for subtlety.
