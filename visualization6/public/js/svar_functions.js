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
    },

    /**
     * Generates the B(phi) matrix.
     * B(phi) = P * R(phi), where P is the Cholesky decomposition of Cov(u_t),
     * and R(phi) is the rotation matrix for angle phi.
     * @param {number[]} u1_t - The first reduced-form shock series.
     * @param {number[]} u2_t - The second reduced-form shock series.
     * @param {number} phi - The rotation angle in radians.
     * @returns {number[][]|null} The 2x2 B(phi) matrix or null on error.
     */
    generateBPhi: function(u1_t, u2_t, phi) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'Attempting to generate B(phi)...', { phi: phi, u1_len: u1_t?.length, u2_len: u2_t?.length });

        if (!window.SVARMathUtil) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARMathUtil not found. Cannot generate B(phi).');
            return null;
        }
        if (u1_t === null || u1_t === undefined || u2_t === null || u2_t === undefined || u1_t.length === 0 || u2_t.length === 0) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: u_t series are null, undefined or empty. Cannot generate B(phi).', { u1_t, u2_t });
            return null;
        }
        if (phi === null || phi === undefined) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Phi is null or undefined. Cannot generate B(phi).', { phi });
            return null;
        }

        // Step 1: Compute Covariance Matrix (Sigma_u)
        const sigmaU = window.SVARMathUtil.calculateCovarianceMatrix(u1_t, u2_t);
        if (!sigmaU) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to calculate covariance matrix for B(phi) generation.');
            return null;
        }
        DebugManager.log('SVAR_DATA_PIPELINE', 'B(phi) Step 1: Covariance Matrix Sigma_u =', JSON.stringify(sigmaU));

        // Step 2: Cholesky Decomposition (P)
        const P = window.SVARMathUtil.choleskyDecomposition(sigmaU);
        if (!P) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to compute Cholesky decomposition for B(phi) generation.');
            return null;
        }
        DebugManager.log('SVAR_DATA_PIPELINE', 'B(phi) Step 2: Cholesky Factor P =', JSON.stringify(P));

        // Step 3: Generate Rotation Matrix (R(phi))
        const R_phi = window.SVARMathUtil.getRotationMatrix(phi);
        // getRotationMatrix currently doesn't return null for invalid phi, but good to be defensive if it changes.
        if (!R_phi) { 
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to generate rotation matrix R(phi).');
            return null;
        }
        DebugManager.log('SVAR_DATA_PIPELINE', 'B(phi) Step 3: Rotation Matrix R(phi) =', JSON.stringify(R_phi));

        // Step 4: Construct B(phi) = P * R(phi)
        const B_phi_matrix = window.SVARMathUtil.matrixMultiply(P, R_phi);
        if (!B_phi_matrix) {
            DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to multiply P and R(phi) for B(phi) generation.');
            return null;
        }
        DebugManager.log('SVAR_DATA_PIPELINE', 'Successfully generated B(phi) matrix =', JSON.stringify(B_phi_matrix));
        return B_phi_matrix;
    },

    /**
     * Generates structural innovations e_t = B(phi)^-1 * u_t.
     * @param {number[][]} B_phi - The 2x2 B(phi) matrix.
     * @param {number[]} u_1t - The first reduced-form shock series.
     * @param {number[]} u_2t - The second reduced-form shock series.
     * @returns {{e_1t: number[], e_2t: number[]}|null} An object containing the innovation series, or null on error.
     */
    generateInnovations: function(B_phi, u_1t, u_2t) {
        const category = 'SVAR_DATA_PIPELINE';
        DebugManager.log(category, 'Attempting to generate structural innovations e_t...');

        if (!window.SVARMathUtil) {
            DebugManager.log(category, 'Error: SVARMathUtil is not available.');
            return null;
        }
        if (!B_phi || !u_1t || !u_2t || u_1t.length !== u_2t.length || u_1t.length === 0) {
            DebugManager.log(category, 'Error: Invalid inputs for generateInnovations. B_phi, u_1t, or u_2t are missing, mismatched, or empty.',
                { B_phi_exists: !!B_phi, u1_len: u_1t ? u_1t.length : 0, u2_len: u_2t ? u_2t.length : 0 });
            return null;
        }

        DebugManager.log(category, 'Input B_phi for innovations:', JSON.parse(JSON.stringify(B_phi)));
        // DebugManager.log(category, 'Input u_1t for innovations (first 5):', JSON.parse(JSON.stringify(u_1t.slice(0,5))));
        // DebugManager.log(category, 'Input u_2t for innovations (first 5):', JSON.parse(JSON.stringify(u_2t.slice(0,5))));

        const B_phi_inv = window.SVARMathUtil.invert2x2Matrix(B_phi);
        if (!B_phi_inv) {
            DebugManager.log(category, 'Error: Could not invert B_phi. Cannot generate innovations.');
            return null;
        }
        DebugManager.log(category, 'Inverted B_phi:', JSON.parse(JSON.stringify(B_phi_inv)));

        const T = u_1t.length;
        const e_1t_series = new Array(T);
        const e_2t_series = new Array(T);

        for (let i = 0; i < T; i++) {
            const u_vector = [u_1t[i], u_2t[i]];
            const e_vector = window.SVARMathUtil.multiplyMatrixByVector(B_phi_inv, u_vector);

            if (!e_vector) {
                DebugManager.log(category, `Error: Matrix-vector multiplication failed at t=${i}.`);
                return null; // Stop if any multiplication fails
            }
            e_1t_series[i] = e_vector[0];
            e_2t_series[i] = e_vector[1];
        }

        DebugManager.log(category, 'Successfully generated structural innovations e_t.');
        // DebugManager.log(category, 'Generated e_1t (first 5):', JSON.parse(JSON.stringify(e_1t_series.slice(0,5))));
        // DebugManager.log(category, 'Generated e_2t (first 5):', JSON.parse(JSON.stringify(e_2t_series.slice(0,5))));

        return { e_1t: e_1t_series, e_2t: e_2t_series };
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
