// public/js/sections/section_four.js
const SECTION_FOUR_ID = 'section-four';

// Expose functions on a global object for main.js to use
window.sectionFour = {
    updatePlots: updateSectionFourPlots,
    initialize: initializeSectionFour
};

/**
 * Initializes the section by building its content and performing an initial plot rendering.
 */
async function initializeSectionFour() {
    DebugManager.log('INIT', `Initializing JavaScript for section: ${SECTION_FOUR_ID}`);
    const contentArea = document.getElementById('section-four-dynamic-content');
    if (!contentArea) {
        DebugManager.log('ERROR', 'Section four dynamic content area not found.');
        return;
    }
    contentArea.innerHTML = ''; // Clear existing content

    // 1. Intro Paragraph
    const introHTML = `
      <p class="section-intro">This section introduces the paper's primary contribution: a ridge-regularized GMM estimator that provides a flexible, data-driven framework for incorporating a potentially invalid economic restriction. Instead of treating the zero restriction \\(b_{12}=0\\) as dogmatically true (as in Section Two) or ignoring it entirely (as in Section Three), this approach shrinks the estimate towards the restriction, allowing the data to provide evidence for or against it.</p> 
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    // 2. Sub-topic Heading
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('The Ridge Estimator'));

    // 3. Ridge Content
    const ridgeMainHTML = `
         <p>
            The estimator minimizes a weighted sum of the non-Gaussian objective function and a penalty term, which penalizes deviations from the restriction \\(b_{12}=0\\).  The ridge-regularised objective function is
        </p> 
        ${ContentTemplates.buildLatexEquationBlock('\\hat{\\phi}_{ridge} = \\arg\\min_{\\phi}\\, J(\\phi)  +  \\lambda v_{12}  b_{12}(\\phi)^2')} 

 <p>The first part of the objective function is the non-Gaussian objective function from Section Three, \\(J(\\phi) = \\mathrm{mean}(e_{1t}^2 e_{2t})^2 + \\mathrm{mean}(e_{1t} e_{2t}^2)^2\\), which tries to minimize the dependency between the shocks \\(e_{1t}\\) and \\(e_{2t}\\).
 </p> 

  <p> The second part of the objective function is the penalty \\(\\lambda v_{12}  b_{12}(\\phi)^2\\), which penalizes deviations from the restriction \\(b_{12}=0\\). The tuning parameter \\(\\lambda\\) and the adaptive weight  \\(v_{12}\\) together govern the cost of deviating from the restriction. 
    The adaptive weight \\(v_{12}\\) is inversely proportional to the size of the \\(b_{12}\\) element from a preliminary, unrestricted estimate (like the one from Section Three), i.e. \\(v_{12} = 1 / \\tilde{b}_{12,nG}^2\\). </p> 
    `;
    const adaptivePenaltyCalloutHTML = ContentTemplates.buildInfoCallout(
        `<p><strong>Adaptive Weights:</strong> By adaptively weighting the penalty, the ridge estimator navigates the classic bias-variance trade-off. The intuition is simple: if the data strongly suggest the parameter \\(b_{12}\\) is non-zero (i.e., the preliminary estimate \\(\\tilde{b}_{12}\\) is large), its corresponding weight \\(v_{12}\\) will be small. This makes the penalty for deviating from the zero restriction 'cheap'. Conversely, if the data suggest the parameter is close to zero, its weight will be large, making it 'costly' to deviate. This mechanism effectively lets the data guide the shrinkage process.The tuning parameter \\(\\lambda\\) controls the overall strength of this trade-off.</p>`,
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(ridgeMainHTML, adaptivePenaltyCalloutHTML));
    
    const CurrentPenaltyHTML = `
    <p> Based on the non-Gaussian estimator from Section Three, the current adaptive weight is equal to ....insert weight here....
    Use the \\(\\phi\\) slider to select a matrix ..insert B(phi) here.. and see how the penalty \\(\\lambda \\tilde{b}_{12}^2\\) changes: ...insert penalty here...</p>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(CurrentPenaltyHTML));

    // 4. Estimator Comparison
    const estimatorRidgeHTML = `
    <p>
        The ridge estimator yields the estimated structural matrix <span id="b_est_ridge_s4_display"></span>.
    </p>
    <p><strong>Compare this estimator to the true \\(B_0\\):</strong> <span id="b_true_s4_display"></span></p>
    <ul>
        <li>When the true model is <strong>recursive</strong>, the restriction \\(b_{12}=0\\) is correct. The ridge estimator leverages this by shrinking towards the correct restriction, resulting in a more efficient (lower variance) estimate than the pure non-Gaussian estimator from Section Three.</li>
        <li>When the true model is <strong>non-recursive</strong>, the restriction \\(b_{12}=0\\) is incorrect. The ridge estimator is biased towards this wrong restriction, but the bias is mitigated by the adaptive weight. It strikes a balance between the biased Cholesky estimator and the unbiased but volatile non-Gaussian estimator.</li>
    </ul>
    <p>Use the \\(\\lambda\\) slider to see how the trade-off between bias and variance changes. A small \\(\\lambda\\) trusts the data more, while a large \\(\\lambda\\) imposes the restriction more strongly. The current values for the adaptive weight and the penalty parameter are displayed below. Watch how the weight \(v_{12}\) changes when you draw a new sample of data, and how the overall penalty is controlled by your choice of \\(\\lambda\\).</p>
    <div class="estimate-card">
        <div class="est-line"><span>Derived weight \(v_{12}\):</span><span id="v_est_ridge_s4_display"></span></div>
        <div class="est-line"><span>Penalty \\(\\lambda\\):</span><span id="lambda_value_s4_display"></span></div>
    </div>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(estimatorRidgeHTML));

    // 5. Explain controls
    const explainControlsHTML = `
    <div class="controls-explanation-card">
        <h4>Interactive Controls</h4>
        <p><strong>Mode Switch:</strong> Toggles the true data-generating process between a recursive and non-recursive \\(B_0\\) matrix.</p>
        <p><strong>T Slider:</strong> Adjusts the sample size of the generated data.</p>
        <p><strong>&lambda; Slider:</strong> Adjusts the tuning parameter for the ridge penalty. A value of 0 effectively turns off the penalty, making this estimator identical to the one in Section Three.</p>
        <p><strong>&phi; Slider:</strong> Manually select a rotation angle \\(\\phi\\) to see how the innovations and objective function change.</p>
        <p><strong>New Data Button:</strong> Generates a new set of random shocks for the given sample size.</p>
    </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(explainControlsHTML));

    // 6. Animations and Observations
    const animationsHTML = `
        <p><strong>Left Plot (Innovations):</strong> A scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) vs. \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Objective Function):</strong> Shows the ridge objective function, \\(J_{ridge}(\\phi)\\), across different values of \\(\\phi\\). Vertical lines indicate the current \\(\\phi\\), the true \\(\\phi_0\\), and the estimated \\(\\hat{\\phi}_{ridge}\\).</p>
        <p><strong>Observations:</strong></p>
        <ul>
            <li>Observe how increasing \\(\\lambda\\) influences the shape of \\(J_{ridge}(\\phi)\\) and the resulting \\(\\hat{\\phi}_{ridge}\\). Higher \\(\\lambda\\) values typically lead to a smoother objective function and can pull \\(\\hat{\\phi}_{ridge}\\) towards angles that result in smaller penalty terms.</li>
            <li>The ridge estimator can be particularly useful when the non-regularized objective function (from Section Three) is noisy or has multiple local minima.</li>
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(animationsHTML));


    // Initialize LaTeX displays
    if (window.LatexUtils) {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s4_display');
        window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', window.sharedData.phi_est_ridge, '\\\\hat{\\\\phi}_{ridge}');
        window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', window.sharedData.B_est_ridge, '\\\\hat{B}_{ridge}');
        // For v_est_ridge_s4_display and lambda_value_s4_display, we'll update them directly in updateSectionFourPlots or a dedicated function
        // as they might need more frequent updates or specific formatting not covered by generic LatexUtils.
        // For now, ensure the lambda display is updated.
        const lambdaElement = document.getElementById('lambda_value_s4_display');
        if (lambdaElement) {
            lambdaElement.textContent = `\\(${window.sharedData.lambda.toFixed(2)}\\)`;
        }
        const vElement = document.getElementById('v_est_ridge_s4_display');
        if (vElement && window.sharedData.v_est_ridge !== undefined) {
            // Assuming v_est_ridge is a number or a simple array that can be stringified for now
            // For a vector, you might want to format it as e.g., [v1, v2]
            let v_display_text = typeof window.sharedData.v_est_ridge === 'number' ? window.sharedData.v_est_ridge.toFixed(3) : JSON.stringify(window.sharedData.v_est_ridge);
            vElement.textContent = `\\(${v_display_text}\\)`;
        } else if (vElement) {
            vElement.textContent = `\\(N/A\\)`;
        }


    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils not available for initial display in Section Four.');
    }

    // Typeset MathJax
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        await window.MathJax.typesetPromise([contentArea]);
    }

    await updateSectionFourPlots();
    DebugManager.log('INIT', `Async initialization for section: ${SECTION_FOUR_ID} complete.`);
}


/**
 * Updates both plots in Section Four.
 * - Left Plot: Scatter plot of the current structural innovations (e_t).
 * - Right Plot: Ridge-regularized objective function J_ridge(phi) vs. a range of phi values.
 */
async function updateSectionFourPlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Four plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi, lambda, phi_0, phi_est_ridge, B_est_ridge, v_est_ridge } = window.sharedData;

    // Update LaTeX displays that might change with phi or lambda
    if (window.LatexUtils) {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s4_display'); // B(phi) depends on current phi slider
        window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', phi_est_ridge, '\\hat{\\phi}_{ridge}');
        window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', B_est_ridge, '\\hat{B}_{ridge}');

        // Display the true B0 matrix
        if (window.sharedData && window.sharedData.B0) {
            window.LatexUtils.displayBEstMatrix('b_true_s4_display', window.sharedData.B0, 'B_0');
        } else {
            window.LatexUtils.displayBEstMatrix('b_true_s4_display', [[NaN, NaN], [NaN, NaN]], 'B_0');
        }

        const lambdaElement = document.getElementById('lambda_value_s4_display');
        if (lambdaElement) {
            lambdaElement.textContent = `\\(${lambda.toFixed(2)}\\)`;
        }
        const vElement = document.getElementById('v_est_ridge_s4_display');
        if (vElement && v_est_ridge !== undefined) {
            let v_display_text = typeof v_est_ridge === 'number' ? v_est_ridge.toFixed(3) : JSON.stringify(v_est_ridge);
            // If v_est_ridge is an array, format it nicely: e.g. [v1, v2]
            if (Array.isArray(v_est_ridge)) {
                v_display_text = `[${v_est_ridge.map(val => val.toFixed(3)).join(', ')}]`;
            }
            vElement.textContent = `\\(${v_display_text}\\)`;
        } else if (vElement) {
            vElement.textContent = `\\(N/A\\)`;
        }

        if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
            // Only typeset the specific elements that were updated
            const elementsToTypeset = ['b_phi_matrix_s4_display', 'phi_est_ridge_s4_display', 'b_est_ridge_s4_display', 'lambda_value_s4_display', 'v_est_ridge_s4_display']
                .map(id => document.getElementById(id))
                .filter(el => el !== null);
            if (elementsToTypeset.length > 0) {
                await window.MathJax.typesetPromise(elementsToTypeset);
            }
        }
    }


    // Left Plot: Scatter of structural innovations e_t
    if (window.PlotUtils && e_1t && e_2t) {
        window.PlotUtils.createOrUpdateScatterPlot(
            'plot_s4_left',
            e_1t,
            e_2t,
            'Structural Innovations e(φ) (Ridge ID)',
            'e_1t',
            'e_2t'
        );
    }

    // Right Plot: Ridge Objective function J_ridge(phi)
    if (window.PlotUtils && window.SVARMathUtil && u_1t && u_1t.length > 0 && u_2t && u_2t.length > 0) {
        const cov_u = window.SVARMathUtil.calculateCovarianceMatrix(u_1t, u_2t);
        if (!cov_u) {
            DebugManager.log('PLOT_RENDERING', 'Section Four: Covariance matrix of u_t is null. Skipping objective plot.');
            return;
        }
        const P = window.SVARMathUtil.choleskyDecomposition(cov_u);
        if (!P) {
            DebugManager.log('PLOT_RENDERING', 'Section Four: Cholesky decomposition P is null. Skipping objective plot.');
            return;
        }

        const phi_range = [];
        const objective_values = [];
        const steps = 100;
        const min_phi = -Math.PI / 4;
        const max_phi = Math.PI / 4;

        for (let i = 0; i <= steps; i++) {
            const current_phi_iter = min_phi + (i / steps) * (max_phi - min_phi);
            phi_range.push(current_phi_iter);
            // calculateLossForPhi_S4 is defined in svar_functions.js as part of calculateRidgeEstimates
            // For plotting, we need a local version or ensure SVARCoreFunctions.calculateSingleRidgeLoss is available
            // Let's assume calculateSingleRidgeLossForPlotting is available or adapt calculateLossForPhi_S4 from svar_functions
            const objective_val = SVARCoreFunctions.calculateSingleRidgeLoss(current_phi_iter, P, u_1t, u_2t, lambda, window.sharedData.v);
            objective_values.push(objective_val);
        }

        // Determine Y-axis range for the ridge objective plot
        let y_axis_range_s4_right = [0, 0.5]; // Default range
        const valid_objective_values = objective_values.filter(val => Number.isFinite(val));
        if (valid_objective_values.length > 0) {
            const max_objective_value = Math.max(...valid_objective_values);
            if (max_objective_value > 0.5) {
                y_axis_range_s4_right = [0, max_objective_value]; // Auto-adjust if max is > 0.5. Plotly will add some padding.
            } else if (max_objective_value < 0) {
                // If all values are negative (unlikely for this loss but good to consider), adjust min too.
                // For this specific loss J = term^2 + term^2 + penalty(b^2), it should be non-negative.
                // So, we primarily care about the max for the upper bound.
                // If max is, say, 0.2, y_axis_range_s4_right remains [0, 0.5]
            }
        } else {
             DebugManager.log('PLOT_RENDERING', 'Section Four: No finite objective values to determine y-axis range. Using default.');
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s4_right',
            phi_range,
            objective_values,
            'Ridge Objective J_ridge(φ)',
            'φ (radians)',
            'Objective Value',
            phi,    // Current phi from slider
            y_axis_range_s4_right, // Dynamically set yAxisRange
            phi_0,  // True phi_0
            phi_est_ridge // Estimated phi for ridge method
        );
    } else {
        DebugManager.log('PLOT_RENDERING', 'Section Four: PlotUtils, SVARMathUtil, or u_t series not available/empty. Skipping objective plot.');
    }
}

// Note: The actual calculation for v_est_ridge and the penalty term in calculateSingleRidgeLoss
// depends on the specific definition of v(phi) used in SVARCoreFunctions.calculateRidgeEstimates.
// The placeholder for v_est_ridge_s4_display assumes sharedData.v_est_ridge is populated correctly
// by SVARCoreFunctions.calculateRidgeEstimates.