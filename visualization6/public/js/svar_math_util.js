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
    },

    /**
     * Inverts a 2x2 matrix.
     * M = [[a, b], [c, d]] => M^-1 = (1/det(M)) * [[d, -b], [-c, a]]
     * @param {number[][]} matrix - The 2x2 matrix to invert.
     * @returns {number[][]|null} The inverted matrix, or null if not invertible.
     */
    invert2x2Matrix: function(matrix) {
        const category = 'SVAR_MATH';
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            DebugManager.log(category, 'Error: Invalid matrix for inversion. Must be 2x2.', matrix);
            return null;
        }

        const a = matrix[0][0];
        const b = matrix[0][1];
        const c = matrix[1][0];
        const d = matrix[1][1];

        const determinant = a * d - b * c;
        DebugManager.log(category, 'Calculating determinant for inversion:', determinant, 'from matrix:', JSON.parse(JSON.stringify(matrix)));

        if (Math.abs(determinant) < 1e-12) { // Check for singularity (determinant close to zero)
            DebugManager.log(category, 'Error: Matrix is singular or nearly singular, cannot invert. Determinant:', determinant);
            return null;
        }

        const invDet = 1 / determinant;
        const invertedMatrix = [
            [d * invDet, -b * invDet],
            [-c * invDet, a * invDet]
        ];
        DebugManager.log(category, 'Inverted matrix:', JSON.parse(JSON.stringify(invertedMatrix)));
        return invertedMatrix;
    },

    /**
     * Multiplies a 2x2 matrix by a 2x1 column vector.
     * Result_vector = Matrix * Vector
     * y1 = m11*v1 + m12*v2
     * y2 = m21*v1 + m22*v2
     * @param {number[][]} matrix - The 2x2 matrix.
     * @param {number[]} vector - The 2x1 vector [v1, v2].
     * @returns {number[]|null} The resulting 2x1 vector [y1, y2], or null on error.
     */
    multiplyMatrixByVector: function(matrix, vector) {
        const category = 'SVAR_MATH';
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            DebugManager.log(category, 'Error: Invalid matrix for matrix-vector multiplication. Must be 2x2.', matrix);
            return null;
        }
        if (!vector || vector.length !== 2) {
            DebugManager.log(category, 'Error: Invalid vector for matrix-vector multiplication. Must be 2x1.', vector);
            return null;
        }

        const m11 = matrix[0][0];
        const m12 = matrix[0][1];
        const m21 = matrix[1][0];
        const m22 = matrix[1][1];

        const v1 = vector[0];
        const v2 = vector[1];

        const resultVector = [
            m11 * v1 + m12 * v2,
            m21 * v1 + m22 * v2
        ];
        // DebugManager.log(category, 'Matrix-vector multiplication:', JSON.parse(JSON.stringify(matrix)), '*', JSON.parse(JSON.stringify(vector)), '=', JSON.parse(JSON.stringify(resultVector))); // Can be too verbose
        return resultVector;
    },

    /**
     * Calculates the mean of an array of numbers.
     * @param {number[]} arr - The array of numbers.
     * @returns {number} The mean of the array, or 0 if the array is empty.
     */
    mean: function(arr) {
        if (!arr || arr.length === 0) {
            return 0;
        }
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    },

    /**
     * Transposes a 2x2 matrix.
     * @param {number[][]} matrix - The 2x2 matrix [[a, b], [c, d]].
     * @returns {number[][]} The transposed matrix [[a, c], [b, d]], or null if input is invalid.
     */
    transposeMatrix2x2: function(matrix) {
        const category = 'SVAR_MATH';
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            DebugManager.log(category, 'Error: Invalid matrix for transposeMatrix2x2. Expected 2x2 matrix.', matrix);
            return null;
        }
        return [
            [matrix[0][0], matrix[1][0]],
            [matrix[0][1], matrix[1][1]]
        ];
    },

    /**
     * Calculates phi_0 such that B0 = R(phi_0) * P_true, where P_true = chol(B0 * B0').
     * @param {number[][]} B0_matrix - The 2x2 structural matrix B0.
     * @returns {number|null} The angle phi_0 in radians, or null if calculation fails.
     */
    calculatePhi0: function(B0_matrix) {
        const category = 'SVAR_MATH';
        DebugManager.log(category, 'Calculating phi_0 for B0:', JSON.parse(JSON.stringify(B0_matrix)));

        if (!B0_matrix || B0_matrix.length !== 2 || B0_matrix[0].length !== 2 || B0_matrix[1].length !== 2) {
            DebugManager.log(category, 'Error: Invalid B0_matrix for calculatePhi0. Expected 2x2 matrix.');
            return null;
        }

        try {
            const B0_transpose = this.transposeMatrix2x2(B0_matrix);
            if (!B0_transpose) {
                DebugManager.log(category, 'Error: Failed to transpose B0 matrix.');
                return null;
            }
            // DebugManager.log(category, 'B0_transpose:', JSON.parse(JSON.stringify(B0_transpose)));

            const Sigma_true = this.matrixMultiply(B0_matrix, B0_transpose);
            if (!Sigma_true) {
                DebugManager.log(category, 'Error: Failed to calculate Sigma_true = B0 * B0_transpose.');
                return null;
            }
            // DebugManager.log(category, 'Sigma_true (B0 * B0_transpose):', JSON.parse(JSON.stringify(Sigma_true)));

            const P_true = this.choleskyDecomposition(Sigma_true);
            if (!P_true) {
                DebugManager.log(category, 'Error: Failed to calculate Cholesky decomposition P_true of Sigma_true.');
                return null;
            }
            // DebugManager.log(category, 'P_true (chol(Sigma_true)):', JSON.parse(JSON.stringify(P_true)));

            // Ensure P_true is not singular before inverting. For a Cholesky factor, this means diagonal elements are non-zero.
            if (Math.abs(P_true[0][0]) < 1e-9 || Math.abs(P_true[1][1]) < 1e-9) {
                 DebugManager.log(category, 'Error: P_true is singular or near-singular, cannot invert for phi_0 calculation. P_true:', JSON.parse(JSON.stringify(P_true)));
                 return null;
            }

            const P_true_inverse = this.invert2x2Matrix(P_true);
            if (!P_true_inverse) {
                DebugManager.log(category, 'Error: Failed to invert P_true.');
                return null;
            }
            // DebugManager.log(category, 'P_true_inverse:', JSON.parse(JSON.stringify(P_true_inverse)));

            const R_candidate = this.matrixMultiply(B0_matrix, P_true_inverse);
            if (!R_candidate) {
                DebugManager.log(category, 'Error: Failed to calculate R_candidate = B0 * P_true_inverse.');
                return null;
            }
            // DebugManager.log(category, 'R_candidate (B0 * P_true_inverse):', JSON.parse(JSON.stringify(R_candidate)));

            // phi_0 = atan2(R[1][0], R[0][0])
            // R_candidate = [[cos(phi_0), -sin(phi_0)], [sin(phi_0), cos(phi_0)]]
            // So, R_candidate[1][0] is sin(phi_0) and R_candidate[0][0] is cos(phi_0)
            const phi_0_rad = Math.atan2(R_candidate[1][0], R_candidate[0][0]);
            DebugManager.log(category, 'Successfully calculated phi_0 (radians):', phi_0_rad);
            return phi_0_rad;

        } catch (error) {
            DebugManager.log(category, 'Exception during calculatePhi0:', error);
            return null;
        }
    }
};
