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

    // Constants
    B0_RECURSIVE: [[1, 0], [0.5, 1]],
    B0_NON_RECURSIVE: [[1, 0.5], [0.5, 1]],
    
    // Event system
    events: {
        DATA_UPDATED: 'svar-data-updated',
        MODEL_TYPE_CHANGED: 'svar-model-type-changed',
        SAMPLE_SIZE_CHANGED: 'svar-sample-size-changed',
        NEW_SAMPLE_GENERATED: 'svar-new-sample-generated',
        PHI_CHANGED: 'svar-phi-changed'
    },
    
    // Update methods
    updateData: function(dataObject) {
        // Update any properties that are provided
        Object.keys(dataObject).forEach(key => {
            if (this.hasOwnProperty(key)) {
                this[key] = dataObject[key];
            }
        });
        
        // Dispatch event to notify all listeners
        this.notifyUpdate('DATA_UPDATED', dataObject);
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
    subscribe: function(eventType, callback) {
        if (!this.events[eventType]) return;
        
        window.addEventListener(this.events[eventType], callback);
        return () => window.removeEventListener(this.events[eventType], callback);
    }
};
