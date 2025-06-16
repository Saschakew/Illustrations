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
            Traditionally, short-run zero restrictions are imposed on the \\(B\\) matrix to identify the SVAR. In the bivariate example, only a single restriction is required to reduce the set of \\(B(\\phi)\\) which yield uncorrelated innovations to a unique matrix. 
</p>
<p>
            We impose a recursive structure on \\(B\\) (e.g., its (1,2) element is zero), which uniquely
            determines the rotation angle as \\(\\phi=0\\). This is the Cholesky identification.  For this data set, applying the Cholesky identification yields the recursive estimator \\(\\hat{B}_{rec}\\) <span id="b_est_rec_s2_display"></span>, corresponding to \\(\\hat{\\phi}_{rec}\\) <span id="phi_est_rec_s2_display"></span>, compared to the true structural matrix <span id="b_true_s2_display"></span>.
        </p>


    
    `;
    const RestrictionsCalloutHTML = ContentTemplates.buildInfoCallout(`
        <p><strong>Note:</strong> Cholesky identification assumes a recursive structure for the \\(B\\) matrix (lower triangular), which sets its (1,2) element to zero. This uniquely determines the rotation angle as \\(\\phi=0\\) in the \\(B(\\phi)\\) parameterization.</p>
    `, false, true);
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(RestrictionsMainHTML, RestrictionsCalloutHTML));


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

         <p><strong>Observations:</strong> Use the \\(\\phi\\) slider to select a rotation angle and see the corresponding matrix <span class="b-matrix-pill" id="b_phi_matrix_s2_display"></span>. Note that all such matrices yield uncorrelated innovations \\(e_t(B) = B(\\phi)^{-1} u_t\\).</p>
        <ul>
            <li>All \\(B(\\phi)\\) yield uncorrelated innovations \\(e_{1t}(\\phi)\\) and \\(e_{2t}(\\phi)\\).</li>
            <li>The recursive estimator works well when the true model is recursive.</li>
            <li>The recursive estimator is biased when the true model is non-recursive.</li>
            <li>The bias does not vanish with an increasing sample size.</li>
        </ul>
    `; 
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(AnnimationsHTML));

 
 
    // Initialize LaTeX displays now that spans are in the DOM
    if (window.LatexUtils) {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s2_display');
        if (window.sharedData && typeof window.sharedData.phi_est_rec !== 'undefined') {
            window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', window.sharedData.phi_est_rec, '\\hat{\\phi}_{rec}');
        } else {
            window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', NaN, '\\hat{\\phi}_{rec}');
        }
        if (window.sharedData && window.sharedData.B_est_rec) {
            window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', window.sharedData.B_est_rec, '\\hat{B}_{rec}');
        } else {
            window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', [[NaN, NaN],[NaN, NaN]], '\\hat{B}_{rec}');
        }
    }

    // Typeset MathJax
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
            const loss = calculateLossForPhi_S2(current_phi_iter, P, u_1t, u_2t);
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

/**
 * Helper function to calculate the loss for a single phi value.
 * Loss = (mean(e_1t * e_2t))^2, where e_t = inv(P * R(phi)) * u_t
 * @param {number} current_phi_iter - The angle for which to calculate the loss.
 * @param {number[][]} P - The Cholesky factor of the covariance of u_t.
 * @param {number[]} u_1t_series - The first reduced-form shock series.
 * @param {number[]} u_2t_series - The second reduced-form shock series.
 * @returns {number|null} The calculated loss value or null on error.
 */
function calculateLossForPhi_S2(current_phi_iter, P, u_1t_series, u_2t_series) {
    const R_phi = window.SVARMathUtil.getRotationMatrix(current_phi_iter);
    const B_phi = window.SVARMathUtil.matrixMultiply(P, R_phi);
    if (!B_phi) return null;

    const B_phi_inv = window.SVARMathUtil.invert2x2Matrix(B_phi);
    if (!B_phi_inv) return null;

    const temp_e_1t = [];
    const temp_e_2t = [];
    for (let i = 0; i < u_1t_series.length; i++) {
        const u_vector = [u_1t_series[i], u_2t_series[i]];
        const e_vector = window.SVARMathUtil.multiplyMatrixByVector(B_phi_inv, u_vector);
        if (e_vector) {
            temp_e_1t.push(e_vector[0]);
            temp_e_2t.push(e_vector[1]);
        }
    }

    if (temp_e_1t.length === 0) return null;

    const products = temp_e_1t.map((val, index) => val * temp_e_2t[index]);
    const meanOfProducts = window.SVARMathUtil.mean(products);
    return meanOfProducts !== null ? Math.pow(meanOfProducts, 2) : null;
}
