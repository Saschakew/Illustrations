// Shared functions specific to SVAR models, namespaced to avoid global scope pollution.

window.SVARFunctions = {
    getB0Matrix: function(phi) {
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        return [[cosPhi, -sinPhi], [sinPhi, cosPhi]];
    },

    generateSigmaT: function(size) {
        const sigma_vals = new Array(size);
        const midpoint = Math.floor(size / 2);
        for (let i = 0; i < size; i++) {
            sigma_vals[i] = (i < midpoint) ? 1 : 2;
        }
        return sigma_vals;
    },

    generateEpsilon: function(T) {
        // Step 1: Generate raw standard normal shocks (η_t)
        const eta_raw_1t = window.SVARGeneral.generateSingleNormalSeries(T);
        const eta_raw_2t = window.SVARGeneral.generateSingleNormalSeries(T);

        // Step 2: Generate the sigma values for heteroskedasticity
        const sigma_t_values = this.generateSigmaT(T);

        // Step 3: Create un-normalized structural shocks (ε_t_unnormalized = η_t * σ_t)
        const unnormalized_epsilon_1t = eta_raw_1t.map((val, i) => val * sigma_t_values[i]);
        const unnormalized_epsilon_2t = eta_raw_2t.map((val, i) => val * sigma_t_values[i]);

        // Step 4: Normalize the shocks to have mean 0 and std dev 1, these are the final structural shocks (ε_t)
        const { normalizedSeries1, normalizedSeries2 } = window.SVARGeneral.normalizeTwoSeriesForMeanAndStdDev(unnormalized_epsilon_1t, unnormalized_epsilon_2t);
        
        return { epsilon_1t: normalizedSeries1, epsilon_2t: normalizedSeries2 };
    },

    getB0: function(isNonRecursive) {
        return isNonRecursive ? window.SVARData.B0_NON_RECURSIVE : window.SVARData.B0_RECURSIVE;
    },

    generateU: function(B_0, epsilon_1t, epsilon_2t) {
        const T = epsilon_1t.length;
        const u_1t = new Array(T);
        const u_2t = new Array(T);

        for (let i = 0; i < T; i++) {
            u_1t[i] = B_0[0][0] * epsilon_1t[i] + B_0[0][1] * epsilon_2t[i];
            u_2t[i] = B_0[1][0] * epsilon_1t[i] + B_0[1][1] * epsilon_2t[i];
        }
        return { u_1t, u_2t };
    },

    generateAndStoreSvarData: function(T, isNonRecursive, source = null) {
        console.log(`[shared_svar_functions.js] Generating and storing SVAR data with T=${T}, isNonRecursive=${isNonRecursive}`);
        // Step 1: Generate structural shocks
        const { epsilon_1t, epsilon_2t } = this.generateEpsilon(T);

        // Step 2: Get B0 matrix
        const B_0 = this.getB0(isNonRecursive);
        if (!B_0) {
            console.error("[shared_svar_functions.js] Critical error: B0 matrix is undefined during data generation.");
            // Potentially update SVARData with an error state or return null/error
            window.SVARData.updateData({
                error: "B0 matrix undefined",
                epsilon_1t: null, epsilon_2t: null, u_1t: null, u_2t: null, B_0: null,
                source: source
            });
            return null; // Or throw an error
        }

        // Step 3: Generate reduced-form shocks
        const { u_1t, u_2t } = this.generateU(B_0, epsilon_1t, epsilon_2t);

        // Step 4: Update central data store
        const dataToStore = {
            T: T,
            epsilon_1t: epsilon_1t,
            epsilon_2t: epsilon_2t,
            u_1t: u_1t,
            u_2t: u_2t,
            B_0: B_0,
            isNonRecursive: isNonRecursive,
            error: null, // Clear any previous error
            source: source // Pass the source of the update
        };
        window.SVARData.updateData(dataToStore);

        // Step 5: Return the generated series for immediate use (optional)
        return { epsilon_1t, epsilon_2t, u_1t, u_2t, B_0 };
    },

    // --- Matrix Helper Functions (for 2x2 matrices) ---
    matinv: function([[a, b], [c, d]]) {
        const det = a * d - b * c;
        if (det === 0) return null;
        return [[d / det, -b / det], [-c / det, a / det]];
    },

    matmul: function([[a, b], [c, d]], [[e, f], [g, h]]) {
        return [[a * e + b * g, a * f + b * h], [c * e + d * g, c * f + d * h]];
    },

    cholesky: function([[a, b], [c, d]]) { // for symmetric positive-definite
        if (a <= 0) return null; // Must be positive definite
        const l11 = Math.sqrt(a);
        const l21 = b / l11;
        const inner = d - l21 * l21;
        if (inner <= 0) return null;
        const l22 = Math.sqrt(inner);
        return [[l11, 0], [l21, l22]];
    },

    transpose: function([[a, b], [c, d]]) {
        return [[a, c], [b, d]];
    },

    calculateEstimationMetrics: function(u_1t, u_2t, isNonRecursive) {
        const T = u_1t.length;

        // 1. Sample Covariance Matrix (Σ_u_hat)
        const mean_u1 = u_1t.reduce((a, b) => a + b, 0) / T;
        const mean_u2 = u_2t.reduce((a, b) => a + b, 0) / T;
        const var_u1 = u_1t.map(x => (x - mean_u1) ** 2).reduce((a, b) => a + b, 0) / (T - 1);
        const var_u2 = u_2t.map(x => (x - mean_u2) ** 2).reduce((a, b) => a + b, 0) / (T - 1);
        const cov_u1_u2 = u_1t.map((x, i) => (x - mean_u1) * (u_2t[i] - mean_u2)).reduce((a, b) => a + b, 0) / (T - 1);
        const sigma_u_hat = [[var_u1, cov_u1_u2], [cov_u1_u2, var_u2]];

        // 2. Cholesky Decomposition (P_hat)
        const p_hat = this.cholesky(sigma_u_hat);
        if (!p_hat) {
            console.error("Cholesky decomposition failed.");
            return null;
        }

        // 3. True Rotation Angle (phi_true)
        const p_hat_inv = this.matinv(p_hat);
        const true_B0 = this.getB0(isNonRecursive);
        if (!p_hat_inv || !true_B0) {
            console.error("Cannot calculate true phi: missing P_hat_inv or true B0.");
            return null;
        }
        const Q_true = this.matmul(p_hat_inv, true_B0);
        const phi_true = Math.atan2(Q_true[1][0], Q_true[0][0]);

        // 4. Correlation Curve Data
        const phis = [];
        const corrs = [];
        for (let p = -Math.PI / 2; p <= Math.PI / 2; p += 0.01) {
            const R = this.getB0Matrix(p);
            const B = this.matmul(p_hat, R);
            const B_inv = this.matinv(B);
            if (!B_inv) continue;

            let sum_e1e2 = 0;
            for (let i = 0; i < T; i++) {
                const e1 = B_inv[0][0] * u_1t[i] + B_inv[0][1] * u_2t[i];
                const e2 = B_inv[1][0] * u_1t[i] + B_inv[1][1] * u_2t[i];
                sum_e1e2 += e1 * e2;
            }
            phis.push(p);
            corrs.push(sum_e1e2 / T);
        }

        return {
            sigma_u_hat,
            p_hat,
            phi_true,
            correlationData: { phis, corrs }
        };
    }
};
