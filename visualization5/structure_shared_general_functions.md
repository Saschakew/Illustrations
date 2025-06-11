# Proposed Structure: `shared-general-functions.js`

This file will consolidate generic, reusable functions that are not specific to the SVAR domain.

```javascript
window.SharedGeneral = {
    // ===================================
    // Random Number Generation
    // ===================================
    /**
     * Generates a random number from a standard normal distribution using the Box-Muller transform.
     * @returns {number} A random normal value.
     */
    normalRandom: function() { /* ... */ },

    // ===================================
    // Data Manipulation
    // ===================================
    /**
     * Normalizes a single data series to have a mean of 0 and a standard deviation of 1.
     * @param {number[]} series - The input data series.
     * @returns {{mean: number, std: number, normalizedSeries: number[]}} An object containing the calculated mean, standard deviation, and the normalized series.
     */
    normalizeSeries: function(series) { /* ... */ },

    /**
     * Normalizes two data series to have a mean of 0 and a standard deviation of 1.
     * Based on the logic in `svar_setup.js`'s `NormalizeData` function.
     * @param {number[]} series1 - The first data series.
     * @param {number[]} series2 - The second data series.
     * @returns {{ series1: number[], series2: number[] }} The normalized series.
     */
    normalizeTwoSeries: function(series1, series2) { /* ... */ },

    // ===================================
    // Matrix Utilities (2x2)
    // ===================================
    /**
     * Inverts a 2x2 matrix.
     * @param {number[][]} matrix - The matrix [[a, b], [c, d]].
     * @returns {number[][] | null} The inverted matrix or null if singular.
     */
    matinv: function(matrix) { /* ... */ },

    /**
     * Multiplies two 2x2 matrices.
     * @param {number[][]} matrixA - The first matrix.
     * @param {number[][]} matrixB - The second matrix.
     * @returns {number[][]} The resulting matrix.
     */
    matmul: function(matrixA, matrixB) { /* ... */ },

    /**
     * Performs Cholesky decomposition on a symmetric, positive-definite 2x2 matrix.
     * @param {number[][]} matrix - The matrix [[a, b], [b, d]].
     * @returns {number[][] | null} The lower triangular matrix [[l11, 0], [l21, l22]] or null if decomposition fails.
     */
    cholesky: function(matrix) { /* ... */ },

    /**
     * Transposes a 2x2 matrix.
     * @param {number[][]} matrix - The input matrix.
     * @returns {number[][]} The transposed matrix.
     */
    transpose: function(matrix) { /* ... */ },

    /**
     * Formats a 2x2 matrix into a LaTeX string.
     * @param {number[][]} matrix - The input matrix.
     * @param {number} [precision=2] - The number of decimal places for the elements.
     * @returns {string} A LaTeX string for the matrix.
     */
    matrixToLatex: function(matrix, precision = 2) { /* ... */ },

    // ===================================
    // UI Utilities
    // ===================================
    /**
     * Calculates the desired square size for a plot based on its container's width.
     * @param {HTMLElement} plotDivElement - The plot's container element.
     * @param {number} [defaultSize=300] - A fallback size.
     * @returns {number} The calculated width.
     */
    getSquareSize: function(plotDivElement, defaultSize = 300) { /* ... */ },

    /**
     * Updates the visual state of a custom toggle switch.
     * @param {HTMLInputElement} switchEl - The checkbox input element.
     * @param {HTMLElement} labelTrue - The label for the 'true' or 'checked' state.
     * @param {HTMLElement} labelFalse - The label for the 'false' or 'unchecked' state.
     * @param {string} [selectedClass='selected'] - The CSS class to apply to the active label.
     */
    updateToggleVisual: function(switchEl, labelTrue, labelFalse, selectedClass = 'selected') { /* ... */ }
};
```
