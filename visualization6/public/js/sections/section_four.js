// public/js/sections/section_four.js
const SECTION_FOUR_ID = 'section-four';

// Expose functions on a global object for main.js to use
window.sectionFour = {
    updatePlots: updateSectionFourPlots,
    initialize: initializeSectionFour // Ensure initialize is also exposed
};

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
        <p class="section-intro"><strong>Goal.</strong> Explore ridge-regularized identification when the basic moment conditions are weak.</p>
    `;
    contentArea.appendChild(ContentTemplates.createIntroRow(introHTML));

    // 2. Estimate Card
    const estimateCardHTML = `
        <div class="estimate-card card">
            <p class="est-line">Current identification matrix <span class="b-matrix-pill">B(\(\phi\))</span>: <span id="b_phi_matrix_s4_display"></span></p>
            <p class="est-line">Estimated \(\hat{\phi}_{\mathrm{ridge}}\): <span id="phi_est_ridge_s4_display"></span></p>
            <p class="est-line">Estimated \(\hat{B}_{\mathrm{ridge}}\): <span id="b_est_ridge_s4_display"></span></p>
            <p class="est-line">Derived Weight \(v\): <span id="v_weight_s4_display">Calculating...</span></p>
            <p class="est-line">Current Penalty Weight \(\lambda\): <span id="lambda_s4_value_display"></span></p>
        </div>
    `;
    contentArea.appendChild(ContentTemplates.createFullWidthContentRow(estimateCardHTML, 'estimate-card-row'));

    // Initialize LaTeX displays now that spans are in the DOM
    if (window.LatexUtils) {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s4_display');
        if (window.sharedData && typeof window.sharedData.phi_est_ridge !== 'undefined') {
            window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', window.sharedData.phi_est_ridge, '\\hat{\\phi}_{\mathrm{ridge}}');
        } else {
            window.LatexUtils.displayPhiEst('phi_est_ridge_s4_display', NaN, '\\hat{\\phi}_{\mathrm{ridge}}');
        }
        if (window.sharedData && window.sharedData.B_est_ridge) {
            window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', window.sharedData.B_est_ridge, '\\hat{B}_{\mathrm{ridge}}');
        } else {
            window.LatexUtils.displayBEstMatrix('b_est_ridge_s4_display', [[NaN, NaN],[NaN, NaN]], '\\hat{B}_{\mathrm{ridge}}');
        }
        if (window.sharedData && typeof window.sharedData.v !== 'undefined') {
            window.LatexUtils.displayVWeight('v_weight_s4_display', window.sharedData.v, 'v');
        } else {
            window.LatexUtils.displayVWeight('v_weight_s4_display', null, 'v');
        }
        // Update lambda display
        const lambdaDisplay = document.getElementById('lambda_s4_value_display');
        if (lambdaDisplay && window.sharedData && typeof window.sharedData.lambda !== 'undefined') {
            lambdaDisplay.textContent = window.sharedData.lambda.toFixed(2);
        } else if (lambdaDisplay) {
            lambdaDisplay.textContent = 'N/A';
        }
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils not available for initial display in Section Four.');
    }

    // Typeset MathJax for the whole section
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
        try {
            await window.MathJax.typesetPromise([contentArea]);
            DebugManager.log('MATHJAX', `MathJax typesetting complete for ${SECTION_FOUR_ID}.`);
        } catch (error) {
            DebugManager.log('ERROR', `MathJax typesetting failed for ${SECTION_FOUR_ID}:`, error);
        }
    }

    // Initial plot rendering
    await updateSectionFourPlots();

    DebugManager.log('INIT', `Initialization for section: ${SECTION_FOUR_ID} complete.`);
}

async function updateSectionFourPlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Four plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi, lambda, phi_0, phi_est_ridge, v } = window.sharedData;

    // Update lambda display dynamically as it might change with controls
    const lambdaDisplay = document.getElementById('lambda_s4_value_display');
    if (lambdaDisplay && typeof lambda !== 'undefined') {
        lambdaDisplay.textContent = lambda.toFixed(2);
    }
    // Update v weight display dynamically
    if (window.LatexUtils && typeof window.LatexUtils.displayVWeight === 'function'){
        window.LatexUtils.displayVWeight('v_weight_s4_display', v, 'v');
    }


    // Left Plot: Scatter of structural innovations e_t
    if (window.PlotUtils && e_1t && e_2t) {
        window.PlotUtils.createOrUpdateScatterPlot(
            'plot_s4_left',
            e_1t,
            e_2t,
            'Scatter of Structural Innovations (e_t) - S4',
            'e_1t',
            'e_2t'
        );
    }

    // Right Plot: Objective function J_ridge(phi)
    if (window.PlotUtils && window.SVARMathUtil && u_1t && u_1t.length > 0 && u_2t && u_2t.length > 0) {
        const cov_u = window.SVARMathUtil.calculateCovarianceMatrix(u_1t, u_2t);
        if (!cov_u) {
            DebugManager.log('PLOT_RENDERING', 'Failed to calculate covariance matrix for S4 plots.');
            return;
        }

        const P = window.SVARMathUtil.choleskyDecomposition(cov_u);
        if (!P) {
            DebugManager.log('PLOT_RENDERING', 'Failed to perform Cholesky decomposition for S4 plots.');
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
            
            const objective_val = calculateLossForPhi_S4(current_phi_iter, P, u_1t, u_2t, lambda, v);
            objective_values.push(objective_val);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s4_right',
            phi_range,
            objective_values,
            'Objective J_ridge(φ) = (E[e₁²e₂])² + (E[e₁e₂²])² + λvb₁₂² - S4',
            'φ (radians)',
            'Objective Value',
            phi, // Current global phi for vertical line (verticalLineX)
            [0, 0.5], // yAxisRange - set to [0, 0.5]
            phi_0, // True phi_0 (phi0LineValue)
            phi_est_ridge // Estimated phi for Ridge method
        );
    } else {
        DebugManager.log('PLOT_RENDERING', 'Skipping S4 objective plot: Missing PlotUtils, SVARMathUtil, or u_t data.');
    }
}

/**
 * Calculates the objective value for a given phi, P, reduced-form shocks, lambda, and v.
 * Objective J_ridge(phi) = (mean(e₁_t² * e₂_t))² + (mean(e₁_t * e₂_t²))² + lambda * v * b₁₂²
 * @param {number} phi_val - The angle phi for which to calculate the objective.
 * @param {Array<Array<number>>} P_chol - The Cholesky decomposition matrix P.
 * @param {number[]} u1_series - The first reduced-form shock series.
 * @param {number[]} u2_series - The second reduced-form shock series.
 * @param {number} lambda_val - The lambda value for the penalty term.
 * @param {number} v_weight - The weight v for the penalty term.
 * @returns {number|null} The calculated objective value or null on error.
 */
function calculateLossForPhi_S4(phi_val, P_chol, u1_series, u2_series, lambda_val, v_weight) {
    if (!window.SVARMathUtil) {
        DebugManager.log('PLOT_RENDERING', 'SVARMathUtil not found in calculateLossForPhi_S4.');
        return null;
    }

    const R_phi = window.SVARMathUtil.getRotationMatrix(phi_val);
    const B_phi = window.SVARMathUtil.matrixMultiply(P_chol, R_phi);

    if (!B_phi) {
        DebugManager.log('PLOT_RENDERING', 'Failed to calculate B(phi) in calculateLossForPhi_S4.');
        return null;
    }

    const B_inv = window.SVARMathUtil.invert2x2Matrix(B_phi);
    if (!B_inv) {
        DebugManager.log('PLOT_RENDERING', 'Failed to invert B(phi) in calculateLossForPhi_S4.');
        return null;
    }

    const N = u1_series.length;
    if (N === 0) {
        DebugManager.log('PLOT_RENDERING', 'Empty shock series in calculateLossForPhi_S4.');
        return null;
    }

    let sum_e1_sq_e2 = 0;
    let sum_e1_e2_sq = 0;

    for (let i = 0; i < N; i++) {
        const u_t = [u1_series[i], u2_series[i]];
        const e_t = window.SVARMathUtil.multiplyMatrixByVector(B_inv, u_t);
        if (!e_t || e_t.length < 2) {
            DebugManager.log('PLOT_RENDERING', `Failed to calculate e_t for sample ${i} in calculateLossForPhi_S4.`);
            continue; // Skip this sample if e_t is not valid
        }
        const e1_t = e_t[0];
        const e2_t = e_t[1];

        sum_e1_sq_e2 += Math.pow(e1_t, 2) * e2_t;
        sum_e1_e2_sq += e1_t * Math.pow(e2_t, 2);
    }

    const mean_e1_sq_e2 = sum_e1_sq_e2 / N;
    const mean_e1_e2_sq = sum_e1_e2_sq / N;

    const s3_objective_component = Math.pow(mean_e1_sq_e2, 2) + Math.pow(mean_e1_e2_sq, 2);

    let penalty_term = 0;
    if (B_phi && B_phi[0] && typeof B_phi[0][1] === 'number' && typeof v_weight === 'number' && !isNaN(v_weight) && typeof lambda_val === 'number' && !isNaN(lambda_val)) {
        const b_12 = B_phi[0][1];
        penalty_term = lambda_val * v_weight * Math.pow(b_12, 2);
    } else {
        // It's possible v_weight is legitimately 0 or lambda_val is 0, so only log if they are unexpectedly not numbers.
        if (typeof v_weight !== 'number' || isNaN(v_weight) || typeof lambda_val !== 'number' || isNaN(lambda_val)){
             DebugManager.log('PLOT_RENDERING', 'Could not calculate penalty term in calculateLossForPhi_S4 due to invalid B_phi[0][1], v_weight, or lambda_val.');
        }
    }

    const final_objective = s3_objective_component + penalty_term;

    return final_objective;
}
