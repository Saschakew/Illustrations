# Temporary Guide: Step-by-Step Deletion of a Dynamic LaTeX Element

This guide outlines the process for removing a dynamic LaTeX element and its associated update logic from the SVAR Visualizer project. This is part of a refactoring effort to centralize LaTeX updates.

**Target Element Example ID**: `example_latex_element_id`

## Steps:

1.  **Identify the HTML Placeholder**:
    *   Locate the HTML `<span>` (or other) element in the relevant section's HTML template string (usually found within the section's JavaScript file, e.g., `public/js/sections/section_X.js`).
    *   Example: `<span id="example_latex_element_id"></span>`

2.  **Replace HTML Placeholder with Text**:
    *   In the HTML template string within the section's JavaScript file, replace the entire `<span>` tag with a simple text placeholder.
    *   Format: `PLACEHOLDER_example_latex_element_id`
    *   Example: Change `<p>Value: <span id="example_latex_element_id"></span></p>` to `<p>Value: PLACEHOLDER_example_latex_element_id</p>`.

3.  **Remove Initial Rendering Code from Section JS**:
    *   In the same section-specific JavaScript file (e.g., `public/js/sections/section_X.js`), find the `initializeSectionX()` function (or equivalent initialization logic).
    *   Locate and delete the JavaScript lines that were responsible for the *initial rendering* of the LaTeX content into this element. This typically involves a call to a `window.LatexUtils` function (e.g., `LatexUtils.displayBEstMatrix('example_latex_element_id', ...)`).

4.  **Remove Dynamic Update Code from `main.js`**:
    *   Open `public/js/main.js`.
    *   Find the `updateDynamicLatexOutputs()` function.
    *   Locate and delete the JavaScript lines within this function that were responsible for *dynamically updating* the LaTeX content for `example_latex_element_id`. This will also likely be a call to a `window.LatexUtils` function, often within an `if (document.getElementById('example_latex_element_id')) { ... }` block.

5.  **Update Documentation (if applicable)**:
    *   If the element's handling was specifically documented (e.g., in `guides/latex.md`), update the documentation to reflect its removal or changed status.

6.  **Verify**:
    *   Run the application and navigate to the relevant section.
    *   Confirm that the LaTeX element is no longer rendered and that the text `PLACEHOLDER_example_latex_element_id` is visible instead.
    *   Check the browser console for any errors related to the removed element or its update logic.

By following these steps, you ensure that both the initial rendering and subsequent dynamic updates for the targeted LaTeX element are completely removed from the codebase.
