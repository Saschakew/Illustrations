// shared_data.js - Central data store
window.sharedData = {
    T: 500, // Default sample size
    phi: 0, // Default value for phi, in radians
    lambda: 50, // Default value for lambda
    isRecursive: true, // Default mode
    B0: [], // To be initialized by updateB0Mode
    // other shared variables can be added here
};

DebugManager.log('DATA_HANDLING', "Initial sharedData.T:", window.sharedData.T);
DebugManager.log('DATA_HANDLING', "Initial sharedData.phi:", window.sharedData.phi);
DebugManager.log('DATA_HANDLING', "Initial sharedData.lambda:", window.sharedData.lambda);

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
