// SVARData.js - Centralized Data Management and Event Hub

window.SVARData = (function() {
    'use strict';

    // --- Private State ---
    const state = {
        // Core simulation data
        data: {
            epsilon_1t: [],
            epsilon_2t: [],
            u_1t: [],
            u_2t: [],
            B_0: null,       // True B_0 matrix
            T: 0,            // Sample size
            isNonRecursive: false, // True if DGP is non-recursive
            phi_true: 0,     // True phi if DGP is non-recursive
            sigma_u: null,   // True covariance matrix of reduced-form shocks
            sigma_epsilon: null // True covariance matrix of structural shocks (should be identity)
        },
        // Global phi for estimation sections
        phi_estimation: 0,
        // Calculated estimation metrics
        estimation_metrics: {
            sigma_u_hat: null,
            p_hat: null,
            phi_true_calculated: null, // Phi calculated from B_0_true and P_hat
            correlationData: { phis: [], corrs: [] }
        },
        // Estimated structural shocks and B_hat(phi)
        estimated_shocks: {
            e1_data_estimated: [],
            e2_data_estimated: [],
            b_hat_matrix_val: null // B_hat(phi_estimation)
        }
    };

    const subscribers = {};

    // --- Private Methods ---
    function _publish(eventName, eventDetail) {
        if (!subscribers[eventName]) {
            return;
        }
        subscribers[eventName].forEach(callback => {
            try {
                callback(eventDetail);
            } catch (e) {
                console.error(`Error in subscriber for ${eventName}:`, e);
            }
        });
    }

    // --- Public API ---
    const publicApi = {
        subscribe: function(eventName, callback) {
            if (!subscribers[eventName]) {
                subscribers[eventName] = [];
            }
            subscribers[eventName].push(callback);
            console.log(`[SVARData] New subscription to ${eventName}`);
        },

        initialize: function() {
            console.log('[SVARData] Initializing data store...');
            // Initialize with default/empty values, could also try to load from localStorage if needed
            // For now, just ensure the structure is there.
            // Actual data generation will be triggered by other modules (e.g., SVARCore.generateNewData)
            // and then set via updateData or specific setters.
            _publish('DATA_STORE_INITIALIZED', { initial_state: JSON.parse(JSON.stringify(state)) });
        },

        // --- Getter Functions ---
        getData: function() {
            return JSON.parse(JSON.stringify(state.data)); // Return a deep copy
        },
        getPhiEstimation: function() {
            return state.phi_estimation;
        },
        getEstimationMetrics: function() {
            return JSON.parse(JSON.stringify(state.estimation_metrics)); // Deep copy
        },
        getEstimatedShocks: function() {
            return JSON.parse(JSON.stringify(state.estimated_shocks)); // Deep copy
        },

        // --- Setter/Update Functions ---
        updateData: function(newData) {
            console.log('[SVARData] updateData called with:', newData);
            let changed = false;
            for (const key in newData) {
                if (state.data.hasOwnProperty(key) && JSON.stringify(state.data[key]) !== JSON.stringify(newData[key])) {
                    state.data[key] = newData[key];
                    changed = true;
                }
            }
            if (changed) {
                console.log('[SVARData] Core data updated, publishing DATA_UPDATED. New state.data:', JSON.parse(JSON.stringify(state.data)));
                _publish('DATA_UPDATED', { ...JSON.parse(JSON.stringify(state.data)), source: newData.source || 'SVARData.updateData' });
                
                // Placeholder: Trigger recalculation of metrics and shocks here in the future
                // this.recalculateAllMetricsAndShocks(); 
            } else {
                console.log('[SVARData] updateData called but no changes detected to state.data.');
            }
        },

        setPhiEstimation: function(newPhi, source = 'unknown') {
            if (typeof newPhi === 'number' && state.phi_estimation !== newPhi) {
                state.phi_estimation = newPhi;
                console.log(`[SVARData] Phi estimation set to ${newPhi} by ${source}. Publishing PHI_ESTIMATION_UPDATED.`);
                _publish('PHI_ESTIMATION_UPDATED', { phi_estimation: newPhi, source: source });

                // Placeholder: Trigger recalculation of estimated_shocks here in the future
                // this.recalculateEstimatedShocks(); 
            } else if (typeof newPhi !== 'number'){
                console.warn(`[SVARData] setPhiEstimation: Invalid phi value provided: ${newPhi}`);
            }
        },

        // --- Calculation Orchestration (to be fully implemented later) ---
        // This is where the logic from the plan will go.
        // For example:
        // recalculateEstimationMetrics: function() { ... publish ESTIMATION_METRICS_UPDATED ... }
        // recalculateEstimatedShocks: function() { ... publish ESTIMATED_SHOCKS_UPDATED ... }
        // recalculateAllMetricsAndShocks: function() { this.recalculateEstimationMetrics(); this.recalculateEstimatedShocks(); }

    };

    // Initialize the data store when the script loads
    // publicApi.initialize(); // Modules should call this if they need to ensure it's run, or call from main.js

    return publicApi;
})();
