function initEstimationRestrictions() {
    // Ensure Plotly & MathJax and required DOM elements are available. Retry if not ready.
    if (typeof Plotly === 'undefined' ||
        !document.getElementById('phiSlider_er') ||
        !document.getElementById('innovationsScatterPlot_er')) {
        setTimeout(initEstimationRestrictions, 100);
        return;
    }

    // --- DOM Elements ---
    const b0Switch = document.getElementById('b0Switch_er');
    const phiSlider = document.getElementById('phiSlider_er');
    const phiValueDisplay = document.getElementById('phiValue_er');
    const newSampleBtn = document.getElementById('newSampleBtn_er');
    const bMatrixDisplay = document.getElementById('bMatrixDisplay_er');
    const innovationsScatterPlotDiv = document.getElementById('innovationsScatterPlot_er');
    const correlationPlotDiv = document.getElementById('correlationPlot_er');
    const estimateRecursiveBtn = document.getElementById('estimateRecursiveBtn_er');
    const estimationResults = document.getElementById('estimationResults_er');
    const estimatedB_er = document.getElementById('estimatedB_er');
    const trueB0_er = document.getElementById('trueB0_er'); 
    const estimatedPhiValue_er = document.getElementById('estimatedPhiValue_er');
    const phiTrueRecDisplay = document.getElementById('phi_true_rec_display');
    const phiTrueNonRecDisplay = document.getElementById('phi_true_non_rec_display');

    // --- Constants & State ---
    const B0_REC = [[1, 0], [0.5, 1]];
    // This now matches the definition in svar_setup.js
    const B0_NON_REC = [[1, 0.5], [0.5, 1]];
    let isNonRecursive = false;
    let bChol, correlationCurve, phi_true;
    
    // Data variables
    let u1t = [], u2t = [], T = 0;
    let innovationsPlotRenderedOnce = false;
    let correlationPlotRenderedOnce = false;

    // --- Matrix Helper Functions (for 2x2 matrices) ---
    const matinv = ([[a, b], [c, d]]) => {
        const det = a * d - b * c;
        if (det === 0) return null;
        return [[d / det, -b / det], [-c / det, a / det]];
    };

    const matmul = ([[a, b], [c, d]], [[e, f], [g, h]]) => {
        return [[a * e + b * g, a * f + b * h], [c * e + d * g, c * f + d * h]];
    };

    const cholesky = ([[a, b], [c, d]]) => { // for symmetric positive-definite
        if (a <= 0) return null; // Must be positive definite
        const l11 = Math.sqrt(a);
        const l21 = b / l11;
        const inner = d - l21 * l21;
        if (inner <= 0) return null;
        const l22 = Math.sqrt(inner);
        return [[l11, 0], [l21, l22]];
    };

    const calculateB = (phi) => {
        if (!bChol) return null;
        const Q = [[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]];
        return matmul(bChol, Q);
    };

    const matrixToLatex = (matrix) => {
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2) {
            return '\\begin{pmatrix} ? & ? \\\\ ? & ? \\end{pmatrix}';
        }
        return `\\begin{pmatrix} ${matrix[0][0].toFixed(2)} & ${matrix[0][1].toFixed(2)} \\\\ ${matrix[1][0].toFixed(2)} & ${matrix[1][1].toFixed(2)} \\end{pmatrix}`;
    };
    
    const transpose = ([[a, b], [c, d]]) => [[a, c], [b, d]];
    
    // Calculate the theoretical phi_0 value for a given B0 matrix
    const calculateTruePhi = (B0) => {
        // Calculate population covariance matrix Σ = B₀B₀'
        const sigma_pop = matmul(B0, transpose(B0));
        // Get Cholesky decomposition of population covariance
        const b_chol_pop = cholesky(sigma_pop);
        if (!b_chol_pop) {
            console.error("Cholesky decomposition of population covariance failed.");
            return null;
        }
        // Calculate Q = (B^Chol)^(-1) * B₀
        const b_chol_pop_inv = matinv(b_chol_pop);
        if (!b_chol_pop_inv) {
            console.error("Cannot invert population Cholesky matrix.");
            return null;
        }
        const q_true_pop = matmul(b_chol_pop_inv, B0);
        // Extract phi_0 from Q
        return Math.atan2(q_true_pop[1][0], q_true_pop[0][0]);
    };

    // --- Plotting Helper Functions ---
    function getSquareSize(plotDivElement) {
        if (!plotDivElement) {
            console.error("getSquareSize called with null or undefined plotDivElement. Returning default size: 300px.");
            return 300;
        }
        const width = plotDivElement.offsetWidth;
        const effectiveWidth = width > 0 ? width : 300; // Fallback to 300 if offsetWidth is 0
        return effectiveWidth;
    }

    // --- Core Logic ---

    function generateAndProcessData() {
    // Hide previous estimation results when data is reprocessed
    if (estimationResults) estimationResults.style.display = 'none';

        // Check if data is available from the central data store
        if (window.SVARData && window.SVARData.u_1t && window.SVARData.u_2t && window.SVARData.u_1t.length > 0) {
            // Use data from central data store
            u1t = window.SVARData.u_1t;
            u2t = window.SVARData.u_2t;
            T = u1t.length;
        } 
        // Fallback to legacy data store if needed
        else if (window.svarSetupData && window.svarSetupData.u_1t && window.svarSetupData.u_2t && window.svarSetupData.u_1t.length > 0) {
            u1t = window.svarSetupData.u_1t;
            u2t = window.svarSetupData.u_2t;
            T = u1t.length;
        } else {
            console.error('Data from SVAR setup is not available or empty. Please visit the SVAR Setup section first.');
            return;
        }
        
        console.log(`Estimation Restrictions: Using data with length ${T}`);

        // Check if we have enough data before calculating statistics
        if (T <= 1) {
            console.error('Not enough data points to calculate statistics (need at least 2)');
            return;
        }

        // Calculate sample covariance matrix of u_t
        const mean_u1 = u1t.reduce((a, b) => a + b, 0) / T;
        const mean_u2 = u2t.reduce((a, b) => a + b, 0) / T;
        const v_u1 = u1t.map(x => (x - mean_u1) ** 2).reduce((a, b) => a + b, 0) / (T - 1);
        const v_u2 = u2t.map(x => (x - mean_u2) ** 2).reduce((a, b) => a + b, 0) / (T - 1);
        const cov_u1_u2 = u1t.map((x, i) => (x - mean_u1) * (u2t[i] - mean_u2)).reduce((a, b) => a + b, 0) / (T - 1);
        const sample_cov_matrix = [[v_u1, cov_u1_u2], [cov_u1_u2, v_u2]];

        // Perform Cholesky decomposition on the sample covariance matrix
        bChol = cholesky(sample_cov_matrix);
        if (!bChol) {
            console.error("Cholesky decomposition failed. The sample covariance matrix might not be positive definite.");
            return;
        }

        // Calculate the theoretical true phi values based on population covariance
        const phi_true_rec = calculateTruePhi(B0_REC);
        const phi_true_non_rec = calculateTruePhi(B0_NON_REC);
        
        // Update the UI with the theoretical values
        if (phiTrueRecDisplay) phiTrueRecDisplay.textContent = phi_true_rec.toFixed(4);
        if (phiTrueNonRecDisplay) phiTrueNonRecDisplay.textContent = phi_true_non_rec.toFixed(4);

        // Set the phi_true for the plot based on the toggle
        isNonRecursive = b0Switch.checked;
        phi_true = isNonRecursive ? phi_true_non_rec : phi_true_rec;

        // Pre-calculate the correlation curve for the right plot
        correlationCurve = {phis: [], corrs: []};
        
        // Check if shared innovations are available
        let e1 = [], e2 = [];
        let useSharedInnovations = false;
        
        if (window.SVARData && window.SVARData.e_1t && window.SVARData.e_1t.length === T) {
            // Use shared innovations from SVARData
            e1 = window.SVARData.e_1t;
            e2 = window.SVARData.e_2t;
            useSharedInnovations = true;
            console.log('Estimation Restrictions: Using shared innovations from SVARData');
        }
        
        for (let p = -Math.PI / 2; p <= Math.PI / 2; p += 0.01) {
            const Q = [[Math.cos(p), -Math.sin(p)], [Math.sin(p), Math.cos(p)]];
            const B = matmul(bChol, Q);
            
            if (useSharedInnovations) {
                // When using shared innovations, we need to transform them using B
                // and then calculate correlation with the observed u1t, u2t
                const u1_phi = [], u2_phi = [];
                for (let i = 0; i < T; i++) {
                    u1_phi[i] = B[0][0] * e1[i] + B[0][1] * e2[i];
                    u2_phi[i] = B[1][0] * e1[i] + B[1][1] * e2[i];
                }
                
                // Calculate correlation between transformed u1 and original u1t
                let sum_u1u1 = 0, sum_u1sq = 0, sum_u1t_sq = 0;
                for (let i = 0; i < T; i++) {
                    sum_u1u1 += u1_phi[i] * u1t[i];
                    sum_u1sq += u1_phi[i] * u1_phi[i];
                    sum_u1t_sq += u1t[i] * u1t[i];
                }
                
                const corr = sum_u1u1 / Math.sqrt(sum_u1sq * sum_u1t_sq);
                correlationCurve.phis.push(p);
                correlationCurve.corrs.push(Math.abs(corr));
            } else {
                // Traditional approach: calculate innovations for each phi
                const B_inv = matinv(B);
                if (!B_inv) continue;
                
                let corr_sum = 0;
                for (let i = 0; i < T; i++) {
                    const e1 = B_inv[0][0] * u1t[i] + B_inv[0][1] * u2t[i];
                    const e2 = B_inv[1][0] * u1t[i] + B_inv[1][1] * u2t[i];
                    corr_sum += e1 * e2;
                }
                correlationCurve.phis.push(p);
                correlationCurve.corrs.push(corr_sum / T);
            }
        }
        updatePlotsAndUI();
    }

    function updatePlotsAndUI() {
        // If bChol is not calculated yet (e.g., due to an error in generateAndProcessData), do nothing.
        if (!bChol) {
            // This can happen if the sample data leads to a non-positive-definite covariance matrix.
            return;
        }


        const phi = parseFloat(phiSlider.value);
        phiValueDisplay.textContent = phi.toFixed(2);
        document.getElementById('phiValueDisplay_er').textContent = phi.toFixed(2);

        // Get the controls container once
        const controlsContainer = document.getElementById('estimation-controls');

        // Calculate B = B_chol * Q(phi)
        const Q_phi = [[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]];
        const B = matmul(bChol, Q_phi);

        // Display B matrix
        const roundedB = B.map(row => row.map(val => val.toFixed(2)));
        bMatrixDisplay.textContent = `\\( \\begin{pmatrix} ${roundedB[0][0]} & ${roundedB[0][1]} \\\\ ${roundedB[1][0]} & ${roundedB[1][1]} \\end{pmatrix} \\)`;
        if (typeof MathJax !== 'undefined' && MathJax.typeset) {
            MathJax.typesetPromise([bMatrixDisplay]).catch(err => console.error('MathJax typeset error:', err));
        }

        // Calculate innovations e_t(phi) = B^{-1} * u_t
        const B_inv = matinv(B);
        const e1t = [], e2t = [];
        // Use the u1t and u2t already defined in generateAndProcessData
        for (let i = 0; i < u1t.length; i++) {
            e1t.push(B_inv[0][0] * u1t[i] + B_inv[0][1] * u2t[i]);
            e2t.push(B_inv[1][0] * u1t[i] + B_inv[1][1] * u2t[i]);
        }

        // Left Plot: Innovations Scatter
        const innovationsTrace = {
            x: e1t,
            y: e2t,
            mode: 'markers',
            type: 'scatter',
            marker: { size: 6, color: 'rgb(252, 81, 133)', opacity: 0.7 },
            hovertemplate: 'e₁: %{x:.3f}<br>e₂: %{y:.3f}<extra></extra>'
        };

        const squareSizeInnovations = getSquareSize(innovationsScatterPlotDiv);
        const layoutInnovations = {
            title: { text: 'Identified Innovations e(φ) (e₁ vs e₂)', font: { size: 18, color: '#222831' } }, // Adjusted title
            xaxis: { title: { text: 'e₁', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE' },
            yaxis: { title: { text: 'e₂', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE', scaleanchor: "x", scaleratio: 1 },
            width: squareSizeInnovations,
            height: squareSizeInnovations,
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 }, // Consistent margin
            paper_bgcolor: '#f8f9fa', // Consistent background
            plot_bgcolor: '#ffffff'    // Consistent plot area background
        };

        Plotly.react(innovationsScatterPlotDiv, [innovationsTrace], layoutInnovations, {responsive: true});

        // Right Plot: Correlation vs. Phi
        const correlationTrace = {
            x: correlationCurve.phis,
            y: correlationCurve.corrs,
            mode: 'lines',
            type: 'scatter',
            name: 'Sample Correlation',
            line: { color: 'rgb(252, 81, 133)', width: 2 } // Accent color for the line
        };

        const squareSizeCorrelation = getSquareSize(correlationPlotDiv);
        const yMinShape = 0; // For shapes, given fixed y-axis [0,1]
        const yMaxShape = 1; // For shapes, given fixed y-axis [0,1]

        // Determine y-position for the 'True φ' annotation
        let truePhiAnnotationY = 0.5; // Default to middle if not found or outside range
        const truePhiIndex = correlationCurve.phis.findIndex(p => p >= phi_true);
        if (truePhiIndex !== -1 && correlationCurve.corrs[truePhiIndex] !== undefined) {
            truePhiAnnotationY = Math.max(0.05, Math.min(0.95, correlationCurve.corrs[truePhiIndex]));
        }

        const layoutCorrelation = {
            title: { text: 'Sample Correlation vs. φ', font: { size: 18, color: '#222831' } },
            xaxis: {
                title: { text: 'φ (radians)', font: { size: 14, color: '#222831' } },
                zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE',
                range: [-Math.PI / 2, Math.PI / 2]
            },
            yaxis: {
                title: { text: 'mean(e₁ ⋅ e₂)', font: { size: 14, color: '#222831' } },
                zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE',
                range: [0, 1] // Fixed y-scale from 0 to 1
            },
            width: squareSizeCorrelation,
            height: squareSizeCorrelation,
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: '#f8f9fa',
            plot_bgcolor: '#ffffff',
            shapes: [
                { // Current phi line
                    type: 'line', x0: phi, y0: yMinShape, x1: phi, y1: yMaxShape,
                    line: { color: 'rgba(255, 0, 0, 0.7)', width: 2, dash: 'dash'}
                },
                { // Recursive restriction (phi=0) line
                    type: 'line', x0: 0, y0: yMinShape, x1: 0, y1: yMaxShape,
                    line: { color: 'rgba(0, 0, 0, 0.5)', width: 2, dash: 'dot'}
                },
                { // Horizontal line at y=0
                    type: 'line',
                    x0: 0, x1: Math.PI / 2,
                    y0: 0, y1: 0,
                    line: {color: 'red', width: 2, dash: 'dash'}
                },
                { // True phi_0 line
                    type: 'line',
                    x0: phi_true, x1: phi_true,
                    y0: yMinShape, y1: yMaxShape,
                    line: { color: 'green', width: 2, dash: 'dot'}
                }
            ],
            annotations: [
                {
                    x: phi_true,
                    y: 1.05,
                    yref: 'paper',
                    text: 'True φ₀',
                    showarrow: false,
                    font: { color: 'green', size: 14 },
                    xanchor: 'center'
                }
            ],
            hoverinfo: 'x+y',
            hovertemplate: 'φ: %{x:.3f}<br>Corr: %{y:.3f}<extra></extra>'
        };

        Plotly.react(correlationPlotDiv, [correlationTrace], layoutCorrelation, {responsive: true});
    }

    // --- Event Listeners ---
    b0Switch.addEventListener('change', function() {
        updateToggleVisual();
        generateAndProcessData();
        // Update central data store and notify other sections
        window.SVARData.updateData({
            isNonRecursive: b0Switch.checked
        });
        window.SVARData.notifyUpdate('MODEL_TYPE_CHANGED', {
            isNonRecursive: b0Switch.checked
        });
    });

    // New Sample button should trigger data generation in svar_setup.js first
    newSampleBtn.addEventListener('click', function() {
        // Call the generateAndPlot function from SVAR setup
        if (window.svarSetupData && window.svarSetupData.generateAndPlot) {
            window.svarSetupData.generateAndPlot();
            // The update will happen via the NEW_SAMPLE_GENERATED event
        } else {
            console.error('SVAR setup generateAndPlot function not available.');
        }
    });

    phiSlider.addEventListener('input', updatePlotsAndUI);

    // Estimate recursive SVAR button
    estimateRecursiveBtn.addEventListener('click', function() {
        // Set phi to 0 (recursive identification)
        phiSlider.value = 0;
        
        // Update plots and UI with the new phi value
        updatePlotsAndUI();
        
        // Show estimation results
        estimationResults.style.display = 'block';
        
        // Get the current B matrix (which is now B(0) - the Cholesky)
        const phi = 0;
        const Q_phi = [[Math.cos(phi), -Math.sin(phi)], [Math.sin(phi), Math.cos(phi)]];
        const estimatedB = matmul(bChol, Q_phi);
        
        // Get the true B0 matrix based on the current toggle state
        const trueB0 = isNonRecursive ? B0_NON_REC : B0_REC;
        
        // Display estimated phi
        estimatedPhiValue_er.textContent = '\\( 0.00\\)';

        // Display the estimated B matrix
        const roundedEstimatedB = estimatedB.map(row => row.map(val => val.toFixed(2)));
        estimatedB_er.textContent = `\\( \\begin{pmatrix} ${roundedEstimatedB[0][0]} & ${roundedEstimatedB[0][1]} \\\\ ${roundedEstimatedB[1][0]} & ${roundedEstimatedB[1][1]} \\end{pmatrix} \\)`;
        
        // Display the true B0 matrix
        const roundedTrueB0 = trueB0.map(row => row.map(val => val.toFixed(2)));
        trueB0_er.textContent = `\\( \\begin{pmatrix} ${roundedTrueB0[0][0]} & ${roundedTrueB0[0][1]} \\\\ ${roundedTrueB0[1][0]} & ${roundedTrueB0[1][1]} \\end{pmatrix} \\)`;
        
        // Typeset the MathJax content for the entire results paragraph
        if (typeof MathJax !== 'undefined' && MathJax.typeset) {
            MathJax.typesetPromise([estimationResults_er]).catch(err => console.error('MathJax typeset error:', err));
        }
    });

    // --- Toggle Visual Update Function ---
    function updateToggleVisual() {
        const phiLabel0 = document.getElementById('phiLabel0_er');
        const phiLabelPi = document.getElementById('phiLabelPi_er');
        const togglePill = b0Switch.closest('.phi-toggle-pill');
        if (!phiLabel0 || !phiLabelPi || !togglePill) return;

        const isNonRecursive = b0Switch.checked;
        phiLabel0.classList.toggle('selected', !isNonRecursive);
        phiLabelPi.classList.toggle('selected', isNonRecursive);
        togglePill.classList.toggle('active', isNonRecursive);
    }

    // --- Switch Synchronization ---
    function setupSwitchSync() {
        // Listen for model type changes from any section
        window.SVARData.subscribe('MODEL_TYPE_CHANGED', (event) => {
            if (event.detail && typeof event.detail.isNonRecursive === 'boolean' && 
                b0Switch.checked !== event.detail.isNonRecursive) {
                // Only update if the value is different
                b0Switch.checked = event.detail.isNonRecursive;
                updateToggleVisual();
                generateAndProcessData();
            }
        });
        
        // Listen for new sample generation
        window.SVARData.subscribe('NEW_SAMPLE_GENERATED', (event) => {
            console.log('Received new sample notification in estimation_restrictions.js');
            // Small delay to ensure data is ready
            setTimeout(() => {
                generateAndProcessData();
            }, 100);
        });
        
        // Listen for sample size changes
        window.SVARData.subscribe('SAMPLE_SIZE_CHANGED', (event) => {
            console.log('Received sample size change notification in estimation_restrictions.js');
            // Will be handled by NEW_SAMPLE_GENERATED event
        });
    }

    // --- Event Listeners ---
    phiSlider.addEventListener('input', updatePlotsAndUI);

    newSampleBtn.addEventListener('click', () => {
        generateAndProcessData();
        updatePlotsAndUI();
    });

    b0Switch.addEventListener('change', () => {
        isNonRecursive = b0Switch.checked;
        // Notify other sections about the change
        window.SVARData.updateData({ isNonRecursive: isNonRecursive }, 'MODEL_TYPE_CHANGED');
        updateToggleVisual();
        generateAndProcessData(); // Re-process data for new phi_true
        updatePlotsAndUI();
    });
    
    estimateRecursiveBtn.addEventListener('click', () => {
        // Find the phi that maximizes the correlation
        let maxCorr = -2;
        let bestPhi = 0;
        if (correlationCurve && correlationCurve.phis) {
            correlationCurve.phis.forEach((phi, i) => {
                if (correlationCurve.corrs[i] > maxCorr) {
                    maxCorr = correlationCurve.corrs[i];
                    bestPhi = phi;
                }
            });
        }
        
        phiSlider.value = bestPhi;
        updatePlotsAndUI();
        phiSlider.dispatchEvent(new Event('input'));

        // Show estimation results
        if (estimationResults) {
            const trueB0 = isNonRecursive ? B0_NON_REC : B0_REC;
            const estimatedB = calculateB(bestPhi);
            
            trueB0_er.textContent = `B₀ = ${matrixToLatex(trueB0)}`;
            estimatedB_er.textContent = `B̂(φ̂) = ${matrixToLatex(estimatedB)}`;
            estimatedPhiValue_er.textContent = `φ̂ = ${bestPhi.toFixed(4)}`;
            
            estimationResults.style.display = 'block';
            if (window.MathJax) {
                MathJax.typesetPromise([trueB0_er, estimatedB_er]).catch(console.error);
            }
        }
    });

    // --- Initial Load & Setup ---
    initializeStickyMenu('estimation-restrictions', 'estimation-controls', 'controls-placeholder-er');
    setupSwitchSync();
    updateToggleVisual(); // Set initial highlight state
    
    // Generate data and draw initial plots
    generateAndProcessData();
    updatePlotsAndUI();

    // Attach plot listeners now that plots exist
    const controlsContainer = document.getElementById('estimation-controls');
    if (innovationsScatterPlotDiv && controlsContainer && typeof controlsContainer.forceRefreshStickyMeasurements === 'function') {
        innovationsScatterPlotDiv.on('plotly_afterplot', () => {
            if (!innovationsPlotRenderedOnce) {
                controlsContainer.forceRefreshStickyMeasurements();
                innovationsPlotRenderedOnce = true;
            }
        });
    }
    if (correlationPlotDiv && controlsContainer && typeof controlsContainer.forceRefreshStickyMeasurements === 'function') {
        correlationPlotDiv.on('plotly_afterplot', () => {
            if (!correlationPlotRenderedOnce) {
                controlsContainer.forceRefreshStickyMeasurements();
                correlationPlotRenderedOnce = true;
            }
        });
    }

    // Attach listener for clicking on the correlation plot to update the slider
    correlationPlotDiv.on('plotly_click', function(data) {
        const clickedPhi = data.points[0].x;
        phiSlider.value = clickedPhi;
        updatePlotsAndUI(); // Update based on the new phi
        phiSlider.dispatchEvent(new Event('input'));
    });

    // Expose to global so main.js can call it after injecting section
    window.initEstimationRestrictions = initEstimationRestrictions;
    
    // Expose functions to global scope (both legacy and new system)
    window.estimationRestrictionsData = {
        generateAndProcessData: generateAndProcessData
    };
    
    // Set up listeners for data changes
    window.SVARData.subscribe('DATA_UPDATED', (event) => {
        // If u_1t or u_2t have been updated, regenerate our plots
        if (event.detail.u_1t || event.detail.u_2t) {
            console.log('Received data update notification in estimation_restrictions.js');
            generateAndProcessData();
        }
    });
    
    // Initialize with current values if available
    if (window.SVARData && window.SVARData.isNonRecursive !== undefined) {
        b0Switch.checked = window.SVARData.isNonRecursive;
        updateToggleVisual();
    }
}
