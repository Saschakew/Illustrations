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
    }
};
