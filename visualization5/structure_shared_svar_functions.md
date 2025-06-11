# Proposed Structure: `shared-svar-functions.js`

This file will consolidate functions that are specific to the Structural Vector Autoregression (SVAR) logic.

```javascript
window.SharedSVAR = {
    // ===================================
    // Shock & Data Generation
    // Follows the pipeline: η_raw -> unnormalized_scaled_shocks (η_raw * σ_t) -> ε (normalized)
    // ===================================
    /**
     * Generates a series of raw, unscaled shocks (η_raw).
     * @param {number} size - The length of the series (T).
     * @param {'normal' | 'mixed'} [type='normal'] - The type of distribution to draw from.
     * @param {object} [mixedParams={s: 2}] - Parameters for the mixed distribution.
     * @returns {number[]} The generated series of raw shocks.
     */
    generateEtaRawSeries: function(size, type = 'normal', mixedParams = {s: 2}) { /* ... */ },

    /**
     * Generates the time-varying volatility process (σ_t).
     * @param {number} size - The length of the series (T).
     * @param {number} [val1=1] - The volatility value for the first regime.
     * @param {number} [val2=2] - The volatility value for the second regime.
     * @returns {number[]} The sigma_t series.
     */
    generateSigmaT: function(size, val1 = 1, val2 = 2) { /* ... */ },

    /**
     * Calculates the final, normalized structural shocks (ε_t).
     * This involves scaling the raw shocks (η_raw) by volatility (σ_t) and then normalizing the result.
     * @param {number[]} eta_raw_1 - The first series of raw shocks.
     * @param {number[]} eta_raw_2 - The second series of raw shocks.
     * @param {number[]} sigma_t_values - The time-varying volatility series.
     * @returns {{epsilon_1t: number[], epsilon_2t: number[]}} The final structural shocks.
     */
    calculateEpsilonShocks: function(eta_raw_1, eta_raw_2, sigma_t_values) {
        // 1. Scale: unnormalized_scaled_1 = eta_raw_1 * sigma_t_values
        // 2. Normalize: epsilon_1 = SharedGeneral.normalizeSeries(unnormalized_scaled_1).normalizedSeries
        // Returns { epsilon_1t, epsilon_2t }
    },

    // ===================================
    // SVAR Model Calculations
    // ===================================
    /**
     * Returns a 2x2 rotation matrix (Q) for a given angle phi.
     * @param {number} phi - The rotation angle in radians.
     * @returns {number[][]} The rotation matrix [[cos(phi), -sin(phi)], [sin(phi), cos(phi)]].
     */
    getB0MatrixFromPhi: function(phi) { /* ... */ },

    /**
     * Returns the hardcoded recursive B0 matrix.
     * @returns {number[][]} The matrix [[1, 0], [0.5, 1]].
     */
    getB0Recursive: function() { return [[1, 0], [0.5, 1]]; },

    /**
     * Returns the hardcoded non-recursive B0 matrix.
     * @returns {number[][]} The matrix [[1, 0.5], [0.5, 1]].
     */
    getB0NonRecursive: function() { return [[1, 0.5], [0.5, 1]]; },

    /**
     * Calculates the reduced-form shocks (u_t) from the structural shocks (ε_t) and a B0 matrix.
     * u_t = B0 * ε_t
     * @param {number[]} epsilon_1t - The first structural shock series.
     * @param {number[]} epsilon_2t - The second structural shock series.
     * @param {number[][]} B0_matrix - The structural matrix.
     * @returns {{u_1t: number[], u_2t: number[]}} The reduced-form shocks.
     */
    calculateReducedForm: function(epsilon_1t, epsilon_2t, B0_matrix) { /* ... */ },

    // ===================================
    // Estimation-Related Functions
    // ===================================
    /**
     * Calculates the theoretical "true" phi angle from a given B0 matrix.
     * Requires the Cholesky decomposition of the population covariance matrix.
     * Q_true = (B_chol_pop)^-1 * B0
     * phi_true = atan2(Q_true[1][0], Q_true[0][0])
     * @param {number[][]} B0_matrix - The true structural matrix.
     * @returns {number | null} The theoretical phi angle or null on failure.
     */
    calculateTruePhiFromB0: function(B0_matrix) { /* ... */ },

    /**
     * Calculates a structural matrix B from a Cholesky factor and a rotation angle phi.
     * B(phi) = B_chol * Q(phi)
     * @param {number[][]} choleskyFactor - The Cholesky factor of the covariance matrix.
     * @param {number} phi - The rotation angle in radians.
     * @returns {number[][]} The calculated B matrix.
     */
    calculateBFromCholeskyAndPhi: function(choleskyFactor, phi) { /* ... */ }
};
```
