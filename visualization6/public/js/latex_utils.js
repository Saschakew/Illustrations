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
            const category = 'LATEX_UTIL';
            const element = document.getElementById(elementId);
            if (element) {
                element.textContent = latexString; 
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([element]).catch((err) => {
                        console.error('MathJax typesetting error for element:', elementId, err);
                        if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                            DebugManager.log(category, 'MathJax typesetting error for element:', elementId, 'Error:', err, 'LaTeX String:', latexString);
                        }
                    });
                } else {
                    console.warn('MathJax.typesetPromise is not available. LaTeX will not be rendered for element:', elementId);
                    if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
                         DebugManager.log(category, 'MathJax.typesetPromise not available for element:', elementId);
                    }
                }
            } else {
                if (window.DebugManager && DebugManager.isCategoryEnabled(category)) {
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
