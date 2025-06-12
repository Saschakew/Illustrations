// shared_data.js - Central data store
window.sharedData = {
    T: 500, // Default sample size
    phi: 0, // Default value for phi, in radians
    lambda: 50, // Default value for lambda
    v: null, // Weight v, calculated from B_est_nG[0][1], used in Section Four
    isRecursive: true, // Default mode
    B0: [], // To be initialized by updateB0Mode
    epsilon_1t: [], // To be populated by SVAR data pipeline
    epsilon_2t: [], // To be populated by SVAR data pipeline
    u_1t: [], // To be populated by SVAR data pipeline (reduced-form shocks)
    u_2t: [], // Stores the second reduced-form shock series u_2t = b21*eps1 + b22*eps2

    // B(phi) matrix, identified using phi and covariance of u_t
    // B(phi) = P * R(phi), where P is Cholesky of Cov(u_t)    // B(phi) matrix, typically 2x2, derived from phi and u_t
    B_phi: [[1, 0], [0, 1]], // Default to identity matrix
    phi_0: 0, // Angle such that B0 = R(phi_0) * P_true, where P_true = chol(B0 * B0')

    // Innovations (estimated structural shocks) e_t = B(phi)^(-1) * u_t
    e_1t: [], // Default to empty array
    e_2t: [], // Default to empty array

    // Estimated phi and B for recursive identification
    phi_est_rec: 0, // Default to 0
    B_est_rec: [[1, 0], [0, 1]], // Default to identity matrix

    // Estimated phi and B for non-Gaussian methods (Section 3)
    phi_est_nG: 0, // Default to 0
    B_est_nG: [[1, 0], [0, 1]], // Default to identity matrix

    // Estimated phi and B for Ridge regression (Section 4)
    phi_est_ridge: 0, // Default to 0
    B_est_ridge: [[1, 0], [0, 1]], // Default to identity matrix

    // other shared variables can be added here
};

DebugManager.log('DATA_HANDLING', "Initial sharedData.T:", window.sharedData.T);
DebugManager.log('DATA_HANDLING', "Initial sharedData.phi:", window.sharedData.phi);
DebugManager.log('SVAR_DATA_PIPELINE', 'Initial sharedData.B_phi:', JSON.parse(JSON.stringify(window.sharedData.B_phi)));
DebugManager.log('SVAR_DATA_PIPELINE', 'Initial sharedData.e_1t:', JSON.parse(JSON.stringify(window.sharedData.e_1t)));
DebugManager.log('SVAR_DATA_PIPELINE', 'Initial sharedData.e_2t:', JSON.parse(JSON.stringify(window.sharedData.e_2t)));
DebugManager.log('DATA_HANDLING', "Initial sharedData.lambda:", window.sharedData.lambda);
DebugManager.log('DATA_HANDLING', "Initial sharedData.epsilon_1t:", window.sharedData.epsilon_1t);
DebugManager.log('DATA_HANDLING', "Initial sharedData.epsilon_2t:", window.sharedData.epsilon_2t);
DebugManager.log('SHARED_DATA', 'Initial u_2t:', JSON.stringify(window.sharedData.u_2t));
DebugManager.log('SHARED_DATA', 'Initial B_phi:', JSON.stringify(window.sharedData.B_phi));
DebugManager.log('SHARED_DATA', 'Initial phi_est_rec:', window.sharedData.phi_est_rec);
DebugManager.log('SHARED_DATA', 'Initial B_est_rec:', JSON.stringify(window.sharedData.B_est_rec));
DebugManager.log('SHARED_DATA', 'Initial phi_est_nG:', window.sharedData.phi_est_nG);
DebugManager.log('SHARED_DATA', 'Initial B_est_nG:', JSON.stringify(window.sharedData.B_est_nG));
DebugManager.log('SHARED_DATA', 'Initial phi_est_ridge:', window.sharedData.phi_est_ridge);
DebugManager.log('SHARED_DATA', 'Initial B_est_ridge:', JSON.stringify(window.sharedData.B_est_ridge));

// Function to update B0 based on isRecursive and log changes
window.sharedData.updateB0Mode = function() {
    if (this.isRecursive) {
        this.B0 = [[1, 0], [0.5, 1]]; // Example Recursive B0
    } else {
        this.B0 = [[1, 0.5], [0.5, 1]]; // Example Non-Recursive B0
    }
    DebugManager.log('SVAR_DATA_PIPELINE', `B0 mode updated. isRecursive: ${this.isRecursive}, B0:`, JSON.stringify(this.B0));
    if (typeof window.regeneratePhi0 === 'function') {
        window.regeneratePhi0(); // Update phi_0 whenever B0 changes
    } else {
        DebugManager.log('SVAR_DATA_PIPELINE', 'Warning: window.regeneratePhi0 function not found. Cannot update phi_0.');
    }
}

// Initialize B0 based on the default mode
window.sharedData.updateB0Mode();
