# Handling Dynamic LaTeX in SVAR Visualizer

This guide outlines the standardized approach for rendering and dynamically updating LaTeX content within the SVAR Visualizer application. The system leverages MathJax for rendering and a central `DynamicLatexManager` for managing updates.

**For step-by-step instructions on adding a new dynamic LaTeX element, please refer to the detailed guide: [`./create_dynamic_latex.md`](./create_dynamic_latex.md).**

## Core System Components

1.  **`public/js/dynamic_latex_manager.js` (DynamicLatexManager)**:
    *   This is the central coordinator for all dynamic LaTeX elements.
    *   It provides `registerDynamicLatex(elementId, dataType, utilKey, fixedArgs)` to register an HTML element for dynamic updates.
    *   It exposes `updateAllDynamicLatex()` which is called by `main.js` (within `updateDynamicLatexOutputs`) whenever global data that might affect LaTeX displays changes.
    *   The manager iterates through all registered elements and uses the appropriate `LatexUtils` function to re-render them with the latest data from `window.sharedData`.

2.  **`public/js/latex_utils.js` (LatexUtils)**:
    *   This utility file contains functions responsible for the actual LaTeX string generation and rendering via MathJax.
    *   Examples include `displayMatrix(elementId, matrixData, matrixName)`, `displayVector(elementId, vectorData, vectorName)`, etc.
    *   These functions take an element ID, the data to display, and any other necessary parameters, then update the element's content and call `MathJax.typesetPromise()` on that specific element.
    *   `DynamicLatexManager` calls functions from `LatexUtils` based on the registration details of each dynamic element.

3.  **`public/js/shared_data.js`**: 
    *   Holds the global data (e.g., `window.sharedData.B0`, `window.sharedData.phi_est_nG`) that dynamic LaTeX elements display.
    *   When this data changes, `DynamicLatexManager` ensures the corresponding LaTeX displays are updated.

4.  **`public/js/main.js`**: 
    *   The `updateDynamicLatexOutputs()` function in `main.js` is responsible for triggering a global update of all registered dynamic LaTeX elements by calling `window.DynamicLatexManager.updateAllDynamicLatex()`.
    *   This typically happens after operations that modify data in `window.sharedData`.

5.  **HTML Placeholders**:
    *   Simple `<span>` or `<div>` elements with unique IDs are used in HTML files (e.g., `index.html` or section-specific HTML) to designate where LaTeX should be rendered.
    *   Example: `<span id="b0_matrix_display"></span>`

## How Dynamic Updates Work

