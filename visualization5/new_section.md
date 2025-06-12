# Guide for Standardized JavaScript Section Initialization

This guide outlines a consistent pattern for initializing JavaScript modules that control distinct sections of your SVAR visualization.

## Core Principles:

1.  **Unified Entry Point:** Each section has a single initialization function (e.g., `initMySection()`).
2.  **Namespace:** All section initializers are grouped under a global namespace (e.g., `window.SVARSections`).
3.  **Dependency Checks:** Robustly check for essential HTML elements and libraries (like Plotly) before proceeding. Retry initialization if dependencies are not met.
4.  **Scoped DOM Management:** Cache references to DOM elements specific to the section, typically queried from a root `sectionElement`.
5.  **Local State (`state`):** Maintain a minimal `state` object. This state holds data directly needed by the section's UI and is primarily populated by subscriptions to global data events.
6.  **Reactive UI Updates (`updateUI`):** A central `updateUI()` function within the section redraws its content based on its current local `state`. This function should be idempotent and focus on rendering.
7.  **Global Data Subscriptions:** Sections subscribe to relevant global events from `SVARData.js` (e.g., `DATA_UPDATED`, `PHI_ESTIMATION_UPDATED`, and potentially new ones for calculated metrics like `ESTIMATION_METRICS_UPDATED`, `ESTIMATED_SHOCKS_UPDATED`).
8.  **Centralized Control Logic (`SVARControls.js`):** Shared UI controls (like global sliders, buttons that trigger global data generation, or mode switches affecting multiple sections) are managed by `SVARControls.js`. The section's init function informs `SVARControls` to activate for its `sectionId`.
9.  **Delegated Calculations (`SVARData.js` / `SVARFunctions.js` / `SVARCore.js`):** Complex data processing or calculations should ideally occur in a central logic module. `SVARData.js` can orchestrate these calculations (often using functions from `SVARFunctions.js` or a dedicated `SVARCore.js`) and then publish the results via new global events. The section then subscribes to these pre-calculated results.
10. **Clear Initialization Sequence:** A well-defined order for setting up subscriptions, initializing controls, fetching initial state (if applicable), and performing the initial UI rendering.
11. **Section-Specific Actions:** Event listeners for interactive elements *unique* to the section and not managed by `SVARControls.js` (e.g., a button that triggers a calculation specific to that section's display, like the "Estimate" button in `estimation_restrictions.js`) are set up within the section's init function. These handlers typically call methods on `SVARData` to update global state or trigger new calculations.

## Step-by-Step Implementation for a New Section (`section_name.js`):

1.  **File & Namespace Setup:**
    *   Create `public/js/section_name.js`.
    *   Ensure the global namespace exists: `window.SVARSections = window.SVARSections || {};`
    *   Define the section's main initialization function: `window.SVARSections.initSectionName = function() { /* ... */ };`

2.  **Configuration & Pre-flight Checks (Inside `initSectionName`):**
    *   Define `const sectionId = 'html-id-of-section-container';` (This should match the ID of the section's main div in the HTML).
    *   Get the section's root element: `const sectionElement = document.getElementById(sectionId);`
    *   Check for essential dependencies:
        ```javascript
        if (typeof Plotly === 'undefined' || !sectionElement /* || !document.getElementById('critical-element-for-this-section') */) {
            console.warn(`[${sectionId}.js] Dependencies not ready. Retrying init...`);
            setTimeout(() => window.SVARSections.initSectionName(), 100); // Retry
            return;
        }
        console.log(`[${sectionId}.js] Initializing section...`);
        ```

3.  **DOM Element References:**
    *   Cache references to DOM elements this section will interact with directly.
        ```javascript
        const elements = {
            // plotContainer: sectionElement.querySelector('#plot-container-for-section'),
            // valueDisplay: sectionElement.querySelector('.value-display-for-section'),
            // ... other elements unique to this section
        };
        ```

4.  **Local State Management (`state`):**
    *   Initialize a `state` object. It will hold data received from global events, necessary for this section's UI.
        ```javascript
        const state = {
            // dataForPlot1: null,
            // calculatedValueForDisplay: 0,
            // uiFlags: { isPlotInitialized: false },
            // ... other state variables needed by this section
        };
        ```

5.  **Core UI Update Function (`updateUI`):**
    *   Define `function updateUI() { /* ... */ }`.
    *   This function reads from the local `state` and updates the DOM using the cached `elements`.
    *   It calls plotting functions (e.g., `window.SVARPlots.updateSpecificPlotForSection(...)`) or utility functions for rendering.
    *   It should be focused on rendering the current state, not on calculations.

6.  **Global Event Handlers:**
    *   Define handler functions for each global event the section needs to react to (e.g., `handleDataUpdated(eventDetail)`, `handlePhiEstimationUpdated(eventDetail)`).
    *   These handlers will:
        *   Update the local `state` with relevant data from `eventDetail`.
        *   Call `updateUI()` to refresh the section's display.
        ```javascript
        // function handleSomeGlobalEvent(eventDetail) {
        //     console.log(`[${sectionId}.js] Received SOME_GLOBAL_EVENT:`, eventDetail);
        //     state.relevantData = eventDetail.data;
        //     updateUI();
        // }
        ```

7.  **Initialization Sequence (Order is important):**
    *   **A. Subscribe to Global Events:**
        ```javascript
        if (window.SVARData && typeof window.SVARData.subscribe === 'function') {
            // window.SVARData.subscribe('DATA_UPDATED', handleDataUpdated);
            // window.SVARData.subscribe('PHI_ESTIMATION_UPDATED', handlePhiEstimationUpdated);
            // ... subscribe to other global events as needed.
        } else {
            console.error(`[${sectionId}.js] SVARData.subscribe is not available.`);
        }
        ```
    *   **B. Initialize Shared Controls (via `SVARControls.js`):**
        ```javascript
        if (window.SVARControls && typeof window.SVARControls.initializeControls === 'function') {
            window.SVARControls.initializeControls(sectionId);
        } else {
            console.error(`[${sectionId}.js] SVARControls.initializeControls is not available.`);
        }
        ```
    *   **C. Initialize Sticky Menu (if applicable for this section's controls):**
        ```javascript
        // if (typeof initializeStickyMenu === 'function') {
        //    initializeStickyMenu(sectionId, 'id-of-controls-div-in-section', 'id-of-placeholder-for-sticky');
        // }
        ```
    *   **D. Fetch Initial Global State (Optional but often useful):**
        *   Populate parts of the local `state` with current values from `SVARData` if available and needed for the initial render.
            ```javascript
            // if (window.SVARData && typeof window.SVARData.getPhiEstimation === 'function') {
            //     state.phi_estimation_global = window.SVARData.getPhiEstimation();
            // }
            ```
    *   **E. Initial UI Draw:**
        ```javascript
        console.log(`[${sectionId}.js] Performing initial UI draw.`);
        updateUI();
        ```
    *   **F. Window Resize Listener (for responsive plots/UI):**
        ```javascript
        window.addEventListener('resize', () => {
            // Only redraw if necessary data exists to prevent errors
            // if (state.dataForPlot1) { // Example check
            //    console.log(`[${sectionId}.js] Window resized. Re-rendering UI.`);
            //    updateUI(); // Or call specific plot update functions
            // }
        });
        ```

8.  **Section-Specific Event Listeners & Action Handlers:**
    *   If the section has interactive elements (buttons, clickable areas) that are *not* global controls managed by `SVARControls.js` but trigger actions specific to this section or update global state:
        *   Set up their event listeners here.
        *   These handlers might call methods on `SVARData` (e.g., `SVARData.setPhiEstimation(...)`, `SVARData.requestNewSample(...)`) or trigger section-specific logic.
        ```javascript
        // if (elements.sectionSpecificButton) {
        //     elements.sectionSpecificButton.addEventListener('click', handleSectionSpecificAction);
        // }
        // function handleSectionSpecificAction() {
        //     // ... logic ...
        //     // window.SVARData.setSomeGlobalValue(...);
        // }
        ```

9.  **Final Log:**
    ```javascript
    console.log(`[${sectionId}.js] Section initialized successfully.`);
    ```

## Calling the Initializer:

Typically, in your main application script (e.g., `main.js` or `app.js`), you would call the initialization function for each section after the DOM is loaded:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    // Initialize common services first
    if (window.SVARData) window.SVARData.initialize(); // If SVARData has its own init
    if (window.SVARControls) window.SVARControls.initializeBase(); // If SVARControls has a base init

    // Initialize all sections
    if (window.SVARSections && window.SVARSections.initSvarSetup) {
        window.SVARSections.initSvarSetup();
    }
    if (window.SVARSections && window.SVARSections.initEstimationRestrictions) {
        window.SVARSections.initEstimationRestrictions();
    }
    // ... call init for other sections
});
```
This guide provides a template for creating well-structured, maintainable, and consistent JavaScript modules for different parts of your visualization.