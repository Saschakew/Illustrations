// Main JavaScript file for SVAR Visualizer

let fullLoadedData = null; // Store loaded data globally
const varNames = ['i', 'r_t']; // Define globally for this module
let lagSlider, lagValueDisplay, varOrderDisplay; // Keep these for VAR estimation section

// Function to ensure VAR results are available, calculating with defaults if needed
window.ensureVARResultsAvailable = async function(defaultLags = DEFAULT_VAR_LAGS) {
    console.log('ensureVARResultsAvailable called.');
    if (window.currentVarResults && window.currentVarResults.residuals && 
        window.currentVarResults.residuals.u_i_t && window.currentVarResults.residuals.u_s_t && 
        !window.currentVarResults.error) {
        console.log('VAR results already available and valid.');
        return true; // Results are already available and seem valid
    }

    console.log('VAR results not available or invalid, attempting to calculate with default lags.');
    if (!fullLoadedData) {
        console.error('Cannot ensure VAR results: Main data (fullLoadedData) not loaded.');
        // Optionally, try to load data here if your app structure supports it, or just return false.
        // For now, assume data should have been loaded at app start.
        window.currentVarResults = { error: 'Main data not loaded. Cannot perform VAR calculation.' };
        return false;
    }

    return await performVARCalculation(fullLoadedData, defaultLags);
};

// KaTeX rendering options
const katexOptions = {
    delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
    ],
    throwOnError: false
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM fully loaded and parsed.');

    // Attempt to load data once when the app starts
    try {
        if (typeof SvarDataLoader === 'undefined' || !SvarDataLoader.loadData) {
            throw new Error('SvarDataLoader is not available.');
        }
        fullLoadedData = await SvarDataLoader.loadData('data/data.xlsx');
        if (!fullLoadedData || !fullLoadedData.year) { // Basic check
            console.error("Failed to load or validate initial data.");
            const contentArea = document.getElementById('content-area');
            if (contentArea) contentArea.innerHTML = "<p class=\"error-message\">Error: Could not load essential data. Please check the console and data source.</p>";
            return; // Stop further initialization if data load fails
        }
        console.log('Initial data loaded successfully.');
    } catch (error) {
        console.error('Error loading initial data:', error);
        const contentArea = document.getElementById('content-area');
        if (contentArea) contentArea.innerHTML = `<p class="error-message">Error loading initial data: ${error.message}. Please check the console and data source.</p>`;
        return; // Stop further initialization
    }

    const navLinks = document.querySelectorAll('#main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            loadSection(sectionName);
        });
    });

    // Load the default section
    loadSection('introduction'); 
});

async function loadSection(sectionName) {
    const contentArea = document.getElementById('content-area');
    if (!contentArea) {
        console.error('Content area #content-area not found!');
        return;
    }
    contentArea.innerHTML = '<p class="loading-message">Loading content...</p>'; // Show loading indicator

    try {
        const response = await fetch(`templates/${sectionName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load section: ${sectionName}, Status: ${response.status}`);
        }
        const html = await response.text();
        contentArea.innerHTML = html;

        // Re-render KaTeX for the new content
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(contentArea, katexOptions);
        } else {
            console.warn('KaTeX renderMathInElement not available.');
        }

        // Initialize scripts specific to the loaded section
        initializeSection(sectionName);

    } catch (error) {
        console.error('Error loading section:', error);
        contentArea.innerHTML = `<p class="error-message">Error loading content for ${sectionName}: ${error.message}. Please try again or check the console.</p>`;
    }
}

function initializeSection(sectionName) {
    console.log(`Initializing section: ${sectionName}`);

    if (sectionName === 'data_overview') {
        initializeDataOverviewSection();
    } else if (sectionName === 'svar_identification_problem') {
        console.log('Attempting to initialize svar_identification_problem section specific scripts.');
        // Delay slightly to ensure scripts loaded via innerHTML have executed
        setTimeout(() => {
            if (typeof window.initializeRotationExplorer === 'function') {
                console.log('Calling window.initializeRotationExplorer for svar_identification_problem section (after timeout).');
                window.initializeRotationExplorer();
            } else {
                console.warn('window.initializeRotationExplorer is still not defined after timeout. Check script loading and errors in svar_rotation_explorer.js.');
            }
        }, 0);
    } else if (sectionName === 'var_estimation') {
        if (fullLoadedData) {
            initializeSvarMethods(fullLoadedData); // Pass the globally loaded data
        } else {
            console.error('VAR Estimation section requires data, but it was not loaded.');
            const varSectionContent = document.getElementById('var-estimation'); // Assuming the section has this ID
            if(varSectionContent) {
                 varSectionContent.innerHTML = "<p class='error-message'>Data not available for VAR estimation. Please ensure data loaded correctly on page start.</p>";
            } else {
                 // Fallback if the specific section ID isn't found but we are in content-area
                 const contentArea = document.getElementById('content-area');
                 if(contentArea) contentArea.innerHTML = "<p class='error-message'>VAR Estimation content could not be initialized: Data missing.</p>";
            }
        }
    }
    // Add other sections' initializers here as:
    // else if (sectionName === 'another_section') {
    //     initializeAnotherSection();
    // }
}

