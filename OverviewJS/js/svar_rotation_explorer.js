// Script-level variables
let rotatedShocksChart;
let phiCorrelationChart;
let u_i_t_original, u_s_t_original;
let B_chol;

// DOM element variables, to be assigned in initializeRotationExplorer
let rotationSlider, rotationAngleValueDisplay, b0MatrixDisplay, rotatedShocksCanvas;
let bIiDisplay, bIsDisplay, bSiDisplay, bSsDisplay;

    function mean(arr) {
        if (!arr || arr.length === 0) return 0;
        return arr.reduce((acc, val) => acc + val, 0) / arr.length;
    }

    function covariance(arr1, arr2) {
        if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length === 0) return 0;
        const mean1 = mean(arr1);
        const mean2 = mean(arr2);
        let cov = 0;
        for (let i = 0; i < arr1.length; i++) {
            cov += (arr1[i] - mean1) * (arr2[i] - mean2);
        }
        return cov / (arr1.length - 1); // Sample covariance, ensure arr1.length > 1
    }
    
    function correlation(arr1, arr2) {
        if (!arr1 || !arr2 || arr1.length !== arr2.length || arr1.length < 2) return NaN; // Correlation requires at least 2 points
        const cov = covariance(arr1, arr2);
        const stdDev1 = Math.sqrt(variance(arr1));
        const stdDev2 = Math.sqrt(variance(arr2));
        if (stdDev1 === 0 || stdDev2 === 0) { // Avoid division by zero if one series has no variance
            // If one series has no variance, but the other does, correlation is undefined (or 0 if both are constant and equal, but cov would be 0)
            // If means are different and one is constant, cov might not be 0, but stddev is 0. This case is tricky.
            // For simplicity, if perfect correlation is not possible due to zero variance, return NaN.
            // A more nuanced handling might be needed if e.g. one shock becomes constant.
            return NaN; 
        }
        return cov / (stdDev1 * stdDev2);
    }

    function variance(arr) {
        if (!arr || arr.length < 2) return 0; // Variance requires at least 2 points
        return covariance(arr, arr);
    }

    function calculateCorrelationForAngle(angleRad, u_i_t_series, u_s_t_series, B_chol_matrix) {
        const cosTheta = Math.cos(angleRad);
        const sinTheta = Math.sin(angleRad);
        const O_matrix = [[cosTheta, -sinTheta], [sinTheta, cosTheta]];
    
        let B0_current, B0_current_inv;
        try {
            B0_current = multiply2x2(B_chol_matrix, O_matrix);
            B0_current_inv = invert2x2(B0_current);
        } catch (error) {
            // console.error(`Error in matrix operations for angle ${angleRad} in correlation calculation:`, error.message);
            return NaN; // Cannot calculate correlation if matrix ops fail
        }
    
        const e_i_t_rotated = [];
        const e_s_t_rotated = [];
        if (!u_i_t_series || !u_s_t_series || u_i_t_series.length === 0) {
            // console.warn('Empty residual series in calculateCorrelationForAngle');
            return NaN;
        }

        for (let i = 0; i < u_i_t_series.length; i++) {
            const u_vec = [u_i_t_series[i], u_s_t_series[i]];
            e_i_t_rotated.push(B0_current_inv[0][0] * u_vec[0] + B0_current_inv[0][1] * u_vec[1]);
            e_s_t_rotated.push(B0_current_inv[1][0] * u_vec[0] + B0_current_inv[1][1] * u_vec[1]);
        }
        
        return correlation(e_i_t_rotated, e_s_t_rotated);
    }

    function cholesky2x2(sigma) {
        const a = sigma[0][0];
        const b = sigma[0][1];
        const d = sigma[1][1];

        if (a <= 1e-9) throw new Error("Matrix not positive definite (a is too small or non-positive).");
        const l11 = Math.sqrt(a);
        const l21 = b / l11;
        const d_l21_sq = d - l21 * l21;
        if (d_l21_sq <= 1e-9) throw new Error("Matrix not positive definite (d - l21^2 is too small or non-positive).");
        const l22 = Math.sqrt(d_l21_sq);
        
        return [[l11, 0], [l21, l22]];
    }

    function multiply2x2(A, B) {
        return [
            [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
            [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]]
        ];
    }

    function invert2x2(A) {
        const det = A[0][0] * A[1][1] - A[0][1] * A[1][0];
        if (Math.abs(det) < 1e-9) throw new Error("Matrix is singular (determinant is too small).");
        const invDet = 1 / det;
        return [
            [invDet * A[1][1], invDet * -A[0][1]],
            [invDet * -A[1][0], invDet * A[0][0]]
        ];
    }

    window.initializeRotationExplorer = function() {
    // Get DOM elements once, at the beginning of the function call
    const rotationSliderElem = document.getElementById('rotation-angle-slider');
    const rotationAngleValueDisplayElem = document.getElementById('rotation-angle-value');
    const b0MatrixDisplayElem = document.getElementById('b0-matrix-display');
    const rotatedShocksCanvasElem = document.getElementById('rotated-shocks-scatter-chart');
    const phiCorrelationCanvasElem = document.getElementById('phi-correlation-chart'); // New canvas
    const equationsDisplayElem = document.getElementById('equations-display');

    if (!rotationSliderElem || !rotationAngleValueDisplayElem || !b0MatrixDisplayElem || !rotatedShocksCanvasElem || !phiCorrelationCanvasElem || !equationsDisplayElem) {
        console.error('SVAR Rotation Explorer: One or more essential DOM elements are missing. Check HTML structure.');
        if(b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = "<p class='error-message'>Error: UI components missing. Explorer cannot start.</p>";
        return;
    }

    // Start asynchronous operations
    (async () => {
        console.log('SVAR Rotation Explorer: Starting initialization sequence...');

        // Display initial loading message
        if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = "<p class='loading-message'>Loading VAR residuals for explorer...</p>";
        if (rotatedShocksCanvasElem) {
            const ctx = rotatedShocksCanvasElem.getContext('2d');
            ctx.clearRect(0, 0, rotatedShocksCanvasElem.width, rotatedShocksCanvasElem.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = 'grey';
            ctx.textAlign = 'center';
            ctx.fillText('Checking for VAR residuals...', rotatedShocksCanvasElem.width/2, rotatedShocksCanvasElem.height/2);
        }
        if (phiCorrelationCanvasElem) { // Initial message for new chart
            const ctxCorr = phiCorrelationCanvasElem.getContext('2d');
            ctxCorr.clearRect(0, 0, phiCorrelationCanvasElem.width, phiCorrelationCanvasElem.height);
            ctxCorr.font = '16px Arial';
            ctxCorr.fillStyle = 'grey';
            ctxCorr.textAlign = 'center';
            ctxCorr.fillText('Loading...', phiCorrelationCanvasElem.width/2, phiCorrelationCanvasElem.height/2);
        }

        // Ensure VAR results are available, calculating with defaults if needed
        let varResultsAvailable = false;
        if (typeof window.ensureVARResultsAvailable === 'function') {
            varResultsAvailable = await window.ensureVARResultsAvailable(); // Uses default lags from main.js
        } else {
            console.error('Critical Error: window.ensureVARResultsAvailable function is not defined. Cannot proceed.');
            if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = "<p class='error-message'><strong>Critical Error:</strong> Initialization function missing. Cannot load VAR data.</p>";
            return;
        }

        // Check if VAR results were successfully obtained or calculated
        if (!varResultsAvailable || !window.currentVarResults || window.currentVarResults.error ||
            !window.currentVarResults.residuals || !window.currentVarResults.residuals.u_i_t || !window.currentVarResults.residuals.u_s_t) {
            console.warn("VAR results not available or failed to load for SVAR rotation explorer.");
            let errorDetail = (window.currentVarResults && window.currentVarResults.error) ? window.currentVarResults.error : "Please ensure data is loaded and try running VAR estimation manually via the 'VAR Estimation' tab.";
            if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = `<p class='error-message'><strong>Error:</strong> VAR residuals could not be loaded. Details: ${errorDetail}</p>`;
            if (rotatedShocksCanvasElem) {
                const ctx = rotatedShocksCanvasElem.getContext('2d');
                ctx.clearRect(0, 0, rotatedShocksCanvasElem.width, rotatedShocksCanvasElem.height);
                ctx.font = '16px Arial'; ctx.fillStyle = 'red'; ctx.textAlign = 'center';
                ctx.fillText('Failed to load VAR residuals for plot.', rotatedShocksCanvasElem.width/2, rotatedShocksCanvasElem.height/2);
            }
            return;
        }
        
        console.log('SVAR Explorer: VAR results successfully obtained. Initializing plot and UI.');
        if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = ''; // Clear loading message

        // Assign residuals to local (module-level) variables
        u_i_t_original = window.currentVarResults.residuals.u_i_t;
        u_s_t_original = window.currentVarResults.residuals.u_s_t;

        if (!u_i_t_original || !u_s_t_original || u_i_t_original.length < 2 || u_s_t_original.length < 2) {
            console.error("VAR residuals have insufficient data points (need at least 2). Cannot proceed.");
            if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = "<p class='error-message'>Error: VAR residuals have insufficient data. Please check VAR estimation.</p>";
            return;
        }

        // Calculate Cholesky decomposition
        const sigma_u_11 = variance(u_i_t_original);
        const sigma_u_22 = variance(u_s_t_original);
        const sigma_u_12 = covariance(u_i_t_original, u_s_t_original);
        const Sigma_u = [[sigma_u_11, sigma_u_12], [sigma_u_12, sigma_u_22]];
        
        try {
            B_chol = cholesky2x2(Sigma_u);
        } catch (e) {
            console.error("Error during Cholesky decomposition:", e);
            if (b0MatrixDisplayElem) b0MatrixDisplayElem.innerHTML = `<p class='error-message'>Error in Cholesky decomposition: ${e.message}. Ensure residuals have variance.</p>`;
            return;
        }

        // Initial UI update with the default slider angle
        const initialAngle = parseFloat(rotationSliderElem.value);
        if (rotationAngleValueDisplayElem) rotationAngleValueDisplayElem.textContent = initialAngle;
        updateVisualization(initialAngle, {
            rotationSlider: rotationSliderElem, 
            angleDisplay: rotationAngleValueDisplayElem, 
            b0MatrixDisplay: b0MatrixDisplayElem,
            rotatedShocksCanvas: rotatedShocksCanvasElem,
            phiCorrelationCanvas: phiCorrelationCanvasElem, // Pass new canvas
            equationsDisplay: equationsDisplayElem
        });

        // Add event listener to the slider
        // Clone and replace to remove any old listeners if this function is ever called multiple times (defensive)
        const newSlider = rotationSliderElem.cloneNode(true);
        rotationSliderElem.parentNode.replaceChild(newSlider, rotationSliderElem);
        // Update the reference to the new slider
        // rotationSliderElem = newSlider; // Not strictly needed if only adding listener here
        
        newSlider.addEventListener('input', (event) => {
            const angleDegrees = parseFloat(event.target.value);
            if (rotationAngleValueDisplayElem) rotationAngleValueDisplayElem.textContent = angleDegrees;
            
            // Force immediate update of visualizations when slider moves
            updateVisualization(angleDegrees, {
                rotationSlider: newSlider, // Use the current slider reference
                angleDisplay: rotationAngleValueDisplayElem, 
                b0MatrixDisplay: b0MatrixDisplayElem,
                rotatedShocksCanvas: rotatedShocksCanvasElem,
                phiCorrelationCanvas: phiCorrelationCanvasElem, // Pass new canvas
                equationsDisplay: equationsDisplayElem
            });
            
            // Log the update for debugging
            console.log('Slider moved to angle:', angleDegrees, 'degrees - updating visualizations');
        });

        console.log('SVAR Rotation Explorer initialization sequence complete.');

    })(); // End of async IIFE

    function updateVisualization(angleDegrees, options) {
        if (!B_chol || !u_i_t_original || !u_s_t_original) {
            console.log('Debug: updateVisualization - Missing B_chol, u_i_t_original, or u_s_t_original. B_chol:', B_chol, 'u_i_t_original:', u_i_t_original ? 'Exists' : 'Missing', 'u_s_t_original:', u_s_t_original ? 'Exists' : 'Missing');
            return;
        }

        const angleRadians = angleDegrees * (Math.PI / 180);
        const cosTheta = Math.cos(angleRadians);
        const sinTheta = Math.sin(angleRadians);

        const O_theta = [[cosTheta, -sinTheta], [sinTheta, cosTheta]];
        console.log('Debug: Calculated O_theta:', JSON.parse(JSON.stringify(O_theta)));
        const B0_current = multiply2x2(B_chol, O_theta);
        console.log('Debug: Calculated B0_current:', JSON.parse(JSON.stringify(B0_current)));
        
        if (options.b0MatrixDisplay) {
            // Format the matrix values with 3 decimal places
            const b00 = B0_current[0][0].toFixed(3);
            const b01 = B0_current[0][1].toFixed(3);
            const b10 = B0_current[1][0].toFixed(3);
            const b11 = B0_current[1][1].toFixed(3);
            
            // Create a more professional-looking HTML representation of the matrix
            const matrixHTML = `
                <div style="text-align: center; margin: 20px 0; font-size: 18px;">
                    <span style="display: inline-block; vertical-align: middle; margin-right: 10px;">B<sub>0</sub> = </span>
                    <span style="display: inline-block; vertical-align: middle;">
                        <table style="border-collapse: collapse; display: inline-block;">
                            <tr>
                                <td style="padding: 0 5px;">
                                    <div style="display: inline-block; position: relative;">
                                        <div style="position: absolute; top: 0; bottom: 0; left: -3px; border-left: 2px solid black;"></div>
                                        <div style="padding: 8px 15px;">
                                            <table style="border-collapse: collapse;">
                                                <tr>
                                                    <td style="padding: 5px 15px; text-align: right;">${b00}</td>
                                                    <td style="padding: 5px 15px; text-align: right;">${b01}</td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 5px 15px; text-align: right;">${b10}</td>
                                                    <td style="padding: 5px 15px; text-align: right;">${b11}</td>
                                                </tr>
                                            </table>
                                        </div>
                                        <div style="position: absolute; top: 0; bottom: 0; right: -3px; border-right: 2px solid black;"></div>
                                    </div>
                                </td>
                            </tr>
                        </table>
                    </span>
                </div>
            `;
            
            // Set the HTML directly
            options.b0MatrixDisplay.innerHTML = matrixHTML;
            console.log('Debug: Rendered B0 matrix as HTML table');
        }
        
        // Render with MathJax if available
        if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
            MathJax.typesetPromise([options.b0MatrixDisplay]).catch(err => console.error('MathJax typesetting error:', err));
        } else if (typeof renderMathInElement === 'function') {
            // Fallback to KaTeX if MathJax is not available
            try {
                renderMathInElement(options.b0MatrixDisplay);
                console.log('Debug: Updated B0 matrix display with KaTeX.');
            } catch (err) {
                console.error('KaTeX rendering error:', err);
            }
        } else {
            console.warn('Neither MathJax nor KaTeX rendering functions available');
        }

        // Store the coefficient values
        const bIi = B0_current[0][0].toFixed(3);
        const bIs = B0_current[0][1].toFixed(3);
        const bSi = B0_current[1][0].toFixed(3);
        const bSs = B0_current[1][1].toFixed(3);
        
        // Update the equations display with HTML representation
        if (options.equationsDisplay) {
            // Create HTML representation of the equations
            const equationsHTML = `
                <div style="text-align: center; margin: 15px 0; font-size: 18px;">
                    <div style="margin-bottom: 15px;">
                        <span>u<sub>i,t</sub> = ${bIi} ε<sub>i,t</sub> + ${bIs} ε<sub>s,t</sub></span>
                    </div>
                    <div>
                        <span>u<sub>s,t</sub> = ${bSi} ε<sub>i,t</sub> + ${bSs} ε<sub>s,t</sub></span>
                    </div>
                </div>
            `;
            
            // Set the HTML content of the equations display
            options.equationsDisplay.innerHTML = equationsHTML;
            console.log('Debug: Updated equations display with HTML representation');
        }

        let B0_current_inv;
        try {
            B0_current_inv = invert2x2(B0_current);
        } catch (error) {
            console.error('Error inverting B0_current:', error.message, 'B0_current:', JSON.parse(JSON.stringify(B0_current)));
            if (options.rotatedShocksCanvas) {
                const ctx = options.rotatedShocksCanvas.getContext('2d');
                if(rotatedShocksChart) { rotatedShocksChart.destroy(); rotatedShocksChart = null; }
                ctx.clearRect(0, 0, options.rotatedShocksCanvas.width, options.rotatedShocksCanvas.height);
                ctx.font = '16px Arial'; ctx.fillStyle = 'red'; ctx.textAlign = 'center';
                ctx.fillText('Error: Could not invert B0 matrix.', options.rotatedShocksCanvas.width/2, options.rotatedShocksCanvas.height/2);
            }
            if (options.phiCorrelationCanvas) {
                const ctxCorr = options.phiCorrelationCanvas.getContext('2d');
                if(phiCorrelationChart) { phiCorrelationChart.destroy(); phiCorrelationChart = null; }
                ctxCorr.clearRect(0, 0, options.phiCorrelationCanvas.width, options.phiCorrelationCanvas.height);
                ctxCorr.font = '16px Arial'; ctxCorr.fillStyle = 'red'; ctxCorr.textAlign = 'center';
                ctxCorr.fillText('Error: B0 matrix inversion failed.', options.phiCorrelationCanvas.width/2, options.phiCorrelationCanvas.height/2);
            }
            return; 
        }

        const e_i_t = [];
        const e_s_t = [];
        console.log('Debug: u_i_t_original (first 5):', u_i_t_original.slice(0,5));
        console.log('Debug: u_s_t_original (first 5):', u_s_t_original.slice(0,5));
        console.log('Debug: B0_current_inv:', JSON.parse(JSON.stringify(B0_current_inv)));
        for (let i = 0; i < u_i_t_original.length; i++) {
            const u_vec = [u_i_t_original[i], u_s_t_original[i]];
            e_i_t.push(B0_current_inv[0][0] * u_vec[0] + B0_current_inv[0][1] * u_vec[1]);
            e_s_t.push(B0_current_inv[1][0] * u_vec[0] + B0_current_inv[1][1] * u_vec[1]);
            if (i < 5) { // Log first 5 transformed shock pairs
                console.log(`Debug: e_t sample ${i}: e_i,t=${e_i_t[i]}, e_s,t=${e_s_t[i]}`);
            }
        }

        const scatterData = e_i_t.map((val, index) => ({ x: val, y: e_s_t[index] }));
        console.log('Debug: scatterData (first 5):', scatterData.slice(0,5));

        if (options.rotatedShocksCanvas) {
            const ctx = options.rotatedShocksCanvas.getContext('2d');
            console.log('Debug: Attempting to create/update chart.');
            if (rotatedShocksChart) {
                rotatedShocksChart.destroy();
                console.log('Debug: Destroyed existing chart instance.');
            }
            rotatedShocksChart = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Identified Structural Shocks (e_i,t , e_s,t)',
                        data: scatterData,
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        pointRadius: 3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: { display: true, text: 'e_i,t (Identified Shock 1)' },
                            grid: { display: false }
                        },
                        y: {
                            title: { display: true, text: 'e_s,t (Identified Shock 2)' },
                            grid: { display: false }
                        }
                    },
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `(e_i,t: ${context.parsed.x.toFixed(3)}, e_s,t: ${context.parsed.y.toFixed(3)})`;
                                }
                            }
                        }
                    }
                }
            });
            // console.log('Debug: New scatter chart instance created/updated:', rotatedShocksChart);
        }

        // --- Update/Create Phi-Correlation Plot ---
        if (options.phiCorrelationCanvas && u_i_t_original && u_s_t_original && B_chol) {
            const correlationDataLine = [];
            const numPoints = 37; // e.g., -90 to +90 in 5 degree steps (180/5 + 1 = 37)
            for (let i = 0; i < numPoints; i++) {
                const angleDeg = -90 + (180 / (numPoints - 1)) * i;
                const angleRadLoop = angleDeg * Math.PI / 180;
                const corrValue = calculateCorrelationForAngle(angleRadLoop, u_i_t_original, u_s_t_original, B_chol);
                if (!isNaN(corrValue)) {
                    correlationDataLine.push({ x: angleDeg, y: corrValue });
                }
            }

            // Correlation for the current angle (already calculated e_i_t, e_s_t)
            const currentCorrelation = correlation(e_i_t, e_s_t);
            const currentAngleMarkerData = [];
            if (!isNaN(currentCorrelation)){
                currentAngleMarkerData.push({ x: angleDegrees, y: currentCorrelation });
            }

            const ctxCorr = options.phiCorrelationCanvas.getContext('2d');
            if (phiCorrelationChart) {
                phiCorrelationChart.destroy();
            }
            phiCorrelationChart = new Chart(ctxCorr, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Corr(e_i,t, e_s,t) vs. Angle',
                            data: correlationDataLine,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: false,
                            tension: 0.1,
                            pointRadius: 2,
                        },
                        {
                            label: 'Current Angle',
                            data: currentAngleMarkerData,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 1)',
                            pointRadius: 5,
                            pointStyle: 'circle',
                            showLine: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, // Allow chart to not be square if container isn't
                    scales: {
                        x: {
                            type: 'linear',
                            position: 'bottom',
                            title: { display: true, text: 'Rotation Angle θ (degrees)' },
                            min: -90,
                            max: 90
                        },
                        y: {
                            title: { display: true, text: 'Correlation(e_i,t, e_s,t)' },
                            min: -1.1, // Give a bit of space around -1 and 1
                            max: 1.1
                        }
                    },
                    plugins: {
                        legend: { display: true, position: 'top' },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.dataset.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed.y !== null) {
                                        label += `Angle: ${context.parsed.x.toFixed(1)}°, Corr: ${context.parsed.y.toFixed(4)}`;
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
            // console.log('Debug: New correlation chart instance created/updated:', phiCorrelationChart);
        } else if (options.phiCorrelationCanvas) {
            // console.warn('Phi-correlation plot could not be updated due to missing data.');
            const ctxCorr = options.phiCorrelationCanvas.getContext('2d');
            if(phiCorrelationChart) { phiCorrelationChart.destroy(); phiCorrelationChart = null; }
            ctxCorr.clearRect(0, 0, options.phiCorrelationCanvas.width, options.phiCorrelationCanvas.height);
            ctxCorr.font = '16px Arial'; ctxCorr.fillStyle = 'grey'; ctxCorr.textAlign = 'center';
            ctxCorr.fillText('Data unavailable for correlation plot.', options.phiCorrelationCanvas.width/2, options.phiCorrelationCanvas.height/2);
        }

    }
}; // Close window.initializeRotationExplorer
    
    // Call initializeRotationExplorer() when appropriate, e.g., after VAR results are ready and this section is displayed.
// For now, it's exposed globally. Consider namespacing like window.svarExplorer.initialize().
