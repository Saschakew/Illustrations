# Loading Screen Implementation Guide

This document explains how the application-wide loading screen works and the responsibilities of developers when working on section-specific JavaScript.

## How It Works

The loading screen is designed to remain visible until the entire application, including all dynamically loaded HTML sections and their specific JavaScript initializations, is fully ready.

1.  **HTML (`index.html`):**
    *   A `div` with the ID `#loading-overlay` is placed directly inside the `<body>`.
    *   This `div` contains a visual spinner and a "Loading..." message.

2.  **CSS (`public/css/style.css`):**
    *   Styles are defined for `#loading-overlay` to make it cover the entire viewport, be semi-transparent, and center its content.
    *   It is set to `display: flex;` by default, making it visible as soon as the HTML starts rendering.

3.  **JavaScript (`public/js/main.js`):**
    *   The main `DOMContentLoaded` event listener is `async`.
    *   It first ensures the `#loading-overlay` is visible.
    *   It then `await`s the completion of `async function loadSections()`, which fetches and injects the HTML for all defined sections.
    *   After sections are loaded, it `await`s the completion of `async function initializeApp()`.
    *   Only after both `loadSections()` and `initializeApp()` have successfully completed does it hide the `#loading-overlay` by setting its `display` style to `none`.

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

If your section's `initializeSectionX()` function is not `async`, or if it is `async` but does not `await` its internal long-running tasks, it will return control to `main.js` prematurely. `main.js` will then assume your section is fully loaded, and the loading screen might disappear before your section's content is actually ready and visible to the user. This can lead to a poor user experience with elements popping in after the main page appears.

By correctly using `async/await`, you ensure that `main.js` waits for the true completion of all setup tasks in your section, providing a smooth and complete initial page load for the user.
