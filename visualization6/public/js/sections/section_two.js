// public/js/sections/section_two.js

// Expose the update function on a global object for main.js to use
window.sectionTwo = {
    updatePlots: updateSectionTwoPlots
};

/**
 * Initializes the section, primarily by performing an initial plot rendering.
 */
async function initializeSectionTwo() {
    DebugManager.log('INIT', `Initializing JavaScript for section: section-two`);
    if (window.LatexUtils && typeof window.LatexUtils.displayBPhiMatrix === 'function') {
        window.LatexUtils.displayBPhiMatrix('b_phi_matrix_s2_display');
        // Display estimated phi_rec and B_rec
        if (window.sharedData && typeof window.sharedData.phi_est_rec !== 'undefined') {
            window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', window.sharedData.phi_est_rec, '\\hat{\\phi}_{rec}');
        } else {
            window.LatexUtils.displayPhiEst('phi_est_rec_s2_display', NaN, '\\hat{\\phi}_{rec}'); // Show N/A
        }
        if (window.sharedData && window.sharedData.B_est_rec) {
            window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', window.sharedData.B_est_rec, '\\hat{B}_{rec}');
        } else {
            window.LatexUtils.displayBEstMatrix('b_est_rec_s2_display', [[NaN, NaN],[NaN, NaN]], '\\hat{B}_{rec}'); // Show N/A
        }
    } else {
        DebugManager.log('LATEX_UPDATE', 'LatexUtils.displayBPhiMatrix not available for initial display in Section Two.');
    }
    await updateSectionTwoPlots();
}

/**
 * Updates both plots in Section Two.
 * - Left Plot: Scatter plot of the current structural innovations (e_t).
 * - Right Plot: Loss function L(phi) = mean(e_1t * e_2t) vs. a range of phi values.
 */
async function updateSectionTwoPlots() {
    DebugManager.log('PLOT_RENDERING', 'Updating Section Two plots...');
    const { e_1t, e_2t, u_1t, u_2t, phi } = window.sharedData;

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
        // The loss function calculation depends on the Cholesky factor of the covariance of u_t.
        const cov_u = window.SVARMathUtil.calculateCovarianceMatrix(u_1t, u_2t);
        if (!cov_u) return;

        const P = window.SVARMathUtil.choleskyDecomposition(cov_u);
        if (!P) return;

        const phi_range = [];
        const loss_values = [];
        const steps = 100;
        const min_phi = -Math.PI / 2;
        const max_phi = Math.PI / 2;

        for (let i = 0; i <= steps; i++) {
            const current_phi = min_phi + (i / steps) * (max_phi - min_phi);
            phi_range.push(current_phi);
            
            // For each phi, calculate the corresponding innovations and then the loss.
            const loss = calculateLossForPhi_S2(current_phi, P, u_1t, u_2t);
            loss_values.push(loss);
        }

        window.PlotUtils.createOrUpdateLossPlot(
            'plot_s2_right',
            phi_range,
            loss_values,
            'Loss Function L(φ) = mean(e₁_t * e₂_t)²',
            'φ (radians)',
            'Loss Value',
            phi,    // Current phi from slider (verticalLineX)
            [0, 1], // yAxisRange: [min, max]
            window.sharedData.phi_0, // True phi_0 (phi0LineValue)
            window.sharedData.phi_est_rec // Estimated phi for recursive identification
        );
    }
}

/**
 * Helper function to calculate the loss for a single phi value.
 * Loss = mean(e_1t * e_2t), where e_t = inv(P * R(phi)) * u_t
 * @param {number} phi - The angle for which to calculate the loss.
 * @param {number[][]} P - The Cholesky factor of the covariance of u_t.
 * @param {number[]} u_1t - The first reduced-form shock series.
 * @param {number[]} u_2t - The second reduced-form shock series.
 * @returns {number|null} The calculated loss value or null on error.
 */
function calculateLossForPhi_S2(phi, P, u_1t, u_2t) {
    const R_phi = window.SVARMathUtil.getRotationMatrix(phi);
    const B_phi = window.SVARMathUtil.matrixMultiply(P, R_phi);
    if (!B_phi) return null;

    const B_phi_inv = window.SVARMathUtil.invert2x2Matrix(B_phi);
    if (!B_phi_inv) return null;

    const temp_e_1t = [];
    const temp_e_2t = [];
    for (let i = 0; i < u_1t.length; i++) {
        const u_vector = [u_1t[i], u_2t[i]];
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