function initializeDataOverviewSection() {
    console.log('Initializing Data Overview section...');
    if (!fullLoadedData || !fullLoadedData.year) {
        console.error('Data not available for Data Overview chart.');
        const dataChartCanvas = document.getElementById('dataChart'); // Assumes 'dataChart' is the ID in data_overview.html
         if (dataChartCanvas) {
            const ctx = dataChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, dataChartCanvas.width, dataChartCanvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = 'red';
            ctx.textAlign = 'center';
            ctx.fillText('Data not loaded. Check console.', dataChartCanvas.width / 2, dataChartCanvas.height / 2);
        } else {
            console.error('Canvas with ID #dataChart not found in data_overview.html');
        }
        return;
    }

    const timeLabels = fullLoadedData.year.map((y, index) => {
        const monthStr = String(fullLoadedData.month[index]).padStart(2, '0');
        return `${y}-${monthStr}`;
    });

    if (typeof SvarPlotting !== 'undefined' && SvarPlotting.plotTimeSeries) {
        SvarPlotting.plotTimeSeries('dataChart', // Assumes 'dataChart' is the ID in data_overview.html
            timeLabels,
            [
                { label: 'Interest Rate ($i_t$)', data: fullLoadedData.i, borderColor: 'rgb(255, 99, 132)', yAxisID: 'yInterestRate' },
                { label: 'S&P 500 Returns ($r_t$)', data: fullLoadedData.r_t, borderColor: 'rgb(54, 162, 235)', yAxisID: 'ySP500Returns' }
            ],
            {
                yInterestRate: { position: 'left', title: { display: true, text: 'Interest Rate (%)' } },
                ySP500Returns: { position: 'right', title: { display: true, text: 'S&P 500 Returns (%)' }, grid: { drawOnChartArea: false } }
            }
        );
        console.log('Data Overview chart initialized.');
    } else {
        console.warn('SvarPlotting or plotTimeSeries function not available for Data Overview.');
        const dataChartCanvas = document.getElementById('dataChart');
        if (dataChartCanvas) {
            const ctx = dataChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, dataChartCanvas.width, dataChartCanvas.height);
            ctx.font = '16px Arial';
            ctx.fillStyle = 'orange';
            ctx.textAlign = 'center';
            ctx.fillText('Plotting library not available.', dataChartCanvas.width / 2, dataChartCanvas.height / 2);
        }
    }
}

function initializeSvarMethods(loadedData) { 
    console.log('Initializing SVAR Methods (VAR Estimation section)...');
    // Ensure data is valid
    if (!loadedData || !loadedData.year || !loadedData.i || !loadedData.r_t) { 
        console.error('Cannot initialize SVAR methods: Data is missing or invalid.');
        const varEstSection = document.getElementById('var-estimation');
        if (varEstSection) {
            varEstSection.innerHTML = '<p class="error-message">Error: Data required for VAR estimation is not available or invalid.</p>';
        }
        return;
    }

    // Query for elements within the newly loaded #var-estimation section
    // These elements are defined in templates/var_estimation.html
    lagSlider = document.getElementById('lag-slider');
    lagValueDisplay = document.getElementById('lag-slider-value');
    varOrderDisplay = document.getElementById('var-order-display'); 

    if (!lagSlider || !lagValueDisplay || !varOrderDisplay) {
        console.error('Lag slider or display elements not found in VAR Estimation section. Ensure IDs are correct in var_estimation.html and the section has loaded.');
        // Optionally, provide feedback in the UI if elements are missing
        const varEstSection = document.getElementById('var-estimation');
        if (varEstSection) {
             // Append error message or replace content if critical elements are missing
            let errorMsg = "<p class='error-message'>Error: UI controls for VAR estimation are missing. Content may not have loaded correctly.</p>";
            const controlsContainer = varEstSection.querySelector('.controls-container');
            if(controlsContainer) controlsContainer.insertAdjacentHTML('beforebegin', errorMsg);
            else varEstSection.innerHTML = errorMsg; 
        }
        return;
    }
    
    const initialLags = parseInt(lagSlider.value);
    lagValueDisplay.textContent = initialLags;
    varOrderDisplay.textContent = initialLags;

    // Remove any existing event listener before adding a new one to prevent duplicates
    // A more robust way would be to use a controller pattern or ensure this init function is called only once per load.
    // For simplicity here, we'll assume this re-initialization is okay, but in complex apps, manage listeners carefully.
    const newLagSlider = lagSlider.cloneNode(true);
    lagSlider.parentNode.replaceChild(newLagSlider, lagSlider);
    lagSlider = newLagSlider;

    lagSlider.addEventListener('input', () => {
        const numLags = parseInt(lagSlider.value);
        lagValueDisplay.textContent = numLags;
        varOrderDisplay.textContent = numLags; 
        runAndDisplayVAR(loadedData, numLags); // Use the passed loadedData
    });

    runAndDisplayVAR(loadedData, initialLags);
    console.log('VAR estimation initialized with default lags.');
}

