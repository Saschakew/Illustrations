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

## 3. JavaScript: The Sticky Scrolling Feature

The sticky behavior is controlled by a dedicated JavaScript function. It tracks the scroll position and dynamically adds/removes the `.sticky` class to the controls container.

### How It Works

1.  **Initialization (`setupInitial`)**: When the page loads, the script measures and stores the natural width and height of the controls container. It also gets references to the main section wrapper and the placeholder div.

2.  **Scroll Monitoring (`onScroll`)**: The script listens for the `scroll` event.
    *   It checks if the top of the **main section wrapper** has scrolled past the top of the viewport (`sectionRect.top <= 0`).
    *   It also checks if the bottom of the section is still visible (`sectionRect.bottom > controlsHeight`).

3.  **Applying Sticky State**: If both conditions are true, it means the user is scrolling *within* the section. The script then:
    *   Adds the `.sticky` class to the `.controls-container`.
    *   Applies inline styles to fix its position (`position: 'fixed'`) and center it horizontally (`left: '50%', transform: 'translateX(-50%)'`).
    *   Sets the height of the `.controls-placeholder` to be equal to the height of the menu. This pushes the content below it down, preventing a sudden jump.

4.  **Removing Sticky State**: When the user scrolls out of the section, the `.sticky` class and all inline styles are removed, and the placeholder's height is reset to `0`.

### Boilerplate JavaScript

Copy this function into your new section's JavaScript file. Update the IDs to match the ones you defined in your HTML.

```javascript
function setupStickyControls_new() {
    const DEBUG = false; // Set to true for console logs
    const section = document.getElementById('new-section-wrapper');
    const controlsContainer = document.getElementById('controls-container_new');
    const controlsPlaceholder = document.getElementById('controls-placeholder_new');
    let resizeTimer;

    if (!section || !controlsContainer || !controlsPlaceholder) {
        if (DEBUG) console.log('Sticky controls for new section: elements not found.');
        return;
    }

    let controlsHeight = 0;
    let controlsNaturalWidth = 0;

    function setupInitial() {
        // Reset styles to measure natural dimensions
        controlsContainer.classList.remove('sticky');
        controlsContainer.style.width = '';
        controlsContainer.style.position = '';

        controlsHeight = controlsContainer.offsetHeight;
        controlsNaturalWidth = controlsContainer.offsetWidth;
        
        if (DEBUG) console.log(`New Section Initial - Height: ${controlsHeight}, Width: ${controlsNaturalWidth}`);
    }

    function onScroll() {
        const sectionRect = section.getBoundingClientRect();
        
        // Condition to be sticky: top of section is off-screen, but bottom is still on-screen
        const shouldBeSticky = sectionRect.top <= 0 && sectionRect.bottom > controlsHeight;

        if (shouldBeSticky) {
            if (!controlsContainer.classList.contains('sticky')) {
                controlsContainer.classList.add('sticky');
                controlsContainer.style.position = 'fixed';
                controlsContainer.style.top = '0';
                controlsContainer.style.left = '50%';
                controlsContainer.style.width = `${controlsNaturalWidth}px`;
                controlsContainer.style.transform = 'translateX(-50%)';
                controlsPlaceholder.style.height = `${controlsHeight}px`;
                if (DEBUG) console.log('New Section State: Sticky');
            }
        } else {
            if (controlsContainer.classList.contains('sticky')) {
                controlsContainer.classList.remove('sticky');
                controlsContainer.style.position = '';
                controlsContainer.style.top = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.style.height = '0';
                if (DEBUG) console.log('New Section State: Normal');
            }
        }
    }

    // Initial setup with a delay to ensure rendering is complete
    setTimeout(() => {
        setupInitial();
        onScroll();
        
        // Throttled scroll listener
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    onScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Debounced resize listener
        window.addEventListener('resize', () => {
            if (resizeTimer) clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                setupInitial(); // Recalculate dimensions on resize
                onScroll();
            }, 250);
        });
        
        if (DEBUG) console.log('New Section sticky controls initialized.');
    }, 500);
}

// Don't forget to call the function!
setupStickyControls_new();
```

---

By following these steps, you can efficiently create new, fully-featured control menus that are perfectly integrated with the existing design and functionality of the application.
