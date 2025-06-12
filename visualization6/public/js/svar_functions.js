// public/js/svar_functions.js

// Ensure SVARGeneralUtil is available
if (typeof window.SVARGeneralUtil === 'undefined') {
    console.error("SVARGeneralUtil is not loaded. Ensure svar_general_functions.js is loaded before svar_functions.js.");
    window.SVARGeneralUtil = { // Fallback to prevent errors, though functionality will be missing
        generateSingleNormalSeries: () => [],
        normalizeTwoSeriesForMeanAndStdDev: (s1, s2) => ({ normalizedSeries1: s1, normalizedSeries2: s2 }),
        calculateMean: () => 0,
        calculateStdDev: () => 1
    };
}

// Ensure DebugManager is available
if (typeof window.DebugManager === 'undefined') {
    console.warn("DebugManager is not loaded. Debug logs from SVARCoreFunctions will not be displayed.");
    window.DebugManager = { // Fallback to prevent errors
        log: () => {},
        setCategory: () => {}
    };
}


window.SVARCoreFunctions = {
    /**
     * Generates sigma_t values for heteroskedasticity.
     * For the first T/2 observations, sigma_t = 1.
     * For the next T/2 observations, sigma_t = 2.
     * @param {number} T - The total number of observations.
     * @returns {number[]} An array of sigma_t values.
     */
    generateSigmaT: function(T) {
        const sigma_t_values = [];
        const midpoint = Math.floor(T / 2);
        for (let i = 0; i < T; i++) {
            if (i < midpoint) {
                sigma_t_values.push(1);
            } else {
                sigma_t_values.push(2);
            }
        }
        DebugManager.log('SVAR_SETUP', `Generated sigma_t_values for T=${T}: First ${midpoint} are 1, next ${T-midpoint} are 2.`);
        return sigma_t_values;
    },

    /**
     * Generates structural shocks epsilon_t = (epsilon_1t, epsilon_2t).
     * Steps:
     * 1. Generate raw standard normal shocks (eta_raw_t).
     * 2. Generate sigma_t values for heteroskedasticity.
     * 3. Create un-normalized structural shocks (eta_raw_t * sigma_t).
     * 4. Normalize these shocks to have mean 0 and std dev 1 (final epsilon_t).
     * @param {number} T - The total number of observations (sample size).
     * @returns {{epsilon_1t: number[], epsilon_2t: number[]}} An object containing the two series of structural shocks.
     */
    generateEpsilon: function(T) {
        DebugManager.log('SVAR_SETUP', `Generating epsilon for T=${T}`);

        // Step 1: Generate raw standard normal shocks (η_raw_t)
        const eta_raw_1t = window.SVARGeneralUtil.generateSingleNormalSeries(T);
        const eta_raw_2t = window.SVARGeneralUtil.generateSingleNormalSeries(T);
        DebugManager.log('SVAR_SETUP', `Generated raw eta_1t (length ${eta_raw_1t.length}) and eta_2t (length ${eta_raw_2t.length})`);

        // Step 2: Generate the sigma values for heteroskedasticity
        const sigma_t_values = this.generateSigmaT(T); // Calls SVARCoreFunctions.generateSigmaT

        // Step 3: Create un-normalized structural shocks (ε_t_unnormalized = η_raw_t * σ_t)
        const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
        const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);
        DebugManager.log('SVAR_SETUP', `Created unnormalized_epsilon_1t and unnormalized_epsilon_2t`);

        // Step 4: Normalize the shocks to have mean 0 and std dev 1, these are the final structural shocks (ε_t)
        const { normalizedSeries1, normalizedSeries2 } = window.SVARGeneralUtil.normalizeTwoSeriesForMeanAndStdDev(
            unnormalized_epsilon_1t,
            unnormalized_epsilon_2t
        );
        DebugManager.log('SVAR_SETUP', `Normalized series. Final epsilon_1t (length ${normalizedSeries1.length}), epsilon_2t (length ${normalizedSeries2.length})`);
        
        return { epsilon_1t: normalizedSeries1, epsilon_2t: normalizedSeries2 };
    },

    /**
     * Generates reduced-form shocks (u_t) from structural shocks (epsilon_t) and a B0 matrix.
     * u_t = B0 * epsilon_t
     * @param {number[][]} B_0 - The 2x2 structural matrix.
     * @param {number[]} epsilon_1t - Array of the first structural shock series.
     * @param {number[]} epsilon_2t - Array of the second structural shock series.
     * @returns {{u_1t: number[], u_2t: number[]}} An object containing the two reduced-form shock series.
     */
    generateU: function(B_0, epsilon_1t, epsilon_2t) {
        DebugManager.log('SVAR_SETUP', 'Attempting to generate reduced-form shocks u_t...');
        if (!B_0 || B_0.length !== 2 || B_0[0].length !== 2 || B_0[1].length !== 2) {
            DebugManager.log('SVAR_SETUP', 'ERROR: Invalid B0 matrix provided for generateU. Expected 2x2 matrix.', B_0);
            return { u_1t: [], u_2t: [] };
        }
        if (!epsilon_1t || !epsilon_2t || epsilon_1t.length !== epsilon_2t.length) {
            DebugManager.log('SVAR_SETUP', 'ERROR: Invalid or mismatched epsilon_t series for generateU.', {len1: epsilon_1t?.length, len2: epsilon_2t?.length});
            return { u_1t: [], u_2t: [] };
        }

        const T = epsilon_1t.length;
        const u_1t = new Array(T);
        const u_2t = new Array(T);

        DebugManager.log('SVAR_SETUP', `Generating u_t for T = ${T} using B0:`, JSON.stringify(B_0));

        for (let i = 0; i < T; i++) {
            // u_1t = B_0[0][0] * ε_1t + B_0[0][1] * ε_2t
            u_1t[i] = B_0[0][0] * epsilon_1t[i] + B_0[0][1] * epsilon_2t[i];
            // u_2t = B_0[1][0] * ε_1t + B_0[1][1] * ε_2t
            u_2t[i] = B_0[1][0] * epsilon_1t[i] + B_0[1][1] * epsilon_2t[i];
        }
        DebugManager.log('SVAR_SETUP', 'Successfully generated u_1t and u_2t series.');
        return { u_1t, u_2t };
    }
};

