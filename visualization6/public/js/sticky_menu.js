function initializeStickyMenus() {
    DebugManager.log('UI_FACTORY', 'Initializing sticky menus...');
    const controlContainers = document.querySelectorAll('.controls-container');
    const mainNavElement = document.getElementById('main-nav'); // Ensure mainNavElement is accessible

    if (!mainNavElement) {
        DebugManager.log('UI_FACTORY', 'ERROR: Sticky Menu: Main navigation element #main-nav not found.');
        return;
    }

    controlContainers.forEach(container => {
        const parentSection = container.closest('.content-section');

        if (parentSection) {
            // Dynamically create a placeholder div
            const dynamicPlaceholder = document.createElement('div');
            dynamicPlaceholder.className = 'sticky-menu-dynamic-placeholder'; // For potential styling or identification
            dynamicPlaceholder.style.height = '1px'; // Initial minimal height
            // Insert the dynamic placeholder before the actual controls container
            parentSection.insertBefore(dynamicPlaceholder, container);

            const updateStickyStyles = () => {
                let currentMainNavHeight = mainNavElement.offsetHeight;
                let controlsHeight = container.offsetHeight;
                
                const placeholderRect = dynamicPlaceholder.getBoundingClientRect();
                const parentSectionRect = parentSection.getBoundingClientRect();
                
                // Determine if the menu should stick based on the placeholder's position
                const shouldStick = placeholderRect.top <= currentMainNavHeight && 
                                    (parentSectionRect.bottom > currentMainNavHeight + controlsHeight + 5);

                if (shouldStick) {
                    container.classList.add('sticky-menu');
                    dynamicPlaceholder.style.height = `${controlsHeight}px`; // Use dynamic placeholder
                    const parentSectionStyles = getComputedStyle(parentSection);
                    const parentPaddingLeft = parseFloat(parentSectionStyles.paddingLeft);
                    container.style.top = `${currentMainNavHeight}px`;
                    container.style.left = `${parentSectionRect.left + parentPaddingLeft}px`;
                    container.style.width = `${parentSection.clientWidth - parentPaddingLeft - parseFloat(parentSectionStyles.paddingRight)}px`;
                } else {
                    container.classList.remove('sticky-menu');
                    dynamicPlaceholder.style.height = '1px'; // Reset dynamic placeholder
                    container.style.top = '';
                    container.style.left = '';
                    container.style.width = '';
                }
            };
            window.addEventListener('scroll', updateStickyStyles);
            window.addEventListener('resize', updateStickyStyles);
            updateStickyStyles(); // Initial check
        } else {
            // Only warn if parentSection is not found, as placeholder is now dynamic
            if (!parentSection) DebugManager.log('UI_FACTORY', `WARNING: Sticky menu: Parent section not found for ${container.id}`);
        }
    });
    DebugManager.log('UI_FACTORY', 'Sticky menus initialized.');
}

