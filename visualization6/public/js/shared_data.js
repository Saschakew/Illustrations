// shared_data.js - Central data store
window.sharedData = {
    T: 500, // Default sample size
    phi: 0, // Default value for phi, in radians
    lambda: 50, // Default value for lambda
    isRecursive: true, // Default mode
    B0: [], // To be initialized by updateB0Mode
    epsilon_1t: [], // To be populated by SVAR data pipeline
    epsilon_2t: [], // To be populated by SVAR data pipeline
    u_1t: [], // To be populated by SVAR data pipeline (reduced-form shocks)
    u_2t: [], // Stores the second reduced-form shock series u_2t = b21*eps1 + b22*eps2

    // B(phi) matrix, identified using phi and covariance of u_t
    // B(phi) = P * R(phi), where P is Cholesky of Cov(u_t) and R(phi) is rotation matrix
    B_phi: [[1, 0], [0, 1]], // Default to identity matrix
    // other shared variables can be added here
};

DebugManager.log('DATA_HANDLING', "Initial sharedData.T:", window.sharedData.T);
DebugManager.log('DATA_HANDLING', "Initial sharedData.phi:", window.sharedData.phi);
DebugManager.log('DATA_HANDLING', "Initial sharedData.lambda:", window.sharedData.lambda);
DebugManager.log('DATA_HANDLING', "Initial sharedData.epsilon_1t:", window.sharedData.epsilon_1t);
DebugManager.log('DATA_HANDLING', "Initial sharedData.epsilon_2t:", window.sharedData.epsilon_2t);
DebugManager.log('DATA_HANDLING', "Initial sharedData.u_1t:", window.sharedData.u_1t);
DebugManager.log('SHARED_DATA', 'Initial u_2t:', JSON.stringify(window.sharedData.u_2t));
DebugManager.log('SHARED_DATA', 'Initial B_phi:', JSON.stringify(window.sharedData.B_phi));

// Function to update B0 based on isRecursive and log changes
window.sharedData.updateB0Mode = function() {
    if (this.isRecursive) {
        this.B0 = [[1, 0], [0.5, 1]];
        DebugManager.log('DATA_HANDLING', 'Mode set to Recursive. B0 updated to:', JSON.stringify(this.B0));
    } else {
        this.B0 = [[1, 0.5], [0.5, 1]];
        DebugManager.log('DATA_HANDLING', 'Mode set to Non-Recursive. B0 updated to:', JSON.stringify(this.B0));
    }
};

// Initialize B0 based on the default mode
window.sharedData.updateB0Mode();
