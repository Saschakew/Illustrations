// public/js/sections/section_three.js
const SECTION_THREE_ID = 'section-three';

// Expose functions on a global object for main.js to use
window.sectionThree = {
    updatePlots: updateSectionThreePlots,
    initialize: initializeSectionThree
};

/**
 * Initializes the section by building its content and performing an initial plot rendering.
 */
async function initializeSectionThree() {
    DebugManager.log('INIT', `Initializing JavaScript for section: ${SECTION_THREE_ID}`);
    const contentArea = document.getElementById('section-three-dynamic-content');
    if (!contentArea) {
        DebugManager.log('ERROR', 'Section three dynamic content area not found.');
        return;
    }
    contentArea.innerHTML = ''; // Clear existing content

    // 1. Intro Paragraph
    const introHTML = `
        <p class="section-intro">This section demonstrates how \\(B_0\\) can be identified by leveraging the non-Gaussianity of the structural shocks. Instead of assuming full statistical independence, we rely on the weaker condition of **mean independence**, which requires that \\(E[\\epsilon_{it} | \\epsilon_{jt}] = 0\\) for \\(i \\neq j\\). This assumption allows for higher-order dependencies like common volatility. </p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    
   // 5. Explain controls
   const explainControlsHTML = `
   <div class="controls-explanation-card">
       <h4>Interactive Controls</h4>
       <p><strong>T Slider:</strong> Adjusts the sample size of the generated data.</p>
       <p><strong>&phi; Slider:</strong> Manually select a rotation angle \\(\\phi\\) for the \\(B(\\phi)\\) parameterization.</p>
       <p><strong>Mode Switch:</strong> Toggles the true data-generating process between a recursive and non-recursive SVAR model.</p>
       <p><strong>New Data Button:</strong> Generates a new set of random shocks for the given sample size.</p>
   </div>
   `;
   contentArea.appendChild(ContentTemplates.createFullWidthContentRow(explainControlsHTML));

    // 2. Sub-topic Heading: Identification via Non-Gaussianity
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Identification via Non-Gaussianity'));

    // 3. Identification Content & Callout
    const identificationMainHTML = `
        <p>
            When at most one of the structural shocks \\(\\epsilon_{it}\\) is Gaussian, the matrix \\(B_0\\) is identified up to permutation and scaling of the shocks. We seek a rotation angle \\(\\phi\\) that transforms the reduced-form shocks \\(u_t\\) into innovations \\(e_t(\\phi) = B(\\phi)^{-1} u_t\\) that are "as mean independent as possible." This can be achieved by minimizing an objective function based on higher-order moments of \\(e_t(\\phi)\\).
        </p>
        
    `;
    const identificationCalloutHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Key Insight:</strong> Unlike Gaussian shocks, whose rotated versions remain independent, rotated non-Gaussian shocks exhibit changes in dependencies, which helps in pinpointing the correct underlying structure.</p>',
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(identificationMainHTML, identificationCalloutHTML));


    // 4. Objective Function Content

    const objfunctionHTML = `<p>
            Under the assumption of mean independence, certain higher-order cross-moments of the true structural shocks are zero. For example, the coskewness terms \\(E[\\epsilon_{1t}^2 \\epsilon_{2t}]\\) and 
            \\(E[\\epsilon_{1t} \\epsilon_{2t}^2]\\) are both zero. We can therefore find the correct rotation angle \\(\\phi\\) by minimizing an objective function built from the sample analogues of these theoretical moment conditions.
            The non-Gaussian estimator solves the following optimization problem:
        </p> 
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(objfunctionHTML));
    
    
    
    const objectiveFunctionMainHTML = `
        ${ContentTemplates.buildLatexEquationBlock('\\hat{\\phi}_{nG} = \\operatorname*{argmin}_{\\phi}   \\mathrm{mean}(e(B(\\phi))_{1t}^2 e(B(\\phi))_{2t})^2 + \\mathrm{mean}(e(B(\\phi))_{1t} e(B(\\phi))_{2t}^2)^2')}
         `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(objectiveFunctionMainHTML));

    const estimatorNGHTML = `
    <p> That is, we search for the rotation angle \(\\phi\) that minimizes the dependencies of the innovations measured by the squared coskewness terms \\(\\mathrm{mean}(e(B(\\phi))_{1t}^2 e(B(\\phi))_{2t})\\) and \\(\\mathrm{mean}(e(B(\\phi))_{1t} e(B(\\phi))_{2t}^2)\\). </p>

    <p>
        The non-Gaussian estimator \\(\\hat{\\phi}_{nG}\\) identifies the model by minimizing the objective function above. It yields the estimator \\(\\hat{B}_{nG}\\) shown below.
    </p>
    
    ${ContentTemplates.createEstimatorComparisonRow('b_est_nG_s3_display', 'b_true_s3_display', 'Estimated (Non-Gaussian)', 'True B₀')}
    
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(estimatorNGHTML));

    // Discussion block for Non-Gaussian estimator performance
    const NGComparisonDiscussionHTML = `
        <ul>
            <li>The non-Gaussian estimator is <strong>consistent</strong> for \\(B_0\\) whether the true model is recursive or non-recursive. This makes it a robust alternative when there is uncertainty about the correct zero restrictions.</li>
            <li>However, because it relies on higher-order moments, it tends to be <strong>less efficient</strong> (i.e., have higher variance) than the Cholesky estimator, especially in small samples. This means its estimates can be more volatile.</li>
        </ul>
        <p>This highlights the trade-off: robustness to misspecification versus efficiency when correctly specified.</p>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(NGComparisonDiscussionHTML));
    
   


    // 7. Sub-topic Heading: Animations
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));

    // 8. Animations Description
    const animationsDescHTML = `
        <p><strong>Left Plot (Innovations):</strong> Displays a scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) against \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Objective Function):</strong> Shows the non-Gaussian objective function plotted against a range of \\(\\phi\\) values. 
            A   line indicates the current \\(\\phi\\) selected by the slider. 
            Another line marks the true \\(\\phi_0\\) (derived from the selected true \\(B_0\\)).
            A third line marks the estimated \\(\\hat{\\phi}_{nG}\\).
        </p>

    `;
    contentArea.appendChild(ContentTemplates.buildLeftRightPlotExplanation(animationsDescHTML));

    // Observations block for animations
    const animationsObsHTML = `
        <ul>
            <li>Use the \\(\\phi\\) slider to select a rotation angle and see how the non-Gaussian objective function changes. In contrast to the objective function in the last section based on uncorrelated shocks, the non-Gaussian objective function has a unique minima. </li>
            <li> With an increasing sample size, the estimator \\(\\hat{\\phi}_{nG}\\) converges to the true \\(\\phi_0\\). </li>
            <li>The non-Gaussian estimator \\(\\hat{\\phi}_{nG}\\) aligns close to the true \\(\\phi_0\\) in both recursive and non-recursive cases.</li>
            <li> However, the non-Gaussian estimator tends to be volatile in small samples. Use a small sample and create multiple new data sets and observe the variance of the estimator. </li>
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(animationsObsHTML));

    // Register dynamic LaTeX elements after they have been added to the DOM
    if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
        window.DynamicLatexManager.registerDynamicLatex('b_est_nG_s3_display', 'B_est_nG', 'displayBEstMatrix', ['\\hat{B}_{nG}']);
        window.DynamicLatexManager.registerDynamicLatex('b_true_s3_display', 'B0', 'displayBEstMatrix', ['B_0']);
    } else {
        DebugManager.error('SEC_THREE_INIT', 'DynamicLatexManager.registerDynamicLatex not available.');
    }

    // Typeset MathJax for the whole section
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        await window.MathJax.typesetPromise([contentArea]);
    }

    await updateSectionThreePlots();
    DebugManager.log('INIT', `Async initialization for section: ${SECTION_THREE_ID} complete.`);
}

/**
 * Updates both plots in Section Three.
 * - Left Plot: Scatter plot of the current structural innovations (e_t).
 * - Right Plot: Objective function J(phi) vs. a range of phi values.
 */
async function updateSectionThreePlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Three plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi, phi_0, phi_est_nG } = window.sharedData;

    // Left Plot: Scatter of structural innovations e_t
    if (window.PlotUtils && e_1t && e_2t) {
        window.PlotUtils.createOrUpdateScatterPlot(
            'plot_s3_left',
            e_1t,
            e_2t,
            'Innovations ',
            '\\(e_{1}(\\\\phi)\\)',
            '\\(e_{2}(\\\\phi)\\)'
        );
    }

    // Right Plot: Objective function J(phi)
    if (window.PlotUtils && window.SVARMathUtil && u_1t && u_1t.length > 0 && u_2t && u_2t.length > 0) {
        const cov_u = window.SVARMathUtil.calculateCovarianceMatrix(u_1t, u_2t);
        if (!cov_u) {
            DebugManager.log('PLOT_RENDERING', 'Section Three: Covariance matrix of u_t is null. Skipping objective plot.');
            return;
        }

        const P = window.SVARMathUtil.choleskyDecomposition(cov_u);
        if (!P) {
            DebugManager.log('PLOT_RENDERING', 'Section Three: Cholesky decomposition P is null. Skipping objective plot.');
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

                        const loss = window.SVARCoreFunctions.calculateNonGaussianLossForPhi(current_phi_iter, P, u_1t, u_2t);
            objective_values.push(loss);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s3_right',
            phi_range,
            objective_values,
            'Loss Function',
            'φ (radians)',
            'Objective Value',
            phi,    // Current phi from slider (verticalLineX)
            [0, 0.5], // yAxisRange - set to [0, 0.5]
            phi_0, // True phi_0 (phi0LineValue)
            phi_est_nG // Estimated phi for non-Gaussian method
        );
    } else {
        DebugManager.log('PLOT_RENDERING', 'Section Three: PlotUtils, SVARMathUtil, or u_t series not available/empty. Skipping objective plot.');
    }
}
