function initSvarSetup() {
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
    function calculateReducedFormAndB0() {
        if (!epsilon_1t || !epsilon_2t ) { // epsilon_1t, epsilon_2t are now the final structural shocks
            console.error("Structural shocks (epsilon_1t, epsilon_2t) for B0/u_t calculation not ready.");
            return;
        }
        if (epsilon_1t.length !== T || epsilon_2t.length !== T) {
            console.error(`Length mismatch for structural shocks: T=${T}, eps1=${epsilon_1t.length}, eps2=${epsilon_2t.length}.`);
            return; 
        }

        B_0 = getB0Matrix(phi_0);

        u_1t = new Array(T);
        u_2t = new Array(T);
        for (let i = 0; i < T; i++) {
            u_1t[i] = B_0[0][0] * epsilon_1t[i] + B_0[0][1] * epsilon_2t[i];
            u_2t[i] = B_0[1][0] * epsilon_1t[i] + B_0[1][1] * epsilon_2t[i];
        }
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
        // 1. Generate raw shock series (eta_raw)
        eta_raw_1t = generateSingleNormalSeries(T);
        const s_mixture = -5; 
        eta_raw_2t = generateMixedNormalData(T, s_mixture);

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
        console.log("Normalizing scaled shocks to get final epsilon_t...");
        [epsilon_1t, epsilon_2t] = NormalizeData(scaled_unnormalized_1t, scaled_unnormalized_2t);

        if (!epsilon_1t || !epsilon_2t || epsilon_1t.length !== T) {
            console.error("Normalization of scaled shocks failed or returned inconsistent data. Aborting plot.");
            Plotly.purge(document.getElementById('shocksScatterPlot'));
            Plotly.purge(document.getElementById('reducedShocksScatterPlot'));
            return;
        }
        console.log(`Final epsilon_1t mean: ${epsilon_1t.reduce((a,b)=>a+b,0)/T}, variance: ${epsilon_1t.map(x=>x*x).reduce((a,b)=>a+b,0)/T}`);
        console.log(`Final epsilon_2t mean: ${epsilon_2t.reduce((a,b)=>a+b,0)/T}, variance: ${epsilon_2t.map(x=>x*x).reduce((a,b)=>a+b,0)/T}`);

        // 5. Calculate B0 and reduced form shocks u_t (this will also update B0 display)
        console.log("Calculating B0 and reduced form shocks u_t...");
        calculateReducedFormAndB0(); 

        if (!u_1t || !u_2t) { 
             console.error("calculateReducedFormAndB0 failed to produce u_t. Aborting plot.");
             return;
        }
        console.log("Data generation and calculations complete. Updating plots.");
        updatePlot();
    }

    // --- Normalization Function (largely unchanged, but ensure it uses current T) ---
    function NormalizeData(unnormalized_scaled_shock1, unnormalized_scaled_shock2) {
        if (!unnormalized_scaled_shock1 || !unnormalized_scaled_shock2) {
            console.error("NormalizeData called with undefined raw shock arrays.");
            return [[], []];
        }
        // Ensure data passed to NormalizeData matches current T
        if (unnormalized_scaled_shock1.length !== T || unnormalized_scaled_shock2.length !== T) {
            console.error(`Mismatch in T (${T}) and rawEta lengths (${unnormalized_scaled_shock1.length}, ${unnormalized_scaled_shock2.length}) in NormalizeData. This should not happen if generateAndPlot is structured correctly.`);
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2]; // Return raw to avoid further issues
        }

        let mean1 = 0, mean2 = 0, cov11 = 0, cov12 = 0, cov22 = 0;
        for (let i = 0; i < T; i++) {
            mean1 += unnormalized_scaled_shock1[i];
            mean2 += unnormalized_scaled_shock2[i];
        }
        mean1 /= T; mean2 /= T;

        for (let i = 0; i < T; i++) {
            cov11 += (unnormalized_scaled_shock1[i] - mean1) * (unnormalized_scaled_shock1[i] - mean1);
            cov12 += (unnormalized_scaled_shock1[i] - mean1) * (unnormalized_scaled_shock2[i] - mean2);
            cov22 += (unnormalized_scaled_shock2[i] - mean2) * (unnormalized_scaled_shock2[i] - mean2);
        }

        if (T <= 1) {
            console.error("Sample size T must be greater than 1 for normalization.");
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        cov11 /= (T - 1); cov12 /= (T - 1); cov22 /= (T - 1);

        let L11 = Math.sqrt(cov11);
        if (isNaN(L11) || L11 <= 1e-9) {
            console.error('Cholesky L11 is NaN or too small. cov11:', cov11, '. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        let L21 = cov12 / L11;
        const L22_squared_val = cov22 - L21 * L21;
        let L22;
        if (L22_squared_val <= 1e-9) {
            console.warn('Cholesky L22_squared_val is near zero or negative:', L22_squared_val, '. Setting L22 to a small positive.');
            L22 = 1e-6;
        } else {
            L22 = Math.sqrt(L22_squared_val);
        }

        if (isNaN(L21) || isNaN(L22) || L22 <= 1e-9) {
            console.error('Cholesky L21 or L22 is NaN or L22 too small. L21:', L21, 'L22:', L22, '. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }

        let output_shock1_normalized = new Array(T);
        let output_shock2_normalized = new Array(T);
        for (let i = 0; i < T; i++) {
            output_shock1_normalized[i] = (unnormalized_scaled_shock1[i] - mean1) / L11;
            output_shock2_normalized[i] = ((unnormalized_scaled_shock2[i] - mean2) - L21 * output_shock1_normalized[i]) / L22;
        }

        let newMean1 = 0, newMean2 = 0, newVar1 = 0, newVar2 = 0;
        for (let i = 0; i < T; i++) {
            newMean1 += output_shock1_normalized[i];
            newMean2 += output_shock2_normalized[i];
        }
        newMean1 /= T; newMean2 /= T;

        for (let i = 0; i < T; i++) {
            output_shock1_normalized[i] -= newMean1;
            output_shock2_normalized[i] -= newMean2;
            newVar1 += output_shock1_normalized[i] * output_shock1_normalized[i];
            newVar2 += output_shock2_normalized[i] * output_shock2_normalized[i];
        }
        let newVar1_val = newVar1 / T;
        let newVar2_val = newVar2 / T;

        if (newVar1_val <= 1e-9 || isNaN(newVar1_val)) {
            console.error('Variance for output_shock1_normalized is too small or NaN. newVar1_val:', newVar1_val, '. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }
        if (newVar2_val <= 1e-9 || isNaN(newVar2_val)) {
            console.error('Variance for output_shock2_normalized is too small or NaN. newVar2_val:', newVar2_val, '. Returning raw data.');
            return [unnormalized_scaled_shock1, unnormalized_scaled_shock2];
        }

        newVar1 = Math.sqrt(newVar1_val);
        newVar2 = Math.sqrt(newVar2_val);

        for (let i = 0; i < T; i++) {
            output_shock1_normalized[i] /= newVar1;
            output_shock2_normalized[i] /= newVar2;
        }
        
        selectedPointIndex = null;
        return [output_shock1_normalized, output_shock2_normalized];
    }

    // --- Event Listeners ---
    sampleSizeSlider.addEventListener('input', () => {
        sampleSizeValue.textContent = sampleSizeSlider.value;
    });

    sampleSizeSlider.addEventListener('change', () => {
        T = parseInt(sampleSizeSlider.value);
        console.log(`Sample size T changed to: ${T}`);
        generateAndPlot(); // Regenerate everything when T changes
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
        phiSwitch.addEventListener('change', () => {
            phi_0 = phiSwitch.checked ? Math.PI / 4 : 0;
            console.log(`phi_0 changed to: ${phi_0.toFixed(4)}`);
            updateToggleVisual(); // Update the visual highlight
            calculateReducedFormAndB0();
            updatePlot();
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

    // --- Sticky Controls Logic ---
    function setupStickyControls() {
        console.log("Setting up sticky controls...");
        const controlsContainer = document.getElementById('simulation-controls');
        const controlsPlaceholder = document.getElementById('controls-placeholder');
        let initialControlsOffsetTop = 0;
        let resizeTimer = null;
        const DEBUG = false; // Set to true to enable debug logging

        if (!controlsContainer || !controlsPlaceholder) {
            console.error("Essential sticky control elements (controlsContainer or controlsPlaceholder) not found!");
            return;
        }

        function setupInitialPositions() {
            if (!controlsContainer) return;

            // Store current scroll position
            const scrollY = window.scrollY;
            
            // Force scroll to top temporarily to get accurate measurements
            // This is necessary because on small screens, the page might already be scrolled
            // when setupInitialPositions is called after a resize
            window.scrollTo(0, 0);
            
            // Temporarily remove sticky classes and reset relevant inline styles
            controlsContainer.classList.remove('sticky', 'sticky-bottom');
            controlsContainer.style.position = '';
            controlsContainer.style.top = '';
            controlsContainer.style.left = '';
            controlsContainer.style.width = '';
            controlsContainer.style.transform = '';
            
            // Force a reflow to ensure the browser recalculates layout
            void controlsContainer.offsetWidth;
            
            // Now get the accurate measurements in normal flow state
            initialControlsOffsetTop = controlsContainer.offsetTop;
            
            // Measure and store the natural width when in normal flow
            // This is critical to prevent width changes when scrolling
            controlsNaturalWidth = controlsContainer.offsetWidth;
            
            // Reset placeholder
            if (controlsPlaceholder) {
                controlsPlaceholder.classList.remove('active');
                controlsPlaceholder.style.height = '0px';
            }
            
            // Restore scroll position
            window.scrollTo(0, scrollY);
            
            if (DEBUG) {
                console.log('Initial controls offsetTop:', initialControlsOffsetTop);
                console.log('Controls natural width:', controlsNaturalWidth);
            }
        }

        // Store the natural width of the controls container when it's in normal flow
        // We'll measure this once during initialization and use it consistently
        let controlsNaturalWidth = 0;
        
        function handleStickyScroll() {
            if (!controlsContainer || !controlsPlaceholder) return;

            const controlsHeight = controlsContainer.offsetHeight; // Get current height, might change with wrapping
            const scrollTop = window.scrollY;
            
            // Get the current position of the controls container relative to the viewport
            const controlsRect = controlsContainer.getBoundingClientRect();
            
            const contentSection = controlsContainer.closest('main'); 
            if (!contentSection) {
                console.warn("Sticky controls: 'main' content section not found. Reverting to basic sticky behavior.");
                return; // Exit if no main content section for advanced sticky
            }

            // Get the section's position and dimensions
            const sectionRect = contentSection.getBoundingClientRect(); // Relative to viewport
            
            // Check if we're within the section's vertical bounds
            const sectionTopVisible = sectionRect.top <= 0;
            const sectionBottomVisible = sectionRect.bottom >= window.innerHeight;
            const withinSection = sectionTopVisible && sectionBottomVisible;
            
            // Check if the top of the controls is at or above the top of the viewport
            // This ensures we only stick when the controls reach the top of the viewport
            const controlsAtTopOfViewport = controlsRect.top <= 0;
            
            // Calculate the absolute positions for determining sticky states
            const sectionAbsoluteTop = scrollTop + sectionRect.top;
            const sectionAbsoluteBottom = sectionAbsoluteTop + contentSection.offsetHeight;
            
            // Check if we've scrolled past the bottom of the section
            const pastSectionBottom = scrollTop + controlsHeight >= sectionAbsoluteBottom;
            
            // Check if we're at the top of the section (for unsticking when scrolling back up)
            const atSectionTop = scrollTop <= sectionAbsoluteTop;
            
            if (DEBUG) {
                console.log('Scroll position:', scrollTop);
                console.log('Section top visible:', sectionTopVisible);
                console.log('Section bottom visible:', sectionBottomVisible);
                console.log('Within section:', withinSection);
                console.log('At section top:', atSectionTop);
                console.log('Past section bottom:', pastSectionBottom);
                console.log('Controls at top of viewport:', controlsAtTopOfViewport);
            }

            // CASE 1: We're at the top of the section or above it - normal flow
            if (atSectionTop || !sectionTopVisible) {
                controlsContainer.classList.remove('sticky', 'sticky-bottom');
                controlsContainer.style.position = ''; 
                controlsContainer.style.top = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.classList.remove('active');
                controlsPlaceholder.style.height = '0px';
                if (DEBUG) console.log('State: Normal flow - at or above section top');
            }
            // CASE 2: We're scrolled past the section bottom - unstick
            else if (!sectionBottomVisible || pastSectionBottom) {
                controlsContainer.classList.remove('sticky', 'sticky-bottom');
                controlsContainer.style.position = ''; 
                controlsContainer.style.top = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.classList.remove('active');
                controlsPlaceholder.style.height = '0px';
                if (DEBUG) console.log('State: Normal flow - past section bottom');
            }
            // CASE 3: We're within the section and controls are at the top of viewport - stick to top
            else if (withinSection && controlsAtTopOfViewport) {
                controlsContainer.classList.add('sticky');
                controlsContainer.classList.remove('sticky-bottom');
                controlsContainer.style.position = 'fixed';
                controlsContainer.style.top = '0px';
                
                // Center the controls and use the stored natural width
                controlsContainer.style.left = '50%';
                controlsContainer.style.width = controlsNaturalWidth + 'px';
                controlsContainer.style.transform = 'translateX(-50%)';
                
                controlsPlaceholder.classList.add('active');
                controlsPlaceholder.style.height = controlsHeight + 'px';
                if (DEBUG) console.log('State: Sticky to top');
            }
            // CASE 4: Default - normal flow
            else {
                controlsContainer.classList.remove('sticky', 'sticky-bottom');
                controlsContainer.style.position = ''; 
                controlsContainer.style.top = '';
                controlsContainer.style.left = '';
                controlsContainer.style.width = '';
                controlsContainer.style.transform = '';
                controlsPlaceholder.classList.remove('active');
                controlsPlaceholder.style.height = '0px';
                if (DEBUG) console.log('State: Normal flow - default');
            }
        }

        // Delay setup slightly to ensure all elements are rendered and positioned
        setTimeout(() => {
            setupInitialPositions();
            handleStickyScroll(); // Initial check
            
            // Add scroll event listener
            window.addEventListener('scroll', handleStickyScroll);
            
            // Add resize event listener with debouncing
            window.addEventListener('resize', () => {
                // Clear any existing timer
                if (resizeTimer) clearTimeout(resizeTimer);
                
                // Set a new timer
                resizeTimer = setTimeout(() => {
                    if (DEBUG) console.log('Recalculating sticky controls after resize');
                    setupInitialPositions();
                    handleStickyScroll();
                    
                    // Additional check after a bit more time to ensure measurements are accurate
                    // This helps with complex responsive layouts that might take time to settle
                    setTimeout(() => {
                        setupInitialPositions();
                        handleStickyScroll();
                    }, 100);
                }, 250); // Wait for resize to "finish" before recalculating
            });
            
            console.log('Sticky controls initialized.');
        }, 200); // Small delay to ensure DOM is fully rendered
    }

    // --- Initial Execution ---
    console.log("Initialising SVAR setup...");
    updateToggleVisual(); // Set initial highlight state for the toggle
    generateAndPlot(); // Generate initial data and plots
    setupStickyControls(); // Initialize sticky controls


    // Loading screen is now handled at the global level in main.js
}

// initSvarSetup is now called by main.js after content has been loaded.
