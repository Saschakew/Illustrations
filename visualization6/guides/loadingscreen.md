# Loading Screen Implementation Guide

This document explains how the application-wide loading screen works, its current "bouncing dots" design, and the responsibilities of developers when working on section-specific JavaScript.

## How It Works

The loading screen is designed to remain visible until the entire application, including all dynamically loaded HTML sections and their specific JavaScript initializations, is fully ready. This prevents users from seeing a partially loaded page or content pop-in.

1.  **HTML Structure (`index.html`):**
    *   A `div` with the ID `#loading-overlay` is placed directly inside the `<body>`.
    *   This `div` contains the "bouncing dots" animation. The typical structure for this is:
        ```html
        <div id="loading-overlay">
            <div class="bouncing-dots">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        </div>
        ```
    *   Key page elements like the hero section, main content area, and footer are initially styled to be hidden.

2.  **CSS Styling (`public/css/style.css`):**
    *   `#loading-overlay`:
        *   Styled to cover the entire viewport (e.g., `position: fixed; top: 0; left: 0; width: 100%; height: 100%;`).
        *   Has a background color (e.g., a semi-transparent dark color or a solid color matching the theme).
        *   Uses flexbox or grid to center the `.bouncing-dots` container.
        *   It is set to `display: flex;` (or `grid`) by default, making it visible as soon as the HTML starts rendering.
    *   `.bouncing-dots` and `.dot`:
        *   The `.bouncing-dots` container holds the individual `div.dot` elements.
        *   Each `.dot` is styled (e.g., `width`, `height`, `background-color`, `border-radius: 50%`).
        *   A CSS keyframe animation (e.g., `bounce`) is defined to make the dots move up and down.
        *   This animation is applied to each `.dot` with staggered `animation-delay` values to create the bouncing sequence.
    *   **Content Fading:**
        *   Initially, main page elements (e.g., `header`, `main`, `footer`) are styled with `opacity: 0;` and `visibility: hidden;` to prevent them from being seen during the loading phase or flashing before the loading screen is fully established.
        *   A `.loaded` class is added (typically to the `<body>` or a main wrapper) via JavaScript once all content is ready.
        *   CSS transitions are defined for these elements to smoothly fade in when the `.loaded` class is applied (e.g., `opacity: 1; visibility: visible; transition: opacity 0.5s ease-in-out;`).

3.  **JavaScript Logic (`public/js/main.js`):**
    *   The main `DOMContentLoaded` event listener is `async`.
    *   It first ensures the `#loading-overlay` is visible (though CSS usually handles this by default).
    *   It then `await`s the completion of `async function loadSections()`, which fetches and injects the HTML for all defined sections.
    *   After sections are loaded, it `await`s the completion of `async function initializeApp()`.
    *   Only after both `loadSections()` and `initializeApp()` have successfully completed does it:
        1.  Hide the `#loading-overlay` (e.g., by setting its `display` style to `none` or adding a class that hides it).
        2.  Apply the `.loaded` class to the `<body>` (or relevant wrapper) to trigger the fade-in animation of the main page content.

4.  **`initializeApp()` in `main.js`:**
    *   This function is `async`.
    *   It handles the initialization of shared controls (sliders, buttons, etc.) created by the UI factory.
    *   Crucially, it then calls and `await`s each section-specific initialization function (e.g., `await initializeSectionOne();`, `await initializeSectionTwo();`, etc.).

## Developer Responsibilities for Section-Specific JavaScript

To ensure the loading screen waits for your section to be fully initialized (including any data generation, calculations, or initial plot rendering), you **MUST** adhere to the following:

1.  **Make Your Section Initializer `async`:**
    *   The main initialization function for your section (e.g., `initializeSectionOne()` in `public/js/sections/section_one.js`) **must be declared as an `async` function**.
    *   Example:
        ```javascript
        // In public/js/sections/section_one.js
        async function initializeSectionOne() {
            DebugManager.log('SECTION_ONE', 'Initializing Section One...');
            // ... your synchronous setup code ...

            if (typeof initSvarSetup === 'function' && document.getElementById('svar-setup-specific-element')) {
                DebugManager.log('SECTION_ONE', 'Calling initSvarSetup...');
                await initSvarSetup(); // Await if initSvarSetup is also async and does heavy work
                DebugManager.log('SECTION_ONE', 'initSvarSetup completed.');
            }

            // ... any other potentially long-running setup for section one ...
            // For example, if you have a function that renders an initial plot:
            // await renderInitialPlotForSectionOne(); 

            DebugManager.log('SECTION_ONE', 'Section One initialization complete.');
        }
        ```

2.  **`await` Long-Running Tasks:**
    *   Inside your `async` section initializer, if you call any functions that perform time-consuming operations (e.g., fetching additional data, complex calculations, rendering complex visualizations), these functions should also ideally be `async` and return a Promise.
    *   You **must `await`** these calls within your section initializer.
    *   Example:
        ```javascript
        async function renderInitialPlotForSectionOne() {
            return new Promise(resolve => {
                // Simulate a delay for plot rendering
                setTimeout(() => {
                    console.log('Plot for Section One rendered.');
                    resolve();
                }, 1500); // Simulates 1.5 seconds to render
            });
        }

        async function initializeSectionOne() {
            // ... other setup ...
            await renderInitialPlotForSectionOne();
            // ... now the loading screen will wait for the plot ...
        }
        ```

**Why is this critical?**

If your section's `initializeSectionX()` function is not `async`, or if it is `async` but does not `await` its internal long-running tasks, it will return control to `main.js` prematurely. `main.js` will then assume your section is fully loaded. The loading screen might disappear, and the `.loaded` class might be applied, before your section's content is actually ready and visible to the user. This can lead to a poor user experience with elements popping in after the main page appears or an empty space where your section's content should be.

By correctly using `async/await`, you ensure that `main.js` waits for the true completion of all setup tasks in your section, providing a smooth and complete initial page load for the user.
