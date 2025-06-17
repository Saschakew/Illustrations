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
        <p class="section-intro">
            The ridge SVAR–GMM estimator proposed in the paper augments the non-Gaussian identification criterion with a <em>shrinkage</em> term that softly pulls the structural matrix towards the economically motivated zero restrictions of the recursive model.  The tuning parameter \(\lambda\) lets you move seamlessly between the purely data-driven estimator (\(\lambda = 0\)) and the fully restricted short-run identification (\(\lambda \to \infty\)).
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    // 2. Sub-topic Heading: Ridge Regularization
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Ridge Regularization for SVARs'));

    // 3. Ridge Regularization Content
    const ridgeMainHTML = `
        <p>
            Ridge regularization modifies the original non-Gaussian objective by <strong>adding an adaptive penalty</strong> on the off-diagonal elements of the candidate structural matrix \(B(\phi)\).
            Formally, the penalty is \(\lambda \sum_{i\neq j} v_{ij}^2 b_{ij}(\phi)^2\) with data-driven weights \(v_{ij} = |\tilde{b}_{ij}|^{-\gamma}\) (\(\gamma>0\)) computed from a preliminary estimator \(\tilde{B}\).  Large preliminary elements therefore receive small weights, allowing the estimator to back-off when the data clearly reject a zero restriction.
        </p>
        <p>
            The slider below the plots changes \(\lambda\) in real time so you can observe how stronger shrinkage (larger \(\lambda\)) gradually aligns \(\hat{B}_{ridge}\) with the recursive benchmark, while smaller values reproduce Section&nbsp;Three’s mean-independence estimator.
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(ridgeMainHTML));

    // 4. Sub-topic Heading: Ridge Objective Function
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('The Ridge-Regularized Objective Function'));

    // 5. Ridge Objective Function Description
    const ridgeObjectiveHTML = `
        <p>
            The ridge-regularised objective function used in the paper is
        </p>
        ${ContentTemplates.buildLatexEquationBlock('\\hat{\\phi}_{ridge} = \\arg\\min_{\\phi}\, J(\\phi)  +  \\lambda \\sum_{i\\neq j} v_{ij}^2 b_{ij}(\\phi)^2')}
        <p>
            Where \\(J(\\phi)\\) is the non-Gaussian objective function from Section Three: \\(J(\\phi) = \\mathrm{mean}(e_{1t}^2 e_{2t})^2 + \\mathrm{mean}(e_{1t} e_{2t}^2)^2\\).
            Here \(J(\\phi)\) is the non-Gaussian coskewness criterion from Section&nbsp;Three and the second term is the adaptive ridge penalty.  When a restriction is likely to be valid (small preliminary \(|\tilde{b}_{ij}|\)), the corresponding weight \(v_{ij}\) is large, so deviating from zero becomes expensive; invalid restrictions impose only a light penalty.
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(ridgeObjectiveHTML, 'ridge-objective-row'));

    // 6. Estimate Card
    const estimateCardHTML = `
        <div class="estimate-card card">
            <p class="est-line">Current \\(B(\\phi)\\): <span id="b_phi_matrix_s4_display"></span></p>
            <p class="est-line">Estimated \\(\\hat{\\phi}_{ridge}\\): <span id="phi_est_ridge_s4_display"></span></p>
            <p class="est-line">Estimated \\(\\hat{B}_{ridge}\\): <span id="b_est_ridge_s4_display"></span></p>
            <p class="est-line">Derived weight \\(v(\\hat{\\phi}_{ridge})\\): <span id="v_est_ridge_s4_display"></span> (example value)</p>
            <p class="est-line">Penalty \\(\\lambda\\): <span id="lambda_value_s4_display"></span></p>
        </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(estimateCardHTML, 'estimate-card-row'));

    // 7. Explain controls
    const explainControlsHTML = `
    <div class="controls-explanation-card">
        <p><strong>Controls Overview:</strong></p>
        <ul>
            <li><strong>\\(T\\) Slider:</strong> Adjusts the sample size.</li>
            <li><strong>\\(B_0\\) Switch:</strong> Toggles the true DGP matrix \\(B_0\\).</li>
            <li><strong>\\(\\phi\\) Slider:</strong> Adjusts the rotation angle for the candidate \\(B(\\phi)\\).</li>
            <li><strong>\\(\\lambda\\) Slider:</strong> Adjusts the ridge penalty strength.</li>
            <li><strong>New Data Button:</strong> Generates a new dataset.</li>
        </ul>
    </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(explainControlsHTML, 'explain-controls-row-s4'));

    // 8. Sub-topic Heading: Animations
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));

    // 9. Animations Description
    const animationsHTML = `
        <p><strong>Left Plot (Innovations):</strong> Displays a scatter plot of \\(e_{1t}(\\phi)\\) vs \\(e_{2t}(\\phi)\\) for the current \\(\\phi\\) from the slider.</p>
        <p><strong>Right Plot (Ridge Objective Function):</strong> Shows \\(J_{ridge}(\\phi)\\) vs \\(\\phi\\).
            A <span style="color: var(--plot-color-current-phi);">blue vertical line</span> indicates the current \\(\\phi\\).
            A <span style="color: var(--plot-color-phi0);">red dashed line</span> marks the true \\(\\phi_0\\).
            A <span style="color: var(--plot-color-estimated-phi);">green long-dashed line</span> marks the estimated \\(\\hat{\\phi}_{ridge}\\) that minimizes \\(J_{ridge}(\\phi)\\).
        </p>
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
        window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', phi_est_ridge, '\\\\hat{\\\\phi}_{ridge}');
        window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', B_est_ridge, '\\\\hat{B}_{ridge}');

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