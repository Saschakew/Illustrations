# Refactoring Plan for Existing Files

This document outlines which functions from the existing controller files (`svar_setup.js`, `estimation_nongaussianity.js`, `estimation_restrictions.js`) should be moved to the new shared libraries.

## A. `svar_setup.js`

*   **Current Responsibilities:** Initial data generation, `B0` and reduced-form shock calculation, plotting, and UI event handling for the main simulation.
*   **Functions to Move:**
    *   **To `shared-general-functions.js`:**
        *   `normalRandom()`
        *   `NormalizeData()` (to become `normalizeTwoSeries`)
        *   `getSquareSize()`
        *   `updateToggleVisual()` (to be generalized)
    *   **To `shared-svar-functions.js`:**
        *   `generateSingleNormalSeries()` (to become `generateEtaRawSeries`)
        *   `generateMixedNormalData()` (to be integrated into `generateEtaRawSeries`)
        *   `getB0Matrix()` (The logic here is simple selection; will be replaced by calls to `getB0Recursive` and `getB0NonRecursive`)
        *   `generateSigmaT()`
        *   `calculateReducedFormAndB0()` (The core logic will be split into `calculateEpsilonShocks` and `calculateReducedForm`)
    *   **To `shared-plots.js`:**
        *   `updatePlot()` (The logic will be generalized or used to create specific functions like `plotInnovations`)
*   **Remaining in `svar_setup.js` (Controller Role):**
    *   `initSvarSetup()`: The main initializer.
    *   `generateAndPlot()`: The high-level orchestrator function that calls the new shared functions.
    *   Event listeners for `sampleSizeSlider`, `newSampleBtn`, and `phiSwitch`.
    *   `setupSwitchSync()`: Logic to synchronize its state with `SVARData`.

## B. `estimation_nongaussianity.js`

*   **Current Responsibilities:** Estimates `phi` by minimizing a non-gaussianity objective function.
*   **Functions to Move:**
    *   **To `shared-general-functions.js`:**
        *   `matinv()`, `matmul()`, `cholesky()`, `transpose()`
        *   `formatMatrix()` (to become `matrixToLatex`)
        *   `getSquareSize()`
    *   **To `shared-svar-functions.js`:**
        *   `calculateTruePhi()` (to become `calculateTruePhiFromB0`)
    *   **To `shared-plots.js`:**
        *   `updatePlotsAndUI()` (to be refactored to use shared plotting functions)
*   **Remaining in `estimation_nongaussianity.js` (Controller Role):**
    *   `initEstimationNonGaussianity()`: Section initializer.
    *   `calculateObjectiveCurve()`: The core estimation logic unique to this method.
    *   UI event listeners for its `phiSlider` and `estimateBtn`.
    *   `handleDataUpdate()`: The handler for reacting to global `SVARData` changes.

## C. `estimation_restrictions.js`

*   **Current Responsibilities:** Estimates `phi` based on identifying restrictions (e.g., correlation).
*   **Functions to Move:**
    *   **To `shared-general-functions.js`:**
        *   `matinv()`, `matmul()`, `cholesky()`, `transpose()` (will be a single shared version)
        *   `matrixToLatex()` (will be a single shared version)
        *   `getSquareSize()`
    *   **To `shared-svar-functions.js`:**
        *   `calculateB()` (to become `calculateBFromCholeskyAndPhi`)
        *   `calculateTruePhi()` (will use the single shared version)
    *   **To `shared-plots.js`:**
        *   `updatePlotsAndUI()` (to be refactored to use shared plotting functions)
*   **Remaining in `estimation_restrictions.js` (Controller Role):**
    *   `initEstimationRestrictions()`: Section initializer.
    *   `generateAndProcessData()`: The core logic for calculating the correlation curve.
    *   UI event listeners and its own `updateToggleVisual()` and `setupSwitchSync()`.
