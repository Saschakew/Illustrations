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

    // --- Constants & State ---
    const B0_REC = [[1, 0], [0.5, 1]];
    const c_pi_4 = Math.cos(Math.PI / 4);
    const s_pi_4 = Math.sin(Math.PI / 4);
    // B0_NON_REC = B0_REC * Q(pi/4)
    // B0_REC = [[1, 0], [0.5, 1]]
    // Q(pi/4) = [[c_pi_4, -s_pi_4], [s_pi_4, c_pi_4]]
    const B0_NON_REC = [
        [c_pi_4, -s_pi_4],
        [0.5 * c_pi_4 + s_pi_4, -0.5 * s_pi_4 + c_pi_4]
    ];
    let isNonRecursive = false;
    let bChol, correlationCurve, phi_true;
    
    // Data variables
    let u1t = [], u2t = [], T = 0;

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
        const l11 = Math.sqrt(a);
        const l21 = b / l11;
        const l22 = Math.sqrt(d - l21 * l21);
        return [[l11, 0], [l21, l22]];
    };
    
    const transpose = ([[a, b], [c, d]]) => [[a, c], [b, d]];

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

    function calculateTruePhi(B0) {
        const sigma_pop = matmul(B0, transpose(B0));
        const b_chol_pop = cholesky(sigma_pop);
        const q_true_pop = matmul(matinv(b_chol_pop), B0);
        return Math.atan2(q_true_pop[1][0], q_true_pop[0][0]);
    }

    const PHI_TRUE_REC = calculateTruePhi(B0_REC);
    const PHI_TRUE_NON_REC = calculateTruePhi(B0_NON_REC);

    function generateAndProcessData() {
    // Hide previous estimation results when data is reprocessed
    if (estimationResults) estimationResults.style.display = 'none';

        // Check if data is available from the central data store
        if (window.SVARData && window.SVARData.u_1t && window.SVARData.u_2t) {
            // Use data from central data store
            u1t = window.SVARData.u_1t;
            u2t = window.SVARData.u_2t;
            T = u1t.length;
        } 
        // Fallback to legacy data store if needed
        else if (window.svarSetupData && window.svarSetupData.u_1t && window.svarSetupData.u_2t) {
            u1t = window.svarSetupData.u_1t;
            u2t = window.svarSetupData.u_2t;
            T = u1t.length;
        } else {
            console.error('Data from SVAR setup is not available. Please visit the SVAR Setup section first.');
            return;
        }
        
        console.log(`Estimation Restrictions: Using data with length ${T}`);

        isNonRecursive = b0Switch.checked;
        phi_true = isNonRecursive ? PHI_TRUE_NON_REC : PHI_TRUE_REC;
        
        // Calculate sample covariance matrix of u_t
        const mean_u1 = u1t.reduce((a, b) => a + b) / T;
        const mean_u2 = u2t.reduce((a, b) => a + b) / T;
        const var_u1 = u1t.map(x => (x - mean_u1) ** 2).reduce((a, b) => a + b) / T;
        const var_u2 = u2t.map(x => (x - mean_u2) ** 2).reduce((a, b) => a + b) / T;
        const cov_u1u2 = u1t.map((x, i) => (x - mean_u1) * (u2t[i] - mean_u2)).reduce((a, b) => a + b) / T;
        const sigma_T = [[var_u1, cov_u1u2], [cov_u1u2, var_u2]];

        bChol = cholesky(sigma_T);
        
        // Pre-calculate the correlation curve for the right plot
        correlationCurve = {phis: [], corrs: []};
        for (let p = 0; p <= Math.PI / 2; p += 0.01) {
            const Q = [[Math.cos(p), -Math.sin(p)], [Math.sin(p), Math.cos(p)]];
            const B = matmul(bChol, Q);
            const B_inv = matinv(B);
            let corr_sum = 0;
            for (let i = 0; i < T; i++) {
                const e1 = B_inv[0][0] * u1t[i] + B_inv[0][1] * u2t[i];
                const e2 = B_inv[1][0] * u1t[i] + B_inv[1][1] * u2t[i];
                corr_sum += e1 * e2;
            }
            correlationCurve.phis.push(p);
            correlationCurve.corrs.push(corr_sum / T);
        }
        updatePlotsAndUI();
    }

    function updatePlotsAndUI() {
        // Debug: log current phi_true and toggle state
        console.log('[ER] updatePlotsAndUI: isNonRecursive =', isNonRecursive, ', phi_true =', phi_true, ', phi_true (deg) =', (phi_true * 180 / Math.PI).toFixed(2));
        const phi = parseFloat(phiSlider.value);
        phiValueDisplay.textContent = phi.toFixed(2);
        document.getElementById('phiValueDisplay_er').textContent = phi.toFixed(2);

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
        const traceInnovations = {
            x: e1t,
            y: e2t,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 6,
                color: 'rgb(252, 81, 133)', // New requested color
                opacity: 0.7,
                line: { width: 1, color: '#222831' } // Dark border - consistent
            },
            hoverinfo: 'x+y',
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

        Plotly.react(innovationsScatterPlotDiv, [traceInnovations], layoutInnovations, {responsive: true});

        // Right Plot: Correlation vs. Phi
        const traceCorrelation = {
            x: correlationCurve.phis,
            y: correlationCurve.corrs,
            mode: 'lines',
            type: 'scatter',
            name: 'Sample Correlation',
            line: { color: '#ff7f0e', width: 2 } // Accent color for the line
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
                range: [0, Math.PI/2]
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

        Plotly.react(correlationPlotDiv, [traceCorrelation], layoutCorrelation, {responsive: true});
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

    // --- Sticky Controls similar to SVAR Setup ---
    function setupStickyControlsER() {
        const controlsContainer = document.getElementById('estimation-controls');
        const controlsPlaceholder = document.getElementById('controls-placeholder-er');
        if (!controlsContainer || !controlsPlaceholder) {
            console.error('Required elements for sticky controls not found');
            return;
        }

        let controlsNaturalWidth = null;
        let controlsHeight = null;
        let resizeTimer = null;
        const DEBUG = false;

        function setupInitial() {
            // Wait for MathJax to finish rendering
            if (typeof MathJax !== 'undefined') {
                MathJax.typesetPromise().then(() => {
                    const rect = controlsContainer.getBoundingClientRect();
                    controlsNaturalWidth = rect.width;
                    controlsHeight = rect.height;
                    if (DEBUG) console.log(`ER Controls: Natural width = ${controlsNaturalWidth}px, height = ${controlsHeight}px`);
                    onScroll(); // Re-check scroll position after getting correct dimensions
                }).catch(err => console.error('MathJax typeset error:', err));
            } else {
                const rect = controlsContainer.getBoundingClientRect();
                controlsNaturalWidth = rect.width;
                controlsHeight = rect.height;
            }
        }

        function onScroll() {
            const section = document.getElementById('estimation-restrictions');
            if (!section || !controlsContainer || !controlsPlaceholder) return;
            
            const sectionRect = section.getBoundingClientRect();
            const controlsRect = controlsContainer.getBoundingClientRect();
            
            // Check if we're within the section boundaries
            const withinSection = sectionRect.top <= 0 && sectionRect.bottom > controlsHeight;
            const sectionTopVisible = sectionRect.top <= 0;
            const sectionBottomVisible = sectionRect.bottom > controlsHeight;
            
            // CASE 1: We're within the section and should stick
            if (withinSection && sectionTopVisible && sectionBottomVisible) {
                controlsContainer.classList.add('sticky');
                controlsContainer.style.position = 'fixed';
                controlsContainer.style.top = '0';
                controlsContainer.style.left = '50%';
                controlsContainer.style.width = `${controlsNaturalWidth}px`;
                controlsContainer.style.transform = 'translateX(-50%)';
                controlsPlaceholder.style.height = `${controlsHeight}px`;
                if (DEBUG) console.log('ER State: Sticky');
            }
            // CASE 2: Normal flow
            else {
                controlsContainer.classList.remove('sticky');
                controlsContainer.style.position = '';
                controlsContainer.style.top = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.style.height = '0';
                if (DEBUG) console.log('ER State: Normal flow');
            }
        }

        // Initial setup with a delay to ensure everything is rendered
        setTimeout(() => {
            setupInitial();
            onScroll();
            
            // Add scroll event listener with throttling
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
            
            // Add resize event listener with debouncing
            window.addEventListener('resize', () => {
                if (resizeTimer) clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    setupInitial();
                    // Additional check after a bit more time
                    setTimeout(setupInitial, 100);
                }, 250);
            });
            
            if (DEBUG) console.log('ER Sticky controls initialized.');
        }, 500); // Increased delay to ensure MathJax has time to render
    }

    // --- Initial Load ---
    setupStickyControlsER();
    setupSwitchSync();
    updateToggleVisual(); // Set initial highlight state
    generateAndProcessData();

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
