// shared-data.js - Central data store for sharing between visualization sections

window.SVARData = {
    // Core data
    u_1t: [],
    u_2t: [],
    epsilon_1t: [],
    epsilon_2t: [],
    sigma_t: [],
    e_1t: [],
    e_2t: [],
    B_0: null,
    T: 500,
    isNonRecursive: false,
    phi_true_rec: null,
    phi_true_non_rec: null,

    // Current state variables
    current_phi: 0,
    current_B_phi: null,

    // Estimation-related state (to be populated by calculations)
    estimation_metrics: {
        sigma_u_hat: null,
        p_hat: null,
        phi_true_calculated: null, // Phi calculated from B_0_true and P_hat
        correlationData: { phis: [], corrs: [] }
    },
    estimated_shocks: {
        e1_data_estimated: [],
        e2_data_estimated: [],
        b_hat_matrix_val: null // B_hat(current_phi)
    },

    // Constants
    B0_RECURSIVE: [[1, 0], [0.5, 1]],
    B0_NON_RECURSIVE: [[1, 0.5], [0.5, 1]],
    
    // Event system
    events: {
        DATA_UPDATED: 'svar-data-updated',
        MODEL_TYPE_CHANGED: 'svar-model-type-changed',
        SAMPLE_SIZE_CHANGED: 'svar-sample-size-changed',
        NEW_SAMPLE_GENERATED: 'svar-new-sample-generated',
        PHI_CHANGED: 'svar-phi-changed',
        ESTIMATION_METRICS_UPDATED: 'svar-estimation-metrics-updated',
        ESTIMATED_SHOCKS_UPDATED: 'svar-estimated-shocks-updated'
    },
    
    // Update methods
    // Setter for current_phi, triggers PHI_CHANGED event and shock recalculation
    setPhi: function(newPhi, source = 'unknown') {
        if (typeof newPhi === 'number' && this.current_phi !== newPhi) {
            this.current_phi = newPhi;
            console.log(`[SVARData/shared-data.js] Phi set to ${newPhi} by ${source}. Notifying PHI_CHANGED.`);
            this.notifyUpdate('PHI_CHANGED', { phi: this.current_phi, source: source });
            
            // Trigger recalculation of estimated_shocks
            if (typeof this._calculateEstimatedShocks === 'function') {
                this._calculateEstimatedShocks();
            } else {
                console.error('[SVARData] _calculateEstimatedShocks method not found.');
            }
        } else if (typeof newPhi !== 'number'){
            console.warn(`[SVARData/shared-data.js] setPhi: Invalid phi value provided: ${newPhi}`);
        } else {
            // console.log(`[SVARData/shared-data.js] setPhi: Phi value ${newPhi} is same as current. No change.`);
        }
    },

    updateData: function(dataObject) {
        // Update any properties that are provided
        Object.keys(dataObject).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = dataObject[key];
            }
        });
        
        // Dispatch event to notify all listeners
        this.notifyUpdate('DATA_UPDATED', { ...this }); // Send a copy of all current data

        // After core data update, recalculate metrics and then shocks
        if (typeof this._calculateEstimationMetrics === 'function') {
            this._calculateEstimationMetrics();
            if (typeof this._calculateEstimatedShocks === 'function') {
                this._calculateEstimatedShocks(); // Shocks depend on P_hat from metrics
            } else {
                console.error('[SVARData] _calculateEstimatedShocks method not found after metrics calculation.');
            }
        } else {
            console.error('[SVARData] _calculateEstimationMetrics method not found.');
        }
    },
    
    // Notification system
    notifyUpdate: function(eventType, detail = {}) {
        if (!this.events[eventType]) return;
        
        const event = new CustomEvent(this.events[eventType], {
            detail: { 
                source: 'Unknown', // Default source
                ...detail, // Allow detail to overwrite the default source
                timestamp: Date.now()
            }
        });
        window.dispatchEvent(event);
        console.log(`Event dispatched: ${this.events[eventType]}`, detail);
    },
    
    // Subscribe to updates
    subscribe: function(eventNameString, callback) {
        // Optional: Verify it's a known event string for sanity, though not strictly necessary
        // if dispatch uses keys and subscribers use the event object values.
        let isKnownEvent = Object.values(this.events).includes(eventNameString);
        if (!isKnownEvent) {
            console.warn(`[SVARData.subscribe] Subscribing to an event name '${eventNameString}' that is not a value in SVARData.events. This might indicate an issue if the event name is mistyped or not defined.`);
            // Still proceed with subscription, as it might be a dynamically added event or an intentional direct subscription.
        }
        window.addEventListener(eventNameString, callback);
        // console.log(`[SVARData.subscribe] Subscribed to event: ${eventNameString}`);
        return () => window.removeEventListener(eventNameString, callback);
    },

    // Internal calculation methods
    _calculateEstimationMetrics: function() {
        console.log('[SVARData] Attempting to calculate estimation metrics...');
        if (!window.SVARMath) {
            console.error('[SVARData._calculateEstimationMetrics] SVARMath is not available.');
            return;
        }
        if (!this.u_1t || this.u_1t.length === 0) {
            console.warn('[SVARData._calculateEstimationMetrics] Reduced form errors u_1t are not available or empty. Skipping calculation.');
            // Optionally clear existing metrics or notify with empty/null data
            this.estimation_metrics = { sigma_u_hat: null, p_hat: null, phi_true_calculated: null, correlationData: { phis: [], corrs: [] } };
            this.notifyUpdate('ESTIMATION_METRICS_UPDATED', { estimation_metrics: this.estimation_metrics }); // Corrected
            return;
        }

        try {
            const sigma_u_hat = SVARMath.calculateCovarianceMatrix(this.u_1t, this.u_2t);
            const p_hat = SVARMath.choleskyDecomposition(sigma_u_hat); // Assuming P_hat[1][0] >= 0 for sign convention
            
            let phi_true_calculated = null;
            if (this.B_0 && p_hat) { // B_0 is the true B matrix from DGP
                // M = B_0 * P_hat_inv. We need phi from M.
                const p_hat_inv = SVARMath.invertMatrix(p_hat);
                if (p_hat_inv) {
                    const M = SVARMath.matrixMultiply(this.B_0, p_hat_inv);
                    phi_true_calculated = SVARMath.calculatePhiFromRotationMatrix(M); // e.g., atan2(M[1][0], M[0][0])
                } else {
                    console.warn('[SVARData._calculateEstimationMetrics] P_hat could not be inverted.');
                }
            }

            const correlationData = { phis: [], corrs: [] };
            if (p_hat) {
                const numSteps = 100;
                for (let i = 0; i <= numSteps; i++) {
                    const phi_iter = -Math.PI / 2 + (Math.PI * i) / numSteps;
                    const R_phi_iter = SVARMath.getB0Matrix(phi_iter); // This is the rotation matrix R(phi)
                    const B_hat_iter = SVARMath.matrixMultiply(p_hat, R_phi_iter);
                    const B_hat_iter_inv = SVARMath.invertMatrix(B_hat_iter);
                    if (B_hat_iter_inv) {
                        const [e1_temp, e2_temp] = SVARMath.calculateStructuralShocks(this.u_1t, this.u_2t, B_hat_iter_inv);
                        const corr_temp = SVARMath.calculateCorrelation(e1_temp, e2_temp);
                        correlationData.phis.push(phi_iter);
                        correlationData.corrs.push(corr_temp);
                    } else {
                         // Skip this iteration if B_hat_iter is not invertible
                        correlationData.phis.push(phi_iter);
                        correlationData.corrs.push(NaN); // Or some indicator of failure
                    }
                }
            } else {
                 console.warn('[SVARData._calculateEstimationMetrics] P_hat is null, cannot calculate correlation profile.');
            }

            this.estimation_metrics = {
                sigma_u_hat: sigma_u_hat,
                p_hat: p_hat,
                phi_true_calculated: phi_true_calculated,
                correlationData: correlationData
            };
            console.log('[SVARData] Estimation metrics calculated:', this.estimation_metrics);
            this.notifyUpdate('ESTIMATION_METRICS_UPDATED', { estimation_metrics: this.estimation_metrics }); // Corrected

        } catch (error) {
            console.error('[SVARData._calculateEstimationMetrics] Error during calculation:', error);
            // Reset metrics to avoid inconsistent state
            this.estimation_metrics = { sigma_u_hat: null, p_hat: null, phi_true_calculated: null, correlationData: { phis: [], corrs: [] } };
            this.notifyUpdate('ESTIMATION_METRICS_UPDATED', { estimation_metrics: this.estimation_metrics }); // Corrected
        }
    },

    _calculateEstimatedShocks: function() {
        console.log('[SVARData] Attempting to calculate estimated shocks for current_phi:', this.current_phi);
        if (!window.SVARMath) {
            console.error('[SVARData._calculateEstimatedShocks] SVARMath is not available.');
            return;
        }
        if (!this.estimation_metrics || !this.estimation_metrics.p_hat) {
            console.warn('[SVARData._calculateEstimatedShocks] P_hat from estimation_metrics is not available. Metrics might need recalculation or u_t data is missing. Skipping shock calculation.');
            // Optionally clear existing shocks or notify with empty/null data
            this.estimated_shocks = { e1_data_estimated: [], e2_data_estimated: [], b_hat_matrix_val: null };
            this.notifyUpdate('ESTIMATED_SHOCKS_UPDATED', { estimated_shocks: this.estimated_shocks }); // Corrected
            return;
        }
        if (!this.u_1t || this.u_1t.length === 0) {
            console.warn('[SVARData._calculateEstimatedShocks] Reduced form errors u_1t are not available or empty. Skipping calculation.');
            this.estimated_shocks = { e1_data_estimated: [], e2_data_estimated: [], b_hat_matrix_val: null };
            this.notifyUpdate('ESTIMATED_SHOCKS_UPDATED', { estimated_shocks: this.estimated_shocks }); // Corrected
            return;
        }

        try {
            const R_current_phi = SVARMath.getB0Matrix(this.current_phi); // This is R(phi_current)
            const b_hat_matrix_val = SVARMath.matrixMultiply(this.estimation_metrics.p_hat, R_current_phi);
            const b_hat_matrix_inv = SVARMath.invertMatrix(b_hat_matrix_val);

            let e1_data_estimated = [];
            let e2_data_estimated = [];

            if (b_hat_matrix_inv) {
                [e1_data_estimated, e2_data_estimated] = SVARMath.calculateStructuralShocks(this.u_1t, this.u_2t, b_hat_matrix_inv);
            } else {
                console.warn('[SVARData._calculateEstimatedShocks] B_hat(current_phi) could not be inverted.');
            }

            this.estimated_shocks = {
                e1_data_estimated: e1_data_estimated,
                e2_data_estimated: e2_data_estimated,
                b_hat_matrix_val: b_hat_matrix_val
            };
            console.log('[SVARData] Estimated shocks calculated:', this.estimated_shocks);
            this.notifyUpdate('ESTIMATED_SHOCKS_UPDATED', { estimated_shocks: this.estimated_shocks }); // Corrected

        } catch (error) {
            console.error('[SVARData._calculateEstimatedShocks] Error during calculation:', error);
            this.estimated_shocks = { e1_data_estimated: [], e2_data_estimated: [], b_hat_matrix_val: null };
            this.notifyUpdate('ESTIMATED_SHOCKS_UPDATED', { estimated_shocks: this.estimated_shocks }); // Corrected
        }
    }
};
