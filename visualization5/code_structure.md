# SVAR Visualizer: Code Structure and Architectural Guidelines

## 1. Introduction

This document outlines the standardized architecture for the SVAR Visualizer project. The primary goal is to ensure a modular, scalable, and maintainable codebase where UI components (controls, plots) across different sections remain synchronized and react to a central data store.

**Benefits:**
- **Modularity:** Clear separation of concerns between data, controls, logic, and presentation.
- **Scalability:** Easily add new interactive sections with synchronized controls and plots.
- **Maintainability:** Easier to understand, debug, and modify individual components.
- **Synchronized UI:** Changes in one control or data point automatically reflect across the entire application.

## 2. Core Principles

- **Single Source of Truth:** All shared application state resides in a central data store (`window.SVARData`).
- **One-Way Data Flow:** UI interactions trigger data updates, which then flow out to all subscribed components.
- **Shared, Reusable Components:** Common functionalities (controls, plotting, SVAR logic) are encapsulated in shared modules.
- **Event-Driven Updates:** Components subscribe to data change events rather than directly calling each other.

## 3. Key Components & Their Roles

### 3.1. Central Data Store (`window.SVARData`)
- **Location:** `public/js/shared_data.js`
- **Purpose:** Holds all shared application state (e.g., sample size `T`, model type `isNonRecursive`, generated data series like `epsilon_1t`, `u_1t`, `B_0`). Also stores constants (e.g., `B0_RECURSIVE`, `B0_NON_RECURSIVE`).
- **Functionality:**
    - Provides methods for updating its internal data (e.g., `window.SVARData.updateData(newData)`).
    - Implements a publish/subscribe system for event notification.
    - `window.SVARData.subscribe(eventName, callback)`: Allows components to listen for specific events.
    - `window.SVARData.notifyUpdate(eventName, detail)`: Dispatches an event with associated data.
    - **Key Event:** `DATA_UPDATED` is dispatched when core simulation parameters or generated data series change. The updated data is passed in `event.detail`.

### 3.2. Shared JavaScript Modules
- **Location:** `public/js/`
- **Namespacing:** All shared functions are namespaced under global objects (e.g., `window.SVARControls`, `window.SVARFunctions`) to prevent global scope pollution and organize code.

    - **`shared_controls.js` (`window.SVARControls`)**
        - **Manages:** Common UI controls (sliders, switches, buttons) across sections.
        - **`initializeControls(sectionId)` function:**
            - Takes the ID of the parent HTML section as an argument.
            - Finds control elements within that section using predefined, consistent CSS classes (see Section 4: HTML Structure).
            - **UI Event Handling:** Attaches event listeners to these controls. When a user interacts with a control:
                - It typically calls a data generation/update function in `window.SVARFunctions` (e.g., `generateAndStoreSvarData`).
            - **Data Subscription:** Subscribes to the `DATA_UPDATED` event from `window.SVARData`. When the central data changes (even if triggered by another section), it updates the visual state of the controls it manages to ensure they reflect the current state.

    - **`shared_svar_functions.js` (`window.SVARFunctions`)**
        - **Contains:** Core SVAR-specific logic, data generation algorithms, and matrix calculations.
        - **Example: `generateAndStoreSvarData(T, isNonRecursive)`:**
            - Performs all necessary calculations to generate structural shocks, reduced-form shocks, etc.
            - Updates the `window.SVARData` store with the new parameters (`T`, `isNonRecursive`) and the newly generated data series.
            - Calls `window.SVARData.notifyUpdate('DATA_UPDATED', allGeneratedData)` to inform all subscribers.

    - **`shared_plots.js` (`window.SVARPlots`)**
        - **Contains:** Functions dedicated to creating and updating Plotly.js visualizations.
        - Example: `updateSvarSetupPlots(epsilon_1t, epsilon_2t, u_1t, u_2t)`. These functions typically take the necessary data arrays as arguments and handle the Plotly rendering logic.

    - **`shared_general_functions.js` (`window.SVARGeneral`)**
        - **Contains:** Utility functions that are general-purpose and not specific to SVARs, plotting, or controls (e.g., custom random number generators, array manipulations if needed).

