# SVAR Data Pipeline: From Menu Parameters to Epsilon_t

This document outlines the pipeline for generating the structural shock series, \\(\\epsilon_t = (\\epsilon_{1t}, \\epsilon_{2t})\\), using parameters from the UI menus (stored in `shared_data.js`) and the core generation functions (in `svar_functions.js`).

## Objective

To dynamically generate and update the structural shock series \\(\\epsilon_t\\) based on user-selected parameters from the application's menus, ensuring that any visualisations or subsequent calculations always use the latest data.

## Core Components Involved

1.  **`public/js/shared_data.js`**:
    *   Acts as the central repository for all shared parameters and generated data.
    *   **Input Parameters (from Menus):**
        *   `sharedData.T`: Sample size for the time series.
        *   (Potentially others in the future, like distribution type, heteroskedasticity parameters, etc., though `generateEpsilon` currently hardcodes \\(\\sigma_t\\) behavior).
    *   **Output Data (to be stored here):**
        *   `sharedData.epsilon_1t`: Array of numbers representing the first structural shock series.
        *   `sharedData.epsilon_2t`: Array of numbers representing the second structural shock series.

2.  **`public/js/svar_functions.js` (`window.SVARCoreFunctions`)**:
    *   Contains the core logic for generating SVAR data.
    *   **Key Function:** `window.SVARCoreFunctions.generateEpsilon(T)`: Takes the sample size `T` as input and returns an object `{ epsilon_1t: [...], epsilon_2t: [...] }`.

3.  **`public/js/main.js` (or a new dedicated data manager module)**:
    *   Will house the orchestration logic to trigger data generation and updates.

4.  **`public/js/shared_controls.js`**:
    *   Event handlers in this file that modify parameters in `sharedData` (e.g., when a slider for `T` is changed) will need to trigger the data regeneration process.

## Data Generation and Storage Process

1.  **Initialization**:
    *   When the application initializes (e.g., in `initializeApp` in `main.js`), a primary data generation function will be called.
    *   This function will:
        *   Read the current sample size `T` from `sharedData.T`.
        *   Call `const { epsilon_1t, epsilon_2t } = window.SVARCoreFunctions.generateEpsilon(sharedData.T);`.
        *   Store the returned series:
            ```javascript
            sharedData.epsilon_1t = epsilon_1t;
            sharedData.epsilon_2t = epsilon_2t;
            DebugManager.log('SVAR_DATA_PIPELINE', 'Initial epsilon_t series generated and stored in sharedData.');
            ```

2.  **Reactive Updates**:
    *   A new function, let's call it `regenerateSvarData()`, will be created. This function will encapsulate the logic described in "Initialization Step 1".
    *   Whenever a UI control (e.g., a slider for sample size `T`) modifies a relevant parameter in `sharedData`, its event handler in `shared_controls.js` (or similar) must call `regenerateSvarData()`.
    *   Example (conceptual, in an event handler in `shared_controls.js`):
        ```javascript
        // Inside a T-slider change handler:
        sharedData.T = newTValue;
        // ... any other updates related to T ...
        window.DataPipelineManager.regenerateSvarData(); // Assuming we create a DataPipelineManager
        ```
    *   `regenerateSvarData()` will then re-fetch `sharedData.T`, call `generateEpsilon`, and update `sharedData.epsilon_1t` and `sharedData.epsilon_2t`.
    *   This ensures that any component or plot relying on `sharedData.epsilon_1t` or `sharedData.epsilon_2t` will automatically use the fresh data after a parameter change.

## Next Steps for Implementation

1.  **Modify `shared_data.js`**:
    *   Add `epsilon_1t: []` and `epsilon_2t: []` to the `sharedData` object as initial empty arrays.

2.  **Create `regenerateSvarData()` function**:
    *   This function could reside in `main.js` initially, or in a new, more dedicated module like `public/js/svar_data_manager.js` if complexity grows.
    *   It will perform the steps: read `T` from `sharedData`, call `generateEpsilon`, store results in `sharedData`.

3.  **Initial Call**:
    *   Call `regenerateSvarData()` once during `initializeApp` in `main.js` after all initial `sharedData` parameters are set.

4.  **Integrate with Controls**:
    *   Identify all UI controls in `shared_controls.js` (and potentially section-specific JS files) that affect parameters used by `generateEpsilon` (currently just `T`).
    *   Modify their event handlers to call `regenerateSvarData()` after updating `sharedData`.

5.  **Debugging Category**:
    *   Add a `DebugManager` category, e.g., `SVAR_DATA_PIPELINE`, for logging messages related to this data flow.

This pipeline ensures a clear and reactive flow for generating the fundamental \\(\\epsilon_t\\) shocks based on user inputs.
