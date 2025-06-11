# Style Guide: Creating Interactive & Sticky Control Menus

This guide provides a comprehensive walkthrough for creating new interactive control menus that match the existing style and functionality of this project. It covers the required HTML structure, CSS classes, and the JavaScript logic for making the menu "sticky" during scrolling.

---

## 1. HTML Structure

The foundation of a consistent menu is a standardized HTML structure. Each new interactive section should be self-contained and follow this pattern.

### Key Components:

1.  **Main Section Wrapper**: A `<section>` element with a unique ID. This is crucial for the sticky logic to know the boundaries of its content.
2.  **Controls Placeholder**: A `<div>` with a unique ID (e.g., `controls-placeholder-er`). This empty div prevents the page content from "jumping" when the controls menu switches to a fixed position.
3.  **Controls Container**: The main `<div>` for the menu, with the class `controls-container` and a unique ID.
4.  **Controls Row**: A `<div>` with the class `controls-row` to manage the layout of items using Flexbox.
5.  **Control Items**: Each individual control (slider, button, toggle) is wrapped in a `<div>` with the class `control-item` and a modifier class describing its content (e.g., `sample-size`, `new-sample`, `phi-toggle`).

### Boilerplate HTML

Here is a template to copy for a new section. **Remember to replace `_new` with a unique suffix for your section** (e.g., `_iv` for an Instrumental Variables section).

```html
<!-- Main wrapper for the new section -->
<section id="new-section-wrapper">

    <!-- Placeholder to prevent content jump when menu is sticky -->
    <div id="controls-placeholder_new" class="controls-placeholder"></div>

    <!-- The actual controls menu -->
    <div id="controls-container_new" class="controls-container card">
        <div class="card-body p-3">
            <div class="controls-row">

                <!-- Control Item 1: Sample Size Slider -->
                <div class="control-item sample-size">
                    <label for="sampleSizeSlider_new" class="form-label me-2 mb-0">Sample Size: <span id="sampleSizeValue_new">500</span></label>
                    <input type="range" class="form-range" min="100" max="2000" step="100" id="sampleSizeSlider_new">
                </div>

                <!-- Control Item 2: New Sample Button -->
                <div class="control-item new-sample">
                    <button id="newSampleBtn_new" class="btn btn-sm">New Sample</button>
                </div>

                <!-- Control Item 3: Custom Toggle Switch -->
                <div class="control-item phi-toggle">
                    <div class="phi-toggle-pill">
                        <span class="phi-label phi-label-left selected" id="phiLabel0_new">Recursive</span>
                        <label class="custom-switch">
                            <input type="checkbox" id="b0Switch_new" title="Switch between Recursive and Non-recursive B_0">
                            <span class="slider"></span>
                        </label>
                        <span class="phi-label phi-label-right" id="phiLabelPi_new">Non-recursive</span>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- ... Rest of the section's content (plots, explanations) goes here ... -->

</section>
```

---

## 2. CSS Styling

All required styles are **globally defined** in `public/css/style.css`. By using the HTML structure above, your new menu will automatically adopt the correct styling. There is no need to write new CSS.

Key classes to be aware of:

*   `.controls-container`: Base styling for the menu card.
*   `.controls-container.sticky`: The style applied by JavaScript when the menu should stick to the top.
*   `.controls-row`: A flex container to align control items.
*   `.control-item`: Provides spacing and alignment for each control.
*   `.phi-toggle-pill`, `.custom-switch`, `.slider`: Styles for the custom toggle component.
*   `.selected`: Used on the toggle labels (`.phi-label`) to indicate the active state.

---

## 3. JavaScript Logic: The Global `initializeStickyMenu` Function

The interactive sticky behavior is managed by a single, global JavaScript function: `initializeStickyMenu(sectionId, controlsContainerId, controlsPlaceholderId)`. This function is located in `public/js/menu.js`.

To make the menu in your new section sticky, you simply need to call this function once in your section's specific JavaScript file, providing the correct IDs for your section wrapper, controls container, and placeholder div.

**Example Call:**

