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
- **Event Source Tracking:** To prevent infinite loops, the origin of data updates is tracked and checked by subscribers.

## 3. Key Components & Their Roles

### 3.1. Central Data Store (`window.SVARData`)
- **Location:** `public/js/shared_data.js`
- **Purpose:** Holds all shared application state (e.g., sample size `T`, model type `isNonRecursive`, generated data series like `epsilon_1t`, `u_1t`, `B_0`). Also stores constants (e.g., `B0_RECURSIVE`, `B0_NON_RECURSIVE`).
- **Functionality:**
    - Provides methods for updating its internal data (e.g., `window.SVARData.updateData(newData, source)`).
    - Implements a publish/subscribe system for event notification.
    - `window.SVARData.subscribe(eventName, callback)`: Allows components to listen for specific events.
    - `window.SVARData.notifyUpdate(eventName, detail)`: Dispatches an event with associated data.
    - **Key Event:** `DATA_UPDATED` is dispatched when core simulation parameters or generated data series change.
        - **`event.detail`**: Contains the updated data bundle.
        - **`event.detail.source` (CRITICAL):** A string identifier indicating the origin of the data update (e.g., `'svar_setup_controls'`, `'estimation_restrictions_ui'`). This is essential for subscribers to ignore events they triggered.

### 3.2. Shared JavaScript Modules
- **Location:** `public/js/`
- **Namespacing:** All shared functions are namespaced under global objects (e.g., `window.SVARControls`, `window.SVARFunctions`) to prevent global scope pollution and organize code.

    - **`shared_controls.js` (`window.SVARControls`)**
        - **Manages:** Common UI controls (sliders, switches, buttons) across sections.
        - **`initializeControls(sectionId, controlSourceId)` function:**
            - Takes the ID of the parent HTML section and a unique `controlSourceId` string for this set of controls.
            - Finds control elements within that section using predefined, consistent CSS classes.
            - **UI Event Handling:** Attaches event listeners to these controls. When a user interacts with a control:
                - It typically calls a data generation/update function in `window.SVARFunctions` (e.g., `generateAndStoreSvarData`), **passing the `controlSourceId` as the `source` argument.**
            - **Data Subscription:** Subscribes to the `DATA_UPDATED` event from `window.SVARData`. When the central data changes:
                - **It MUST check `event.detail.source`**. If `event.detail.source === controlSourceId`, it should generally ignore the event to prevent self-triggered loops.
                - Updates the visual state of its managed controls if the event originated elsewhere.
                - **Null Checks:** Before accessing properties of DOM elements (e.g., `.value`, `.textContent`), it must perform null checks to prevent runtime errors if an element is unexpectedly missing.

    - **`shared_svar_functions.js` (`window.SVARFunctions`)**
        - **Contains:** Core SVAR-specific logic, data generation algorithms, and matrix calculations.
        - **Example: `generateAndStoreSvarData(T, isNonRecursive, source)`:**
            - Performs all necessary calculations.
            - Updates `window.SVARData` using `window.SVARData.updateData(allGeneratedData, source)`, propagating the `source` argument.

    - **`shared_plots.js` (`window.SVARPlots`)**
        - **Contains:** Functions for creating and updating Plotly.js visualizations.

    - **`shared_general_functions.js` (`window.SVARGeneral`)**
        - **Contains:** General-purpose utility functions.

### 3.3. Section-Specific Logic (e.g., `svar_setup.js`)
- **Location:** `public/js/section_name.js`
- **Purpose:** Handles unique behavior and initialization for a specific section.
- **Structure:**
    - Typically wrapped in an initialization function (e.g., `initSvarSetup(sectionId, sectionSourceId)`).
    - **Initialization Steps:**
        1. Define a unique `sectionSourceId` string for this section (e.g., `'svar_setup_section'`).
        2. Call `window.SVARControls.initializeControls(sectionId, sectionSourceId + '_controls')` (or a similar unique source for its controls).
        3. Subscribe to `DATA_UPDATED`: `window.SVARData.subscribe('DATA_UPDATED', (event) => { ... });`.
            - **CRITICAL:** Inside the subscriber, check `if (event.detail.source === sectionSourceId) return;` to prevent loops if this section itself triggered the update through other means (less common but possible).
            - Receives `event.detail`.
            - Calls plotting functions from `window.SVARPlots`.
            - **Null Checks:** Perform null checks for expected data in `event.detail` or for DOM elements before use.
        4. May trigger initial data generation, passing its `sectionSourceId`.
- **Role:** Orchestrates shared services, reacts to data changes, and manages its specific UI elements.

### 3.4. HTML Structure (Section Files)
- **Location:** `public/sections/section_name.html`
- **Control Element Classes:** Use consistent CSS classes for discovery by `shared_controls.js`. (See `style_guide_menu.md` for details on menu structure).
    - Ensure all interactive elements that might be targeted by JavaScript have unique and predictable IDs or robust class-based selectors.

### 3.5. Orchestration (`main.js`)
- **Location:** `public/js/main.js`
- **Purpose:** Manages application lifecycle, loads sections, initializes `window.SVARData`, and calls section-specific init functions.
    - **Error Handling:** Implement robust error handling for event subscriber callbacks to catch and log errors without breaking the entire event system.

## 4. Data Flow & Loop Prevention

