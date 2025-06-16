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
        <p class="section-intro">
            This section explores how non-Gaussianity in structural shocks \\(\\epsilon_t\\) can be exploited to identify the SVAR model without relying on traditional short-run zero restrictions. 
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    // 2. Sub-topic Heading: Identification via Non-Gaussianity
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Identification via Non-Gaussianity'));

    // 3. Identification Content & Callout
    const identificationMainHTML = `
        <p>
            When at most one of the structural shocks \\(\\epsilon_{it}\\) is Gaussian, the matrix \\(B_0\\) is identified up to permutation and scaling of the shocks. We seek a rotation angle \\(\\phi\\) that transforms the reduced-form innovations \\(u_t\\) into innovations \\(e_t(\\phi) = B(\\phi)^{-1} u_t\\) that are "as independent as possible." This can be achieved by minimizing an objective function based on higher-order moments of \\(e_t(\\phi)\\).
        </p>
        
    `;
    const identificationCalloutHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Key Insight:</strong> Unlike Gaussian shocks, whose rotated versions remain Gaussian, rotated non-Gaussian shocks exhibit changes in their statistical properties (like skewness and kurtosis), which helps in pinpointing the correct underlying structure.</p>',
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(identificationMainHTML, identificationCalloutHTML));


    // 4. Objective Function Content

    const objfunctionHTML = `<p>
            Here, we use a simple objective function to minimize the innovation's coskewness, which is given by:
        </p> 
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(objfunctionHTML));
    
    
    
    const objectiveFunctionMainHTML = `
        ${ContentTemplates.buildLatexEquationBlock('\\hat{\\phi}_{nG} = argmin_{\\phi}   \\mathrm{mean}(e_{1t}(\\phi)^2 e_{2t}(\\phi))^2 + \\mathrm{mean}(e_{1t}(\\phi) e_{2t}(\\phi)^2)^2')}
         `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(objectiveFunctionMainHTML));

    const estimatorNGHTML = `
    <p>
            The estimator \\(\\hat{\\phi}_{nG}\\) estimates the rotation angle to be <span id="phi_est_nG_s3_display"></span>, which corresponds to an estimated structural matrix <span id="b_est_nG_s3_display"></span>. 
        </p>
    `;
    const estimatorNGCalloutHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Note:</strong> Compared   the estimator to the true structural matrix <span id="b_true_s3_display"></span>.</p>',
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(estimatorNGHTML, estimatorNGCalloutHTML));
    
    // 4. Sub-topic Heading: Objective Function
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Objective Function for Non-Gaussianity'));

    // 5. Objective Function Description
    const objectiveFunctionHTML = `
        
        <p>
            The true rotation angle \\(\\phi_0\\) (which depends on the true \\(B_0\\)) should ideally minimize this function, driving it towards zero. The estimated \\(\\hat{\\phi}_{nG}\\) is the angle that minimizes \\(J(\\phi)\\) for the observed data.
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(objectiveFunctionHTML, 'objective-function-row'));

   

    // 7. Sub-topic Heading: Animations
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Animations'));

    // 8. Animations Description
    const animationsHTML = `
        <p><strong>Left Plot (Innovations):</strong> Displays a scatter plot of the calculated innovations \\(e_{1t}(\\phi)\\) against \\(e_{2t}(\\phi)\\) for the currently selected \\(\\phi\\).</p>
        <p><strong>Right Plot (Objective Function):</strong> Shows the objective function \\(J(\\phi)\\) plotted against a range of \\(\\phi\\) values. 
            A <span style="color: var(--plot-color-current-phi);">blue vertical line</span> indicates the current \\(\\phi\\) selected by the slider. 
            A <span style="color: var(--plot-color-phi0);">red dashed line</span> marks the true \\(\\phi_0\\) (derived from the selected true \\(B_0\\)).
            A <span style="color: var(--plot-color-estimated-phi);">green long-dashed line</span> marks the estimated \\(\\hat{\\phi}_{nG}\\) that minimizes \\(J(\\phi)\\).
        </p>
        <p><strong>Observations:</strong></p>
        <ul>
            <li>Use the \\(\\phi\\) slider to select a rotation angle and see coskewness of the innovations \\(e_t(\\phi)\\) changes.</li>
            <li>The non-Gaussian estimator aligns close to the true \\(\\phi_0\\) in the recursive and non-recursive cases.</li> 
        </ul>
    `;
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(animationsHTML));

    // Initialize LaTeX displays now that spans are in the DOM
    if (window.LatexUtils) { 
        if (window.sharedData && typeof window.sharedData.phi_est_nG !== 'undefined') {
            window.LatexUtils.displayPhiEst('phi_est_nG_s3_display', window.sharedData.phi_est_nG, '\\hat{\\phi}_{nG}');
        } else {
            window.LatexUtils.displayPhiEst('phi_est_nG_s3_display', NaN, '\\hat{\\phi}_{nG}');
        }
        if (window.sharedData && window.sharedData.B_est_nG) {
            window.LatexUtils.displayBEstMatrix('b_est_nG_s3_display', window.sharedData.B_est_nG, '\\hat{B}_{nG}');
        } else {
            window.LatexUtils.displayBEstMatrix('b_est_nG_s3_display', [[NaN, NaN], [NaN, NaN]], '\\hat{B}_{nG}');
        }
        // Display the true B0 matrix
        if (window.sharedData && window.sharedData.B0) {
            window.LatexUtils.displayBEstMatrix('b_true_s3_display', window.sharedData.B0, 'B_0');
        } else {
            window.LatexUtils.displayBEstMatrix('b_true_s3_display', [[NaN, NaN], [NaN, NaN]], 'B_0');
        }
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils not available for initial display in Section Three.');
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
            'Structural Innovations e(φ) (Non-Gaussian ID)',
            'e_1t',
            'e_2t'
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

            const objective_val = calculateLossForPhi_S3(current_phi_iter, P, u_1t, u_2t);
            objective_values.push(objective_val);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s3_right',
            phi_range,
            objective_values,
            'Objective J(φ) (Non-Gaussian ID)',
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

/**
 * Helper function to calculate the objective value for a single phi value.
 * Objective J(phi) = (mean(e_1t^2 * e_2t))^2 + (mean(e_1t * e_2t^2))^2, where e_t = inv(P * R(phi)) * u_t
 * @param {number} phi_val - The angle for which to calculate the objective.
 * @param {number[][]} P_chol - The Cholesky factor of the covariance of u_t.
 * @param {number[]} u1_series - The first reduced-form shock series.
 * @param {number[]} u2_series - The second reduced-form shock series.
 * @returns {number|null} The calculated objective value or null on error.
 */
function calculateLossForPhi_S3(phi_val, P_chol, u1_series, u2_series) {
    if (!window.SVARMathUtil) {
        DebugManager.log('PLOT_RENDERING', 'SVARMathUtil not found in calculateLossForPhi_S3.');
        return null;
    }
    const R_phi = window.SVARMathUtil.getRotationMatrix(phi_val);
    const B_phi_candidate = window.SVARMathUtil.matrixMultiply(P_chol, R_phi);
    if (!B_phi_candidate) return null;

    const B_phi_inv = window.SVARMathUtil.invert2x2Matrix(B_phi_candidate);
    if (!B_phi_inv) return null;

    const temp_e_1t = [];
    const temp_e_2t = [];
    for (let i = 0; i < u1_series.length; i++) {
        const u_vector = [u1_series[i], u2_series[i]];
        const e_vector = window.SVARMathUtil.multiplyMatrixByVector(B_phi_inv, u_vector);
        if (e_vector) {
            temp_e_1t.push(e_vector[0]);
            temp_e_2t.push(e_vector[1]);
        }
    }

    if (temp_e_1t.length === 0 || temp_e_2t.length === 0) return null;

    // Calculate term1: mean(e_1t^2 * e_2t)
    const term1_products = temp_e_1t.map((val, index) => Math.pow(val, 2) * temp_e_2t[index]);
    const mean_of_term1_products = window.SVARMathUtil.mean(term1_products);
    if (mean_of_term1_products === null) return null;

    // Calculate term2: mean(e_1t * e_2t^2)
    const term2_products = temp_e_1t.map((val, index) => val * Math.pow(temp_e_2t[index], 2));
    const mean_of_term2_products = window.SVARMathUtil.mean(term2_products);
    if (mean_of_term2_products === null) return null;

    // Final objective: (mean(e_1t^2 * e_2t))^2 + (mean(e_1t * e_2t^2))^2
    return Math.pow(mean_of_term1_products, 2) + Math.pow(mean_of_term2_products, 2);
}