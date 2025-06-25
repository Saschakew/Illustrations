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

    // 2. Sub-topic Heading:  Identification Problem
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('The identification problem'));

    // 3.  Identification Problem Main Content
    const IdentificationProblemMainHTML = `
       <p>
              We observe reduced-form shocks \\(u_t\\) and seek to recover the unobserved structural shocks \\(\\epsilon_t\\) and the true mixing matrix \\(B_0\\), related by \\(\\epsilon_t = B_0^{-1} u_t\\).
            Define innovations \\(e_t(B) = B^{-1} u_t\\). Assuming that the structural shocks are uncorrelated and have unit variance
            (\\(E[\\epsilon_t \\epsilon_t'] = I\\)), we look for a matrix \\(B\\) such that the sample innovations \\(e_t(B)\\) are also uncorrelated and have unit variance. The set of such matrices \\(B\\) can be parameterized by a single rotation angle \\(\\phi\\).  
        </p>

        <p> Given the true data-generating matrix \\(B_0\\) (selected via the toggle), we can calculate the rotation angle
        \\(\\phi_0\\) such that \\(B(\\phi_0) = B_0\\). For the recursive \\(B_0\\) we get \\(\\phi_0^{\\text{rec}} = 0\\). For the non-recursive \\(B_0\\) we get
        \\(\\phi_0^{\\text{non-rec}} \\approx -0.46\\).</p>
    `;
    const IdentificationProblemCalloutHTML = ContentTemplates.buildInfoCallout(`
        <p><strong>Note:</strong> All matrices \\(B(\\phi) = B^{\\text{Chol}} Q(\\phi)\\) yield innovations with unit variance and
            uncorrelated shocks, where \\(B^{\\text{Chol}}\\) is the Cholesky decomposition of the sample covariance of \\(u_t\\) , 
            and \\(Q(\\phi) = \\begin{bmatrix} \\cos \\phi & -\\sin\\phi \\\\ \\sin\\phi & \\cos\\phi \\end{bmatrix}\\).</p>
    `, false, true);
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(IdentificationProblemMainHTML, IdentificationProblemCalloutHTML));

    // 3. Sub-topic Heading:  Short-Run Restrictions
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Short-Run Restrictions'));

    const RestrictionsMainHTML = `
       <p>
            The conventional approach to solving the identification problem is to impose economically-motivated short-run zero restrictions on the \\(B\\) matrix. In the bivariate example, only a single restriction is required to reduce the set of \\(B(\\phi)\\) which yield uncorrelated innovations to a unique matrix.
</p>

<p>While this approach provides a unique solution, it comes with a significant drawback: if the model is exactly identified by the restriction, an incorrect restriction cannot be detected by the data, even in large samples. This can lead to biased estimates and flawed inference. The following sections explore methods that relax this rigid assumption.</p>`;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(RestrictionsMainHTML));


    const EstimatorRecursiveHTML = `
    <p>
        By imposing the zero restriction \(b_{12}=0\), we uniquely identify the model. This is the well-known <strong>Cholesky identification</strong>. It yields the estimator <span id="b_est_rec_s2_display"></span>.
        But is this a good estimate? That depends entirely on whether the restriction is correct.
    </p>

     <p><strong>Compare the estimator to the true  </strong> <span id="b0_display_s2"></span> </p>
        <ul>
            <li>When the true model is <strong>recursive</strong>, the Cholesky estimator is consistent and performs well.</li>
            <li>When the true model is <strong>non-recursive</strong>, the restriction \\(b_{12}=0\\) is incorrect. The resulting estimator is biased and inconsistent—notice that it is not close to the true \\(B_0\\), and this bias does not disappear even with a large sample size.</li>
        </ul>
        <p>This highlights the risk of imposing dogmatic restrictions.</p>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(EstimatorRecursiveHTML));

    // 4. Explain controls
    const ExplainControlsHTML = `
    <div class="controls-explanation-card">
        <p><strong>Controls Overview:</strong></p>
        <ul>
            <li><strong>\\(T\\) Slider:</strong> Adjusts the sample size \\(T\\) for the \\(B(\phi)\\) parameterization.</li>
            <li><strong>\\(B_0\\) Switch:</strong> Toggles the true data-generating matrix between a recursive and a non-recursive structure.</li>
            <li><strong>\\(\\phi\\) Slider:</strong> Adjusts the rotation angle \\(\phi\\) for the \\(B(\phi)\\) parameterization.</li>
            <li><strong>New Data Button:</strong> Generates a new dataset with the current settings, allowing you to see how results vary across different random draws.</li>
        </ul>
    </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(ExplainControlsHTML, 'explain-controls-row'));

   
    //2. Sub - topic Heading: Model Variants
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Annimations'));

    // 3. B0 Matrix Options Card and Tip Callout
    const AnnimationsHTML = `
       <p><strong>Left Plot (Innovations):</strong> A scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) vs. \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Correlation):</strong> Shows the correlation, \\(\\text{mean}(e_{1t}(\\phi) \\cdot e_{2t}(\\phi))\\), across different values of \\(\\phi  \\). A vertical line indicates the current \\(\\phi\\). Another line marks \\(\\phi_0\\) which corresponds to the true \\(B_0\\) which changes with the recursive vs non-recursive slider.</p>

         <p><strong>Observations:</strong> Use the \\(\\phi\\) slider to select a rotation angle and see the corresponding matrix <span id="b_phi_matrix_s2_display"></span>. Note that all such matrices yield uncorrelated innovations \\(e_t(B) = B(\\phi)^{-1} u_t\\).</p>
        <ul>
            <li>All \\(B(\\phi)\\) yield uncorrelated innovations \\(e_{1t}(\\phi)\\) and \\(e_{2t}(\\phi)\\).</li>
            <li>The recursive estimator works well when the true model is recursive.</li>
            <li>The recursive estimator is biased when the true model is non-recursive.</li>
            <li>The bias does not vanish with an increasing sample size.</li>
        </ul>
    `; 
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(AnnimationsHTML));

 
 
    // Initial rendering of LaTeX elements that are dynamic or require specific data
    // window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', 0); // phi is fixed at 0 for recursive
    // window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', window.sharedData.B_est_recursive, 'B_{\text{est, rec}}');
    // window.LatexUtils.displayBEstMatrix('b_true_s2_display', window.sharedData.B0, 'B_0');

    if (window.DynamicLatexManager && typeof window.DynamicLatexManager.registerDynamicLatex === 'function') {
        // Register B0 display for Section Two
        window.DynamicLatexManager.registerDynamicLatex('b0_display_s2', 'B0', 'displayBEstMatrix', ['B_0']);
        // Register B_est_rec display for Section Two
        window.DynamicLatexManager.registerDynamicLatex('b_est_rec_s2_display', 'B_est_rec', 'displayBEstMatrix', ['B_{REC}']);
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
            'Scatter of Structural Innovations (e_t)',
            'e_1t',
            'e_2t'
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
            'Loss Function L(φ) = mean(e₁_t ⋅ e₂_t)²',
            'φ (radians)',
            'Loss Value',
            phi,    // Current phi from slider (verticalLineX)
            [0, 0.5], // yAxisRange - set to [0, 0.5]
            phi_0, // True phi_0 (phi0LineValue)
            phi_est_rec // Estimated phi for recursive identification
        );
    }
}



