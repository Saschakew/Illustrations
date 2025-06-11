# Cross-Section Synchronization System

## Overview
This document describes the system for synchronizing data and visualizations across different sections of the SVAR visualization app.

## Key Components

### 1. Central Data Store (`shared-data.js`)
```javascript
window.SVARData = {
    // Core data
    u_1t: [], u_2t: [], epsilon_1t: [], epsilon_2t: [], 
    sigma_t: [], B_0: null, T: 500, isNonRecursive: false,

    // Event types
    events: {
        DATA_UPDATED: 'svar-data-updated',
        MODEL_TYPE_CHANGED: 'svar-model-type-changed',
        SAMPLE_SIZE_CHANGED: 'svar-sample-size-changed',
        NEW_SAMPLE_GENERATED: 'svar-new-sample-generated',
        PHI_CHANGED: 'svar-phi-changed'
    },

    // Methods
    updateData: function(dataObject) { /* ... */ },
    notifyUpdate: function(eventType, detail = {}) { /* ... */ },
    subscribe: function(eventType, callback) { /* ... */ }
}
```

### 2. Implementation Patterns

#### In SVAR Setup:
- Updates `SVARData` when generating new shocks
- Broadcasts changes via `notifyUpdate()`
- Listens for model type changes

#### In Estimation Restrictions:
- Gets data from `SVARData`
- Listens for `DATA_UPDATED` and `NEW_SAMPLE_GENERATED`
- Updates plots when data changes

### 3. Key Events

| Event | Trigger | Action Required |
|-------|---------|-----------------|
| `DATA_UPDATED` | Core data changes | Update relevant plots |
| `MODEL_TYPE_CHANGED` | B₀ matrix type changes | Update matrix and plots |
| `NEW_SAMPLE_GENERATED` | New shocks generated | Update all visualizations |

## Best Practices
1. Always update data through `SVARData.updateData()`
2. Subscribe to events in initialization
3. Check if `SVARData` exists before use
4. Maintain backward compatibility with legacy systems

## Example Usage
```javascript
// Subscribing to updates
window.SVARData.subscribe('DATA_UPDATED', (event) => {
    if (event.detail.u_1t) updatePlots();
});

// Broadcasting changes
b0Switch.addEventListener('change', () => {
    window.SVARData.updateData({
        isNonRecursive: b0Switch.checked
    });
    window.SVARData.notifyUpdate('MODEL_TYPE_CHANGED');
});
```
