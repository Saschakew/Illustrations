# Guide 3: UI Controls and the Factory Pattern

This guide explains how to add, modify, and remove interactive UI controls like sliders and buttons. The template uses a **UI Factory pattern** to ensure that controls are created in a consistent, reusable, and maintainable way.

## The UI Factory Pattern

The core idea is to centralize the creation of UI elements. Instead of writing raw HTML for a slider in multiple section files, you define a function that generates the slider's HTML. This approach has several advantages:

-   **Consistency**: All sliders created by the factory will look and feel the same.
-   **Maintainability**: If you need to change the design of all sliders, you only need to edit the factory function in one place.
-   **Simplicity**: Adding a new control to a section becomes a matter of adding a single placeholder `<div>`, not a complex block of HTML.

### The Key Files in the Pattern

Three files work together to implement this pattern:

1.  **`public/js/ui_factory.js`**: This is the factory itself. It contains functions (e.g., `createTSlider`) that take an ID and return a complete HTML string for a specific control.
2.  **`public/js/main.js`**: The orchestrator. Its `initializeApp` function finds control placeholders in the HTML and uses the `ui_factory.js` to replace them with the actual controls.
3.  **`public/js/shared_controls.js`**: The logic hub. It contains the initializer functions (e.g., `initializeSliders`) that attach event listeners to the controls after they have been created.

## Supported Control Types (as of commit)

The factory already exposes the following helpers (see `public/js/ui_factory.js`):

| Control type (in `data-control-type`) | Factory function | CSS class | Core purpose |
| --- | --- | --- | --- |
| `t-slider` | `createTSlider` | `.t-slider` | Sample size **T** slider |
| `phi-slider` | `createPhiSlider` | `.phi-slider` | Estimation angle **φ** slider |
| `lambda-slider` | `createLambdaSlider` | `.lambda-slider` | Ridge penalty **λ** slider |
| `mode-switch` | `createModeSwitch` | `.mode-switch` | Toggle Recursive / Non-Recursive |
| `new-data-button` | `createNewDataButton` | `.new-data-button` | Regenerate new ε-series |

You can inspect the switch statement in `main.js` (around line 430) to see how each placeholder type maps to its factory call.

### Placeholder Guidelines

1. Every control goes inside a `data-control-type` placeholder:
   ```html
   <div data-control-type="phi-slider" data-control-id="slider_phi_s1"></div>
   ```
2. The **ID** (`data-control-id`) must be unique throughout the whole page because it becomes the element’s actual `id`.
3. Keep placeholders minimal—`main.js` replaces the entire `<div>` with the generated HTML.
4. After injection, initialiser functions in `shared_controls.js` locate controls by their CSS class (e.g., `.phi-slider`).

---

## Workflow: Adding a New Slider

Let's walk through the complete, end-to-end process of adding a new slider. We will use the example from the previous guide: adding a **'volatility scale' (`gamma`) slider**.

*(Prerequisite: The `gamma` property must already be defined in `shared_data.js`, as explained in Guide 2.)*

### Step 1: Create a Factory Function in `ui_factory.js`

First, we need to teach our factory how to build a `gamma` slider. Open `public/js/ui_factory.js` and add a new function, `createGammaSlider`.

```javascript
// public/js/ui_factory.js

window.uiFactory = {
    // ... existing functions like createTSlider, createPhiSlider ...

    createGammaSlider: function(id, label = 'γ=') {
        const sliderId = id;
        const outputId = `${id}_value`;
        // Get the default value from our single source of truth
        const defaultValue = window.sharedData.gamma || 1.0;

        return `
            <div class="control-item">
                <label for="${sliderId}">${label}</label>
                <output for="${sliderId}" id="${outputId}">${defaultValue.toFixed(2)}</output>
                <input type="range" id="${sliderId}" name="${sliderId}" min="0.1" max="3.0" value="${defaultValue}" step="0.1" class="slider gamma-slider">
            </div>
        `;
    },

    // ... other functions ...
};
```

### Step 2: Add a Placeholder to the Section HTML

Now, decide where you want the slider to appear. Open the relevant section file (e.g., `public/sections/section_one.html`) and add a simple placeholder `<div>`. The `data-control-type` attribute is critical, as it tells `main.js` which factory function to use.

```html
<!-- in public/sections/section_one.html -->

<div class="controls-container card">
    <h4>Simulation Controls</h4>
    <div class="controls-row">
        <!-- Existing controls -->
        <div data-control-type="t-slider" data-control-id="slider_T_s1"></div>

        <!-- Our new placeholder -->
        <div data-control-type="gamma-slider" data-control-id="slider_gamma_s1"></div>
    </div>
</div>
```

### Step 3: Teach `main.js` to Build the New Control

Next, we need to tell the `initializeApp` function in `main.js` how to handle the `gamma-slider` type. Open `public/js/main.js` and add a new `else if` condition to the control creation loop.

```javascript
// in public/js/main.js, inside initializeApp()

document.querySelectorAll('[data-control-type]').forEach(placeholder => {
    const type = placeholder.dataset.controlType;
    const id = placeholder.dataset.controlId;
    let controlHtml = '';

    if (type === 't-slider') {
        controlHtml = window.uiFactory.createTSlider(id);
    } else if (type === 'phi-slider') {
        controlHtml = window.uiFactory.createPhiSlider(id);
    } else if (type === 'gamma-slider') { // Our new condition
        controlHtml = window.uiFactory.createGammaSlider(id);
    }
    // ... other control types

    if (controlHtml) {
        placeholder.outerHTML = controlHtml;
    }
});
```

### Step 4: Add the Control Logic in `shared_controls.js`

The final step is to give the slider its functionality. We need to create a function in `public/js/shared_controls.js` that finds all gamma sliders, attaches event listeners to them, and tells them what to do when they are moved.

First, create the initializer function `initializeGammaSliders`:

```javascript
// public/js/shared_controls.js

function initializeGammaSliders() {
    const gammaSliders = document.querySelectorAll('.gamma-slider');
    if (gammaSliders.length === 0) return; // No sliders found

    gammaSliders.forEach(slider => {
        const output = document.getElementById(`${slider.id}_value`);

        // Set initial value from sharedData
        slider.value = window.sharedData.gamma;
        output.textContent = parseFloat(slider.value).toFixed(2);

        slider.addEventListener('change', function() {
            const newGamma = parseFloat(this.value);
            window.sharedData.gamma = newGamma; // 1. Update state

            // Synchronize all other gamma sliders and their outputs
            gammaSliders.forEach(s => {
                const o = document.getElementById(`${s.id}_value`);
                s.value = newGamma;
                if (o) o.textContent = newGamma.toFixed(2);
            });

            DebugManager.log('SHARED_CONTROLS', 'Gamma updated to:', newGamma);

            regenerateSvarData(); // 2. Trigger recalculation
        });
    });

    DebugManager.log('SHARED_CONTROLS', 'Gamma sliders initialized.');
}
```

Second, make sure this new initializer is called from `main.js` after the controls have been created.

```javascript
// in public/js/main.js, at the end of initializeApp()

    // ... after the control creation loop ...

    // Call initializers for all controls
    if (typeof initializeSliders === 'function') initializeSliders();
    if (typeof initializePhiSliders === 'function') initializePhiSliders();
    if (typeof initializeGammaSliders === 'function') initializeGammaSliders(); // Call our new initializer
    // ... other initializers
```

And that's it! You have successfully added a new, fully functional, and synchronized slider to the application.

---

The next guide, **`04_svar_logic_and_computations.md`**, will cover how to implement the SVAR-specific calculations that are triggered by these controls.
