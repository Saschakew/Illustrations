# Guide: Unified Menu Element Creation and Management

This guide outlines a standardized approach for creating and managing interactive UI elements (controls like sliders, buttons, dropdowns, etc.) within the dynamic sections of the application. The goal is to promote reusability, maintainability, and a clear separation of concerns.

## Core Idea: UI Factory Pattern

We use a "UI Factory" pattern, where a dedicated JavaScript module (`ui_factory.js`) is responsible for generating the HTML structure for common UI elements. Section-specific HTML files will use simple placeholders, and a central script (`main.js`) will populate these placeholders during application initialization.

## Components

1.  **`public/js/ui_factory.js`**: 
    *   This file will host a global object (e.g., `window.uiFactory`).
    *   This object will contain methods, each responsible for generating the HTML string (or DOM elements) for a specific type of UI control (e.g., `createTSlider()`, `createButton()`, `createModeSwitch()`).
    *   These factory methods can accept parameters for customization (e.g., IDs, labels, default values, classes).

2.  **Section HTML Files (e.g., `public/sections/section_one.html`)**:
    *   Instead of hardcoding complex HTML for controls, these files will contain simple placeholder `<div>` elements.
    *   Placeholders use `data-*` attributes to specify the type of control and any necessary parameters (like a unique ID).
    *   Controls are typically placed within a `div` with class `controls-row` for consistent layout.
    *   Example:
        ```html
        <div class="controls-row">
            <!-- Placeholder for a T-slider -->
            <div data-control-type="t-slider" data-control-id="slider_T_sec1"></div>

            <!-- Placeholder for a Mode Switch -->
            <div data-control-type="mode-switch" data-control-id="mode_switch_sec1"></div>

            <!-- Placeholder for a generic button -->
            <div data-control-type="button" data-control-id="actionButton_sec1" data-button-text="Run Simulation" data-button-class="btn-primary"></div>
        </div>
        ```

3.  **`public/js/main.js` (`initializeApp` function)**:
    *   After dynamic sections are loaded (via `loadSections()`), `initializeApp()` will query the DOM for all placeholders (e.g., `document.querySelectorAll('[data-control-type]')`).
    *   It will iterate through these placeholders, read their `data-*` attributes, and call the appropriate method from `window.uiFactory` to generate the control's HTML.
    *   The generated HTML then replaces the placeholder element (typically using `placeholder.outerHTML = controlHtml;`).
    *   **Crucially**: After all controls are dynamically injected, shared initializer functions (like `initializeSliders()`, `initializeModeSwitches()` from `shared_controls.js`) **must be called**. This is because these initializers need to find and attach event listeners to the newly created DOM elements.

4.  **`public/js/shared_controls.js` (and similar)**:
    *   This file (and potentially others for different control types) will continue to house the JavaScript logic for initializing controls and attaching event listeners.
    *   These functions will typically select elements by common classes (e.g., `.t-slider`, `.mode-switch`) or specific IDs if necessary, which are assigned by the UI factory.

5.  **`index.html`**: 
    *   Must include the `ui_factory.js` script.
    *   The loading order should be: `shared_data.js` (for data), then `ui_factory.js` (to define factories), then `shared_controls.js` (for generic initializers), then `main.js` (to orchestrate loading and initialization).

## Workflow Examples

Below are step-by-step examples of how to add new controls using the UI Factory pattern.

### Example 1: Adding a New T-Slider (Sample Size Control)

1.  **Define `createTSlider` in `ui_factory.js` (if not already present)**:
    ```javascript
    // public/js/ui_factory.js
    window.uiFactory = window.uiFactory || {}; // Ensure object exists
    window.uiFactory.createTSlider = function(id, label = 'Sample Size (T):') {
        const sliderId = id;
        const outputId = `${id}_value`;
        const defaultValue = (window.sharedData && typeof window.sharedData.T !== 'undefined') ? window.sharedData.T : 500;
        
        return `
            <div class="control-item">
                <label for="${sliderId}">${label}</label>
                <input type="range" id="${sliderId}" name="${sliderId}" min="100" max="2000" value="${defaultValue}" step="50" class="slider t-slider">
                <output for="${sliderId}" id="${outputId}">${defaultValue}</output>
            </div>
        `;
    };
    ```

2.  **Add Placeholder in Section HTML (e.g., `section_three.html`)**:
    ```html
    <div class="controls-row">
        <div data-control-type="t-slider" data-control-id="slider_T_sec3"></div>
        <!-- Other controls -->
    </div>
    ```

3.  **Update `main.js` (`initializeApp`) to handle the `t-slider` type (if new)**:
    ```javascript
    // In initializeApp() in main.js, within the controls creation loop:
document.querySelectorAll('[data-control-type]').forEach(placeholder => {
        const type = placeholder.dataset.controlType;
        const id = placeholder.dataset.controlId; // Crucial for unique identification
        let controlHtml = '';

        if (type === 't-slider' && window.uiFactory && typeof window.uiFactory.createTSlider === 'function') {
            controlHtml = window.uiFactory.createTSlider(id, placeholder.dataset.controlLabel); // Pass optional label
        } 
        // ... handle other types like 'mode-switch'
        
        if (controlHtml) {
            placeholder.outerHTML = controlHtml; // Replace placeholder with actual control
        } else {
            console.warn(`Could not create control of type: '${type}' with id: '${id}'. Check ui_factory.js.`);
        }
    });

    // ... (other initializers)

    // Call the initializer for sliders
    if (typeof initializeSliders === 'function') {
        initializeSliders(); 
    }
    ```

4.  **Ensure `shared_controls.js` handles all `.t-slider` elements correctly**. This involves selecting elements with the `.t-slider` class and attaching event listeners for shared behavior and data synchronization.

