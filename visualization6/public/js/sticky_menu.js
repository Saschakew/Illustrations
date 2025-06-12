function initializeStickyMenus() {
    console.log('Initializing sticky menus...');
    const controlContainers = document.querySelectorAll('.controls-container');
    const mainNavElement = document.getElementById('main-nav'); // Ensure mainNavElement is accessible

    if (!mainNavElement) {
        console.error('Sticky Menu: Main navigation element #main-nav not found.');
        return;
    }

    controlContainers.forEach(container => {
        const placeholderId = container.id.replace('controls-container_', 'controls-placeholder_');
        const placeholder = document.getElementById(placeholderId);
        const parentSection = container.closest('.content-section');

        if (placeholder && parentSection) {
            const updateStickyStyles = () => {
                let currentMainNavHeight = mainNavElement.offsetHeight;
                let controlsHeight = container.offsetHeight;
                const placeholderRect = placeholder.getBoundingClientRect();
                const parentSectionRect = parentSection.getBoundingClientRect();
                const shouldStick = placeholderRect.top <= currentMainNavHeight && 
                                    (parentSectionRect.bottom > currentMainNavHeight + controlsHeight + 5);

                if (shouldStick) {
                    container.classList.add('sticky-menu');
                    placeholder.style.height = `${controlsHeight}px`;
                    const parentSectionStyles = getComputedStyle(parentSection);
                    const parentPaddingLeft = parseFloat(parentSectionStyles.paddingLeft);
                    container.style.top = `${currentMainNavHeight}px`;
                    container.style.left = `${parentSectionRect.left + parentPaddingLeft}px`;
                    container.style.width = `${parentSection.clientWidth - parentPaddingLeft - parseFloat(parentSectionStyles.paddingRight)}px`;
                } else {
                    container.classList.remove('sticky-menu');
                    placeholder.style.height = '1px';
                    container.style.top = '';
                    container.style.left = '';
                    container.style.width = '';
                }
            };
            window.addEventListener('scroll', updateStickyStyles);
            window.addEventListener('resize', updateStickyStyles);
            updateStickyStyles(); // Initial check
        } else {
            if (!placeholder) console.warn(`Sticky menu: Placeholder not found for ${container.id}. Expected: ${placeholderId}`);
            if (!parentSection) console.warn(`Sticky menu: Parent section not found for ${container.id}`);
        }
    });
    console.log('Sticky menus initialized.');
}

