function initSvarSetup() {
    // We'll use the central SVARData store instead of a local object
    // But keep the legacy object for backward compatibility
    window.svarSetupData = {};
    console.log("Initializing SVAR setup visualization...");

    // Check if Plotly and the essential elements are loaded
    if (typeof Plotly === 'undefined' || 
        !document.getElementById('sampleSizeSlider') || 
        !document.getElementById('shocksScatterPlot') || 
        !document.getElementById('reducedShocksScatterPlot')
    ) {
        setTimeout(initSvarSetup, 100); // Retry after a short delay
        return;
    }

    const sampleSizeSlider = document.getElementById('sampleSizeSlider');
    const sampleSizeValue = document.getElementById('sampleSizeValue');
    const newSampleBtn = document.getElementById('newSampleBtn');
    const phiSwitch = document.getElementById('phiSwitch');
    const phiLabel0 = document.getElementById('phiLabel0');
    const phiLabelPi = document.getElementById('phiLabelPi');

    let T = parseInt(sampleSizeSlider.value);
    let eta_raw_1t, eta_raw_2t;                 // Raw shocks from initial generation
    let sigma_t_values;                         // Array for sigma_t (1 for 1st half, 2 for 2nd half)
    let epsilon_1t, epsilon_2t;                 // FINAL Structural shocks (raw * sigma_t, then normalized), used for plotting and u_t calculation
    let u_1t, u_2t;                             // Reduced-form shocks
    let phi_0 = 0;                              // Initial value for phi_0, controlled by phiSwitch
    let B_0;                                    // Will hold the B_0 matrix
    let selectedPointIndex = null;              // For potential future use with plot interactions

    // --- Helper Functions for Data Generation ---
    function generateSingleNormalSeries(size) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(normalRandom());
        }
        return series;
    }

    function normalRandom() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random();
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    }

    function generateMixedNormalData(length, s) {
        return Array.from({length}, () => {
            if (Math.random() < 0.9) {
                return normalRandom() - 0.1 * s;
            } else {
                return normalRandom() + s - 0.1 * s;
            }
        });
    }

    function getB0Matrix(phi) {
        const cosPhi = Math.cos(phi);
        const sinPhi = Math.sin(phi);
        return [[cosPhi, -sinPhi], [sinPhi, cosPhi]];
    }

    function generateSigmaT(size) {
        const sigma_vals = new Array(size);
        const midpoint = Math.floor(size / 2);
        for (let i = 0; i < size; i++) {
            sigma_vals[i] = (i < midpoint) ? 1 : 2;
        }
        return sigma_vals;
    }

    // --- Core Calculation Logic for B0 and Reduced Form Shocks ---
    const B0_RECURSIVE = [[1, 0], [0.5, 1]];
    const B0_NON_RECURSIVE = [[1, 0.5], [0.5, 1]];
    
    function calculateReducedFormAndB0() {
        if (!epsilon_1t || !epsilon_2t || epsilon_1t.length !== T || epsilon_2t.length !== T) {
            console.error("Structural shocks not ready or length mismatch");
            return;
        }

        B_0 = phiSwitch.checked ? B0_NON_RECURSIVE : B0_RECURSIVE;
        
        u_1t = []; u_2t = [];
        for (let i = 0; i < T; i++) {
            u_1t[i] = B_0[0][0] * epsilon_1t[i] + B_0[0][1] * epsilon_2t[i];
            u_2t[i] = B_0[1][0] * epsilon_1t[i] + B_0[1][1] * epsilon_2t[i];
        }
        
            // Update both the legacy object and the central data store
        window.svarSetupData.u_1t = u_1t;
        window.svarSetupData.u_2t = u_2t;
        window.svarSetupData.epsilon_1t = epsilon_1t;
        window.svarSetupData.epsilon_2t = epsilon_2t;
        window.svarSetupData.B_0 = B_0;
        
        // Update the central data store
        window.SVARData.updateData({
            u_1t: u_1t,
            u_2t: u_2t,
            epsilon_1t: epsilon_1t,
            epsilon_2t: epsilon_2t,
            B_0: B_0,
            isNonRecursive: phiSwitch.checked
        });
    }

    // --- Plotting and UI Helper Functions ---
    function getSquareSize(plotDivElement) {
        if (!plotDivElement) {
            console.error("getSquareSize called with null or undefined plotDivElement. Returning default size: 300px.");
            return 300;
        }
        const width = plotDivElement.offsetWidth;
        // console.log(`getSquareSize for ${plotDivElement.id}: offsetWidth = ${width}, parentOffsetWidth = ${plotDivElement.parentElement ? plotDivElement.parentElement.offsetWidth : 'N/A'}, window.innerWidth = ${window.innerWidth}`);
        const effectiveWidth = width > 0 ? width : 300;
        // console.log(`getSquareSize for ${plotDivElement.id}: effectiveWidth chosen = ${effectiveWidth}`);
        return effectiveWidth;
    }

    function updatePlot() {
        const shocksScatterPlotDiv = document.getElementById('shocksScatterPlot');
        const reducedShocksPlotDiv = document.getElementById('reducedShocksScatterPlot');

        if (!shocksScatterPlotDiv || !reducedShocksPlotDiv) {
            console.error("Plot div(s) not found!");
            return;
        }

        // Check for new epsilon_1t, epsilon_2t (scaled shocks)
        if (!epsilon_1t || !epsilon_2t || !u_1t || !u_2t || epsilon_1t.length === 0) {
            console.warn("Data for plotting (epsilon_t or u_t) is not ready yet.");
            return;
        }

        // Plot 1: Structural Shocks (ε_t = σ_t * η_t)
        const traceEpsilon = {
            x: epsilon_1t, // These are now the scaled structural shocks ε_t
            y: epsilon_2t,
            mode: 'markers',
            type: 'scatter',
            marker: {
                size: 6,
                color: '#00ADB5', // Teal
                opacity: 0.7,
                line: { width: 1, color: '#222831' } // Dark border
            },
            hoverinfo: 'x+y',
            hovertemplate: 'ε₁: %{x:.3f}<br>ε₂: %{y:.3f}<extra></extra>'
        };

        const squareSizeEpsilon = getSquareSize(shocksScatterPlotDiv);
        const layoutEpsilon = {
            title: { text: 'Structural Shocks (ε₁ vs ε₂)', font: { size: 18, color: '#222831' } },
            xaxis: { title: { text: 'ε₁', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE' },
            yaxis: { title: { text: 'ε₂', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE', scaleanchor: "x", scaleratio: 1 },
            width: squareSizeEpsilon,
            height: squareSizeEpsilon,
            margin: { l: 50, r: 20, b: 50, t: 50, pad: 4 },
            paper_bgcolor: '#f8f9fa',
            plot_bgcolor: '#ffffff'
        };
        Plotly.newPlot(shocksScatterPlotDiv, [traceEpsilon], layoutEpsilon, {responsive: true});

        const traceU = {
            x: u_1t, y: u_2t,
            mode: 'markers', type: 'scatter',
            marker: { size: 6, color: '#FF5733', opacity: 0.7, line: { width: 1, color: '#222831' } },
            hoverinfo: 'x+y', hovertemplate: 'u₁: %{x:.3f}<br>u₂: %{y:.3f}<extra></extra>'
        };
        const layoutU = {
            title: { text: 'Reduced-Form Shocks (u₁ vs u₂)', font: { size: 18, color: '#222831' } },
            xaxis: { title: { text: 'u₁', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE' },
            yaxis: { title: { text: 'u₂', font: { size: 14, color: '#222831' } }, zeroline: true, zerolinecolor: '#DDDDDD', gridcolor: '#EEEEEE', scaleanchor: 'x', scaleratio: 1 },
            width: getSquareSize(reducedShocksPlotDiv), height: getSquareSize(reducedShocksPlotDiv),
            margin: { t: 40, b: 40, l: 40, r: 20 }, hovermode: 'closest',
            plot_bgcolor: '#FFFFFF', paper_bgcolor: '#FFFFFF', showlegend: false
        };
        Plotly.newPlot(reducedShocksPlotDiv, [traceU], layoutU, { responsive: true, displayModeBar: false, displaylogo: false });
    }

    // --- Main Data Generation and Plotting Trigger ---
    function generateAndPlot() {
        console.log(`Generating data for T=${T}...`);
        // Generate raw structural shocks
        generateRawEpsilons();
        
        // Store raw innovations in shared data
        window.SVARData.updateData({
            e_1t: eta_raw_1t,
            e_2t: eta_raw_2t
        });
        
        // Generate sigma_t values
        sigma_t_values = generateSigmaT(T);
        
        // Apply scaling and normalization
        applyScalingAndCalculateReducedForm();
        
        // Update the plot
        updatePlot();
        
        // Notify about new sample generation
        window.SVARData.notifyUpdate('NEW_SAMPLE_GENERATED', {
            sampleSize: T,
            isNonRecursive: phiSwitch.checked
        });
    }

    function generateRawEpsilons() {
        // 1. Generate raw shock series (eta_raw)
        eta_raw_1t = generateSingleNormalSeries(T);
        const s_mixture = -5; 
        eta_raw_2t = generateMixedNormalData(T, s_mixture);
    }

    function normalizeEpsilons() {
        // 4. Normalize these scaled shocks to get final structural shocks (epsilon_t)
        console.log("Normalizing scaled shocks to get final epsilon_t...");
        [epsilon_1t, epsilon_2t] = NormalizeData(eta_raw_1t, eta_raw_2t);
    }

    function applyScalingAndCalculateReducedForm() {
        // 2. Generate sigma_t values
        sigma_t_values = generateSigmaT(T);
        console.log("Generated sigma_t values. First few:", sigma_t_values.slice(0,5), "Last few:", sigma_t_values.slice(-5));

        // 3. Scale raw shocks by sigma_t (element-wise)
        let scaled_unnormalized_1t = new Array(T);
        let scaled_unnormalized_2t = new Array(T);
        for (let i = 0; i < T; i++) {
            scaled_unnormalized_1t[i] = eta_raw_1t[i] * sigma_t_values[i];
            scaled_unnormalized_2t[i] = eta_raw_2t[i] * sigma_t_values[i];
        }
        console.log("Scaled raw shocks with sigma_t.");
        
        // 4. Normalize these scaled shocks to get final structural shocks (epsilon_t)
        [epsilon_1t, epsilon_2t] = NormalizeData(scaled_unnormalized_1t, scaled_unnormalized_2t);

        // 5. Calculate B0 and reduced form shocks u_t (this will also update B0 display)
        console.log("Calculating B0 and reduced form shocks u_t...");
        calculateReducedFormAndB0(); 
    }

    // --- Normalization Function (now only zero mean & unit variance, no decorrelation) ---
    function NormalizeData(unnormalized_scaled_shock1, unnormalized_scaled_shock2) {
        if (!unnormalized_scaled_shock1 || !unnormalized_scaled_shock2) {
            console.error("NormalizeData called with undefined raw shock arrays.");
            return [[], []];
        }
        if (unnormalized_scaled_shock1.length !== T || unnormalized_scaled_shock2.length !== T) {
            console.error(`Mismatch in T (${T}) and rawEta lengths (${unnormalized_scaled_shock1.length}, ${unnormalized_scaled_shock2.length}) in NormalizeData. This should not happen if generateAndPlot is structured correctly.`);
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        if (T <= 1) {
            console.error("Sample size T must be greater than 1 for normalization.");
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }

        // Normalize shock 1
        let mean1 = 0;
        for (let i = 0; i < T; i++) mean1 += unnormalized_scaled_shock1[i];
        mean1 /= T;
        let var1 = 0;
        for (let i = 0; i < T; i++) var1 += (unnormalized_scaled_shock1[i] - mean1) ** 2;
        var1 /= T;
        if (var1 <= 1e-9 || isNaN(var1)) {
            console.error('Variance for shock 1 is too small or NaN. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        let std1 = Math.sqrt(var1);
        let output_shock1_normalized = new Array(T);
        for (let i = 0; i < T; i++) output_shock1_normalized[i] = (unnormalized_scaled_shock1[i] - mean1) / std1;

        // Normalize shock 2
        let mean2 = 0;
        for (let i = 0; i < T; i++) mean2 += unnormalized_scaled_shock2[i];
        mean2 /= T;
        let var2 = 0;
        for (let i = 0; i < T; i++) var2 += (unnormalized_scaled_shock2[i] - mean2) ** 2;
        var2 /= T;
        if (var2 <= 1e-9 || isNaN(var2)) {
            console.error('Variance for shock 2 is too small or NaN. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        let std2 = Math.sqrt(var2);
        let output_shock2_normalized = new Array(T);
        for (let i = 0; i < T; i++) output_shock2_normalized[i] = (unnormalized_scaled_shock2[i] - mean2) / std2;

        selectedPointIndex = null;
        return [output_shock1_normalized, output_shock2_normalized];
    }

    // --- Event Listeners ---
    sampleSizeSlider.addEventListener('input', () => {
        sampleSizeValue.textContent = sampleSizeSlider.value;
    });

    sampleSizeSlider.addEventListener('change', function() {
        T = parseInt(this.value);
        
        // Update the central data store with new sample size
        window.SVARData.updateData({
            T: T
        });
        
        // Notify about sample size change
        window.SVARData.notifyUpdate('SAMPLE_SIZE_CHANGED', {
            sampleSize: T
        });
        
        generateAndPlot();
    });

    newSampleBtn.addEventListener('click', () => {
        console.log("New Sample button clicked.");
        generateAndPlot(); // Regenerate everything for a new sample
    });

    function updateToggleVisual() {
        if (!phiLabel0 || !phiLabelPi) return;
        phiLabel0.classList.remove('selected');
        phiLabelPi.classList.remove('selected');
        if (phiSwitch.checked) {
            phiLabelPi.classList.add('selected');
        } else {
            phiLabel0.classList.add('selected');
        }
    }

    if (phiSwitch) {
        phiSwitch.addEventListener('change', function() {
            calculateReducedFormAndB0();
            updatePlot();
            updateToggleVisual();
        });

        phiLabel0.addEventListener('click', function() {
            if (phiSwitch.checked) {
                phiSwitch.checked = false;
                phiSwitch.dispatchEvent(new Event('change'));
            }
        });

        phiLabelPi.addEventListener('click', function() {
            if (!phiSwitch.checked) {
                phiSwitch.checked = true;
                phiSwitch.dispatchEvent(new Event('change'));
            }
        });
    } else {
        console.error("'phiSwitch' element not found!");
    }

    window.addEventListener('resize', () => {
        // console.log("Window resized, updating plots.");
        updatePlot(); // Redraw plots on resize to maintain square aspect and responsiveness
    });


    // --- Switch Synchronization ---
    function setupSwitchSync() {
        // Listen for model type changes from any section
        window.SVARData.subscribe('MODEL_TYPE_CHANGED', (event) => {
            if (event.detail && typeof event.detail.isNonRecursive === 'boolean' && 
                phiSwitch.checked !== event.detail.isNonRecursive) {
                // Only update if the value is different
                phiSwitch.checked = event.detail.isNonRecursive;
                updateToggleVisual();
                calculateReducedFormAndB0();
                updatePlot();
            }
        });

        // Broadcast model type changes
        phiSwitch.addEventListener('change', () => {
            // Update the central data store
            window.SVARData.updateData({
                isNonRecursive: phiSwitch.checked
            });
            
            // Notify about the model type change
            window.SVARData.notifyUpdate('MODEL_TYPE_CHANGED', {
                isNonRecursive: phiSwitch.checked
            });
            
            updateToggleVisual();
        });
    }

    // --- Initial Execution ---
    console.log("Initialising SVAR setup...");
    updateToggleVisual(); // Set initial highlight state for the toggle
    generateAndPlot(); // Generate initial data and plots
    initializeStickyMenu('svar-setup', 'simulation-controls', 'controls-placeholder');
    setupSwitchSync(); // Initialize switch synchronization
    
    // Expose functions to global scope (both legacy and new system)
    window.svarSetupData.generateAndPlot = generateAndPlot;
    
    // Set up listeners for data changes from other sections
    window.SVARData.subscribe('DATA_UPDATED', (event) => {
        // Check if we need to update our local T value
        if (event.detail.T && event.detail.T !== T) {
            T = event.detail.T;
            sampleSizeInput.value = T;
        }
    });
    
    // Initialize the central data store with current values
    window.SVARData.updateData({
        T: T,
        isNonRecursive: phiSwitch.checked
    });

    // Loading screen is now handled at the global level in main.js
}

// initSvarSetup is now called by main.js after content has been loaded.