### 3.3. Section-Specific Logic (e.g., `svar_setup.js`)
- **Location:** `public/js/section_name.js` (e.g., `public/js/svar_setup.js`)
- **Purpose:** Handles the unique behavior and initialization for a specific interactive section of the application.
- **Structure:**
    - Typically wrapped in an initialization function (e.g., `initSvarSetup()`) that is called by `main.js`.
    - **Initialization Steps:**
        1. Calls `window.SVARControls.initializeControls('your-section-id')` to activate and synchronize the shared controls within its corresponding HTML.
        2. Subscribes to the `DATA_UPDATED` event from `window.SVARData`. The event handler:
            - Receives the updated data bundle in `event.detail`.
            - Calls the appropriate plotting functions from `window.SVARPlots` with the new data to redraw its visualizations.
        3. May trigger an initial data generation (e.g., by calling `window.SVARFunctions.generateAndStoreSvarData()` with default/initial control values) to populate plots when the section first loads.
    - **Role:** Acts primarily as a "view" or "controller" layer for its specific section, orchestrating shared services and reacting to data changes. It should contain minimal local state related to the core simulation data.

### 3.4. HTML Structure (Section Files)
- **Location:** `public/sections/section_name.html` (e.g., `public/sections/svar_setup.html`)
- **Purpose:** Contains the HTML markup for a specific section, including placeholders for controls and plots.
- **Control Element Classes:** For `shared_controls.js` to discover and manage UI elements, they **must** use consistent CSS classes:
    - Sample Size Slider: Existing Bootstrap class `.form-range` (often with `[min="250"]` or similar attribute selectors if needed).
    - Sample Size Value Display: `.sample-size-value` (e.g., `<span class="sample-size-value">500</span>`).
    - "New Sample" Button: `.new-sample-btn` (e.g., `<button class="new-sample-btn">New Sample</button>`).
    - Recursive/Non-Recursive Switch (and its labels):
        - Switch input: `.custom-switch input[type="checkbox"]`
        - "Recursive" label: `.phi-label-left`
        - "Non-Recursive" label: `.phi-label-right`
    - Plot Containers: Unique IDs (e.g., `id="shocksScatterPlot"`) for Plotly to target.

### 3.5. Orchestration (`main.js`)
- **Location:** `public/js/main.js`
- **Purpose:**
    - Manages the overall application lifecycle.
    - Dynamically loads HTML content for each section into the main page.
    - Ensures `window.SVARData` and its event system are initialized.
    - Calls the initialization function for each section (e.g., `initSvarSetup()`) once its HTML content is loaded and other dependencies (like MathJax) are ready.
    - Handles global UI concerns like the initial loading screen.

## 4. Data Flow (Simplified)

1.  **User Interaction:** User interacts with a control (e.g., moves a slider in Section A).
2.  **Control Handler (`shared_controls.js`):** The event listener for that control (managed by `shared_controls.js`) is triggered.
3.  **Data Generation (`shared_svar_functions.js`):** The control handler calls a function like `window.SVARFunctions.generateAndStoreSvarData()`, passing the new control value (e.g., new sample size `T`).
4.  **Central Store Update (`shared_svar_functions.js` -> `window.SVARData`):**
    - `generateAndStoreSvarData()` calculates all new data series.
    - It then updates `window.SVARData` with these new values (e.g., new `T`, new `epsilon_1t`, etc.).
    - Finally, it calls `window.SVARData.notifyUpdate('DATA_UPDATED', allNewData)`.
5.  **Event Dispatch (`window.SVARData`):** `window.SVARData` broadcasts the `DATA_UPDATED` event to all subscribers. The `event.detail` contains the `allNewData` bundle.
6.  **Reactive Updates:**
    - **Controls (`shared_controls.js`):** The `DATA_UPDATED` subscriber within `shared_controls.js` (for Section A, Section B, etc.) receives the event. If the data change affects a control it manages (e.g., the sample size slider value), it updates the control's visual appearance. This keeps all instances of shared controls synchronized.
    - **Plots (Section-Specific JS, e.g., `svar_setup.js`):** The `DATA_UPDATED` subscriber within `svar_setup.js` (and other section-specific scripts) receives the event. It extracts the necessary data series from `event.detail` and calls the relevant functions in `window.SVARPlots` to redraw its visualizations.

## 5. Adding a New Synchronized Section (Checklist)

1.  **Create HTML File:**
    - In `public/sections/`, create `new_section_name.html`.
    - Include necessary control elements, ensuring they use the standard CSS classes defined in Section 3.4.
    - Add `div` elements with unique IDs to serve as plot containers.
