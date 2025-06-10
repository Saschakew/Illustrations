# SVAR Intuition Visualizer

This project is a single-page website designed to provide interactive visualizations for core concepts in Structural Vector Autoregression (SVAR) analysis, based on a research paper.

## Project Structure

The project is organized to keep content, styling, and logic separate for better maintainability.

- `server.js`: A simple Node.js/Express server to serve the static files.
- `package.json`: Defines project metadata and dependencies.
- `public/`: The root directory for all front-end assets.
  - `index.html`: The main HTML shell for the single-page application.
  - `css/`: Contains stylesheets.
    - `style.css`: The main stylesheet for the application.
  - `js/`: Contains JavaScript files.
    - `main.js`: The main script that loads section content and handles global logic.
    - `svar_setup.js`: Logic for the 'SVAR Setup' section.
    - `estimation_restrictions.js`: Logic for the 'Estimation with Restrictions' section.
    - `estimation_nongaussianity.js`: Logic for the 'Estimation with Non-Gaussianity' section.
    - `ridge_estimation.js`: Logic for the 'Ridge Estimation' section.
  - `sections/`: Contains HTML partials for each section of the page.
    - `svar_setup.html`
    - `estimation_restrictions.html`
    - `estimation_nongaussianity.html`
    - `ridge_estimation.html`
- `README.md`: This file.

## How to Run

1.  Install dependencies:
    ```bash
    npm install
    ```
2.  Start the server:
    ```bash
    npm start
    ```
3.  Open your browser and navigate to `http://localhost:3000`.

## HTML Structure and Section Loading

The SVAR Visualizer is a modular, single-page web application. The structure is as follows:

- **index.html**: Contains the main HTML shell, including the header, navigation bar, and placeholders for each section. The main content area is divided into `<section>` elements (e.g., `#svar-setup`, `#estimation-restrictions`, etc.), which are dynamically populated.

- **Section Partials**: Each section's content is stored in a separate HTML file under `public/sections/` (e.g., `svar_setup.html`). These are loaded into the corresponding section placeholder in `index.html` via JavaScript.

- **JavaScript Structure**:
  - `main.js` handles global logic, navigation, and dynamic loading of section partials.
  - Each section has its own JS file (e.g., `svar_setup.js`) for section-specific logic. These scripts should be included in `index.html` after the section partials are loaded, or imported dynamically as needed.
  - All scripts should be placed at the end of the `<body>` in `index.html` to ensure the DOM is loaded before scripts execute.

**Best Practice:**
- Keep global logic in `main.js` and section-specific logic in their respective JS files.
- Do not duplicate logic between sections. Use modular functions and shared utilities where possible.
- Always keep the HTML, CSS, and JS for each section separated for maintainability.

## Contribution Guidelines

To maintain a clean and organized codebase, please adhere to the following structure:

- **Content**: All HTML content for a specific section should go into its corresponding file in the `public/sections/` directory.
- **Styling**: General styles go into `public/css/style.css`. If a section requires very specific, complex styles, consider creating a separate CSS file and linking it within that section's HTML partial.
- **Logic**: All JavaScript logic for a specific section must be in its corresponding file in the `public/js/` directory. This script should be included at the end of the section's HTML partial. Global logic that affects the entire page should be in `public/js/main.js`.
- **Dependencies**: Any new front-end libraries should be added to a `lib` folder or managed via a package manager and linked appropriately. Any new Node.js dependencies should be added to `package.json`.

## Sticky Menu Implementation

The project includes a responsive sticky menu implementation that can be reused across different sections. This implementation provides an intuitive user experience by making controls accessible while scrolling through content.

### Key Features

- **Viewport-Based Stickiness**: The menu sticks only when it reaches the top of the viewport, not at a fixed scroll position.
- **Section-Aware Behavior**: The menu unsticks when scrolling past the end of its containing section or when scrolling back up to the top of the section.
- **Consistent Width**: The menu maintains its natural width when sticky, preventing layout shifts or width changes during scrolling.
- **Responsive Design**: Works across all screen sizes and adapts to orientation changes.
- **Placeholder Element**: Uses a placeholder to prevent content jumps when the menu becomes sticky.

### Implementation Logic

The sticky menu implementation follows these key principles:

1. **Initialization**:
   - Measure the natural width of the menu in its normal flow state
   - Create a placeholder element with the same height as the menu
   - Store the initial offset position of the menu

2. **Scroll Handling**:
   - **Case 1**: When at the top of the section or above it → Normal flow (not sticky)
   - **Case 2**: When scrolled past the section bottom → Normal flow (not sticky)
   - **Case 3**: When within the section and controls at top of viewport → Fixed position sticky
   - **Case 4**: Default case → Normal flow

3. **Responsive Behavior**:
   - Recalculate measurements on window resize (debounced)
   - Allow controls to wrap on smaller screens using CSS media queries
   - Center the sticky menu horizontally using transform

### Example Implementation

To implement a sticky menu in another section:

1. Add a placeholder element after your controls container:
   ```html
   <div id="your-controls-container">
     <!-- Your controls here -->
   </div>
   <div id="your-controls-placeholder"></div>
   ```

2. Set up the necessary CSS:
   ```css
   #your-controls-container {
     /* Base styles */
   }
   #your-controls-container.sticky {
     position: fixed;
     z-index: 100;
   }
   #your-controls-placeholder {
     display: none;
     height: 0;
   }
   #your-controls-placeholder.active {
     display: block;
   }
   ```

3. Initialize the sticky behavior in your section's JavaScript file:
   ```javascript
   function setupStickyControls() {
     const controlsContainer = document.getElementById('your-controls-container');
     const controlsPlaceholder = document.getElementById('your-controls-placeholder');
     let controlsNaturalWidth = 0;
     let initialControlsOffsetTop = 0;
     
     // Initialize positions and measurements
     setupInitialPositions();
     
     // Add scroll and resize event listeners
     window.addEventListener('scroll', handleStickyScroll);
     window.addEventListener('resize', debounce(handleResize, 250));
     
     // Implementation functions...
   }
   ```

See `svar_setup.js` for a complete working implementation that can be adapted for other sections.
