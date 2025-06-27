window.Navigation = (function() {
    const DebugManager = window.DebugManager;

    // --- Private Functions ---

    /**
     * From main.js:
     * Initializes the main menu toggle button (hamburger menu) for mobile/small screens.
     */
    function initializeMainMenuToggle() {
        DebugManager.log('NAVIGATION', 'Initializing main menu toggle...');
        const mainNav = document.getElementById('main-nav');
        const navUl = mainNav ? mainNav.querySelector('ul') : null;

        if (!mainNav || !navUl) {
            DebugManager.log('NAVIGATION', 'ERROR: Main navigation or its UL not found. Cannot create hamburger menu.');
            return;
        }

        if (mainNav.querySelector('.main-nav-toggle')) {
            DebugManager.log('NAVIGATION', 'Main menu toggle button already exists.');
            return;
        }

        const toggleButton = document.createElement('button');
        toggleButton.className = 'main-nav-toggle';
        toggleButton.setAttribute('aria-label', 'Toggle navigation');
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-controls', 'main-nav-ul');

        const toggleIcon = document.createElement('span');
        toggleIcon.className = 'main-nav-toggle-icon';
        toggleButton.appendChild(toggleIcon);

        mainNav.prepend(toggleButton);
        navUl.id = 'main-nav-ul';

        toggleButton.addEventListener('click', () => {
            const isExpanded = mainNav.classList.toggle('nav-open');
            toggleButton.classList.toggle('active');
            toggleButton.setAttribute('aria-expanded', isExpanded.toString());
            DebugManager.log('NAVIGATION', `Main navigation toggled. Is open: ${isExpanded}`);
        });

        DebugManager.log('NAVIGATION', 'Main menu toggle initialized.');
    }

    /**
     * From sticky_menu.js:
     * Initializes sticky behavior for control containers within content sections.
     */
    function initializeStickyMenus() {
        DebugManager.log('NAVIGATION', 'Initializing sticky menus...');
        const controlContainers = document.querySelectorAll('.controls-container');
        const mainNavElement = document.getElementById('main-nav');

        if (!mainNavElement) {
            DebugManager.log('NAVIGATION', 'ERROR: Sticky Menu: Main navigation element #main-nav not found.');
            return;
        }

        controlContainers.forEach(container => {
            const parentSection = container.closest('.content-section');

            if (parentSection) {
                const dynamicPlaceholder = document.createElement('div');
                dynamicPlaceholder.className = 'sticky-menu-dynamic-placeholder';
                dynamicPlaceholder.style.height = '1px';
                parentSection.insertBefore(dynamicPlaceholder, container);

                const updateStickyStyles = () => {
                    let currentMainNavHeight = mainNavElement.offsetHeight;
                    let controlsHeight = container.offsetHeight;
                    
                    const placeholderRect = dynamicPlaceholder.getBoundingClientRect();
                    const parentSectionRect = parentSection.getBoundingClientRect();
                    
                    const shouldStick = placeholderRect.top <= currentMainNavHeight && 
                                        (parentSectionRect.bottom > currentMainNavHeight + controlsHeight + 5);

                    if (shouldStick) {
                        container.classList.add('sticky-menu');
                        dynamicPlaceholder.style.height = `${controlsHeight}px`;
                        const parentSectionStyles = getComputedStyle(parentSection);
                        const parentPaddingLeft = parseFloat(parentSectionStyles.paddingLeft);
                        container.style.top = `${currentMainNavHeight}px`;
                        container.style.left = `${parentSectionRect.left + parentPaddingLeft}px`;
                        container.style.width = `${parentSection.clientWidth - parentPaddingLeft - parseFloat(parentSectionStyles.paddingRight)}px`;
                    } else {
                        container.classList.remove('sticky-menu');
                        dynamicPlaceholder.style.height = '1px';
                        container.style.top = '';
                        container.style.left = '';
                        container.style.width = '';
                    }
                };
                window.addEventListener('scroll', updateStickyStyles);
                window.addEventListener('resize', updateStickyStyles);
                updateStickyStyles();
            } else {
                if (!parentSection) DebugManager.log('NAVIGATION', `WARNING: Sticky menu: Parent section not found for ${container.id}`);
            }
        });
        DebugManager.log('NAVIGATION', 'Sticky menus initialized.');
    }

    /**
     * From controls_toggle.js:
     * Handles the collapsible controls container functionality.
     */
    function initializeControlsToggle() {
        DebugManager.log('NAVIGATION', 'Initializing controls toggle buttons...');
        
        const controlContainers = document.querySelectorAll('.controls-container');
        
        controlContainers.forEach(container => {
            const toggleButton = document.createElement('button');
            toggleButton.className = 'controls-toggle-btn';
            toggleButton.setAttribute('aria-label', 'Toggle controls visibility');
            toggleButton.innerHTML = '<span class="toggle-icon"></span>';
            
            container.insertBefore(toggleButton, container.firstChild);
            
            toggleButton.addEventListener('click', () => {
                container.classList.toggle('collapsed');
                toggleButton.classList.toggle('active');
                
                const isExpanded = !container.classList.contains('collapsed');
                toggleButton.setAttribute('aria-expanded', isExpanded.toString());
            });
            
            if (window.innerWidth <= 768) {
                container.classList.add('collapsed');
                toggleButton.setAttribute('aria-expanded', 'false');
            } else {
                toggleButton.setAttribute('aria-expanded', 'true');
            }
        });
        
        DebugManager.log('NAVIGATION', 'Controls toggle buttons initialized.');
    }

    /**
     * Sets up smooth scrolling for navigation links.
     */
    function setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('.main-navigation a');
        const mainNavElement = document.getElementById('main-nav');

        if (!mainNavElement || navLinks.length === 0) {
            DebugManager.log('NAVIGATION', 'Main navigation element or links not found for smooth scrolling.');
            return;
        }

        DebugManager.log('NAVIGATION', 'Initializing smooth scrolling for nav links.');
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (!targetId || targetId === '#') return;
                const targetElement = document.querySelector(targetId);
                const currentMainNavHeight = mainNavElement.offsetHeight;

                if (targetElement) {
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - currentMainNavHeight - 20;
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    /**
     * Highlights the active navigation link based on scroll position.
     */
    function setupActiveLinkHighlighting() {
        const navLinks = document.querySelectorAll('.main-navigation a');
        const mainNavElement = document.getElementById('main-nav');
        const contentSections = document.querySelectorAll('.content-section');

        if (contentSections.length === 0 || navLinks.length === 0 || !mainNavElement) {
            DebugManager.log('NAVIGATION', 'Content sections, nav links, or main nav not found for active link highlighting.');
            return;
        }

        DebugManager.log('NAVIGATION', 'Initializing active link highlighting.');
        const updateActiveLink = () => {
            let currentSectionId = '';
            const currentMainNavHeight = mainNavElement.offsetHeight;

            contentSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                if (window.pageYOffset >= (sectionTop - currentMainNavHeight - 2) && window.pageYOffset < (sectionTop + sectionHeight - currentMainNavHeight - 2)) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        };

        window.addEventListener('scroll', updateActiveLink);
        window.addEventListener('resize', updateActiveLink);
    }

    // --- Public API ---

    /**
     * Main initialization function for all navigation-related features.
     */
    function initializeNavigation() {
        DebugManager.log('NAVIGATION', 'Initializing all navigation features...');
        setupSmoothScrolling();
        setupActiveLinkHighlighting();
        initializeMainMenuToggle();
        initializeStickyMenus();
        initializeControlsToggle();
        DebugManager.log('NAVIGATION', 'All navigation features initialized.');
    }

    return {
        initializeNavigation
    };
})();