const DEFAULT_VAR_LAGS = 1; // Default lags for background calculation

async function performVARCalculation(data, numLags) {
    console.log(`Performing VAR(${numLags}) calculation...`);
    if (!data || !data.i || !data.r_t) {
        console.error("Data for VAR calculation is missing or incomplete.");
        window.currentVarResults = null; // Clear any stale results
        return false;
    }
    if (typeof SvarAlgorithms === 'undefined' || !SvarAlgorithms.estimateVAREquationByEquation) {
        console.error('SvarAlgorithms.estimateVAREquationByEquation is not available for VAR calculation.');
        window.currentVarResults = null;
        return false;
    }

    try {
        const varResults = SvarAlgorithms.estimateVAREquationByEquation(data, varNames, numLags);

        if (!varResults || varResults.error) {
            console.error('VAR calculation failed:', varResults ? varResults.error : 'Unknown error');
            window.currentVarResults = { error: (varResults && varResults.error) ? varResults.error : 'Unknown calculation error' };
            return false;
        }

        // Store results globally
        window.currentVarResults = {
            equation_i: varResults['i'],
            equation_s: varResults['r_t'], // 'r_t' from data maps to 's_t' in SVAR context
            residuals: {
                u_i_t: (varResults['i'] && varResults['i'].residuals) ? varResults['i'].residuals : null,
                u_s_t: (varResults['r_t'] && varResults['r_t'].residuals) ? varResults['r_t'].residuals : null
            },
            numLags: numLags // Store the number of lags used
        };
        console.log('performVARCalculation: window.currentVarResults populated:', JSON.parse(JSON.stringify(window.currentVarResults)));
        return true; // Indicate success
    } catch (error) {
        console.error(`Error during performVARCalculation for VAR(${numLags}):`, error);
        window.currentVarResults = { error: `Exception during calculation: ${error.message}` };
        return false;
    }
}