2.  **Create JavaScript File:**
    - In `public/js/`, create `new_section_name.js`.
    - Implement an initialization function (e.g., `initNewSectionName()`).
    - Inside this function:
        - Call `window.SVARControls.initializeControls('new-section-id')` (where `'new-section-id'` is the ID of the main `div` or `section` tag for this new section in the main `index.html`).
        - Subscribe to `window.SVARData.subscribe('DATA_UPDATED', (event) => { /* ... update plots ... */ });`.
        - In the subscriber, call appropriate functions from `window.SVARPlots` using data from `event.detail`.
        - If the section should display data on load, trigger an initial data generation via `window.SVARFunctions.generateAndStoreSvarData()`.
3.  **Update `main.js`:**
    - Add the new section to the `sections` array or similar configuration for dynamic HTML loading.
    - Ensure `main.js` calls `initNewSectionName()` after the section's HTML is loaded and other dependencies are ready.
4.  **Update `index.html` (if needed):**
    - Add a main `section` tag with an ID for the new content (e.g., `<section id="new-section-id"></section>`).
    - Add a navigation link to the new section in the main `<nav>` menu.
5.  **Extend Shared Modules (if necessary):**
    - If the new section requires new types of plots, add corresponding functions to `shared_plots.js`.
    - If it requires new core SVAR logic or general utility functions, add them to `shared_svar_functions.js` or `shared_general_functions.js`, respectively.

## 6. Best Practices and Common Pitfalls

To avoid common runtime errors and ensure the application remains stable, follow these critical best practices when developing or modifying sections.

### 6.1. Always Check for Section Visibility in Event Handlers

- **Problem:** The `DATA_UPDATED` event is broadcast globally to all sections. If a section is hidden (`display: none`), its JavaScript event handler will still fire. Any attempt to access or modify DOM elements within the hidden section will result in a `TypeError` (e.g., "Cannot read properties of null").
- **Solution:** Add a guard clause at the very beginning of every `DATA_UPDATED` subscriber to check if the section is currently visible. Only proceed with UI updates if the section is visible.

**Example (in a section-specific JS file like `estimation_restrictions.js`):**
```javascript
window.SVARData.subscribe('DATA_UPDATED', (event) => {
    const section = document.getElementById('estimation-restrictions');

    // CRITICAL: Check for visibility before doing anything else.
    if (section.style.display === 'none' || !document.body.contains(section)) {
        return; // Do nothing if the section is not visible or detached from the DOM.
    }

    // ... proceed with updating plots and UI elements ...
});
```
This also applies to shared modules like `shared_controls.js` that operate within a section's context.

### 6.2. Write Robust Shared Modules with Null Checks

- **Problem:** A shared module like `shared_controls.js` is designed to work across multiple sections. However, not all sections will contain every single shared control. For example, the "Estimation" section does not have a "Sample Size" slider. Without checks, the code will throw a `TypeError` when it tries to access a `null` element.
- **Solution:** Inside shared modules, always perform a null check on a DOM element before attempting to read its properties or update it.

**Example (in `shared_controls.js`):**
```javascript
// Inside the DATA_UPDATED subscriber...

// Sync Sample Size (T)
// CRITICAL: Check if sampleSizeSlider exists before accessing its properties.
if (sampleSizeSlider && data.T && sampleSizeSlider.value !== String(data.T)) {
    sampleSizeSlider.value = data.T;
    if (sampleSizeValue) { // Also check for the value display span
        sampleSizeValue.textContent = data.T;
    }
}

// Sync Model Type (Recursive/Non-recursive)
if (phiSwitch && typeof data.isNonRecursive === 'boolean' && phiSwitch.checked !== data.isNonRecursive) {
    phiSwitch.checked = data.isNonRecursive;
    updateToggleVisual();
}
```

### 6.3. Ensure HTML and JavaScript are Synchronized

- **Problem:** A `TypeError` can occur if the JavaScript code attempts to access a DOM element by an ID that does not exist in the corresponding HTML file. This is often due to a typo or forgetting to add the element to the HTML.
- **Solution:** When writing JavaScript that interacts with a specific element, always double-check the HTML file to ensure the element exists and its `id` or `class` matches the selector in the JavaScript exactly.
