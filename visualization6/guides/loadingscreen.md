# Loading Screen Implementation Guide

This document explains how the application-wide loading screen works, its new **particle animation** design (replacing the previous “bouncing dots”), and the responsibilities of developers when working on section-specific JavaScript.

## How It Works

The loading screen is designed to remain visible until the entire application, including all dynamically loaded HTML sections and their specific JavaScript initializations, is fully ready. This prevents users from seeing a partially loaded page or content pop-in.

1.  **HTML Structure (`index.html`):**
    *   A `div` with the ID `#loading-overlay` is placed directly inside the `<body>`.
    *   This `div` contains the particle animation. The typical structure for this is:
        ```html
        <div id="loading-overlay">
            <canvas id="particle-canvas"></canvas>
        </div>
        ```
    *   Key page elements like the hero section, main content area, and footer are initially styled to be hidden.

2.  **CSS Styling (`public/css/style.css`):**
    *   `#loading-overlay`:
        *   Styled to cover the entire viewport (e.g., `position: fixed; top: 0; left: 0; width: 100%; height: 100%;`).
        *   Has a background color (e.g., a semi-transparent dark color or a solid color matching the theme).
        *   Uses flexbox or grid to center the `#particle-canvas` element.
        *   It is set to `display: flex;` (or `grid`) by default, making it visible as soon as the HTML starts rendering.
    *   `#particle-canvas`:
        *   The canvas takes full viewport so particles can cover the screen.
        *   Styled with `width: 100%; height: 100%; display: block;` to remove inline-canvas whitespace.
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

## Particle Animation Details

The revamped loading experience now features a lightweight, GPU-accelerated particle animation that aligns with the project’s style guide (`guides/guide_style.md`).  The animation is rendered on a `<canvas>` element using the open-source [tsParticles](https://particles.js.org/) library, which offers excellent performance and a small footprint (~50 KB minified).

### 1.  HTML Structure (`index.html`)

Replace the old *bouncing dots* markup with:

```html
<div id="loading-overlay">
    <canvas id="particle-canvas"></canvas>
</div>
```

### 2.  CSS Styling (`public/css/style.css`)

```css
/* Overlay container */
#loading-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-background-page);
    z-index: 9999;
}

/* Canvas takes full viewport so particles can cover the screen */
#particle-canvas {
    width: 100%;
    height: 100%;
    display: block; /* Removes inline-canvas whitespace */
}
```

Key style-guide considerations:

*   **Colors:** Particle colours reuse CSS variables `--color-accent-primary` (teal) and `--color-accent-secondary-plot-loss` (magenta) for on-brand flair.
*   **Responsiveness:** Because the canvas is `100%` width/height, the animation gracefully scales on all view-ports.

### 3.  JavaScript Initialisation (`public/js/main.js`)

1.  Install tsParticles via npm or include its CDN bundle **before** `main.js`:

    ```html
    <script src="https://cdn.jsdelivr.net/npm/tsparticles@3/tsparticles.bundle.min.js" defer></script>
    ```
2.  In `main.js`, initialise the particles **before** awaiting `loadSections()` so the animation is already running while other assets load:

    ```javascript
    async function showLoadingScreen() {
        const { tsParticles } = window;
        await tsParticles.load({
            id: 'particle-canvas',
            options: {
                background: { color: { value: 'transparent' } },
                fullScreen: { enable: false },
                particles: {
                    number: { value: 60, density: { enable: true, area: 800 } },
                    color: { value: [
                        getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-accent-primary').trim(),
                        getComputedStyle(document.documentElement)
                            .getPropertyValue('--color-accent-secondary-plot-loss').trim(),
                    ] },
                    shape: { type: 'circle' },
                    opacity: { value: 0.6 },
                    size: { value: { min: 2, max: 4 } },
                    move: { enable: true, speed: 2, direction: 'none', outMode: 'bounce' },
                },
            },
        });
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await showLoadingScreen();
        await loadSections();
        await initializeApp();
        document.body.classList.add('loaded');
        document.getElementById('loading-overlay').style.display = 'none';
    });
    ```

### 4.  Accessibility & Performance

*   **Reduced-motion users:** Respect the `prefers-reduced-motion` media query.  Wrap the particle initialisation in a check and skip or reduce motion if users prefer minimal animations.
*   **Performance:** 60 particles with low opacity and small size keeps GPU usage negligible even on mobile devices.

> **Tip:** If you need to tweak colours, sizes, or speeds, consult `guide_style.md` to ensure your choices remain on-brand.

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
