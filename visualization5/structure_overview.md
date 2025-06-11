# Project Refactoring Overview

## I. Current State & Goal

*   **Current Structure:** The project consists of several JavaScript files (`svar_setup.js`, `estimation_nongaussianity.js`, `estimation_restrictions.js`, etc.), each handling a specific visualization or part of the SVAR model. There is evidence of repeated utility functions (e.g., matrix operations, plot sizing) across these files. `shared-data.js` already exists as a central data store and event bus.
*   **Goal:** To consolidate shared logic into dedicated files (`shared-svar-functions.js`, `shared-general-functions.js`, `shared-data.js`, `shared-plots.js`), improving modularity, reducing redundancy, and making the codebase easier to maintain and understand.

## II. Proposed New File Structure

*   **`shared-data.js`**: Continues as the central hub for all shared time series data, model parameters, and the event bus.
*   **`shared-general-functions.js`**: Will contain generic utility functions not specific to SVAR models, such as matrix math, random number generation, and general UI helpers.
*   **`shared-svar-functions.js`**: Will contain functions specific to the SVAR model logic, such as shock generation, `B0` matrix calculations, and calculating reduced-form shocks.
*   **`shared-plots.js`**: Will contain reusable functions for creating and updating Plotly plots, including common layouts and trace configurations.

## III. Post-Refactor Role of Controller Files

*   **`svar_setup.js` (Controller):** Orchestrates the "SVAR Setup" page. It will use the new shared libraries for data generation, calculations, and plotting. It will retain its own UI event listeners and state management, interacting with `SVARData`.
*   **`estimation_nongaussianity.js` (Controller):** Orchestrates the "Non-Gaussianity Estimation" page. It will fetch data from `SVARData` and use the shared libraries for math, SVAR logic, and plotting. It will retain its unique objective function logic.
*   **`estimation_restrictions.js` (Controller):** Orchestrates the "Restrictions Estimation" page. Similar to the others, it will use shared libraries and `SVARData`, retaining its unique correlation curve calculation logic.
*   **`main.js`:** Will be responsible for initializing all sections and ensuring the shared libraries are loaded in the correct order.
