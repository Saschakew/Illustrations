// controls_toggle.js - Handles the collapsible controls container functionality

function initializeControlsToggle() {
    DebugManager.log('UI_FACTORY', 'Initializing controls toggle buttons...');
    
    // Find all controls containers
    const controlContainers = document.querySelectorAll('.controls-container');
    
    controlContainers.forEach(container => {
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.className = 'controls-toggle-btn';
        toggleButton.setAttribute('aria-label', 'Toggle controls visibility');
        toggleButton.innerHTML = '<span class="toggle-icon"></span>';
        
        // Insert button at the beginning of the container
        container.insertBefore(toggleButton, container.firstChild);
        
        // Add click event listener
        toggleButton.addEventListener('click', () => {
            container.classList.toggle('collapsed');
            toggleButton.classList.toggle('active');
            
            // Update aria-expanded attribute for accessibility
            const isExpanded = !container.classList.contains('collapsed');
            toggleButton.setAttribute('aria-expanded', isExpanded.toString());
        });
        
        // Check if we should initialize in collapsed state on mobile
        if (window.innerWidth <= 768) {
            container.classList.add('collapsed');
            toggleButton.setAttribute('aria-expanded', 'false');
        } else {
            toggleButton.setAttribute('aria-expanded', 'true');
        }
    });
    
    DebugManager.log('UI_FACTORY', 'Controls toggle buttons initialized.');
}

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // This will be called by main.js instead
    // initializeControlsToggle();
});
