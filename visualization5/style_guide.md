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
