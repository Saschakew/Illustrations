function initEstimationNonGaussianity() {
    if (typeof Plotly === 'undefined' || !document.getElementById('phiSlider_eng')) {
        setTimeout(initEstimationNonGaussianity, 100);
        return;
    }

    // --- DOM Elements ---
    const b0Switch = document.getElementById('b0Switch_eng');
    const phiSlider = document.getElementById('phiSlider_eng');
    const phiValueDisplay = document.getElementById('phiValue_eng');
    const innovationsScatterPlotDiv = document.getElementById('innovationsScatterPlot_eng');
    const objectivePlotDiv = document.getElementById('objectivePlot_eng');
    const estimateBtn = document.getElementById('estimateNonGaussianityBtn_eng');
    const estimationResults = document.getElementById('estimationResults_eng');
    const estimatedB_eng = document.getElementById('estimatedB_eng');
    const trueB0_eng = document.getElementById('trueB0_eng');
    const estimatedPhiValue_eng = document.getElementById('estimatedPhiValue_eng');
    const phiLabel0_eng = document.getElementById('phiLabel0_eng');
    const phiLabelPi_eng = document.getElementById('phiLabelPi_eng');

    // --- Constants & State ---
    const B0_REC_THEORETICAL = [[1, 0], [0.5, 1]];
    const c_pi_4 = Math.cos(Math.PI / 4), s_pi_4 = Math.sin(Math.PI / 4);
    const B0_NON_REC_THEORETICAL = [[c_pi_4, -s_pi_4], [0.5 * c_pi_4 + s_pi_4, -0.5 * s_pi_4 + c_pi_4]];
    
    let u1t = [], u2t = [], T = 0;
    let bChol, objectiveCurve, phi_true;
    let isNonRecursive = false;
    let phi_values = Array.from({ length: 315 }, (_, i) => -1.57 + i * 0.01); // Range: -1.57 to 1.57
    let innovationsPlotRenderedOnce = false;
    let objectivePlotRenderedOnce = false;

    // --- Matrix Helpers ---
    const matinv = ([[a, b], [c, d]]) => { const det = a * d - b * c; if (det === 0) return [[0,0],[0,0]]; return [[d / det, -b / det], [-c / det, a / det]]; };
    const matmul = ([[a, b], [c, d]], [[e, f], [g, h]]) => [[a * e + b * g, a * f + b * h], [c * e + d * g, c * f + d * h]];
    const cholesky = ([[a, b], [c, d]]) => { const l11 = Math.sqrt(a); if (l11 === 0) return [[0,0],[0,0]]; const l21 = b / l11; const l22 = Math.sqrt(d - l21 * l21); return [[l11, 0], [l21, l22]]; };
    const transpose = ([[a, b], [c, d]]) => [[a, c], [b, d]];
    const formatMatrix = (m) => `\begin{bmatrix} ${m[0][0].toFixed(2)} & ${m[0][1].toFixed(2)} \\ ${m[1][0].toFixed(2)} & ${m[1][1].toFixed(2)} \end{bmatrix}`;

    function getSquareSize(plotDivElement) {
        if (!plotDivElement) return 300;
        const width = plotDivElement.offsetWidth;
        return width > 0 ? width : 300;
    }

    // --- Core Logic ---
    function calculateTruePhi(B0) {
        const sigma_pop = matmul(B0, transpose(B0));
        const b_chol_pop = cholesky(sigma_pop);
        const q_true_pop = matmul(matinv(b_chol_pop), B0);
        return Math.atan2(q_true_pop[1][0], q_true_pop[0][0]);
    }

    const PHI_TRUE_REC = calculateTruePhi(B0_REC_THEORETICAL);
    const PHI_TRUE_NON_REC = calculateTruePhi(B0_NON_REC_THEORETICAL);

    function calculateObjectiveCurve() {
        const sigma_hat = [[u1t.reduce((a, v) => a + v * v, 0) / T, u1t.reduce((a, v, i) => a + v * u2t[i], 0) / T], [u2t.reduce((a, v, i) => a + v * u1t[i], 0) / T, u2t.reduce((a, v) => a + v * v, 0) / T]];
        bChol = cholesky(sigma_hat);
        if (bChol[0][0] === 0) { // Handle degenerate case
            objectiveCurve = Array(158).fill(0);
            return;
        }
        
        // Check if shared innovations are available
        let useSharedInnovations = false;
        let e1 = [], e2 = [];
        
        if (window.SVARData && window.SVARData.e_1t && window.SVARData.e_1t.length === T) {
            // Use shared innovations from SVARData
            e1 = window.SVARData.e_1t;
            e2 = window.SVARData.e_2t;
            useSharedInnovations = true;
            console.log('Estimation NonGaussianity: Using shared innovations from SVARData');
        }
        
        if (useSharedInnovations) {
            // When using shared innovations, we calculate the objective function differently
            // For each phi, we transform the shared innovations using the B matrix
            objectiveCurve = phi_values.map(phi => {
                const c = Math.cos(phi), s = Math.sin(phi);
                const Q = [[c, -s], [s, c]];
                const B = matmul(bChol, Q);
                
                // Transform the shared innovations using B to get u_t
                const u1_phi = [], u2_phi = [];
                for (let i = 0; i < T; i++) {
                    u1_phi[i] = B[0][0] * e1[i] + B[0][1] * e2[i];
                    u2_phi[i] = B[1][0] * e1[i] + B[1][1] * e2[i];
                }
                
                // Calculate the objective function using the transformed innovations
                let sum_e1sq_e2 = 0, sum_e2sq_e1 = 0;
                for (let i = 0; i < T; i++) {
                    sum_e1sq_e2 += e1[i] * e1[i] * e2[i];
                    sum_e2sq_e1 += e2[i] * e2[i] * e1[i];
                }
                return Math.pow(sum_e1sq_e2 / T, 2) + Math.pow(sum_e2sq_e1 / T, 2);
            });
        } else {
            // Traditional approach: calculate innovations for each phi
            const bChol_inv = matinv(bChol);
            
            objectiveCurve = phi_values.map(phi => {
                const c = Math.cos(phi), s = Math.sin(phi);
                const Q_inv = [[c, s], [-s, c]];
                const B_inv = matmul(Q_inv, bChol_inv);
                let sum_e1sq_e2 = 0, sum_e2sq_e1 = 0;
                for (let i = 0; i < T; i++) {
                    const e1 = B_inv[0][0] * u1t[i] + B_inv[0][1] * u2t[i];
                    const e2 = B_inv[1][0] * u1t[i] + B_inv[1][1] * u2t[i];
                    sum_e1sq_e2 += e1 * e1 * e2;
                    sum_e2sq_e1 += e2 * e2 * e1;
                }
                return Math.pow(sum_e1sq_e2 / T, 2) + Math.pow(sum_e2sq_e1 / T, 2);
            });
        }
    }

    function updatePlotsAndUI() {
        if (!objectiveCurve || !bChol) return;

        const phi_current = parseFloat(phiSlider.value);

    // Get the controls container once
    const controlsContainer = document.getElementById('estimation-controls-eng');
        phiValueDisplay.textContent = phi_current.toFixed(2);

        // Scatter plot of innovations
        const c = Math.cos(phi_current), s = Math.sin(phi_current);
        const Q_inv_current = [[c, s], [-s, c]];
        const bChol_inv = matinv(bChol);
        const B_inv_current = matmul(Q_inv_current, bChol_inv);
        const e1_current = u1t.map((u1, i) => B_inv_current[0][0] * u1 + B_inv_current[0][1] * u2t[i]);
        const e2_current = u1t.map((u1, i) => B_inv_current[1][0] * u1 + B_inv_current[1][1] * u2t[i]);

        const innovationsLayout = {
            title: '<b>Innovations e(φ)</b>',
            xaxis: { title: 'e₁', zeroline: true, zerolinecolor: '#DDDDDD' },
            yaxis: { title: 'e₂', zeroline: true, zerolinecolor: '#DDDDDD', scaleanchor: 'x', scaleratio: 1 },
            width: getSquareSize(innovationsScatterPlotDiv),
            height: getSquareSize(innovationsScatterPlotDiv),
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: '#f8f9fa',
            plot_bgcolor: '#ffffff',
            font: { family: 'Arial, sans-serif', size: 12, color: '#222831' }
        };
        const innovationsTrace = {
            x: e1_current, y: e2_current, mode: 'markers', type: 'scatter',
            marker: { size: 6, color: 'rgb(252, 81, 133)', opacity: 0.7, line: { width: 1, color: 'rgba(0, 0, 0, 0.5)' } },
            hovertemplate: 'e₁: %{x:.3f}<br>e₂: %{y:.3f}<extra></extra>'
        };
        Plotly.react(innovationsScatterPlotDiv, [innovationsTrace], innovationsLayout, { responsive: true });

        // The 'plotly_afterplot' listener is now set up once during initialization.

        // Objective function plot
        const phi_values = Array.from({ length: 158 }, (_, i) => i * 0.01);
        const yMax = Math.max(...objectiveCurve);
        const objectiveLayout = {
            title: '<b>Objective Function J(φ)</b>',
            xaxis: { title: 'φ', zeroline: true, zerolinecolor: '#DDDDDD', range: [-1.57, 1.57] },
            yaxis: { title: 'J(φ) Value', zeroline: true, zerolinecolor: '#DDDDDD', range: [0, yMax * 1.1] },
            width: getSquareSize(objectivePlotDiv),
            height: getSquareSize(objectivePlotDiv),
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: '#f8f9fa',
            plot_bgcolor: '#ffffff',
            font: { family: 'Arial, sans-serif', size: 12, color: '#222831' },
            shapes: [
                { type: 'line', x0: phi_current, y0: 0, x1: phi_current, y1: yMax * 1.1, line: { color: 'rgb(252, 81, 133)', width: 2, dash: 'dash' }, name: 'Current φ' },
                { type: 'line', x0: phi_true, y0: 0, x1: phi_true, y1: yMax * 1.1, line: { color: 'rgba(0, 0, 0, 0.5)', width: 2 }, name: 'True φ₀' }
            ]
        };
        const objectiveTrace = {
            x: phi_values, y: objectiveCurve, mode: 'lines', type: 'scatter', name: 'J(φ)',
            line: { color: 'rgb(252, 81, 133)', width: 2 },
            hovertemplate: 'φ: %{x:.3f}<br>J(φ): %{y:.3f}<extra></extra>'
        };
        Plotly.react(objectivePlotDiv, [objectiveTrace], objectiveLayout, { responsive: true });

        // The 'plotly_afterplot' listener is now set up once during initialization.
    }

    function handleDataUpdate(event) {
        if (event.detail && event.detail.u_1t) {
            u1t = event.detail.u_1t;
            u2t = event.detail.u_2t;
            T = u1t.length;
            isNonRecursive = event.detail.isNonRecursive;
            phi_true = isNonRecursive ? PHI_TRUE_NON_REC : PHI_TRUE_REC;
            
            b0Switch.checked = isNonRecursive;
            updateToggleVisual();
            if (estimationResults) estimationResults.style.display = 'none';

            calculateObjectiveCurve();
            updatePlotsAndUI();
        }
    }

    // --- Event Listeners ---
    phiSlider.addEventListener('input', updatePlotsAndUI);
    
    estimateBtn.addEventListener('click', () => {
        if (!objectiveCurve) return;
        const minValue = Math.min(...objectiveCurve);
        const phi_hat_idx = objectiveCurve.indexOf(minValue);
        const phi_hat = phi_values[phi_hat_idx];

        const c_hat = Math.cos(phi_hat), s_hat = Math.sin(phi_hat);
        const Q_hat = [[c_hat, -s_hat], [s_hat, c_hat]];
        const B_hat = matmul(bChol, Q_hat);
        const B0_true_matrix = isNonRecursive ? B0_NON_REC_THEORETICAL : B0_REC_THEORETICAL;

        estimatedPhiValue_eng.textContent = phi_hat.toFixed(4);
        estimatedB_eng.innerHTML = `\(${formatMatrix(B_hat)}\)`;
        trueB0_eng.innerHTML = `\(${formatMatrix(B0_true_matrix)}\)`;
        estimationResults.style.display = 'block';
        MathJax.typesetPromise([estimationResults]);
    });
    
    // The newSampleBtn and b0Switch are in svar_setup, which will trigger a DATA_UPDATED event.
    // This component only needs to listen for DATA_UPDATED.

    // --- Toggle Visuals ---
    function updateToggleVisual() {
        if (!phiLabel0_eng || !phiLabelPi_eng || !b0Switch) return;
        if (b0Switch.checked) {
            phiLabelPi_eng.classList.add('highlight');
            phiLabel0_eng.classList.remove('highlight');
        } else {
            phiLabel0_eng.classList.add('highlight');
            phiLabelPi_eng.classList.remove('highlight');
        }
    }

    // --- Initial Load & Data Sync ---
    window.SVARData.subscribe('DATA_UPDATED', handleDataUpdate);
    
    if (window.SVARData && window.SVARData.u_1t && window.SVARData.u_1t.length > 0) {
        handleDataUpdate({ detail: window.SVARData });
    } 
    
    initializeStickyMenu('estimation-nongaussianity', 'estimation-controls-eng', 'controls-placeholder-eng');

    // Attach plot listeners only once to prevent memory leaks
    const controlsContainer = document.getElementById('estimation-controls-eng');
    
    // Ensure Plotly is initialized before attaching event handlers
    // Check if the div is a Plotly graph with 'on' method available
    if (innovationsScatterPlotDiv && innovationsScatterPlotDiv.on && controlsContainer && typeof controlsContainer.forceRefreshStickyMeasurements === 'function') {
        innovationsScatterPlotDiv.on('plotly_afterplot', () => {
            if (!innovationsPlotRenderedOnce) {
                controlsContainer.forceRefreshStickyMeasurements();
                innovationsPlotRenderedOnce = true;
            }
        });
    } else {
        console.log('Innovations scatter plot not yet initialized with Plotly');
    }
    
    if (objectivePlotDiv && objectivePlotDiv.on && controlsContainer && typeof controlsContainer.forceRefreshStickyMeasurements === 'function') {
        objectivePlotDiv.on('plotly_afterplot', () => {
            if (!objectivePlotRenderedOnce) {

                controlsContainer.forceRefreshStickyMeasurements();
                objectivePlotRenderedOnce = true;
            }
        });
    }
}

window.initEstimationNonGaussianity = initEstimationNonGaussianity;
