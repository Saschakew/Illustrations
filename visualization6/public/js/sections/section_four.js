// public/js/sections/section_four.js
const SECTION_FOUR_ID = 'section-four';

async function updateSectionFourPlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Four plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi, lambda } = window.sharedData;

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

    // Right Plot: Loss function L(phi)
    if (window.PlotUtils && window.SVARMathUtil && u_1t && u_1t.length > 0) {
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
        const loss_values = [];
        const steps = 100;
        const min_phi = -Math.PI / 2;
        const max_phi = Math.PI / 2;

        for (let i = 0; i <= steps; i++) {
            const current_phi_iter = min_phi + (i / steps) * (max_phi - min_phi);
            phi_range.push(current_phi_iter);
            
            const loss = calculateLossForPhi_S4(current_phi_iter, P, u_1t, u_2t, lambda);
            loss_values.push(loss);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s4_right',
            phi_range,
            loss_values,
            'Loss L(φ) = (mean(e₁_t²e₂_t)² + mean(e₁_t e₂_t²)²) + λ - S4',
            'φ (radians)',
            'Loss',
            phi, // Current global phi for vertical line (verticalLineX)
            null, // yAxisRange - let Plotly autoscale for now, or pass a sensible range
            window.sharedData.phi_0, // True phi_0 (phi0LineValue)
            window.sharedData.phi_est_ridge // Estimated phi for Ridge method
        );
    } else {
        DebugManager.log('PLOT_RENDERING', 'Skipping S4 loss plot: Missing PlotUtils, SVARMathUtil, or u_1t data.');
    }
}

/**
 * Calculates the loss for a given phi, P, reduced-form shocks, and lambda.
 * Loss = (mean(e₁_t² * e₂_t))² + (mean(e₁_t * e₂_t²))² + lambda
 * @param {number} phi_val - The angle phi for which to calculate the loss.
 * @param {Array<Array<number>>} P_chol - The Cholesky decomposition matrix P.
 * @param {number[]} u1_series - The first reduced-form shock series.
 * @param {number[]} u2_series - The second reduced-form shock series.
 * @param {number} lambda_val - The lambda value to add to the loss.
 * @returns {number|null} The calculated loss value or null on error.
 */
function calculateLossForPhi_S4(phi_val, P_chol, u1_series, u2_series, lambda_val) {
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

    const loss_s3_component = Math.pow(mean_e1_sq_e2, 2) + Math.pow(mean_e1_e2_sq, 2);
    const final_loss = loss_s3_component + lambda_val;

    return final_loss;
}

async function initializeSectionFour() {
    DebugManager.log('PLOT_RENDERING', `Async initializing JavaScript for section: ${SECTION_FOUR_ID}`);
    
    // Expose updatePlots for this section to be called by main.js or other components
    window.sectionFour = {
        updatePlots: updateSectionFourPlots
    };

    // Initial plot rendering
    await updateSectionFourPlots();

    DebugManager.log('PLOT_RENDERING', `Async initialization for section: ${SECTION_FOUR_ID} complete.`);
}