```javascript
// In your section's specific .js file (e.g., public/js/my_new_section.js)
document.addEventListener('DOMContentLoaded', () => {
    // ... other initialization code for your section ...

    initializeStickyMenu('my-section-wrapper-id', 'my-controls-container-id', 'my-controls-placeholder-id');

    // ... other event listeners or setup for your section ...
});
```

Or, if your section's script is loaded after the DOM is ready or has its own readiness check (like waiting for Plotly):

```javascript
function initMyNewSection() {
    // Check if essential elements for this section are ready (e.g., Plotly, specific divs)
    if (typeof Plotly === 'undefined' || !document.getElementById('someEssentialDiv_new')) {
        setTimeout(initMyNewSection, 100); // Wait and retry
        return;
    }

    // ... other initialization code for your section ...

    initializeStickyMenu('my-section-wrapper-id', 'my-controls-container-id', 'my-controls-placeholder-id');

    // ... other event listeners or setup for your section ...
}

// Call your section's main initialization function
initMyNewSection();
```

### How It Works (`initializeStickyMenu`):

1.  **Element Retrieval**: The function first gets references to the section, controls container, and placeholder elements using the provided IDs.
2.  **Initial Measurement (`setupInitial`)**: 
    *   The function ensures the controls container is in the normal document flow (not sticky or pinned) before taking measurements.
    *   It then measures the natural width and height of the controls container and its original offset from the top of the document.
    *   **Layout Stability**: To ensure accurate measurements, especially in sections with asynchronously loading content (like MathJax or Plotly charts), `setupInitial`:
        *   Waits for `MathJax.typesetPromise()` to complete if MathJax is present.
        *   Performs an additional, slightly delayed re-measurement of positions after the initial measurement. This gives other dynamic elements time to render and stabilize the layout, preventing the menu from becoming sticky too late or too early.
3.  **Scroll Monitoring (`handleScroll`)**: The script listens for `scroll` events. To ensure performance and prevent layout bugs, the handler is optimized in two ways:
    *   **Throttling**: It uses `requestAnimationFrame` to ensure the logic only runs once per frame, preventing stuttering during fast scrolls.
    *   **Read/Write Separation**: Within a single scroll event, it first *reads* all the necessary layout information (like element positions) from the DOM for all menus. Only after all reads are complete does it then *write* all the style and class changes back to the DOM. This prevents "layout thrashing" and ensures that calculations for one menu aren't based on a partially-updated state from another. This makes the system resilient to timing issues with multiple menus.
4.  **Three-State Logic**: Based on the scroll position relative to the section and the controls container's height, the menu transitions between three states:
    *   **State 1: Normal Flow**: When the menu is in its original position within the section and has not been scrolled past. The placeholder has `0` height.
    *   **State 2: Sticky**: When the user has scrolled past the menu's original position, but the bottom of the section is still visible. The menu becomes `position: fixed`, sticks to the top of the viewport, and its original width is maintained. The placeholder's height is set to the menu's height to prevent content jump.
    *   **State 3: Pinned**: When the user has scrolled such that the bottom of the section is about to scroll past the bottom of where the sticky menu would be. The menu becomes `position: absolute` and is pinned to the bottom of its parent section. This keeps the menu contained within its section.
5.  **Resize Handling**: The script also listens for `resize` events (debounced) and calls `setupInitial` to recalculate dimensions and positions if the window size changes.

By using this centralized `initializeStickyMenu` function, you no longer need to write custom sticky logic for each section. Just ensure your HTML structure is correct and make a single call to this function.

---

By following these steps, you can efficiently create new, fully-featured control menus that are perfectly integrated with the existing design and functionality of the application.

---

## 4. Integration with Application Architecture

While this guide covers the HTML, CSS, and sticky behavior of the menu, it is critical to remember that the controls within the menu are part of a larger, event-driven system.

**Key Considerations:**

- **Event-Driven Updates:** The controls in your menu will trigger and respond to global `DATA_UPDATED` events. This can lead to runtime errors if not handled carefully.
- **Robustness is Essential:** Your section's JavaScript must be written defensively to avoid errors when the section is hidden or does not contain all shared controls.

For detailed architectural patterns and critical best practices—including **how to prevent `TypeError` exceptions from hidden sections and missing elements**—you **must** refer to **`code_structure.md`**. That document contains the complete guidelines for writing stable and maintainable JavaScript for this project.
