# Guide: Creating New Dynamic LaTeX Elements

This guide explains how to add new dynamic LaTeX elements to the SVAR Visualizer project. These elements will automatically update when their underlying data in `window.sharedData` changes, thanks to the `DynamicLatexManager`.

## Prerequisites

1.  **`DynamicLatexManager` is set up**: Ensure `public/js/dynamic_latex_manager.js` exists and is included in `index.html` *before* `main.js` and any section-specific JavaScript files that will register LaTeX elements. It should be loaded *after* `public/js/latex_utils.js` and `public/js/shared_data.js`.
    Example order in `index.html`:
    ```html
    <script src="public/js/shared_data.js" defer></script>
    <script src="public/js/latex_utils.js" defer></script>
    <script src="public/js/dynamic_latex_manager.js" defer></script>
    <!-- ... other scripts ... -->
    <script src="public/js/main.js" defer></script>
    ```

2.  **`LatexUtils` functions**: You need a function in `public/js/latex_utils.js` that can take an element ID, data, and any other necessary arguments to render the desired LaTeX. For example, `window.LatexUtils.displayMatrix(elementId, matrixData, matrixName)`.

## Steps to Add a New Dynamic LaTeX Element

Let's say you want to display a dynamic vector called `myVector` which is stored in `window.sharedData.myVectorData` and you want to display it using a custom label "My Dynamic Vector".

### 1. Add an HTML Placeholder

In your HTML file (e.g., `index.html` or a section-specific HTML like `public/sections/my_section.html`), add an empty `<span>` (or `<div>`) element with a unique ID where the LaTeX should be rendered.

```html
<p>The current value of My Dynamic Vector is: <span id="my_dynamic_vector_display"></span></p>
```

### 2. Ensure a `LatexUtils` Rendering Function Exists

Verify or create a function in `public/js/latex_utils.js` that can render your specific type of LaTeX. This function will be called by the `DynamicLatexManager`.

Example (assuming you want to display it like a matrix/vector):
```javascript
// In public/js/latex_utils.js
window.LatexUtils = window.LatexUtils || {};

window.LatexUtils.displayMyCustomVector = function(elementId, vectorData, label) {
    const el = document.getElementById(elementId);
    if (!el) {
        DebugManager.error('LATEX_UTIL', `Element with ID '${elementId}' not found for custom vector display.`);
        return;
    }
    if (vectorData === undefined || vectorData === null) {
        el.innerHTML = `$$${label}: \text{N/A}$$`;
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([el]);
        }
        return;
    }
    // Example: Convert vectorData to a LaTeX string
    const latexString = `${label}: \begin{bmatrix} ${vectorData.join('\\')} \end{bmatrix}`;
    el.innerHTML = `$$${latexString}$$`;
    if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise([el]);
    }
};
```
Make sure the function is attached to `window.LatexUtils`.

### 3. Register the Element with `DynamicLatexManager`

In the JavaScript file responsible for the section where your HTML element exists (e.g., `public/js/sections/my_section.js` during its initialization, or `main.js` if it's a global element), register your element with the `DynamicLatexManager`.

```javascript
// In your relevant .js file (e.g., during section initialization)
if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
    window.DynamicLatexManager.registerDynamicLatex(
        'my_dynamic_vector_display',  // 1. The unique ID of your HTML element
        'myVectorData',               // 2. The key in `window.sharedData` where the data resides
        'displayMyCustomVector',      // 3. The key of the rendering function in `window.LatexUtils`
        ['My Dynamic Vector']         // 4. (Optional) An array of fixed arguments to pass to the util function *after* elementId and data
    );
} else {
    DebugManager.error('MY_SECTION_INIT', 'DynamicLatexManager.registerDynamicLatex not available.');
}
```

**Explanation of `registerDynamicLatex` arguments:**
1.  `elementId` (string): The `id` of the HTML `<span>` or `<div>`.
2.  `dataType` (string): The property name within `window.sharedData` that holds the data for this LaTeX element (e.g., if your data is `window.sharedData.myVectorData`, then `dataType` is `'myVectorData'`).
3.  `utilKey` (string): The name of the function within `window.LatexUtils` that will be used to render the LaTeX (e.g., `'displayMyCustomVector'`).
4.  `fixedArgs` (array, optional): An array of any additional, fixed arguments that your `LatexUtils` function requires, *after* the `elementId` and the dynamic `dataValue`. In our example, `['My Dynamic Vector']` is passed as the `label` argument to `displayMyCustomVector`.

### 4. How Updates Work

-   **Initial Render**: When `registerDynamicLatex` is called, it performs an initial render of the LaTeX element using the current data from `window.sharedData`.
-   **Dynamic Updates**: The `DynamicLatexManager` has a function `updateAllDynamicLatex()`. This function is called by `main.js` (specifically within `updateDynamicLatexOutputs()`) typically after any operation that might change global data in `window.sharedData` (e.g., after `regenerateSvarData()` or `regenerateBPhi()`).
-   When `updateAllDynamicLatex()` is called, it iterates through all registered elements. **For each element, it first checks if its underlying data in `window.sharedData` has actually changed since the last update. If the data is unchanged, the manager intelligently skips re-rendering that specific element to improve performance.** If the data has changed, the element is re-rendered using its respective `LatexUtils` function and the latest data.

You generally **do not need to manually call update functions** for individual LaTeX elements once they are registered. The central `updateAllDynamicLatex()` in `main.js` handles this.

## Example Recap

1.  **HTML (`my_section.html` or `index.html`):**
    `<span id="my_dynamic_vector_display"></span>`
2.  **JS (`latex_utils.js`):**
    `window.LatexUtils.displayMyCustomVector = function(elementId, data, label) { /* ... */ };`
3.  **JS (e.g., `my_section.js`):**
    `DynamicLatexManager.registerDynamicLatex('my_dynamic_vector_display', 'myVectorData', 'displayMyCustomVector', ['My Dynamic Vector']);`
4.  **Data (`shared_data.js` or updated dynamically):
    `window.sharedData.myVectorData = [1, 2, 3];`

Now, whenever `window.sharedData.myVectorData` changes and `updateDynamicLatexOutputs()` (in `main.js`) is subsequently called, your `my_dynamic_vector_display` span will automatically update.

## Troubleshooting

-   **LaTeX Not Appearing/Updating?**
    -   Check browser console for errors from `DYNAMIC_LATEX_MANAGER` or `LATEX_UTIL`.
    -   Verify the element ID in HTML matches the one used in `registerDynamicLatex`.
    -   Ensure the `dataType` key correctly points to your data in `window.sharedData`.
    -   Confirm the `utilKey` matches an existing function in `window.LatexUtils`.
    -   Make sure `dynamic_latex_manager.js` is loaded correctly and before scripts that use it.
    -   Ensure `MathJax.typesetPromise()` is called within your `LatexUtils` function if you're adding new LaTeX content dynamically.
-   **`DynamicLatexManager.registerDynamicLatex not available` error?**
    -   `dynamic_latex_manager.js` is likely not loaded or loaded too late in `index.html`.

This system provides a centralized and maintainable way to handle dynamic LaTeX across the application.