1.  **Registration**: During initialization (e.g., in a section's JavaScript file like `section_two.js`), dynamic LaTeX elements are registered with the `DynamicLatexManager` using `registerDynamicLatex()`. This registration includes the element's ID, the `sharedData` key for its data, the `LatexUtils` function to use for rendering, and any fixed arguments for that function.
2.  **Initial Render**: Upon registration, `DynamicLatexManager` performs an initial render of the element.
3.  **Data Change**: An event in the application (e.g., user input, new calculation) modifies data in `window.sharedData`.
4.  **Update Trigger**: The application logic (usually in `main.js`) calls `updateDynamicLatexOutputs()`.
5.  **Manager Updates All**: `updateDynamicLatexOutputs()` calls `window.DynamicLatexManager.updateAllDynamicLatex()`.
6.  **Targeted Re-rendering**: The `DynamicLatexManager` iterates through all its registered elements. For each element, it retrieves the current data from `window.sharedData` and calls the specified `LatexUtils` function to re-render the LaTeX in the designated HTML placeholder.

This centralized approach simplifies adding new dynamic LaTeX elements and ensures consistent update behavior.

## MathJax Configuration and Best Practices

The following details about our MathJax setup remain crucial for performance and correct rendering:

*   **MathJax Version**: We use MathJax v3.2.2 (or latest stable v3.x) loaded via CDN in `index.html`:
    ```html
    <script src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js" id="MathJax-script"></script>
    ```
*   **Configuration** (typically set before MathJax script tag in `index.html` or in a dedicated config block):
    ```javascript
    window.MathJax = {
      tex: {
        inlineMath: [['\\(', '\\)']], // Standard delimiters for inline math
        displayMath: [['$$', '$$']], // Standard delimiters for display math
        tags: 'none' // Disable automatic equation numbering if not needed
      },
      options: {
        skipHtmlTags: ['script', 'style', 'textarea', 'pre'] // Faster parsing
      },
      startup: {
        ready: () => {
          MathJax.startup.defaultReady();
          // Custom ready logic if needed
        }
      }
    };
    ```
*   **Loading Strategy**: 
    *   The MathJax script tag in `index.html` should ideally have `async` to avoid render-blocking.
    *   Ensure `dynamic_latex_manager.js` and `latex_utils.js` are loaded *before* scripts that use them, and `shared_data.js` before those.
*   **Scoped Updates**: `LatexUtils` functions should always use scoped MathJax updates for performance:
    ```javascript
    // Inside a LatexUtils function, after setting element.innerHTML or element.textContent
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([element]);
    }
    ```
*   **Performance Tips (General):**
    *   Keep LaTeX strings as simple as possible.
    *   Avoid unnecessary re-renders by having `DynamicLatexManager` (or `LatexUtils` if a check is implemented there) compare old vs. new data/LaTeX strings before calling `typesetPromise` (current `DynamicLatexManager` re-renders on each call to `updateAllDynamicLatex`).
    *   Ensure heavy JavaScript computations complete *before* triggering LaTeX updates.

## `public/js/latex_utils.js` Overview

This file provides the core rendering functions called by `DynamicLatexManager`. Key functions include:

*   `formatMatrixToLatex(matrix, matrixName, precision = 3)`: Converts a 2D array into a LaTeX matrix string.
*   `displayMatrix(elementId, matrix, matrixName, precision = 3)`: Renders a matrix in the specified element.
*   Other specific display functions (e.g., `displayVector`, `displayScalar`).

These functions are responsible for:
1.  Fetching the HTML element by `elementId`.
2.  Formatting the input data into a valid LaTeX string.
3.  Setting the `innerHTML` or `textContent` of the element.
4.  Calling `MathJax.typesetPromise([element])` to make MathJax render the new LaTeX.

Refer to `public/js/latex_utils.js` for the exact implementation details of these rendering functions.

## Debugging

Utilize the `DebugManager` with categories like `DYNAMIC_LATEX_MANAGER` and `LATEX_UTIL` to trace registration and update processes. Check the browser console for any errors related to MathJax or these modules.

### 2. `updateLatexDisplay(elementId, latexString)`

Updates the content of an HTML element with a LaTeX string and triggers MathJax rendering.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element to update.
    *   `latexString` (string): The LaTeX string to display.

### 3. `displayBPhiMatrix(elementId)`

A specific helper to get `sharedData.B_phi`, format it using `formatMatrixToLatex`, and display it using `updateLatexDisplay`.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element where `B(\phi)` should be displayed.

### 4. `formatPhiToLatex(phiValue, phiName, precision = 3)`

Converts a scalar number (phi value) into a LaTeX string.

*   **Parameters**:
    *   `phiValue` (number): The scalar value.
    *   `phiName` (string): The name of the phi value (e.g., "\\hat{\\phi}_{rec}").
    *   `precision` (number, optional): Number of decimal places. Defaults to 3.
*   **Returns**: (string) A LaTeX string, e.g., `\( \hat{\phi}_{rec} = 0.123 \)`.

### 5. `displayPhiEst(elementId, phiValue, phiName, precision = 3)`

A helper to display an estimated \(\phi\) value. It uses `formatPhiToLatex` and `updateLatexDisplay`.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element.
    *   `phiValue` (number): The estimated phi value (e.g., `sharedData.phi_est_rec`).
    *   `phiName` (string): The LaTeX name for the phi (e.g., "\\hat{\\phi}_{rec}").
    *   `precision` (number, optional): Defaults to 3.

### 6. `displayBEstMatrix(elementId, matrix, matrixName, precision = 3)`

A helper to display an estimated \(B\) matrix (e.g., `sharedData.B_est_rec`). It uses `formatMatrixToLatex` and `updateLatexDisplay`.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element.
    *   `matrix` (Array<Array<number>>): The estimated B matrix data.
    *   `matrixName` (string): The LaTeX name for the matrix (e.g., "\\hat{B}_{rec}").
    *   `precision` (number, optional): Defaults to 3.

### 7. `formatVToLatex(vValue, vName = 'v', precision = 3)`

Converts a scalar number (e.g., v-weight) into a LaTeX string.

*   **Parameters**:
    *   `vValue` (number): The scalar value.
    *   `vName` (string): The name of the value (e.g., "v").
    *   `precision` (number, optional): Number of decimal places. Defaults to 3.
*   **Returns**: (string) A LaTeX string, e.g., `\( v = 0.500 \)`.

### 8. `displayVWeight(elementId, vValue, vName = 'v', precision = 3)`

A helper to display a scalar value, typically a weight like `v_weight`. It uses `formatVToLatex` and `updateLatexDisplay`. Shows "Calculating..." if `vValue` is null or undefined.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element.
    *   `vValue` (number | null | undefined): The value to display.
    *   `vName` (string): The LaTeX name for the value.
    *   `precision` (number, optional): Defaults to 3.

**Example Implementation Snippet (`latex_utils.js`):**
```javascript
window.LatexUtils = {
    formatMatrixToLatex: function(matrix, matrixName, precision = 3) { /* ... */ },
    updateLatexDisplay: function(elementId, latexString) { /* ... */ },
    displayBPhiMatrix: function(elementId) { /* ... */ },
    formatPhiToLatex: function(phiValue, phiName, precision = 3) { /* ... */ },
    displayPhiEst: function(elementId, phiValue, phiName, precision = 3) { /* ... */ },
    displayBEstMatrix: function(elementId, matrix, matrixName, precision = 3) { /* ... */ },
    formatVToLatex: function(vValue, vName = 'v', precision = 3) { /* ... */ },
    displayVWeight: function(elementId, vValue, vName = 'v', precision = 3) { /* ... */ }
    // Other internal helpers might exist but these are the primary display functions.
};
```

## Integration Steps

### 1. Include `latex_utils.js`
Add the script tag to `index.html` after `shared_data.js` and before other scripts that might use it (like section-specific JS or `main.js` if it calls these utils directly during init):
```html
<script src="public/js/shared_data.js" defer></script>
<script src="public/js/latex_utils.js" defer></script>
<!-- other scripts -->
<script src="public/js/main.js" defer></script>
```

### 2. Add Placeholder Elements in HTML
In your section HTML files (e.g., `public/sections/section_two.html`), add a placeholder. Make sure the `<span>` has a unique ID:
```html
<p>The current identification matrix \\(B(\\phi)\\) is: <span id="b_phi_matrix_s2_display"></span></p>
```

### 3. Initial Rendering
In the corresponding section's JavaScript file (e.g., `public/js/sections/section_two.js`), within its initialization function (e.g., `initializeSectionTwo()`):
```javascript
if (window.LatexUtils && typeof window.LatexUtils.displayBPhiMatrix === 'function') {
    window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s2_display');
} else {
    DebugManager.log('SECTION_TWO', 'LatexUtils.displayBPhiMatrix not available for initial display.');
}
```

### 4. Dynamic Updates

When data underlying a LaTeX display changes (e.g., `sharedData.B_phi`), the display needs to be updated. A centralized function in `main.js` is recommended.

**Centralized Update Function (e.g., `updateDynamicLatexOutputs()` in `main.js`):**
```javascript
async function updateDynamicLatexOutputs() {
    DebugManager.log('LATEX_UPDATE', 'Attempting to update dynamic LaTeX outputs.');

    const idsToUpdate = ['b_phi_matrix_s2_display', 'b_phi_matrix_s3_display', 'b_phi_matrix_s4_display'];
    if (window.LatexUtils && typeof window.LatexUtils.displayBPhiMatrix === 'function') {
        idsToUpdate.forEach(id => {
            if (document.getElementById(id)) {
                window.LatexUtils.displayBPhiMatrix(id);
            }
        });
    }
}
```
This `updateDynamicLatexOutputs()` function should be `await`ed after the relevant `sharedData` has been modified. For example, at the end of `regenerateBPhi()` in `main.js` (which might need to become `async`):
```javascript
// In main.js, inside regenerateBPhi()
// ... after sharedData.B_phi is updated ...
await updateDynamicLatexOutputs();
```

### 5. Debugging
Add a category to `DebugManager` for LaTeX updates (e.g., `LATEX_UPDATE`) to help trace issues:
```javascript
// In debug_manager.js
const DEBUG_CATEGORIES = {
    // ... other categories
    LATEX_UPDATE: false, // Set to true for debugging LaTeX updates
};
```

This structure provides a reusable and maintainable way to handle dynamic LaTeX displays in the application.
