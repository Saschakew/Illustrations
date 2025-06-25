/**
 * Resources Section JavaScript
 * Handles initialization and functionality for the Resources section
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the resources section once the DOM is fully loaded
    initializeResourcesSection();
});

/**
 * Initialize the resources section
 */
function initializeResourcesSection() {
    console.log('Resources section initialized');
    
    // Add any specific functionality for the resources section here
    // For example, you could add event listeners for resource links tracking
    
    const resourceLinks = document.querySelectorAll('#section-resources .resource-list a');
    resourceLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Optional: Track resource link clicks
            console.log('Resource clicked:', this.href);
            
            // You could add analytics tracking here if needed
        });
    });
    
    // If using the shared controls system, initialize any controls for this section
    if (window.SVARControls && typeof window.SVARControls.initializeControls === 'function') {
        window.SVARControls.initializeControls('section-resources');
    }
    
    // Subscribe to data update events if needed
    if (window.SVARData && typeof window.SVARData.subscribe === 'function') {
        window.SVARData.subscribe('DATA_UPDATED', updateResourcesSection);
    }
}

/**
 * Update the resources section when data changes
 * @param {Object} data - Updated data
 */
function updateResourcesSection(data) {
    // This function would be called when shared data is updated
    // For a static resources section, this might not be needed
    console.log('Resources section updated with new data');
}
