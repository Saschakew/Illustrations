# Full SVAR Data Pipeline Overview

This document outlines the complete data generation and transformation pipeline within the SVAR visualizer, from the initial generation of structural shocks to the final computation of estimated structural innovations. The pipeline is designed to be reactive, meaning that changes to upstream parameters or data will automatically trigger recalculations downstream.

## Data Flow and Key Components

The pipeline proceeds in the following sequence:

1.  **Structural Shocks (\(\epsilon_t\))**:
    *   **Purpose**: Generate the underlying, unobserved structural shocks.
    *   **Generation**: `SVARCoreFunctions.generateEpsilon(T)` using `sharedData.T` (sample size).
        *   Involves generating raw N(0,1) shocks, applying time-varying volatility (\(\sigma_t\)), and then normalizing to mean 0, std dev 1.
    *   **Storage**: `sharedData.epsilon_1t`, `sharedData.epsilon_2t`.
    *   **Reactive Update**: Triggered by changes in `T` (sample size slider) or 'New Data' button.
    *   **Orchestration**: `regenerateSvarData()` in `main.js`.

2.  **Structural Matrix for DGP (\(B_0\))**:
    *   **Purpose**: Defines the true underlying structural relationships in the Data Generating Process (DGP).
    *   **Selection**: Based on `sharedData.isRecursive` (mode switch: Recursive/Non-Recursive).
        *   Recursive: `[[1, 0], [0.5, 1]]`
        *   Non-Recursive: `[[1, 0.5], [0.5, 1]]`
    *   **Storage**: `sharedData.B0`.
    *   **Reactive Update**: Triggered by the mode switch.
    *   **Orchestration**: `sharedData.updateB0Mode()` which is called by `initializeModeSwitches` in `shared_controls.js`.

3.  **Reduced-Form Shocks (\(u_t\))**:
    *   **Purpose**: Generate the observed reduced-form shocks using \(u_t = B_0 \epsilon_t\).
    *   **Generation**: `SVARCoreFunctions.generateU(B0, epsilon_1t, epsilon_2t)` using `sharedData.B0`, `sharedData.epsilon_1t`, `sharedData.epsilon_2t`.
    *   **Storage**: `sharedData.u_1t`, `sharedData.u_2t`.
    *   **Reactive Update**: Triggered by changes in \(\epsilon_t\) (via `regenerateSvarData`) or changes in `B0` (via `regenerateReducedFormShocksFromExistingEpsilon` in `main.js`).
    *   **Orchestration**: `regenerateSvarData()` or `regenerateReducedFormShocksFromExistingEpsilon()`.

4.  **True DGP Rotation Angle (\(\phi_0\))**:
    *   **Purpose**: Calculate the intrinsic rotation angle \(\phi_0\) embedded in the true `B0` matrix. This angle is a fundamental characteristic of the chosen Data Generating Process (DGP), representing the rotation applied to a lower-triangular matrix \(P_{\text{true}}\) (derived from the Cholesky decomposition of \(B_0 B_0'\)) to obtain \(B_0\). Thus, \(B_0 = R(\phi_0) P_{\text{true}}\). Understanding \(\phi_0\) helps in interpreting the nature of the "true" structural identification. It is independent of the sample data and only changes if the definition of `B0` itself changes (e.g., switching between recursive and non-recursive forms).
    *   **Calculation**: `SVARMathUtil.calculatePhi0(B0)` using `sharedData.B0`.
        *   Steps: Compute \(B_0 B_0'\), Cholesky decompose to get \(P_{\text{true}}\), invert \(P_{\text{true}}\), compute \(R_{\text{cand}} = B_0 P_{\text{true}}^{-1}\), then \(\phi_0 = \text{atan2}(R_{\text{cand}}[1][0], R_{\text{cand}}[0][0])\).
    *   **Storage**: `sharedData.phi_0` (in radians).
    *   **Reactive Update**: Triggered by changes in `B0`.
    *   **Orchestration**: `regeneratePhi0()` in `main.js`, which is called on `B0` update (via `sharedData.updateB0Mode()`) and during `initializeApp()`.

5.  **Estimation Angle (\(\phi\))**:
    *   **Purpose**: User-selected angle for identifying the structural model from the data.
    *   **Source**: UI slider (`phi-slider`).
    *   **Storage**: `sharedData.phi` (in radians).
    *   **Reactive Update**: Triggered by user interaction with the \(\phi\) slider.
    *   **Orchestration**: `initializePhiSliders` in `shared_controls.js` updates `sharedData.phi`.

6.  **Estimated Identification Matrix (\(B(\phi)\))**:
    *   **Purpose**: Construct the candidate structural matrix \(B(\phi) = P \cdot R(\phi)\) based on the data (via \(P\)) and the user's estimation angle (via \(R(\phi)\)).
    *   **Generation**: `SVARCoreFunctions.generateBPhi(phi, u1_t, u2_t)` using `sharedData.phi`, `sharedData.u_1t`, `sharedData.u_2t`.
        *   Steps: Calculate covariance of \(u_t\) (\(\Sigma_u\)), Cholesky decompose \(\Sigma_u\) to get \(P\), generate rotation matrix \(R(\phi)\) from `sharedData.phi`, then multiply \(P \cdot R(\phi)\).
    *   **Storage**: `sharedData.B_phi` (a 2x2 matrix).
    *   **Reactive Update**: Triggered by changes in `sharedData.phi` or `sharedData.u_1t`/`sharedData.u_2t`.
    *   **Orchestration**: `regenerateBPhi()` in `main.js`.

7.  **Estimated Structural Innovations (\(e_t\))**:
    *   **Purpose**: Calculate the estimated structural innovations using \(e_t = B(\phi)^{-1} u_t\).
    *   **Generation**: `SVARCoreFunctions.generateInnovations(B_phi, u1_t, u2_t)` using `sharedData.B_phi`, `sharedData.u_1t`, `sharedData.u_2t`.
        *   Involves inverting `sharedData.B_phi` and then multiplying by each \(u_t\) vector.
    *   **Storage**: `sharedData.e_1t`, `sharedData.e_2t`.
    *   **Reactive Update**: Triggered by changes in `sharedData.B_phi` or `sharedData.u_1t`/`sharedData.u_2t`.
    *   **Orchestration**: `regenerateInnovations()` in `main.js`.

## Key JavaScript Files Involved

*   `public/js/shared_data.js`: Central state management.
*   `public/js/svar_math_util.js`: Low-level mathematical operations (matrix algebra, Cholesky, etc.).
*   `public/js/svar_functions.js`: Core SVAR-specific generation functions (for \(\epsilon_t, u_t, B(\phi), e_t\)).
*   `public/js/main.js`: Orchestration of the reactive data pipeline (`regenerateSvarData`, `regenerateReducedFormShocksFromExistingEpsilon`, `regeneratePhi0`, `regenerateBPhi`, `regenerateInnovations`, `initializeApp`).
*   `public/js/shared_controls.js`: UI control initialization and event handlers that trigger pipeline updates.
*   `public/js/debug_manager.js`: For categorized logging throughout the pipeline.

---

# SVAR Data Pipeline: From Menu Parameters to Epsilon_t (Original Content - Review for Integration/Removal)

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