async function runAndDisplayVAR(currentData, numLags) {
    console.log(`Running VAR(${numLags}) estimation...`);
    if (!currentData || !currentData.i || !currentData.r_t) {
        console.error("Data for VAR estimation is missing or incomplete.");
        // Clear previous results or show error message in UI
        const resultsDivI = document.getElementById('var-equation-i-results');
        const resultsDivR = document.getElementById('var-equation-r_t-results');
        if(resultsDivI) resultsDivI.innerHTML = '<p class="error-message">Error: Data missing for VAR.</p>';
        if(resultsDivR) resultsDivR.innerHTML = '<p class="error-message">Error: Data missing for VAR.</p>';
        return;
    }
    if (typeof SvarAlgorithms === 'undefined' || !SvarAlgorithms.estimateVAREquationByEquation) {
        console.error('SvarAlgorithms.estimateVAREquationByEquation is not available.');
        // Display error in UI
        const resultsDivI = document.getElementById('var-equation-i-results');
        const resultsDivR = document.getElementById('var-equation-r_t-results');
        const errorMsg = '<p class="error-message">Critical error: VAR estimation functions are not loaded.</p>';
        if(resultsDivI) resultsDivI.innerHTML = errorMsg;
        if(resultsDivR) resultsDivR.innerHTML = errorMsg;
        return;
    }

    const calculationSuccess = await performVARCalculation(currentData, numLags);

    if (!calculationSuccess || !window.currentVarResults || window.currentVarResults.error) {
        console.error('VAR estimation failed or produced an error, cannot display results.');
        const resultsDivI = document.getElementById('var-equation-i-results');
        const resultsDivR = document.getElementById('var-equation-r_t-results');
        const errorMessage = `<p class="error-message">Error during VAR estimation: ${window.currentVarResults && window.currentVarResults.error ? window.currentVarResults.error : 'Calculation failed or no results'}</p>`;
        if(resultsDivI) resultsDivI.innerHTML = errorMessage;
        if(resultsDivR) resultsDivR.innerHTML = errorMessage;
        // Clear scatter plot canvas on error
        const scatterCanvas = document.getElementById('residualScatterChart');
        if (scatterCanvas) {
            const ctx = scatterCanvas.getContext('2d');
            ctx.clearRect(0, 0, scatterCanvas.width, scatterCanvas.height);
        }
        return; // Stop if estimation itself failed or had errors
    }

    // At this point, window.currentVarResults is populated and valid
    const varResults = { // Reconstruct varResults for local use in display functions
        'i': window.currentVarResults.equation_i,
        'r_t': window.currentVarResults.equation_s
    };

    // Display results for 'i' equation
        if (varResults['i'] && !varResults['i'].error) {
            displayVarEquationResults('i', varResults['i'], currentData, numLags);
        } else {
            const resultsDivI = document.getElementById('var-equation-i-results');
            if(resultsDivI) resultsDivI.innerHTML = `<p class="error-message">Error in VAR equation for 'i': ${varResults['i'] && varResults['i'].error ? varResults['i'].error : 'Result missing or unspecified error'}</p>`;
        }

        // Display results for 'r_t' equation
        if (varResults['r_t'] && !varResults['r_t'].error) {
            displayVarEquationResults('r_t', varResults['r_t'], currentData, numLags);
        } else {
            const resultsDivR = document.getElementById('var-equation-r_t-results');
            if(resultsDivR) resultsDivR.innerHTML = `<p class="error-message">Error in VAR equation for 'r_t': ${varResults['r_t'] && varResults['r_t'].error ? varResults['r_t'].error : 'Result missing or unspecified error'}</p>`;
        }

        // Plot residual scatter
        if (typeof SvarPlotting !== 'undefined' && SvarPlotting.plotResidualScatter) {
            if (varResults['i'] && varResults['i'].residuals && 
                varResults['r_t'] && varResults['r_t'].residuals && 
                varResults['i'].residuals.length === varResults['r_t'].residuals.length) {
                 SvarPlotting.plotResidualScatter('residualScatterChart', varResults['i'].residuals, varResults['r_t'].residuals);
            } else {
                console.warn('Residuals for scatter plot are not available or misaligned. VAR results for i:', varResults['i'], 'VAR results for r_t:', varResults['r_t']);
                const scatterCanvas = document.getElementById('residualScatterChart');
                if (scatterCanvas) {
                    const ctx = scatterCanvas.getContext('2d');
                    ctx.clearRect(0, 0, scatterCanvas.width, scatterCanvas.height);
                    ctx.font = '14px Arial';
                    ctx.fillStyle = 'orange';
                    ctx.textAlign = 'center';
                    ctx.fillText('Residuals for scatter plot unavailable.', scatterCanvas.width / 2, scatterCanvas.height / 2);
                }
            }
        } else {
            console.warn('SvarPlotting.plotResidualScatter not available.');
        }
        console.log(`VAR(${numLags}) estimation displayed.`);

    // The try-catch for performVARCalculation is inside that function.
    // runAndDisplayVAR now focuses on UI updates based on window.currentVarResults.
}

