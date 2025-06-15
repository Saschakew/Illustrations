(function() {
    if (window.LatexUtils) {
        console.warn('LatexUtils already defined. Skipping re-initialization.');
        return;
    }

    window.LatexUtils = {
        formatMatrixToLatex: function(matrix, matrixName, precision = 3) {
            const category = 'LATEX_UTIL';
            if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || matrix[0].length === 0) {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, `Matrix for ${matrixName} is invalid or empty. Provided:`, matrix);
                }
                return `\\( ${matrixName} = \\text{Data Not Available} \\)`;
            }
            if (matrix.some(row => !Array.isArray(row))) {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                     DebugManager.log(category, `Matrix for ${matrixName} has invalid rows. Provided:`, matrix);
                }
                return `\\( ${matrixName} = \\text{Invalid Matrix Structure} \\)`;
            }

            let latexString = `\\( ${matrixName} = \\begin{bmatrix} `;
            matrix.forEach((row, rowIndex) => {
                row.forEach((val, colIndex) => {
                    const numVal = parseFloat(val);
                    latexString += Number.isNaN(numVal) ? "\\text{NaN}" : numVal.toFixed(precision);
                    if (colIndex < row.length - 1) {
                        latexString += " & ";
                    }
                });
                if (rowIndex < matrix.length - 1) {
                    latexString += " \\\\ ";
                }
            });
            latexString += " \\end{bmatrix} \\)";
            return latexString;
        },

        updateLatexDisplay: function(elementId, latexString) {
            const element = document.getElementById(elementId);
            if (!element) {
                if (window.DebugManager && DebugManager.isCategoryEnabled('LATEX_UTIL')) {
                    console.warn(`LatexUtils: Element with ID '${elementId}' not found.`);
                }
                return;
            }

            // Performance Optimization: Only update if the content has actually changed.
            if (element.textContent === latexString) {
                if (window.DebugManager && DebugManager.isCategoryEnabled('LATEX_UPDATE')) {
                    console.log(`Skipping typeset for #${elementId}, content is unchanged.`);
                }
                return; // Exit if the new LaTeX string is the same as the old one
            }

            element.textContent = latexString;

            if (window.MathJax && window.MathJax.typesetPromise) {
                if (window.DebugManager && DebugManager.isCategoryEnabled('LATEX_UPDATE')) {
                    console.log(`Typesetting for element: #${elementId}`);
                }
                window.MathJax.typesetPromise([element]).catch((err) => {
                    console.error('MathJax typesetting error for element:', elementId, err);
                    if (window.DebugManager && DebugManager.isCategoryEnabled('LATEX_UPDATE')) {
                        DebugManager.log('LATEX_UPDATE', 'MathJax typesetting error for element:', elementId, 'Error:', err, 'LaTeX String:', latexString);
                    }
                });
            } else {
                console.warn('MathJax.typesetPromise is not available. LaTeX will not be rendered for element:', elementId);
                if (window.DebugManager && DebugManager.isCategoryEnabled('LATEX_UTIL')) {
                     DebugManager.log('LATEX_UTIL', 'MathJax.typesetPromise not available for element:', elementId);
                    DebugManager.log(category, `LaTeX display element with ID '${elementId}' not found.`);
                }
            }
        },

        displayBPhiMatrix: function(elementId) {
            const category = 'LATEX_UPDATE'; // Use LATEX_UPDATE for higher-level operation
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Attempting to display B(phi) matrix in element: ${elementId}`);
            }

            if (!window.sharedData || typeof window.sharedData.B_phi === 'undefined') {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, 'sharedData.B_phi not available for LaTeX display.');
                }
                this.updateLatexDisplay(elementId, `\\( B(\\phi) = \\text{N/A} \\)`);
                return;
            }
            
            if (!Array.isArray(window.sharedData.B_phi) || window.sharedData.B_phi.length !== 2 ||
                !Array.isArray(window.sharedData.B_phi[0]) || window.sharedData.B_phi[0].length !== 2 ||
                !Array.isArray(window.sharedData.B_phi[1]) || window.sharedData.B_phi[1].length !== 2) {
                
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, 'sharedData.B_phi is not a valid 2x2 matrix:', window.sharedData.B_phi);
                }
                this.updateLatexDisplay(elementId, `\\( B(\\phi) = \\text{Invalid Data Structure} \\)`);
                return;
            }

            const bPhiLatex = this.formatMatrixToLatex(window.sharedData.B_phi, "B(\\phi)");
            this.updateLatexDisplay(elementId, bPhiLatex);
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Updated B(phi) for ${elementId} with LaTeX: ${bPhiLatex}`);
            }
        },

        formatPhiToLatex: function(phiValue, phiName, precision = 3) {
            const category = 'LATEX_UTIL';
            if (typeof phiValue !== 'number' || Number.isNaN(phiValue)) {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, `Phi value for ${phiName} is invalid or NaN. Provided:`, phiValue);
                }
                return `\\( ${phiName} = \\text{N/A} \\)`;
            }
            return `\\( ${phiName} = ${phiValue.toFixed(precision)} \\)`;
        },

        displayPhiEst: function(elementId, phiValue, phiName, precision = 3) {
            const category = 'LATEX_UPDATE';
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Attempting to display ${phiName} in element: ${elementId}`);
            }
            const phiLatex = this.formatPhiToLatex(phiValue, phiName, precision);
            this.updateLatexDisplay(elementId, phiLatex);
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Updated ${phiName} for ${elementId} with LaTeX: ${phiLatex}`);
            }
        },

        displayBEstMatrix: function(elementId, matrix, matrixName, precision = 3) {
            const category = 'LATEX_UPDATE';
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Attempting to display ${matrixName} matrix in element: ${elementId}`);
            }

            if (!matrix || !Array.isArray(matrix) || matrix.length !== 2 ||
                !Array.isArray(matrix[0]) || matrix[0].length !== 2 ||
                !Array.isArray(matrix[1]) || matrix[1].length !== 2) {
                
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, `${matrixName} is not a valid 2x2 matrix or not available:`, matrix);
                }
                // Use formatMatrixToLatex's internal error handling for the string
                const errorLatex = this.formatMatrixToLatex(matrix, matrixName, precision);
                this.updateLatexDisplay(elementId, errorLatex);
                return;
            }

            const bEstLatex = this.formatMatrixToLatex(matrix, matrixName, precision);
            this.updateLatexDisplay(elementId, bEstLatex);
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Updated ${matrixName} for ${elementId} with LaTeX: ${bEstLatex}`);
            }
        },

        formatVToLatex: function(vValue, vName = 'v', precision = 3) {
            const category = 'LATEX_UTIL';
            if (typeof vValue !== 'number' || Number.isNaN(vValue)) {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                    DebugManager.log(category, `Value for ${vName} is invalid or NaN. Provided:`, vValue);
                }
                return `\( ${vName} = \text{N/A} \)`;
            }
            return `\( ${vName} = ${vValue.toFixed(precision)} \)`;
        },

        displayVWeight: function(elementId, vValue, vName = 'v', precision = 3) {
            const category = 'LATEX_UPDATE';
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Attempting to display ${vName} in element: ${elementId}`);
            }
            
            let vLatex;
            if (vValue === null || typeof vValue === 'undefined') {
                 vLatex = `\( ${vName} = \text{Calculating...} \)`;
            } else {
                vLatex = this.formatVToLatex(vValue, vName, precision);
            }

            this.updateLatexDisplay(elementId, vLatex);
            if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                DebugManager.log(category, `Updated ${vName} for ${elementId} with LaTeX: ${vLatex}`);
            }
        }
    };

    // Add a LATEX_UTIL category for lower-level util functions if it doesn't exist
    // This is a bit of a hack, ideally DebugManager is loaded first and categories are pre-defined.
    if (window.DebugManager && typeof window.DebugManager.setCategory === 'function' && typeof DebugManager.isCategoryEnabled('LATEX_UTIL') === 'undefined') {
        // This won't work if DEBUG_CATEGORIES is const and not exported for modification.
        // For now, assume categories are added to an extensible object or use a general one.
        // console.log('Attempting to ensure LATEX_UTIL debug category exists.');
    }

    if (window.DebugManager && DebugManager.isCategoryEnabled('MAIN_APP')) {
        DebugManager.log('MAIN_APP', 'LatexUtils.js initialized.');
    }
})();
