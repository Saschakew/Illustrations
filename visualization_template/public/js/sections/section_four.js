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
      <p class="section-intro">This section introduces the paper's primary contribution: a ridge-regularized GMM estimator that provides a flexible, data-driven framework for incorporating potentially invalid short-run restriction. Instead of treating the zero restriction \\(b_{12}=0\\) as dogmatically true (as in Section Two) or ignoring it entirely (as in Section Three), this approach shrinks the estimate towards the restriction, allowing the data to provide evidence for or against it.</p> 

      
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

     // 5. Explain controls
     const explainControlsHTML = `
     <div class="controls-explanation-card">
         <h4>Interactive Controls</h4>
         <p><strong>T Slider:</strong> Adjusts the sample size of the generated data.</p>
         <p><strong>Mode Switch:</strong> Toggles the true data-generating process between a recursive and non-recursive SVAR model.</p>
         <p><strong>&phi; Slider:</strong> Manually select a rotation angle \\(\\phi\\) for the \\(B(\\phi)\\) parameterization.</p>
         <p><strong>&lambda; Slider:</strong> Adjusts the tuning parameter for the ridge penalty. </p>
         <p><strong>New Data Button:</strong> Generates a new set of random shocks for the given sample size.</p>
     </div>
     `;
     contentArea.appendChild(ContentTemplates.createFullWidthContentRow(explainControlsHTML));

    // 2. Sub-topic Heading
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('The Ridge Estimator'));

    // 3. Ridge Content
    const ridgeMainHTML = `
         <p>
            The estimator minimizes a weighted sum of the non-Gaussian objective function and a penalty term, which penalizes deviations from the restriction \\(b_{12}=0\\).  The ridge-regularised objective function is
        </p> 
        ${ContentTemplates.buildLatexEquationBlock('\\hat{\\phi}_{ridge} =  \\operatorname*{argmin}_{\\phi}   \\, J(\\phi)  +  \\lambda v_{12}  B(\\phi)_{12}^2')} 

 <p>The first part of the objective function is the non-Gaussian objective function from Section Three, \\(J(\\phi) = \\mathrm{mean}(e_{1t}(\\phi)^2 e_{2t}(\\phi))^2 + \\mathrm{mean}(e_{1t}(\\phi) e_{2t}(\\phi)^2)^2\\), which tries to minimize the dependency between the shocks \\(e_{1t}(\\phi)\\) and \\(e_{2t}(\\phi)\\).
 </p> 

  <p> The second part of the objective function is the penalty \\(\\lambda v_{12}  B(\\phi)_{12}^2\\), which penalizes deviations from the restriction \\(b_{12}=0\\). The tuning parameter \\(\\lambda\\) and the adaptive weight  \\(v_{12}\\) together govern the cost of deviating from the restriction. 
  
     </p> 
    `; 
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(ridgeMainHTML));

    const ridgeDescriptionHTML = `
    <ul>
    <li>A small tuning parameter \\(\\lambda\\) makes it 'cheap' to deviate from the restriction and a large \\(\\lambda\\) makes it 'costly' to deviate.</li>
    <li>The adaptive weight \\(v_{12}\\) is inversely proportional to the size of the \\(B_{12}\\) element from the unrestricted non-Gaussian estiamtor in Section Three, i.e. \\(v_{12} = 1 / \\tilde{B}_{12,nG}^2\\). </li>
    <li>If the true data-generating process is recursive such that the restriction \\(b_{12}=0\\) is correct, the non-Gaussian estimator will yield a large adaptive weight \\(v_{12}\\) and it becomes costly to deviate from it. If the true data-generating process is non-recursive such that the restriction \\(b_{12}=0\\) is false, the adaptive weight will be smaller and it becomes cheap to deviate from incorrect restrictions.  This mechanism effectively lets the data guide the shrinkage process.</li>
  </ul>
    `; 
    const ridgeCVNoteHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Note:</strong> In practice, the tuning parameter is chosen by cross-validation. That is, we split the data into a training and a validation set and choose the tuning parameter that yields the smallest cross-validation error.</p>',
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(ridgeDescriptionHTML, ridgeCVNoteHTML));
    
    const CurrentPenaltyHTML = `
    <p> Based on the non-Gaussian estimator from Section Three, the current adaptive weight is equal to </span> <span id="v_s4_display"></span>.  
    Use the \\(\\phi\\) slider to select a matrix  <span id="b_phi_display_s4"></span> and see how the penalty \\(\\lambda v_{12} b_{12}^2\\) changes: <span id="penalty_s4_display"></span>. Use the \\(\\lambda\\) slider to see how the tuning parameter affects the penalty.</p>
     
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(CurrentPenaltyHTML));

    // 4. Estimator Comparison
    const estimatorRidgeHTML = `
    <p>
        The ridge estimator yields the estimated structural matrix shown below.
    </p>
    
    ${ContentTemplates.createEstimatorComparisonRow('b_est_ridge_s4_display', 'b_0_display_s4', 'Estimated (Ridge)', 'True B₀')}
    
     
   
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(estimatorRidgeHTML));

        // Discussion block for Cholesky estimator performance
        const RecComparisonDiscussionHTML = `
        <p> If the true data-generating process is recursive such that the restriction \\(b_{12}=0\\) is correct:</p>
        <ul>
            <li>The adaptive weights induce a large penalty for deviating from restrictions and the ridge estimator shrinks towards the restriction. </li>
            <li> Due to the large adaptive weights, the choice of the tuning parameter \\(\\lambda\\) has a smaller effect on the estimator because of the large penalty induced by the adaptive weights. </li>
            <li>Compared to the unrestricted non-Gaussian estimator in Section Three, the ridge estimator is more efficient and is closer to the true \\(B_0\\).</li>
        </ul>
        <p>If the true data-generating process is non-recursive such that the restriction \\(b_{12}=0\\) is false:</p>
        <ul>
            <li>The adaptive weights induce a small penalty for deviating from restrictions and it becomes less costly to deviate from the restriction.  With a growing sample size, the ridge estimator shrinks less towards the incorrect restrictions. </li>
            <li>Compared to the dogmatic estimator in Section Two which imposes the restriction as a constrained, the ridge estimator is able to deviate from the restriction.</li>
        </ul>
        This high flexibility of the ridge estimator: It can use correct restrictions to increase efficiency and it can ignore incorrect restrictions to remain robust and unbiased. 
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(RecComparisonDiscussionHTML));
   

    //2. Sub - topic Heading: Model Variants
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));
    // 6. Animations description
    const animationsDescHTML = `
        <p><strong>Left Plot (Innovations):</strong> A scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) vs. \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Objective Function):</strong>Shows the Ridge objective function plotted against a range of \\(\\phi\\) values.
            A   line indicates the current \\(\\phi\\) selected by the slider.
            Another line marks the true \\(\\phi_0\\) (derived from the selected true \\(B_0\\)).
            A third line marks the estimated \\(\\hat{\\phi}_{ridge}\\).
        </p>
    `;
    contentArea.appendChild(ContentTemplates.buildLeftRightPlotExplanation(animationsDescHTML));

    // Observations block
    const animationsObsHTML = `
        <ul>
            <li>Observe how increasing \\(\\lambda\\) influences the shape of the Ridge objective function: A large tuning parameter \\(\\lambda\\) makes it costly to deviate from restrictions. A small tuning parameter \\(\\lambda\\) makes it cheap to deviate from restrictions.</li>
            <li> Change between the recursive and non-recursive data-generating process and observe how the Ridge objective function changes: In the recursive model, the restriction is correct and the adaptive weights induces a large penalty and heavy shrinkage towards the restriction. In contrast, in the non-recursive model, the restriction is false and the adaptive weights induces a much smaller penalty and less shrinkage towards the restriction. 
            </li> 
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(animationsObsHTML));


    // Register dynamic LaTeX elements after they have been added to the DOM
    if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
        window.DynamicLatexManager.registerDynamicLatex('b_0_display_s4', 'B0', 'displayBEstMatrix', ['B_0']);
        window.DynamicLatexManager.registerDynamicLatex('b_est_ridge_s4_display', 'B_est_ridge', 'displayBEstMatrix', ['\\hat{B}_{ridge}']);
        window.DynamicLatexManager.registerDynamicLatex('v_s4_display', 'v', 'displayVWeight', ['v']);
        window.DynamicLatexManager.registerDynamicLatex('penalty_s4_display', 'penalty', 'displayPenalty', ['penalty']);
        window.DynamicLatexManager.registerDynamicLatex('b_phi_display_s4', 'B_phi', 'displayBEstMatrix', ['B(\\phi)']);
    } else {
        DebugManager.error('SEC_ONE_INIT', 'DynamicLatexManager.registerDynamicLatex not available.');
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
            'Innovations',
            '\\(e_{1}(\\\\phi)\\)',
            '\\(e_{2}(\\\\phi)\\)'
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
            'Loss Function',
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