// // Example usage (for testing purposes, can be removed or commented out)
// document.addEventListener('DOMContentLoaded', () => {
//     if (window.DebugManager) {
//        DebugManager.setCategory('SVAR_SETUP', true); // Enable logging for this category if not already
//     }
//     if (window.SVARCoreFunctions && window.SVARGeneralUtil) {
//        const T_sample = 10; // Small sample for quick test
//        console.log(`Attempting to generate epsilons with T_sample = ${T_sample}`);
//        const epsilons = window.SVARCoreFunctions.generateEpsilon(T_sample);
//        console.log("Generated Epsilon 1 (first 5):", epsilons.epsilon_1t.slice(0,5));
//        console.log("Mean Epsilon 1:", window.SVARGeneralUtil.calculateMean(epsilons.epsilon_1t));
//        console.log("StdDev Epsilon 1:", window.SVARGeneralUtil.calculateStdDev(epsilons.epsilon_1t));
//        console.log("Generated Epsilon 2 (first 5):", epsilons.epsilon_2t.slice(0,5));
//        console.log("Mean Epsilon 2:", window.SVARGeneralUtil.calculateMean(epsilons.epsilon_2t));
//        console.log("StdDev Epsilon 2:", window.SVARGeneralUtil.calculateStdDev(epsilons.epsilon_2t));
//     } else {
//        console.error("SVARCoreFunctions or SVARGeneralUtil not available for testing.");
//     }
// });
