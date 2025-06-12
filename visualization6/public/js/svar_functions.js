// public/js/svar_functions.js

// Ensure SVARGeneralUtil is available
if (typeof window.SVARGeneralUtil === 'undefined') {
    console.error("SVARGeneralUtil is not loaded. Ensure svar_general_functions.js is loaded before svar_functions.js.");
    window.SVARGeneralUtil = { // Fallback to prevent errors, though functionality will be missing
        generateSingleNormalSeries: () => [],
        normalizeTwoSeriesForMeanAndStdDev: (s1, s2) => ({ normalizedSeries1: s1, normalizedSeries2: s2 }),
        generateMixtureNormalSeries: () => [],
        generateSingleMixtureNormalValue: () => 0,
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
     * 1. Generate raw shocks (eta_raw_t):
     *    - eta_raw_1t: Standard normal N(0,1).
     *    - eta_raw_2t: Mixture of two normal distributions N(-0.1*s, 1) and N(0.9*s, 1) for skewness.
     * 2. Generate sigma_t values for heteroskedasticity.
     * 3. Create un-normalized structural shocks (eta_raw_t * sigma_t).
     * 4. Normalize these shocks to have mean 0 and std dev 1 (final epsilon_t).
     * @param {number} T - The total number of observations (sample size).
     * @param {number} [s_param=3] - The skewness parameter for the mixture distribution of the second shock.
     * @returns {{epsilon_1t: number[], epsilon_2t: number[]}} An object containing the two series of structural shocks.
     */
    generateEpsilon: function(T, s_param = 3) {
        DebugManager.log('SVAR_SETUP', `Generating epsilon for T=${T}`);

        // Step 1: Generate raw shocks (η_raw_t)
        // eta_raw_1t from N(0,1)
        const eta_raw_1t = window.SVARGeneralUtil.generateSingleNormalSeries(T);
        let eta_raw_2t;
        // eta_raw_2t from mixture of normals: 0.9*N(-0.1*s, 1) + 0.1*N(0.9*s, 1)
        if (typeof window.SVARGeneralUtil.generateMixtureNormalSeries !== 'function' || typeof window.SVARGeneralUtil.generateSingleMixtureNormalValue !== 'function') {
            DebugManager.log('SVAR_SETUP', 'Error: SVARGeneralUtil.generateMixtureNormalSeries or generateSingleMixtureNormalValue is not available. Falling back to N(0,1) for eta_raw_2t.');
            eta_raw_2t = window.SVARGeneralUtil.generateSingleNormalSeries(T);
        } else {
            eta_raw_2t = window.SVARGeneralUtil.generateMixtureNormalSeries(T, s_param);
            DebugManager.log('SVAR_SETUP', `Generated raw eta_1t (length ${eta_raw_1t.length}) from N(0,1) and eta_2t (length ${eta_raw_2t.length}) from mixture with s_param=${s_param}`);
        }
            

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
    },

    /**
     * Calculates and stores the recursive estimates phi_est_rec and B_est_rec.
     * B_est_rec is the Cholesky decomposition of the covariance matrix of u_t.
     * phi_est_rec is 0, as B_est_rec = P_hat * R(0) = P_hat.
     */
    calculateRecursiveEstimates: function() {
        const category = 'SVAR_DATA_PIPELINE';
        DebugManager.log(category, 'Attempting to calculate recursive estimates (phi_est_rec, B_est_rec)...');

        if (!window.SVARMathUtil) {
            DebugManager.log(category, 'Error: SVARMathUtil is not available. Cannot calculate recursive estimates.');
            // Optionally set default/error values in sharedData or leave them as is
            sharedData.phi_est_rec = 0; // Or some error indicator
            sharedData.B_est_rec = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        if (!sharedData.u_1t || !sharedData.u_2t || sharedData.u_1t.length === 0 || sharedData.u_1t.length !== sharedData.u_2t.length) {
            DebugManager.log(category, 'Error: Reduced-form shocks u_1t or u_2t are not available or invalid. Cannot calculate recursive estimates.');
            sharedData.phi_est_rec = 0;
            sharedData.B_est_rec = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        try {
            const Sigma_u_hat = SVARMathUtil.calculateCovarianceMatrix(sharedData.u_1t, sharedData.u_2t);
            if (!Sigma_u_hat) {
                DebugManager.log(category, 'Error: Failed to calculate covariance matrix Sigma_u_hat.');
                sharedData.phi_est_rec = 0;
                sharedData.B_est_rec = [[NaN, NaN], [NaN, NaN]];
                return;
            }
            DebugManager.log(category, 'Calculated Sigma_u_hat for recursive estimates:', JSON.parse(JSON.stringify(Sigma_u_hat)));

            const P_hat = SVARMathUtil.choleskyDecomposition(Sigma_u_hat);
            if (!P_hat) {
                DebugManager.log(category, 'Error: Failed to compute Cholesky decomposition P_hat.');
                sharedData.phi_est_rec = 0;
                sharedData.B_est_rec = [[NaN, NaN], [NaN, NaN]];
                return;
            }
            DebugManager.log(category, 'Calculated Cholesky P_hat for recursive estimates:', JSON.parse(JSON.stringify(P_hat)));

            sharedData.B_est_rec = P_hat;
            sharedData.phi_est_rec = 0; // By definition for this identification

            DebugManager.log(category, 'Successfully calculated and stored recursive estimates.');
            DebugManager.log(category, 'sharedData.phi_est_rec:', sharedData.phi_est_rec);
            DebugManager.log(category, 'sharedData.B_est_rec:', JSON.parse(JSON.stringify(sharedData.B_est_rec)));

        } catch (error) {
            DebugManager.log(category, 'Exception during calculateRecursiveEstimates:', error);
            sharedData.phi_est_rec = 0;
            sharedData.B_est_rec = [[NaN, NaN], [NaN, NaN]];
        }
    },

    /**
     * Calculates and stores the non-Gaussian estimates phi_est_nG and B_est_nG.
     * phi_est_nG minimizes the loss function L(phi) = mean(e_1t^2 * e_2t)^2 + mean(e_1t * e_2t^2)^2.
     * B_est_nG = P_hat * R(phi_est_nG).
     */
    calculateNonGaussianEstimates: function() {
        const category = 'SVAR_DATA_PIPELINE';
        DebugManager.log(category, 'Attempting to calculate non-Gaussian estimates (phi_est_nG, B_est_nG)...');

        if (!window.SVARMathUtil || typeof SVARMathUtil.calculateCovarianceMatrix !== 'function' ||
            typeof SVARMathUtil.choleskyDecomposition !== 'function' ||
            typeof SVARMathUtil.getRotationMatrix !== 'function' ||
            typeof SVARMathUtil.matrixMultiply !== 'function' ||
            typeof SVARMathUtil.invert2x2Matrix !== 'function' ||
            typeof SVARMathUtil.multiplyMatrixByVector !== 'function' ||
            typeof SVARMathUtil.mean !== 'function') {
            DebugManager.log(category, 'Error: SVARMathUtil or one of its required methods is not available. Cannot calculate non-Gaussian estimates.');
            sharedData.phi_est_nG = 0;
            sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        if (!sharedData.u_1t || !sharedData.u_2t || sharedData.u_1t.length === 0 || sharedData.u_1t.length !== sharedData.u_2t.length) {
            DebugManager.log(category, 'Error: Reduced-form shocks u_1t or u_2t are not available or invalid. Cannot calculate non-Gaussian estimates.');
            sharedData.phi_est_nG = 0;
            sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        try {
            const Sigma_u_hat = SVARMathUtil.calculateCovarianceMatrix(sharedData.u_1t, sharedData.u_2t);
            if (!Sigma_u_hat) {
                DebugManager.log(category, 'Error: Failed to calculate Sigma_u_hat for nG estimates.');
                sharedData.phi_est_nG = 0;
                sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
                return;
            }

            const P_hat = SVARMathUtil.choleskyDecomposition(Sigma_u_hat);
            if (!P_hat) {
                DebugManager.log(category, 'Error: Failed to compute P_hat for nG estimates.');
                sharedData.phi_est_nG = 0;
                sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
                return;
            }

            let minLoss = Infinity;
            let phi_at_minLoss = 0;
            const steps = 100;
            const min_phi_range = -Math.PI / 2;
            const max_phi_range = Math.PI / 2;

            for (let i = 0; i <= steps; i++) {
                const current_phi_iter = min_phi_range + (i / steps) * (max_phi_range - min_phi_range);
                
                const R_iter = SVARMathUtil.getRotationMatrix(current_phi_iter);
                const B_iter = SVARMathUtil.matrixMultiply(P_hat, R_iter);
                if (!B_iter) continue;

                const B_iter_inv = SVARMathUtil.invert2x2Matrix(B_iter);
                if (!B_iter_inv) continue;

                const temp_e_1t = [];
                const temp_e_2t = [];
                for (let j = 0; j < sharedData.u_1t.length; j++) {
                    const u_vector = [sharedData.u_1t[j], sharedData.u_2t[j]];
                    const e_vector = SVARMathUtil.multiplyMatrixByVector(B_iter_inv, u_vector);
                    if (e_vector) {
                        temp_e_1t.push(e_vector[0]);
                        temp_e_2t.push(e_vector[1]);
                    }
                }

                if (temp_e_1t.length === 0) continue;

                const term1_products = temp_e_1t.map((val, index) => Math.pow(val, 2) * temp_e_2t[index]);
                const mean_term1 = SVARMathUtil.mean(term1_products);

                const term2_products = temp_e_1t.map((val, index) => val * Math.pow(temp_e_2t[index], 2));
                const mean_term2 = SVARMathUtil.mean(term2_products);

                if (mean_term1 === null || mean_term2 === null) continue;

                const currentLoss = Math.pow(mean_term1, 2) + Math.pow(mean_term2, 2);

                if (currentLoss < minLoss) {
                    minLoss = currentLoss;
                    phi_at_minLoss = current_phi_iter;
                }
            }

            sharedData.phi_est_nG = phi_at_minLoss;
            const R_phi_est_nG = SVARMathUtil.getRotationMatrix(sharedData.phi_est_nG);
            sharedData.B_est_nG = SVARMathUtil.matrixMultiply(P_hat, R_phi_est_nG);
            if (!sharedData.B_est_nG) { // Handle potential error from matrixMultiply
                 DebugManager.log(category, 'Error: Failed to compute B_est_nG.');
                 sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
            }

            DebugManager.log(category, 'Successfully calculated and stored non-Gaussian estimates.');
            DebugManager.log(category, 'sharedData.phi_est_nG:', sharedData.phi_est_nG);
            DebugManager.log(category, 'sharedData.B_est_nG:', JSON.parse(JSON.stringify(sharedData.B_est_nG)));

            // Calculate and store v weight after B_est_nG is updated
            this.calculateAndStoreVWeight();

        } catch (error) {
            DebugManager.log(category, 'Exception during calculateNonGaussianEstimates:', error);
            sharedData.phi_est_nG = 0;
            sharedData.B_est_nG = [[NaN, NaN], [NaN, NaN]];
        }
    },

    /**
     * Calculates and stores the Ridge estimates phi_est_ridge and B_est_ridge.
     * phi_est_ridge minimizes the loss function L(phi) = (mean(e_1t^2 * e_2t))^2 + (mean(e_1t * e_2t^2))^2 + lambda.
     * B_est_ridge = P_hat * R(phi_est_ridge).
     */
    calculateRidgeEstimates: function() {
        const category = 'SVAR_DATA_PIPELINE';
        DebugManager.log(category, 'Attempting to calculate Ridge estimates (phi_est_ridge, B_est_ridge)...');

        if (!window.SVARMathUtil || typeof SVARMathUtil.calculateCovarianceMatrix !== 'function' ||
            typeof SVARMathUtil.choleskyDecomposition !== 'function' ||
            typeof SVARMathUtil.getRotationMatrix !== 'function' ||
            typeof SVARMathUtil.matrixMultiply !== 'function' ||
            typeof SVARMathUtil.invert2x2Matrix !== 'function' ||
            typeof SVARMathUtil.multiplyMatrixByVector !== 'function' ||
            typeof SVARMathUtil.mean !== 'function') {
            DebugManager.log(category, 'Error: SVARMathUtil or one of its required methods is not available. Cannot calculate Ridge estimates.');
            sharedData.phi_est_ridge = 0;
            sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        if (!sharedData.u_1t || !sharedData.u_2t || sharedData.u_1t.length === 0 || sharedData.u_1t.length !== sharedData.u_2t.length || typeof sharedData.lambda !== 'number') {
            DebugManager.log(category, 'Error: Reduced-form shocks u_1t/u_2t or lambda are not available/invalid. Cannot calculate Ridge estimates.');
            sharedData.phi_est_ridge = 0;
            sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
            return;
        }

        try {
            const Sigma_u_hat = SVARMathUtil.calculateCovarianceMatrix(sharedData.u_1t, sharedData.u_2t);
            if (!Sigma_u_hat) {
                DebugManager.log(category, 'Error: Failed to calculate Sigma_u_hat for Ridge estimates.');
                sharedData.phi_est_ridge = 0;
                sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
                return;
            }

            const P_hat = SVARMathUtil.choleskyDecomposition(Sigma_u_hat);
            if (!P_hat) {
                DebugManager.log(category, 'Error: Failed to compute P_hat for Ridge estimates.');
                sharedData.phi_est_ridge = 0;
                sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
                return;
            }

            let minLoss = Infinity;
            let phi_at_minLoss = 0;
            const steps = 100;
            const min_phi_range = -Math.PI / 2;
            const max_phi_range = Math.PI / 2;
            const lambda_val = sharedData.lambda / 1000; // Scaling lambda as it might be large for loss
            // The division by 1000 for lambda is an assumption based on typical penalty scales.
            // This might need adjustment depending on the expected magnitude of lambda and the loss terms.
            // Consider if lambda from sharedData is already appropriately scaled or if this scaling is always needed.


            for (let i = 0; i <= steps; i++) {
                const current_phi_iter = min_phi_range + (i / steps) * (max_phi_range - min_phi_range);
                
                const R_iter = SVARMathUtil.getRotationMatrix(current_phi_iter);
                const B_iter = SVARMathUtil.matrixMultiply(P_hat, R_iter);
                if (!B_iter) continue;

                const B_iter_inv = SVARMathUtil.invert2x2Matrix(B_iter);
                if (!B_iter_inv) continue;

                const temp_e_1t = [];
                const temp_e_2t = [];
                for (let j = 0; j < sharedData.u_1t.length; j++) {
                    const u_vector = [sharedData.u_1t[j], sharedData.u_2t[j]];
                    const e_vector = SVARMathUtil.multiplyMatrixByVector(B_iter_inv, u_vector);
                    if (e_vector) {
                        temp_e_1t.push(e_vector[0]);
                        temp_e_2t.push(e_vector[1]);
                    }
                }

                if (temp_e_1t.length === 0) continue;

                const term1_products = temp_e_1t.map((val, index) => Math.pow(val, 2) * temp_e_2t[index]);
                const mean_term1 = SVARMathUtil.mean(term1_products);

                const term2_products = temp_e_1t.map((val, index) => val * Math.pow(temp_e_2t[index], 2));
                const mean_term2 = SVARMathUtil.mean(term2_products);

                if (mean_term1 === null || mean_term2 === null) continue;

                const s3_loss_component = Math.pow(mean_term1, 2) + Math.pow(mean_term2, 2);
                const currentLoss = s3_loss_component + lambda_val; // Add lambda here

                if (currentLoss < minLoss) {
                    minLoss = currentLoss;
                    phi_at_minLoss = current_phi_iter;
                }
            }

            sharedData.phi_est_ridge = phi_at_minLoss;
            const R_phi_est_ridge = SVARMathUtil.getRotationMatrix(sharedData.phi_est_ridge);
            sharedData.B_est_ridge = SVARMathUtil.matrixMultiply(P_hat, R_phi_est_ridge);
            if (!sharedData.B_est_ridge) { // Handle potential error from matrixMultiply
                 DebugManager.log(category, 'Error: Failed to compute B_est_ridge.');
                 sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
            }

            DebugManager.log(category, 'Successfully calculated and stored Ridge estimates.');
            DebugManager.log(category, 'sharedData.phi_est_ridge:', sharedData.phi_est_ridge);
            DebugManager.log(category, 'sharedData.B_est_ridge:', JSON.parse(JSON.stringify(sharedData.B_est_ridge)));
            DebugManager.log(category, 'Lambda used for Ridge loss (scaled):', lambda_val);

        } catch (error) {
            DebugManager.log(category, 'Exception during calculateRidgeEstimates:', error);
            sharedData.phi_est_ridge = 0;
            sharedData.B_est_ridge = [[NaN, NaN], [NaN, NaN]];
        }
    },

    /**
     * Calculates and stores the weight v = 1 / (B_est_nG[0][1]^2).
     * Handles potential numerical issues if B_est_nG[0][1] is close to zero.
     */
    calculateAndStoreVWeight: function() {
        const category = 'SVAR_ESTIMATION';
        const EPSILON = 1e-8; // Small constant to prevent division by zero

        if (!sharedData.B_est_nG || !sharedData.B_est_nG[0] || typeof sharedData.B_est_nG[0][1] !== 'number') {
            DebugManager.log(category, 'Error: B_est_nG is not properly defined for calculating v.');
            sharedData.v = null;
            return;
        }

        const b_tmp = sharedData.B_est_nG[0][1];
        
        // Ensure b_tmp is not too close to zero to avoid numerical instability
        const denominator = Math.pow(Math.max(Math.abs(b_tmp), EPSILON), 2);
        
        if (denominator === 0) { // Should be caught by Math.max with EPSILON, but as a safeguard
            DebugManager.log(category, `Warning: Denominator for v is zero (b_tmp = ${b_tmp}). Setting v to a large fallback value.`);
            sharedData.v = 1 / (EPSILON * EPSILON); // Fallback to a large number
        } else {
            sharedData.v = 1 / denominator;
        }

        DebugManager.log(category, 'Successfully calculated and stored v weight.');
        DebugManager.log(category, 'B_est_nG[0][1] (b_tmp):', b_tmp);
        DebugManager.log(category, 'sharedData.v:', sharedData.v);
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
