window.SVARMath = {
    /**
     * Calculates the sample covariance matrix for two time series.
     * @param {number[]} u1_t - First time series.
     * @param {number[]} u2_t - Second time series.
     * @returns {Array<Array<number>>|null} The 2x2 covariance matrix or null if inputs are invalid.
     */
    calculateCovarianceMatrix: function(u1_t, u2_t) {
        if (!u1_t || !u2_t || u1_t.length !== u2_t.length || u1_t.length === 0) {
            console.error('[SVARMath] Invalid input for covariance matrix calculation.');
            return null;
        }
        const n = u1_t.length;
        const mean_u1 = u1_t.reduce((a, b) => a + b, 0) / n;
        const mean_u2 = u2_t.reduce((a, b) => a + b, 0) / n;

        let var_u1 = 0, var_u2 = 0, cov_u1_u2 = 0;
        for (let i = 0; i < n; i++) {
            var_u1 += (u1_t[i] - mean_u1) * (u1_t[i] - mean_u1);
            var_u2 += (u2_t[i] - mean_u2) * (u2_t[i] - mean_u2);
            cov_u1_u2 += (u1_t[i] - mean_u1) * (u2_t[i] - mean_u2);
        }
        // Using (n-1) for sample covariance, but for large T, n is also common.
        // Let's stick to n for consistency if other parts of a library might use it, or n-1 for unbiased sample estimate.
        // For now, using n as it's simpler and often used in this context unless high precision for small samples is key.
        const divisor = n; // Or n-1 for sample covariance
        if (divisor === 0) return null;

        return [
            [var_u1 / divisor, cov_u1_u2 / divisor],
            [cov_u1_u2 / divisor, var_u2 / divisor]
        ];
    },

    /**
     * Performs Cholesky decomposition on a symmetric positive-definite 2x2 matrix.
     * Returns a lower triangular matrix P such that matrix = P * P^T.
     * @param {Array<Array<number>>} matrix - The 2x2 matrix [[a, b], [b, d]].
     * @returns {Array<Array<number>>|null} The lower triangular matrix P or null if decomposition fails.
     */
    choleskyDecomposition: function(matrix) {
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            console.error('[SVARMath] Invalid matrix for Cholesky decomposition.');
            return null;
        }
        const a = matrix[0][0];
        const b = matrix[0][1]; // c = matrix[1][0]
        const d = matrix[1][1];

        if (a <= 0) { // Must be positive definite
            console.error('[SVARMath] Cholesky failed: matrix[0][0] must be positive.');
            return null;
        }
        const p11 = Math.sqrt(a);
        const p21 = b / p11;
        const p22_squared = d - p21 * p21;

        if (p22_squared <= 0) { // Must be positive definite
            console.error('[SVARMath] Cholesky failed: matrix is not positive definite (p22_squared <=0).');
            return null;
        }
        const p22 = Math.sqrt(p22_squared);

        return [
            [p11, 0],
            [p21, p22]
        ];
    },

    /**
     * Inverts a 2x2 matrix.
     * @param {Array<Array<number>>} matrix - The 2x2 matrix [[a, b], [c, d]].
     * @returns {Array<Array<number>>|null} The inverted matrix or null if determinant is zero.
     */
    invertMatrix: function(matrix) {
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            console.error('[SVARMath] Invalid matrix for inversion.');
            return null;
        }
        const a = matrix[0][0], b = matrix[0][1];
        const c = matrix[1][0], d = matrix[1][1];
        const det = a * d - b * c;
        if (Math.abs(det) < 1e-12) { // Check for singularity
            console.warn('[SVARMath] Matrix determinant is near zero, inversion failed.');
            return null;
        }
        const invDet = 1 / det;
        return [
            [d * invDet, -b * invDet],
            [-c * invDet, a * invDet]
        ];
    },

    /**
     * Multiplies two 2x2 matrices (A * B).
     * @param {Array<Array<number>>} matrixA
     * @param {Array<Array<number>>} matrixB
     * @returns {Array<Array<number>>|null} The resulting 2x2 matrix or null.
     */
    matrixMultiply: function(matrixA, matrixB) {
        if (!matrixA || !matrixB || matrixA.length !== 2 || matrixA[0].length !== 2 || 
            matrixB.length !== 2 || matrixB[0].length !== 2 || matrixA[1].length !== 2 || matrixB[1].length !== 2) {
            console.error('[SVARMath] Invalid matrices for multiplication.');
            return null;
        }
        const res = [[0, 0], [0, 0]];
        res[0][0] = matrixA[0][0] * matrixB[0][0] + matrixA[0][1] * matrixB[1][0];
        res[0][1] = matrixA[0][0] * matrixB[0][1] + matrixA[0][1] * matrixB[1][1];
        res[1][0] = matrixA[1][0] * matrixB[0][0] + matrixA[1][1] * matrixB[1][0];
        res[1][1] = matrixA[1][0] * matrixB[0][1] + matrixA[1][1] * matrixB[1][1];
        return res;
    },

    /**
     * Generates a 2x2 rotation matrix R(phi).
     * R(phi) = [[cos(phi), -sin(phi)], [sin(phi), cos(phi)]]
     * @param {number} phi - The rotation angle in radians.
     * @returns {Array<Array<number>>} The 2x2 rotation matrix.
     */
    getRotationMatrix: function(phi) {
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        return [
            [cosPhi, -sinPhi],
            [sinPhi, cosPhi]
        ];
    },
    
    /**
    * Alias for getRotationMatrix, as it was used with this name in shared-data.js placeholder.
    * This is the rotation matrix R(phi), not B0(phi) = P*R(phi).
    */
    getB0Matrix: function(phi) {
        // console.warn("[SVARMath] getB0Matrix is an alias for getRotationMatrix. It returns R(phi), not P*R(phi).");
        return this.getRotationMatrix(phi);
    },

    /**
     * Calculates phi from a 2x2 matrix M, assuming M is a rotation matrix or similar structure.
     * phi = atan2(M[1][0], M[0][0])
     * @param {Array<Array<number>>} matrixM - The 2x2 matrix.
     * @returns {number|null} The angle phi in radians or null.
     */
    calculatePhiFromRotationMatrix: function(matrixM) {
        if (!matrixM || matrixM.length !== 2 || matrixM[0].length !== 2 || matrixM[1].length !== 2) {
            console.error('[SVARMath] Invalid matrix for phi calculation.');
            return null;
        }
        // Assuming M = [[cos(phi), -sin(phi)], [sin(phi), cos(phi)]]
        // Or M = P_true * R(phi_true) * P_hat_inv, where P_true and P_hat_inv are somewhat diagonal
        // The primary rotation component should be captured by atan2(m10, m00)
        return Math.atan2(matrixM[1][0], matrixM[0][0]);
    },

    /**
     * Calculates structural shocks e_t = B_inv * u_t.
     * @param {number[]} u1_t - First reduced-form error series.
     * @param {number[]} u2_t - Second reduced-form error series.
     * @param {Array<Array<number>>} B_inv - The inverted structural matrix B_hat_inv.
     * @returns {Array<Array<number>>} An array containing [e1_t, e2_t] or [[], []] if inputs are invalid.
     */
    calculateStructuralShocks: function(u1_t, u2_t, B_inv) {
        if (!u1_t || !u2_t || u1_t.length !== u2_t.length || !B_inv || B_inv.length !== 2) {
            console.error('[SVARMath] Invalid input for structural shock calculation.');
            return [[], []];
        }
        const e1_t = [];
        const e2_t = [];
        const b_inv_00 = B_inv[0][0], b_inv_01 = B_inv[0][1];
        const b_inv_10 = B_inv[1][0], b_inv_11 = B_inv[1][1];

        for (let i = 0; i < u1_t.length; i++) {
            e1_t.push(b_inv_00 * u1_t[i] + b_inv_01 * u2_t[i]);
            e2_t.push(b_inv_10 * u1_t[i] + b_inv_11 * u2_t[i]);
        }
        return [e1_t, e2_t];
    },

    /**
     * Calculates the Pearson correlation coefficient between two series.
     * @param {number[]} series1
     * @param {number[]} series2
     * @returns {number|null} The correlation coefficient or null if inputs are invalid.
     */
    calculateCorrelation: function(series1, series2) {
        if (!series1 || !series2 || series1.length !== series2.length || series1.length === 0) {
            console.error('[SVARMath] Invalid input for correlation calculation.');
            return null;
        }
        const n = series1.length;
        const mean1 = series1.reduce((a, b) => a + b, 0) / n;
        const mean2 = series2.reduce((a, b) => a + b, 0) / n;

        let num = 0;
        let den1 = 0;
        let den2 = 0;

        for (let i = 0; i < n; i++) {
            const diff1 = series1[i] - mean1;
            const diff2 = series2[i] - mean2;
            num += diff1 * diff2;
            den1 += diff1 * diff1;
            den2 += diff2 * diff2;
        }

        if (den1 === 0 || den2 === 0) {
            // console.warn('[SVARMath] Correlation cannot be calculated if one series has zero variance.');
            // This can happen legitimately if, for example, phi perfectly orthogonalizes the shocks.
            // Or if a series is constant.
            // If num is also 0, it's 0/0, which is NaN. If num is non-zero, it's non-zero/0, which is Inf/NaN.
            // A correlation of 0 is often a valid outcome in such cases if num is also 0.
            return (num === 0) ? 0 : NaN; 
        }
        return num / Math.sqrt(den1 * den2);
    }
};