### Example 2: Adding a New Mode Switch (Recursive/Non-Recursive)

This example demonstrates adding a `<select>` dropdown for mode selection.

1.  **Define `createModeSwitch` in `ui_factory.js`**:
    ```javascript
    // public/js/ui_factory.js
    window.uiFactory = window.uiFactory || {};
    window.uiFactory.createModeSwitch = function(id, label = 'Mode:') {
        const switchId = id;
        const initialMode = (window.sharedData && typeof window.sharedData.isRecursive !== 'undefined') 
                            ? (window.sharedData.isRecursive ? 'recursive' : 'non-recursive') 
                            : 'recursive';

        return `
            <div class="control-item">
                <label for="${switchId}">${label}</label>
                <select id="${switchId}" name="${switchId}" class="mode-switch">
                    <option value="recursive" ${initialMode === 'recursive' ? 'selected' : ''}>Recursive</option>
                    <option value="non-recursive" ${initialMode === 'non-recursive' ? 'selected' : ''}>Non-Recursive</option>
                </select>
            </div>
        `;
    };
    ```

2.  **Add Placeholder in Section HTML (e.g., `section_one.html`)**:
    Place the placeholder within a `.controls-row` div. Ensure `data-control-id` is unique.
    ```html
    <div class="controls-row">
        <div data-control-type="mode-switch" data-control-id="mode_switch_s1"></div>
        <!-- Other controls -->
    </div>
    ```

3.  **Update `main.js` (`initializeApp`) to handle the `mode-switch` type**:
    ```javascript
    // In initializeApp() in main.js, within the controls creation loop:
document.querySelectorAll('[data-control-type]').forEach(placeholder => {
        const type = placeholder.dataset.controlType;
        const id = placeholder.dataset.controlId;
        let controlHtml = '';

        if (type === 't-slider' && /* ... */) { /* ... */ }
        else if (type === 'mode-switch' && window.uiFactory && typeof window.uiFactory.createModeSwitch === 'function') {
            controlHtml = window.uiFactory.createModeSwitch(id, placeholder.dataset.controlLabel);
        }
        // ... other types
        
        if (controlHtml) {
            placeholder.outerHTML = controlHtml;
        } else {
            console.warn(`Could not create control of type: '${type}' with id: '${id}'. Check ui_factory.js.`);
        }
    });

    // ... (other initializers)

    // Call the initializer for mode switches
    if (typeof initializeModeSwitches === 'function') {
        initializeModeSwitches(); 
    }
    ```

4.  **Create `initializeModeSwitches` in `shared_controls.js`**:
    This function will find all elements with the class `.mode-switch` (added by the factory), set their initial state from `sharedData`, and attach event listeners to update `sharedData.isRecursive`, call `sharedData.updateB0Mode()`, and synchronize other switches.
    ```javascript
    // public/js/shared_controls.js
    function initializeModeSwitches() {
        console.log('Initializing mode switches...');
        const modeSwitches = document.querySelectorAll('.mode-switch');
        // ... (full logic as implemented previously: set initial value, add event listeners, synchronize) ...
        console.log('Mode switch initialization complete.');
    }
    ```

## Benefits

*   **Reduced HTML Duplication**: Section files become cleaner and focus on layout.
*   **Consistency**: All instances of a control type (e.g., T-sliders, Mode Switches) will look and behave consistently.
*   **Maintainability**: Changes to a control's structure or default behavior are made in one place (`ui_factory.js` and `shared_controls.js`).
*   **Scalability**: Easier to add new types of controls or new instances of existing controls.

## Next Steps (General Implementation Checklist)

To implement this pattern for any new control:
1. Create or update the factory method in `public/js/ui_factory.js`.
2. Update `index.html` to load `ui_factory.js` (if not already done) in the correct order.
3. Add placeholders (`<div data-control-type="your-type" data-control-id="unique_id"></div>`) to the relevant section HTML files, inside a `.controls-row`.
4. Update `main.js` (`initializeApp` function) to process these new placeholders and inject the HTML generated by the factory.
5. Create or update an initializer function in `public/js/shared_controls.js` (or a more specific control script if needed).
6. Ensure this new initializer is called in `main.js` *after* HTML injection.

## Debugging Common Issues

*   **Control Not Appearing**: 
    *   Check `main.js`: Is there an `else if` block in `initializeApp` for your `data-control-type`?
    *   Check `ui_factory.js`: Does the factory method exist and is it correctly named? Is it returning a valid HTML string?
    *   Check HTML placeholder: Is `data-control-type` spelled correctly? Is `data-control-id` provided and unique?
    *   Look for warnings in the console like "Could not create control of type...".
*   **Control Appears But Doesn't Work (No Interactivity)**:
    *   Check `main.js`: Is the corresponding initializer function (e.g., `initializeSliders()`, `initializeModeSwitches()`) being called *after* the control HTML is injected?
    *   Check `shared_controls.js` (or similar): 
        *   Does the initializer function correctly select the elements (e.g., by class like `.t-slider` or `.mode-switch`)? The class should be added by your factory method.
        *   Are event listeners being attached correctly?
        *   Are there any errors in the console when you try to interact with the control?
*   **Styling Issues or Layout Problems (e.g., Sticky Menus)**:
    *   Ensure your control HTML generated by the factory has appropriate structure and classes (e.g., a `control-item` wrapper if consistent with other controls).
    *   For complex interactions like sticky positioning, ensure the JavaScript logic correctly identifies and manipulates the DOM elements. Dynamic placeholder management, as seen in `sticky_menu.js`, can be crucial if the original DOM structure changes.
