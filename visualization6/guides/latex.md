# Handling Dynamic LaTeX in SVAR Visualizer

This guide outlines the standardized approach for rendering and dynamically updating LaTeX content within the SVAR Visualizer application, leveraging MathJax.

## Core Principles

1.  **Centralized Utilities**: A dedicated utility file, `public/js/latex_utils.js`, will house functions for formatting data into LaTeX strings and updating HTML elements.
2.  **MathJax Integration**: All LaTeX rendering relies on MathJax. After updating an element's content with a LaTeX string, `MathJax.typesetPromise()` must be called to re-render the math.
3.  **Unique Element IDs**: HTML elements designated to display LaTeX must have unique IDs.
4.  **Reactive Updates**: When underlying data for a LaTeX display changes, a mechanism must trigger the re-rendering of that specific LaTeX element.

## `public/js/latex_utils.js`

This file will expose a `window.LatexUtils` object with helper functions.

### 1. `formatMatrixToLatex(matrix, matrixName, precision = 3)`

Converts a 2D array (matrix) into a LaTeX string.

*   **Parameters**:
    *   `matrix` (Array<Array<number>>): The matrix data.
    *   `matrixName` (string): The name of the matrix to be displayed (e.g., "B(\\phi)", "\\Sigma_u").
    *   `precision` (number, optional): Number of decimal places for matrix elements. Defaults to 3.
*   **Returns**: (string) A LaTeX string, e.g., `\\( B(\\phi) = \\begin{bmatrix} 1.000 & 0.500 \\\\ 0.250 & 0.800 \\end{bmatrix} \\)`.

### 2. `updateLatexDisplay(elementId, latexString)`

Updates the content of an HTML element with a LaTeX string and triggers MathJax rendering.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element to update.
    *   `latexString` (string): The LaTeX string to display.

### 3. `displayBPhiMatrix(elementId)`

A specific helper to get `sharedData.B_phi`, format it using `formatMatrixToLatex`, and display it using `updateLatexDisplay`.

*   **Parameters**:
    *   `elementId` (string): The ID of the HTML element where `B(\phi)` should be displayed.

**Example Implementation Snippet (`latex_utils.js`):**
```javascript
window.LatexUtils = {
    formatMatrixToLatex: function(matrix, matrixName, precision = 3) {
        // ... implementation ...
    },
    updateLatexDisplay: function(elementId, latexString) {
        // ... implementation ...
    },
    displayBPhiMatrix: function(elementId) {
        // ... implementation using sharedData.B_phi ...
    }
    // ... other formatting functions can be added here
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
