# Basic Project Structure and HTML Guide (SVAR Visualizer)

## 1. Introduction

This guide provides the foundational principles for structuring the SVAR Visualizer project, designing HTML pages, and implementing a consistent user interface. Adhering to these guidelines will help maintain a clean, organized, and scalable codebase.

This guide should be read in conjunction with `style_guide.md`, `style_guide_plots.md`, and `style_guide_menu.md` for detailed styling and component information.

## 2. Project Directory Structure

A standardized directory structure is crucial for organization. The proposed structure is as follows:

```
visualization5/
├── index.html               # Main entry point of the application
├── README.md                # Project overview and setup instructions
├── public/
│   ├── css/
│   │   ├── style.css        # Main stylesheet (includes CSS variables, layout, components)
│   │   └── mobile.css       # Styles for responsive design (tablets, mobile)
│   ├── js/
│   │   ├── main.js          # Main JavaScript file (loads sections, initializes app)
│   │   ├── shared_data.js   # Central data store (e.g., window.SVARData)
│   │   ├── shared_controls.js # Logic for common UI controls (e.g., window.SVARControls)
│   │   ├── svar_functions.js  # Core SVAR logic, data generation (e.g., window.SVARFunctions)
│   │   ├── general_utils.js # General utility functions (e.g., window.SVARGeneralUtils)
│   │   ├── plot_utils.js    # Plotting utilities, helpers like getSquareSize (e.g., window.SVARPlotUtils)
│   │   ├── sticky_menu.js   # Contains initializeStickyMenu for section control panels
│   │   └── sections/        # Section-specific JavaScript files
│   │       └── section_name.js
│   ├── sections/            # HTML snippets for different content sections
│   │   └── section_name.html
│   └── assets/              # Static assets like images, icons, etc.
│       └── images/
└── guides/                  # Markdown guides for development
    ├── guide_basic.md       # This file
    ├── guide_section.md     # Guide for adding new interactive sections
    ├── code_structure.md    # Detailed JS architecture
    ├── style_guide.md       # General CSS and component style guide
    ├── style_guide_plots.md # Plotly chart specific style guide
    └── style_guide_menu.md  # Guide for section control panel menus
```

## 3. HTML Page Layout

Consistency in HTML structure ensures predictability and easier styling.

### 3.1. Main Page (`index.html`)

*   **Standard HTML5 Boilerplate:** Use `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>`.
*   **`<head>`:**
    *   `<meta charset="UTF-8">`
    *   `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
    *   `<title>SVAR Visualizer</title>`
    *   Links to CSS files (`style.css`, `mobile.css`).
    *   Links to JavaScript files (defer loading where possible, e.g., `<script src="public/js/main.js" defer></script>`).
    *   CDN link for MathJax (if not self-hosted).
*   **`<body>`:**
    *   **Header:** Optional, for a main project title (e.g., `<header><h1>SVAR Interactive Visualizer</h1></header>`).
    *   **Sticky Main Navigation Menu:**
        *   A `<nav id="main-nav">` element, styled to be sticky at the top of the viewport.
        *   Contains an unordered list `<ul>` of links to page sections: `<a href="#section-id">Section Title</a>`.
        *   Styling for stickiness (e.g., `position: sticky; top: 0; z-index: 1000; background-color: var(--color-text);`).
    *   **Main Content Area:**
        *   A `<main id="main-content">` container.
        *   Inside, create placeholder `<div>` elements for each section that will be dynamically loaded by `main.js`. Example: `<div id="svar-setup-placeholder"></div>`, `<div id="estimation-placeholder"></div>`.
    *   **Footer:** Optional (e.g., `<footer><p>&copy; 2024 Your Name/Project</p></footer>`).

### 3.2. Section HTML Snippets (`public/sections/section_name.html`)

Each section is a self-contained HTML snippet, typically loaded into the placeholders in `index.html`.

*   **Outermost Wrapper:** A `<section id="unique-section-id" class="content-section card">`.
    *   The `id` is crucial for navigation links (`#unique-section-id`) and JavaScript targeting.
    *   The `card` class provides base styling (background, shadow) from `style.css`.
*   **Section Title:** `<h2>Section Title</h2>` (consider using `aria-labelledby` on the section pointing to the title ID for accessibility).
*   **Controls Area (for interactive sections):**
    *   Follow the structure detailed in `style_guide_menu.md`:
        *   `<div id="controls-placeholder_unique-suffix" class="controls-placeholder"></div>`
        *   `<div id="controls-container_unique-suffix" class="controls-container card">` (Note: this inner 'card' is for the control panel itself, distinct from the section's main card style).
            *   `<div class="card-body p-3"><div class="controls-row">...control items...</div></div>`
*   **Content Area:**
    *   Explanatory text (`<p>`, `<ul>`, etc.).
    *   Mathematical equations (use MathJax syntax).
    *   Plot containers: `<div id="plot-id_unique-suffix" class="plot-container"></div>`.

## 4. Styling (CSS)

Refer to `public/css/style.css` and `public/css/mobile.css`. Key principles from `style_guide.md` to remember:

*   **CSS Variables:** Use defined variables (e.g., `var(--color-primary)`) for colors, fonts, etc., to maintain consistency.
*   **Color Palette:** Adhere to the project's color scheme.
*   **Typography:** Use 'Lato' font, with specified weights and sizes. Maintain readable line height.
*   **Layout:** Max content width, consistent spacing unit (`1rem`), card-like appearance for sections.
*   **Components:** Style buttons, inputs, and other UI elements according to `style_guide.md`.
*   **Responsive Design:** Ensure layouts adapt gracefully to different screen sizes, with breakpoints defined in `mobile.css`.

## 5. Main Navigation Menu Functionality

*   **Stickiness:** The main navigation bar (`<nav id="main-nav">`) should remain visible at the top of the viewport when scrolling. This can be achieved with CSS: `position: sticky; top: 0;`.
*   **Smooth Scrolling:** Implement smooth scrolling for internal links (e.g., using CSS `scroll-behavior: smooth;` on the `<html>` element or a small JavaScript snippet if more control is needed).
*   **Active Link Highlighting (Optional):** JavaScript can be used to highlight the current section's link in the navigation menu as the user scrolls.

## 6. JavaScript Entry Point (`main.js`)

*   `main.js` is responsible for:
    *   Initializing the application after the DOM is loaded (`DOMContentLoaded`).
    *   Loading HTML content for each section into its respective placeholder in `index.html` (e.g., using `fetch()` and `innerHTML`).
    *   Calling the initialization function for each section's JavaScript module (e.g., `window.SVARSections.initSvarSetup()`).
    *   Initializing any global components or listeners.

By following this basic guide, new development should integrate smoothly into the existing project structure and maintain a consistent look and feel.
