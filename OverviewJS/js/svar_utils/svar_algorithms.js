// js/svar_utils/svar_algorithms.js

const SvarAlgorithms = {
    /**
     * Performs Ordinary Least Squares (OLS) regression.
     * @param {number[]} y_vector - Dependent variable vector.
     * @param {number[][]} X_matrix - Matrix of independent variables (rows are observations, columns are regressors).
     *                              Should include a column of ones if a constant is desired.
     * @returns {object|null} OLS results (coefficients, residuals, etc.) or null on error.
     */
    performOLS: function(y_vector, X_matrix) {
        if (typeof math === 'undefined') {
            console.error("math.js is not loaded. OLS cannot be performed.");
            return { error: "math.js not loaded." };
        }

        try {
            // Ensure X_matrix is a 2D array of numbers
            if (!Array.isArray(X_matrix) || !X_matrix.every(row => Array.isArray(row) && row.every(val => typeof val === 'number'))) {
                throw new Error("X_matrix must be a 2D array of numbers.");
            }
            // Ensure y_vector is a 1D array of numbers
            if (!Array.isArray(y_vector) || !y_vector.every(val => typeof val === 'number')) {
                throw new Error("y_vector must be a 1D array of numbers.");
            }

            const X = math.matrix(X_matrix);
            const y = math.matrix(y_vector).reshape([-1, 1]); // Ensure y is a column vector

            if (X.size()[0] !== y.size()[0]) {
                throw new Error(`Number of observations in X (${X.size()[0]}) and y (${y.size()[0]}) do not match.`);
            }
            
            const N = X.size()[0]; // Number of observations
            const K = X.size()[1]; // Number of regressors (including constant)

            if (N === 0) {
                 throw new Error("No observations provided (N=0).");
            }
            if (K === 0) {
                throw new Error("No regressors provided (K=0).");
            }
            if (N <= K) {
                throw new Error(`Not enough observations (N=${N}) to estimate parameters for K=${K} regressors.`);
            }

            const Xt = math.transpose(X);
            const XtX = math.multiply(Xt, X);
            if (math.det(XtX) === 0) {
                throw new Error("Singular matrix (X'X is not invertible). Check for perfect multicollinearity.");
            }
            const XtX_inv = math.inv(XtX);
            const Xty = math.multiply(Xt, y);
            
            const beta_matrix = math.multiply(XtX_inv, Xty);
            const beta = beta_matrix.toArray().flat(); // Coefficients

            const y_fitted_matrix = math.multiply(X, beta_matrix);
            const y_fitted = y_fitted_matrix.toArray().flat();
            
            const residuals_matrix = math.subtract(y, y_fitted_matrix);
            const residuals = residuals_matrix.toArray().flat();
            
            const SSE = math.sum(math.map(residuals_matrix, math.square)); // Sum of Squared Errors, using residuals_matrix
            const sigma_sq_hat = SSE / (N - K); // Estimated variance of residuals
            
            const varCovarBeta_matrix = math.multiply(sigma_sq_hat, XtX_inv);
            const stdErrors = math.map(math.diag(varCovarBeta_matrix), math.sqrt).toArray(); // Element-wise sqrt

            const tStats = beta.map((b, i) => (stdErrors[i] !== 0 && isFinite(stdErrors[i])) ? b / stdErrors[i] : NaN);
            
            // P-values require a T-distribution CDF (e.g., from a library like jStat or scipy.stats.t.sf)
            // For now, returning NaN. math.js does not have this built-in.
            const pValues = tStats.map(() => NaN); 

            const y_mean = math.mean(y); // math.mean works directly on matrix y
            const y_dev_from_mean_matrix = math.subtract(y, y_mean); // Element-wise subtraction from matrix y
            const TSS = math.sum(math.map(y_dev_from_mean_matrix, math.square)); // Total Sum of Squares, element-wise
            const R_squared = (TSS === 0) ? NaN : 1 - (SSE / TSS); // Handle case where TSS is 0 (e.g. y is constant)

            return {
                coefficients: beta,
                residuals: residuals,
                fittedValues: y_fitted,
                standardErrors: stdErrors,
                tStats: tStats,
                pValues: pValues, 
                rSquared: R_squared,
                N: N,
                K: K,
                sigma_sq_hat: sigma_sq_hat
            };

        } catch (e) {
            console.error("Error in performOLS:", e.message, e.stack);
            return { error: e.message };
        }
    },

    /**
     * Estimates a VAR model equation by equation using OLS.
     * @param {object} dataSeries - Object with series names as keys and data arrays as values (e.g., { i: [...], sp500: [...] }).
     * @param {string[]} varNames - Array of variable names to include in the VAR, defining the order.
     * @param {number} numLags - The number of lags (p) to include.
     * @returns {object} An object containing estimation results for each equation, or null on error.
     */
    estimateVAREquationByEquation: function(dataSeries, varNames, numLags) {
        if (typeof math === 'undefined') {
            console.error("math.js is not loaded. VAR estimation cannot proceed.");
            return { error: "math.js not loaded." };
        }
        if (!varNames || varNames.length === 0) {
            console.error("No variable names provided for VAR estimation.");
            return { error: "No variable names provided." };
        }

        const T_orig = dataSeries[varNames[0]].length;
        if (T_orig <= numLags) {
            console.error(`Not enough data points (T_orig=${T_orig}) to estimate VAR with p=${numLags} lags.`);
            return { error: "Insufficient data for specified lags." };
        }

        const results = {};
        const N_effective = T_orig - numLags; // Number of observations available for regression

        // Prepare the block of lagged regressors (common to all equations)
        const X_lagged_block_rows = [];
        for (let t = 0; t < N_effective; t++) { // Iterate for each effective observation row
            const currentRow = [];
            // For current observation Y_t (which is at original index t + numLags)
            // we need lags from (t + numLags - 1) down to (t + numLags - numLags)
            for (const name of varNames) { // For each variable in the system
                for (let lag = 1; lag <= numLags; lag++) { // For each lag
                    currentRow.push(dataSeries[name][t + numLags - lag]);
                }
            }
            X_lagged_block_rows.push(currentRow);
        }
        
        for (const depVarName of varNames) {
            const Y_vector = dataSeries[depVarName].slice(numLags); // Dependent variable, length N_effective

            // Construct the full X matrix for this equation: [constant_column, ...X_lagged_block_rows]
            const X_matrix_this_equation = X_lagged_block_rows.map(row => [1, ...row]);
            
            console.log(`Estimating equation for ${depVarName}: N_eff=${N_effective}, K_lags=${varNames.length * numLags + 1}`);
            // console.log(`Y vector (first 3 for ${depVarName}):`, Y_vector.slice(0,3));
            // console.log(`X matrix (first 3 rows, first 3 cols for ${depVarName}):`, X_matrix_this_equation.slice(0,3).map(r => r.slice(0,3)));

            console.log(`Inputs for OLS (${depVarName}):`);
            console.log('Y_vector (first 5):', Y_vector.slice(0, 5));
            console.log('X_matrix_this_equation (first 3 rows, all columns, then first 5x5 subarray):');
            try {
                console.table(X_matrix_this_equation.slice(0, 3)); // Shows first 3 rows, all columns in a table
            } catch (e) { console.log('console.table for X_matrix_this_equation failed, logging raw slice:', X_matrix_this_equation.slice(0,3)); }
            console.log('X_matrix_this_equation (first 5x5 subarray for quick check):', X_matrix_this_equation.slice(0, 5).map(row => row.slice(0, 5)));
            const olsResult = this.performOLS(Y_vector, X_matrix_this_equation);
        
            if (olsResult && !olsResult.error && olsResult.coefficients) {
                // Transform coefficients array into named object format expected by displayVarEquationResults
                const namedCoefficients = { c: olsResult.coefficients[0] }; // First coefficient is constant
                const namedTStats = { c: olsResult.tStats[0] };
                const namedPValues = { c: olsResult.pValues[0] };
                
                let coeffIndex = 1; // Start after constant
                for (const name of varNames) {
                    for (let lag = 1; lag <= numLags; lag++) {
                        const key = `${name}_L${lag}`;
                        namedCoefficients[key] = olsResult.coefficients[coeffIndex];
                        namedTStats[key] = olsResult.tStats[coeffIndex];
                        namedPValues[key] = olsResult.pValues[coeffIndex];
                        coeffIndex++;
                    }
                }
                
                // Replace array coefficients with named object
                olsResult.originalCoefficients = olsResult.coefficients; // Keep original array just in case
                olsResult.coefficients = namedCoefficients;
                olsResult.tStats = namedTStats;
                olsResult.pValues = namedPValues;
                
                // Add adjusted R-squared
                const n = olsResult.N;
                const k = olsResult.K;
                olsResult.adjRSquared = 1 - ((1 - olsResult.rSquared) * (n - 1) / (n - k));
                
                // Add F-statistic (simplified)
                olsResult.fStatistic = {
                    value: (olsResult.rSquared / (k - 1)) / ((1 - olsResult.rSquared) / (n - k)),
                    pValue: NaN // We don't have F-distribution CDF
                };
                
                // Add number of observations for display
                olsResult.nObs = n;
            }
            
            results[depVarName] = olsResult;
        }
        return results;
    }
};

// If not using ES6 modules, uncomment to make SvarAlgorithms globally available:
window.SvarAlgorithms = SvarAlgorithms;
