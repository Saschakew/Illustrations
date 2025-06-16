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
        <p class="section-intro"><strong>Context.</strong>
            When structural shocks \(\epsilon_t\) are non-Gaussian, we can identify the model without imposing restrictions like
            \(B_0\) being lower-triangular. The key idea is that rotating a non-Gaussian distribution changes its shape. We can
            find the correct rotation angle \(\phi\) by finding the one that makes the resulting innovations \(e_t(\phi)\) "most
            independent."
        </p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    // 2. Sub-topic Heading: Objective function
    contentArea.appendChild(ContentTemplates.createSubTopicHeadingRow('Objective function'));

    // 3. Objective Function Description and Tip Callout
    const objectiveMainHTML = `
        <p>
            One way to measure this is to minimize an objective function based on higher-order moments. We define the objective
            function as \(J(\phi) = \mathrm{mean}(e_{1t}^2 e_{2t})^2 + \mathrm{mean}(e_{2t}^2 e_{1t})^2\). The true rotation angle
            \(\phi_0\) should minimize this function, driving it close to zero.
        </p>
        <div class="estimate-card card"><p class="est-line">Estimate...</p></div>
    `;
    const objectiveTipCalloutHTML = ContentTemplates.buildInfoCallout(
        '<p><strong>Tip:</strong> Use the \(\phi\) slider to see how the innovations and the objective function change. The true data-generating matrix \(B_0\) (and thus the true \(\phi_0\)) is selected via the toggle.</p>',
        false,
        true
    );
    contentArea.appendChild(ContentTemplates.createGeneralContentRow(objectiveMainHTML, objectiveTipCalloutHTML));

    // 4. LaTeX Output Container
    const latexOutputsHTML = `
        <div class="latex-output-container card">
            <p>Current identification matrix \(B(\phi)\): <span id="b_phi_matrix_s3_display"></span></p>
            <p>Estimated \(\hat{\phi}_{nG}\): <span id="phi_est_nG_s3_display"></span></p>
            <p>Estimated \(\hat{B}_{nG}\): <span id="b_est_nG_s3_display"></span></p>
        </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(latexOutputsHTML, 'latex-output-row'));

    // Initialize LaTeX displays now that spans are in the DOM
    if (window.LatexUtils) {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s3_display');
        if (window.sharedData && typeof window.sharedData.phi_est_nG !== 'undefined') {
            window.LatexUtils.displayPhiEst('phi_est_nG_s3_display', window.sharedData.phi_est_nG, '\\hat{\\phi}_{nG}');
        } else {
            window.LatexUtils.displayPhiEst('phi_est_nG_s3_display', NaN, '\\hat{\\phi}_{nG}');
        }
        if (window.sharedData && window.sharedData.B_est_nG) {
            window.LatexUtils.displayBEstMatrix('b_est_nG_s3_display', window.sharedData.B_est_nG, '\\hat{B}_{nG}');
        } else {
            window.LatexUtils.displayBEstMatrix('b_est_nG_s3_display', [[NaN, NaN],[NaN, NaN]], '\\hat{B}_{nG}');
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
            'Scatter of Structural Innovations (e_t) - S3',
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
            'Objective J(φ) = (E[e₁²e₂])² + (E[e₁e₂²])² - S3',
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
