# Generating Reduced-Form Shocks (u_t) from Structural Shocks (ε_t) and Sample Size (T)

This document outlines the precise step-by-step process of how the reduced-form shocks, denoted as \(u_t = [u_{1t}, u_{2t}]'\), are generated in the SVAR model. This process relies on the sample size `T` (to generate \(\epsilon_t\)), the generated structural shocks \(\epsilon_t\), and the contemporaneous structural matrix \(B_0\).

The primary function orchestrating the overall data generation, including \(u_t\), is `window.SVARFunctions.generateAndStoreSvarData(T, isNonRecursive)`.

## Overall Process within `SVARFunctions.generateAndStoreSvarData(T, isNonRecursive)`:

1.  **Generate Structural Shocks (ε<sub>t</sub>)**: First, the structural shocks \(\epsilon_{1t}\) and \(\epsilon_{2t}\) are generated based on the sample size `T`. This process is detailed in the `generate_eps.md` guide.
    ```javascript
    // Called within generateAndStoreSvarData
    const { epsilon_1t, epsilon_2t } = this.generateEpsilon(T);
    ```
    *(See `generate_eps.md` for the implementation of `generateEpsilon(T)`)*

2.  **Determine the Structural Matrix (B<sub>0</sub>)**: The \(B_0\) matrix is selected based on whether the model is specified as recursive or non-recursive. This selection is handled by `window.SVARFunctions.getB0(isNonRecursive)`.
    ```javascript
    // Definition in public/js/shared_svar_functions.js
    window.SVARFunctions.getB0 = function(isNonRecursive) {
        return isNonRecursive ? window.SVARData.B0_NON_RECURSIVE : window.SVARData.B0_RECURSIVE;
    };
    ```
    The actual matrix values are defined in `public/js/shared-data.js`:
    ```javascript
    // Defined in public/js/shared-data.js
    window.SVARData = {
        // ... other properties
        B0_RECURSIVE: [[1, 0], [0.5, 1]],
        B0_NON_RECURSIVE: [[1, 0.5], [0.5, 1]],
        // ... other properties
    };
    ```
    So, `getB0` returns either `[[1, 0], [0.5, 1]]` for a recursive model or `[[1, 0.5], [0.5, 1]]` for a non-recursive model.

3.  **Calculate Reduced-Form Shocks (u<sub>t</sub>)**: The reduced-form shocks \(u_t\) are then calculated from \(B_0\) and \(\epsilon_t\) using the relationship \(u_t = B_0 \epsilon_t\). This is implemented in `window.SVARFunctions.generateU(B_0, epsilon_1t, epsilon_2t)`.
    ```javascript
    // Definition in public/js/shared_svar_functions.js
    window.SVARFunctions.generateU = function(B_0, epsilon_1t, epsilon_2t) {
        const T = epsilon_1t.length;
        const u_1t = new Array(T);
        const u_2t = new Array(T);

        for (let i = 0; i < T; i++) {
            // u_1t = B_0[0][0] * ε_1t + B_0[0][1] * ε_2t
            u_1t[i] = B_0[0][0] * epsilon_1t[i] + B_0[0][1] * epsilon_2t[i];
            // u_2t = B_0[1][0] * ε_1t + B_0[1][1] * ε_2t
            u_2t[i] = B_0[1][0] * epsilon_1t[i] + B_0[1][1] * epsilon_2t[i];
        }
        return { u_1t, u_2t };
    };
    ```
    This function iterates through each time point `t` from `0` to `T-1` and computes:
    *   \(u_{1t} = B_0[0][0] \cdot \epsilon_{1t} + B_0[0][1] \cdot \epsilon_{2t}\)
    *   \(u_{2t} = B_0[1][0] \cdot \epsilon_{1t} + B_0[1][1] \cdot \epsilon_{2t}\)

## Summary of Inputs and Outputs:

*   **Inputs**:
    *   `T`: Sample size (integer), used to determine the length of the shock series.
    *   `isNonRecursive`: Boolean flag (true/false) to select the \(B_0\) matrix.
*   **Intermediate Steps**:
    *   Generation of \(\epsilon_{1t}, \epsilon_{2t}\) (arrays of length `T`).
    *   Selection of \(B_0\) (2x2 matrix).
*   **Outputs (from `generateU`)**:
    *   `u_1t`: Array of length `T` representing the first reduced-form shock series.
    *   `u_2t`: Array of length `T` representing the second reduced-form shock series.

This guide provides a comprehensive overview of how \(u_t\) is derived within the SVAR model's JavaScript implementation.
