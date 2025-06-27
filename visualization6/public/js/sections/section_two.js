// public/js/sections/section_two.js

// Expose the update function on a global object for main.js to use
window.sectionTwo = {
    updatePlots: updateSectionTwoPlots,
    initialize: initializeSectionTwo // Expose initialize if main.js needs to call it directly after dynamic load
};

/**
 * Initializes the section by building its content and performing an initial plot rendering.
 */
async function initializeSectionTwo() {
    DebugManager.log('INIT', `Initializing JavaScript for section: section-two`);
    const contentArea = document.getElementById('section-two-dynamic-content');
    if (!contentArea) {
        DebugManager.log('ERROR', 'Section two dynamic content area not found.');
        return;
    }
    contentArea.innerHTML = ''; // Clear any existing placeholder content

    // 1. Intro Paragraph
    const introHTML = `
        <p class="section-intro">
        This section briefly explains the SVAR identification problem and outlines how short-run restrictions are used to solve it.
        </p>


     
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

    // 2. Sub-topic Heading:  Identification Problem
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('The identification problem'));

    // 3.  Identification Problem Main Content
    const IdentificationProblemMainHTML = `
       <p>
              We observe reduced-form shocks \\(u_t\\) and seek to recover the unobserved structural shocks \\(\\epsilon_t\\) and the true mixing matrix \\(B_0\\), related by \\(\\epsilon_t = B_0^{-1} u_t\\).
            Define innovations \\(e_t(B) = B^{-1} u_t\\). Assuming that the structural shocks are uncorrelated and have unit variance
            (\\(E[\\epsilon_t \\epsilon_t'] = I\\)), we look for a matrix \\(B\\) such that the innovations \\(e_t(B)\\) are also uncorrelated and have unit variance.
            However, there are infinialy many such matrices \\(B\\) and hence the assumption of uncorrelated unit variance shocks is not sufficient to identify the true matrix \\(B_0\\). 
        </p>

        <p> The set of  matrices \\(B\\) that yield uncorrelated unit variance innovations \\(e_{1t}(\\phi)\\) can be parameterized by a single rotation angle \\(\\phi\\). Let \\(B(\\phi)\\) be denote all such matrices \\(B\\) that yield uncorrelated unit variance innovations and define \\(e_{t}(\\phi) = B(\\phi)^{-1} u_t\\). </p>

        <p> Given the true data-generating matrix \\(B_0\\) (selected via the toggle), we can calculate the rotation angle
        \\(\\phi_0\\) such that \\(B(\\phi_0) = B_0\\). For the recursive \\(B_0\\) we get \\(\\phi_0^{\\text{rec}} = 0\\). For the non-recursive \\(B_0\\) we get
        \\(\\phi_0^{\\text{non-rec}} \\approx -0.46\\).</p>
    `;
    const IdentificationProblemCalloutHTML = ContentTemplates.buildInfoCallout(`
        <p><strong>Note:</strong> All matrices \\(B(\\phi) = B^{\\text{Chol}} Q(\\phi)\\) yield innovations \\(e_t(B(\\phi))\\) with unit variance and
            uncorrelated shocks, where \\(B^{\\text{Chol}}\\) is the Cholesky decomposition of the sample covariance of \\(u_t\\) , 
            and \\(Q(\\phi) = \\begin{bmatrix} \\cos \\phi & -\\sin\\phi \\\\ \\sin\\phi & \\cos\\phi \\end{bmatrix}\\).</p>
    `, false, true);
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(IdentificationProblemMainHTML, IdentificationProblemCalloutHTML));

    // 3. Sub-topic Heading:  Short-Run Restrictions
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Short-Run Restrictions'));

    const RestrictionsMainHTML = `
       <p>
            The conventional approach to solve the identification problem is to impose economically-motivated short-run zero restrictions on the \\(B\\) matrix. 
            In the bivariate example, only a single restriction is required to reduce the set of \\(B(\\phi)\\) which yield uncorrelated innovations to a unique matrix.
</p> `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(RestrictionsMainHTML));


    const EstimatorRecursiveHTML = `
    <p>
        By imposing the zero restriction \\(b_{12}=0\\), we uniquely identify the model. Technically, we solve the optimization problem: </p>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(EstimatorRecursiveHTML));


    const objectiveFunctionMainHTML = `
    ${ContentTemplates.buildLatexEquationBlock('\\begin{align*} \\hat{\\phi}_{rec} &= \\operatorname*{argmin}_{\\phi}   \\mathrm{mean}(e_{1t}(\\phi) e_{2t}(\\phi))^2 \\\\ & \\quad s.t. B(\\phi)_{12}=0 \\end{align*}')}
     `;
contentArea.appendChild(ContentTemplates.createFullWidthContentRow(objectiveFunctionMainHTML));


    const EstimatorRecursive2HTML = `
    <p> That is it we search for the rotation angle \\(\\hat{\\phi}_{rec}\\) that minimizes leads to uncorrelated innovations (this is trivial, by construction all \\(\\phi\\) yield uncorrelated innovations) and which satisfies the restriction \\(B(\\hat{\\phi}_{rec})_{12}=0\\). </p>

    
         <p>It yields the estimator shown below.
        But is this a good estimate? That depends entirely on whether the imposed restriction is correct.
    </p>

    ${ContentTemplates.createEstimatorComparisonRow('b_est_rec_s2_display', 'b0_display_s2', 'Estimated (Cholesky)', 'True B₀')}

    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(EstimatorRecursive2HTML));

    // Discussion block for Cholesky estimator performance
    const RecComparisonDiscussionHTML = `
        <ul>
            <li>When the true model is <strong>recursive</strong>, the Cholesky estimator is consistent and performs well.</li>
            <li>When the true model is <strong>non-recursive</strong>, the restriction \\(b_{12}=0\\) is incorrect. The resulting estimator is biased and inconsistent—notice that it is not close to the true \\(B_0\\), and this bias does not disappear even with a large sample size.</li>
        </ul>
        <p>This highlights the risk of imposing dogmatic restrictions.</p>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(RecComparisonDiscussionHTML));


   
    //2. Sub - topic Heading: Model Variants
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));

    // 3. B0 Matrix Options Card and Tip Callout
    const animationsDescHTML = `
       <p><strong>Left Plot (Innovations):</strong> A scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) vs. \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Correlation):</strong> Shows the correlation, \\(\\text{mean}(e_{1t}(\\phi) \\cdot e_{2t}(\\phi))\\), across different values of \\(\\phi  \\). A vertical line indicates the current \\(\\phi\\). Another line marks \\(\\phi_0\\) which corresponds to the true \\(B_0\\) which changes with the recursive vs non-recursive slider. The green line marks the estimated \\(\\hat{\\phi}_{rec}\\).</p>

         
    `;
    contentArea.appendChild(ContentTemplates.buildLeftRightPlotExplanation(animationsDescHTML));

    const observationsHTML = `
     
        <ul>
        <li>Use the \\(\\phi\\) slider to select a rotation angle and see the corresponding matrix <span id="b_phi_matrix_s2_display"></span>. Note that all such matrices yield uncorrelated innovations \\(e_{t}(\\phi) \\) shown in the left plot.
        </li> 
            <li>The recursive estimator works well when the true model is recursive.</li>
            <li>The recursive estimator is biased when the true model is non-recursive.</li>
            <li>The bias does not vanish with an increasing sample size.</li>
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createComparisonDiscussionRow(observationsHTML));
 
 
    // Initial rendering of LaTeX elements that are dynamic or require specific data
    // window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', 0); // phi is fixed at 0 for recursive
    // window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', window.sharedData.B_est_recursive, 'B_{\text{est, rec}}');
    // window.LatexUtils.displayBEstMatrix('b_true_s2_display', window.sharedData.B0, 'B_0');

    if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
        // Register B0 display for Section Two
        window.DynamicLatexManager.registerDynamicLatex('b0_display_s2', 'B0', 'displayBEstMatrix', ['B_0']);
        // Register B_est_rec display for Section Two
        window.DynamicLatexManager.registerDynamicLatex('b_est_rec_s2_display', 'B_est_rec', 'displayBEstMatrix', ['\\hat{B}_{rec}']);
        // Register B_phi display for Section Two
        window.DynamicLatexManager.registerDynamicLatex('b_phi_matrix_s2_display', 'B_phi', 'displayBEstMatrix', ['B(\\phi)']);
    } else {
        DebugManager.error('SEC_TWO_INIT', 'DynamicLatexManager.registerDynamicLatex not available.');
    }

    // Typeset MathJax for the whole section
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        await window.MathJax.typesetPromise([contentArea]);
    }


    await updateSectionTwoPlots();
}

/**
 * Updates both plots in Section Two.
 * - Left Plot: Scatter plot of the current structural innovations (e_t).
 * - Right Plot: Loss function L(phi) = mean(e_1t * e_2t)^2 vs. a range of phi values.
 */
async function updateSectionTwoPlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Two plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi, phi_0, phi_est_rec } = window.sharedData;

    // Left Plot: Scatter of structural innovations e_t
    if (window.PlotUtils && e_1t && e_2t) {
        window.PlotUtils.createOrUpdateScatterPlot(
            'plot_s2_left',
            e_1t,
            e_2t,
            'Innovations',
            '\\(e_{1}(\\phi)\\)',
            '\\(e_{2}(\\phi)\\)'
        );
    }

    // Right Plot: Loss function L(phi)
    if (window.PlotUtils && window.SVARMathUtil && u_1t && u_1t.length > 0) {
        const cov_u = window.SVARMathUtil.calculateCovarianceMatrix(u_1t, u_2t);
        if (!cov_u) return;

        const P = window.SVARMathUtil.choleskyDecomposition(cov_u);
        if (!P) return;

        const phi_range = [];
        const loss_values = [];
        const steps = 100;
        const min_phi = -Math.PI / 4;
        const max_phi = Math.PI / 4;

        for (let i = 0; i <= steps; i++) {
            const current_phi_iter = min_phi + (i / steps) * (max_phi - min_phi);
            phi_range.push(current_phi_iter);
                        const loss = window.SVARCoreFunctions.calculateRecursiveLossForPhi(current_phi_iter, P, u_1t, u_2t);
            loss_values.push(loss);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s2_right',
            phi_range,
            loss_values,
            'Loss Function',
            '\\(\\phi\\) (radians)',
            'Loss Value',
            phi,    // Current phi from slider (verticalLineX)
            [0, 0.5], // yAxisRange - set to [0, 0.5]
            phi_0, // True phi_0 (phi0LineValue)
            phi_est_rec // Estimated phi for recursive identification
        );
    }
}



