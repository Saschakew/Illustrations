// public/js/svar_math_util.js

window.SVARMathUtil = {
    /**
     * Calculates the 2x2 covariance matrix for two series.
     * @param {number[]} u1_t - The first series.
     * @param {number[]} u2_t - The second series.
     * @returns {number[][]|null} The 2x2 covariance matrix or null on error.
     */
    calculateCovarianceMatrix: function(u1_t, u2_t) {
        if (!u1_t || !u2_t || u1_t.length !== u2_t.length || u1_t.length === 0) {
            DebugManager.log('SVAR_MATH', 'ERROR: Invalid input for covariance matrix calculation. Series must be non-empty and of equal length.', { len1: u1_t?.length, len2: u2_t?.length });
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
        // Using n as divisor as per guide's note, common in some contexts (ML), though n-1 is for unbiased sample estimate.
        const divisor = n; 
        if (divisor === 0) { // Should be caught by initial length check, but as a safeguard.
            DebugManager.log('SVAR_MATH', 'ERROR: Divisor is zero in covariance calculation.');
            return null;
        }

        const covMatrix = [
            [var_u1 / divisor, cov_u1_u2 / divisor],
            [cov_u1_u2 / divisor, var_u2 / divisor]
        ];
        DebugManager.log('SVAR_MATH', 'Covariance matrix calculated:', JSON.stringify(covMatrix));
        return covMatrix;
    },

    /**
     * Computes the Cholesky decomposition of a 2x2 symmetric positive definite matrix.
     * Returns a lower triangular matrix P such that matrix = P * P'.
     * @param {number[][]} matrix - The 2x2 matrix.
     * @returns {number[][]|null} The lower triangular Cholesky factor P, or null on error.
     */
    choleskyDecomposition: function(matrix) {
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            DebugManager.log('SVAR_MATH', 'ERROR: Invalid matrix for Cholesky decomposition. Expected 2x2 matrix.', matrix);
            return null;
        }
        // Assuming matrix[0][1] === matrix[1][0] (symmetry) as covariance matrix should be symmetric.
        const a = matrix[0][0];
        const b = matrix[0][1]; 
        const d = matrix[1][1];

        if (a <= 0) {
            DebugManager.log('SVAR_MATH', 'ERROR: Cholesky failed: matrix[0][0] must be positive.', { val: a });
            return null;
        }
        const p11 = Math.sqrt(a);
        if (p11 === 0) { // Avoid division by zero if a is extremely small but positive.
             DebugManager.log('SVAR_MATH', 'ERROR: Cholesky failed: p11 is zero, matrix[0][0] too small or zero.', { p11_val: p11 });
             return null;
        }
        const p21 = b / p11;
        const p22_squared = d - p21 * p21;

        if (p22_squared <= 0) {
            DebugManager.log('SVAR_MATH', 'ERROR: Cholesky failed: matrix is not positive definite (p22_squared <= 0).', { p22_sq_val: p22_squared });
            return null;
        }
        const p22 = Math.sqrt(p22_squared);

        const choleskyFactor = [
            [p11, 0],
            [p21, p22]
        ];
        DebugManager.log('SVAR_MATH', 'Cholesky factor P calculated:', JSON.stringify(choleskyFactor));
        return choleskyFactor;
    },

    /**
     * Generates a 2x2 orthogonal rotation matrix R(phi) from an angle phi (in radians).
     * @param {number} phi - The rotation angle in radians.
     * @returns {number[][]} The 2x2 rotation matrix.
     */
    getRotationMatrix: function(phi) {
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        const rotationMatrix = [
            [cosPhi, -sinPhi],
            [sinPhi, cosPhi]
        ];
        DebugManager.log('SVAR_MATH', 'Rotation matrix R(phi) for phi =', phi, 'calculated:', JSON.stringify(rotationMatrix));
        return rotationMatrix;
    },

    /**
     * Multiplies two 2x2 matrices.
     * @param {number[][]} matrixA - The first 2x2 matrix.
     * @param {number[][]} matrixB - The second 2x2 matrix.
     * @returns {number[][]|null} The resulting 2x2 matrix or null on error.
     */
    matrixMultiply: function(matrixA, matrixB) {
        if (!matrixA || matrixA.length !== 2 || matrixA[0].length !== 2 || matrixA[1].length !== 2 ||
            !matrixB || matrixB.length !== 2 || matrixB[0].length !== 2 || matrixB[1].length !== 2) {
            DebugManager.log('SVAR_MATH', 'ERROR: Invalid matrices for multiplication. Both must be 2x2.', { A: matrixA, B: matrixB });
            return null;
        }
        const res = [[0, 0], [0, 0]];
        res[0][0] = matrixA[0][0] * matrixB[0][0] + matrixA[0][1] * matrixB[1][0];
        res[0][1] = matrixA[0][0] * matrixB[0][1] + matrixA[0][1] * matrixB[1][1];
        res[1][0] = matrixA[1][0] * matrixB[0][0] + matrixA[1][1] * matrixB[1][0];
        res[1][1] = matrixA[1][0] * matrixB[0][1] + matrixA[1][1] * matrixB[1][1];
        DebugManager.log('SVAR_MATH', 'Matrix multiplication result:', JSON.stringify(res));
        return res;
    }
};