1.  **User Interaction:** User interacts with a control in Section A (e.g., `sampleSizeSlider` in `svar_setup`).
2.  **Control Handler (`shared_controls.js` for `svar_setup`):**
    - Event listener triggers.
    - Calls `window.SVARFunctions.generateAndStoreSvarData(newSize, ..., 'svar_setup_controls')`. The `'svar_setup_controls'` is the `source`.
3.  **Data Generation (`shared_svar_functions.js`):**
    - Calculates new data.
    - Calls `window.SVARData.updateData(newDataBundle, 'svar_setup_controls')`.
4.  **Central Store Update & Event Dispatch (`window.SVARData`):**
    - Stores `newDataBundle`.
    - Dispatches `DATA_UPDATED` event with `event.detail = { ...newDataBundle, source: 'svar_setup_controls' }`.
5.  **Reactive Updates (Subscribers):**
    - **`shared_controls.js` (for `svar_setup` controls):**
        - Receives `DATA_UPDATED`.
        - Checks `event.detail.source`. It's `'svar_setup_controls'`, which matches its own `controlSourceId`.
        - **Action:** Ignores the event for its primary data update logic to prevent re-triggering. It might still update its visual state if necessary (e.g., slider position if the data was constrained by the model), but it won't re-call `generateAndStoreSvarData`.
    - **`shared_controls.js` (for other sections, e.g., `estimation_restrictions` controls):**
        - Receives `DATA_UPDATED`.
        - Checks `event.detail.source`. It's `'svar_setup_controls'`, which does *not* match its `controlSourceId` (e.g., `'er_controls'`).
        - **Action:** Updates its own control elements (e.g., sample size display) to reflect the new data.
    - **`svar_setup.js` (Section Logic for `svar_setup`):**
        - Receives `DATA_UPDATED`.
        - Checks `event.detail.source`. It's `'svar_setup_controls'`. This might or might not be its own `sectionSourceId`. If the section logic itself can trigger updates, it should also check against its own `sectionSourceId`.
        - **Action:** Updates plots using data from `event.detail`.
    - **`estimation_restrictions.js` (Section Logic for `estimation_restrictions`):**
        - Receives `DATA_UPDATED`.
        - Checks `event.detail.source`. It's `'svar_setup_controls'`, which does not match its `sectionSourceId` (e.g., `'er_section'`).
        - **Action:** Updates its plots and UI elements.

## 5. Adding a New Synchronized Section (Checklist)

1.  **Define Unique Source IDs:**
    - For the section itself (e.g., `const mySectionSourceId = 'my_new_section_logic';`).
    - For controls managed by `shared_controls.js` within this section (e.g., `const myControlsSourceId = 'my_new_section_controls';`).
2.  **Create HTML File (`public/sections/new_section_name.html`):**
    - Structure according to `style_guide_menu.md`.
    - Ensure all elements to be manipulated by JS have clear IDs or classes.
3.  **Create JavaScript File (`public/js/new_section_name.js`):**
    - Implement `initNewSectionName(sectionHtmlId, anyOtherParams)`.
    - Inside:
        - Call `window.SVARControls.initializeControls(sectionHtmlId, myControlsSourceId)`.
            - Ensure `shared_controls.js` correctly finds elements (e.g., by passing unique IDs from your HTML or relying on consistent class names within the `sectionHtmlId` scope).
            - **Verify `shared_controls.js` has null checks for all elements it tries to access.**
        - Subscribe to `DATA_UPDATED`:
          ```javascript
          window.SVARData.subscribe('DATA_UPDATED', (event) => {
              if (event.detail.source && event.detail.source.startsWith('my_new_section_')) { // Or more specific check
                  // console.log(`'${mySectionSourceId}' ignoring self-sourced event from: ${event.detail.source}`);
                  return;
              }
              // ... update plots and other UI specific to this section ...
              // Perform null checks on event.detail data and DOM elements.
          });
          ```
        - Trigger initial data load if needed, passing `mySectionSourceId` or `myControlsSourceId` as the source.
4.  **Update `main.js`:**
    - Load HTML, call `initNewSectionName()`.
5.  **Update `index.html`:** Add section placeholder and nav link.
6.  **Extend Shared Modules:** As needed.

## 6. Best Practices for Avoiding Errors

-   **Always Pass `source`:** Every call to `window.SVARData.updateData()` and consequently to functions like `generateAndStoreSvarData` **must** include a `source` argument.
-   **Always Check `source` in Subscribers:** Every `DATA_UPDATED` event subscriber **must** check `event.detail.source` and ignore events that originate from itself to prevent infinite loops.
-   **Null Check DOM Elements:** Before accessing properties like `.value`, `.textContent`, `.style`, or attaching event listeners to DOM elements queried from the document, **always** check if the element exists (i.g., `if (myElement) { ... }`). This is crucial if elements are dynamically added/removed or if selectors are incorrect.
-   **Null Check Data Properties:** Before using data from `event.detail` or other sources (e.g., `event.detail.data.value.toFixed(2)`), ensure the intermediate properties (`data`, `value`) exist and are of the expected type.
-   **Initialize Variables:** Ensure variables that will hold DOM elements or data are initialized (e.g., to `null` or an empty array) and that functions expecting them can handle these initial states.
-   **Defensive Programming:** Write code that anticipates potential issues like missing data or elements. Use `try...catch` blocks for operations that might fail, especially around external libraries or complex DOM manipulations.
-   **Clear Console Logs:** Use descriptive `console.log` messages during development to trace event flow and data changes, especially when debugging loops or unexpected behavior. Remove or conditionalize them for production.
-   **Incremental Development:** When adding new features or controls, test frequently to catch issues early.