function displayVarEquationResults(depVarName, olsResult, fullData, numLags) {
    const resultsDivId = `var-equation-${depVarName.toLowerCase()}-results`;
    const resultsDiv = document.getElementById(resultsDivId);

    if (!resultsDiv) {
        console.error(`Results container #${resultsDivId} not found.`);
        return;
    }
    if (!olsResult || !olsResult.coefficients) { // Added check for olsResult.coefficients
        resultsDiv.innerHTML = `<p class="error-message">No OLS results or coefficients to display for ${depVarName}.</p>`;
        return;
    }
    
    let tableHtml = `<h5>Estimated Coefficients for ${depVarName} Equation (VAR(${numLags}))</h5>`;
    
    tableHtml += `<p><strong>Constant (c):</strong> ${olsResult.coefficients.c !== undefined ? olsResult.coefficients.c.toFixed(4) : 'N/A'}</p>`;
    
    tableHtml += `<div class="a-matrices-container">`;
    for (let lag = 1; lag <= numLags; lag++) {
        const extraClass = lag > 6 ? 'matrix-extra' : '';
        tableHtml += `<div class="matrix-block ${extraClass}">
            <h6>A<sub>${lag}</sub> (Lag ${lag}) Coefficients for ${depVarName}</h6>
            <table class="matrix-table coefficient-table">
                <tr><th>Variable</th><th>Coefficient</th></tr>`;
        varNames.forEach((varName) => {
            const coeffKey = `${varName}_L${lag}`;
            tableHtml += `<tr>
                <td>${varName}<sub>t-${lag}</sub></td>
                <td>${olsResult.coefficients[coeffKey] !== undefined ? olsResult.coefficients[coeffKey].toFixed(4) : 'N/A'}</td>
            </tr>`;
        });
        tableHtml += `</table></div>`;
    }
    tableHtml += `</div>`;

    if (numLags > 6) {
        tableHtml += `<div class="matrix-toggle">
            <button id="toggle-matrices-${depVarName}" class="toggle-matrices-btn" data-show="false">Show All ${numLags} Lag Coefficient Tables</button>
        </div>`;
    }

    tableHtml += `<h5>Summary Statistics for ${depVarName} Equation</h5>
                  <p><strong>R-squared:</strong> ${olsResult.rSquared !== undefined ? olsResult.rSquared.toFixed(4) : 'N/A'}</p>
                  <p><strong>Adjusted R-squared:</strong> ${olsResult.adjRSquared !== undefined ? olsResult.adjRSquared.toFixed(4) : 'N/A'}</p>
                  <p><strong>F-statistic:</strong> ${olsResult.fStatistic && olsResult.fStatistic.value !== undefined ? olsResult.fStatistic.value.toFixed(2) : 'N/A'} (p-value: ${olsResult.fStatistic && olsResult.fStatistic.pValue !== undefined ? olsResult.fStatistic.pValue.toFixed(3) : 'N/A'})</p>
                  <p><strong>Number of observations:</strong> ${olsResult.nObs !== undefined ? olsResult.nObs : 'N/A'}</p>`;

    resultsDiv.innerHTML = tableHtml;

    if (typeof renderMathInElement === 'function') {
        renderMathInElement(resultsDiv, katexOptions);
    }

    if (numLags > 6) {
        const toggleBtn = document.getElementById(`toggle-matrices-${depVarName}`);
        if (toggleBtn) {
            // Clone and replace to ensure old listeners are removed if any
            const newToggleBtn = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggleBtn, toggleBtn);

            newToggleBtn.addEventListener('click', function() {
                const isShowing = this.getAttribute('data-show') === 'true';
                const container = resultsDiv.querySelector('.a-matrices-container');
                if (container) {
                    const extras = container.querySelectorAll('.matrix-extra');
                    extras.forEach(el => {
                        el.style.display = isShowing ? 'none' : '';
                    });
                }
                this.setAttribute('data-show', isShowing ? 'false' : 'true');
                this.textContent = isShowing ? `Show All ${numLags} Lag Coefficient Tables` : 'Hide Extra Lag Tables';
            });
            // Set initial state for extras
            const container = resultsDiv.querySelector('.a-matrices-container');
            if (container) {
                const extras = container.querySelectorAll('.matrix-extra');
                extras.forEach(el => {
                    el.style.display = 'none'; // Initially hide extras
                });
            }
        }
    }

    const timeLabelsAll = fullData.year.map((y, idx) => `${y}-${String(fullData.month[idx]).padStart(2, '0')}`);
    const timeLabelsForPlot = timeLabelsAll.slice(numLags);
    const actualDataForPlot = fullData[depVarName].slice(numLags);

    if (typeof SvarPlotting !== 'undefined') {
        const actualFittedCanvasId = `var-${depVarName.toLowerCase()}-actual-fitted-chart`;
        const residualsCanvasId = `var-${depVarName.toLowerCase()}-residuals-chart`;
        
        if (document.getElementById(actualFittedCanvasId)) {
            SvarPlotting.plotActualVsFitted(actualFittedCanvasId, timeLabelsForPlot, actualDataForPlot, olsResult.fittedValues, depVarName);
        } else {
            console.warn(`Canvas ${actualFittedCanvasId} not found for ${depVarName}.`);
        }
        if (document.getElementById(residualsCanvasId)) {
            SvarPlotting.plotResiduals(residualsCanvasId, timeLabelsForPlot, olsResult.residuals, `${depVarName} Residuals`);
        } else {
            console.warn(`Canvas ${residualsCanvasId} not found for ${depVarName}.`);
        }
    } else {
        console.warn('SvarPlotting not fully available for VAR plots.');
    }
}

// Ensure SvarDataLoader, SvarPlotting, SvarAlgorithms are available.
// These are assumed to be loaded via <script> tags in index.html before main.js
