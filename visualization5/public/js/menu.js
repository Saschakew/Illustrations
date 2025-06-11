// Manages multiple sticky menus on the same page without conflicts.
const stickyMenuManager = {
    menus: [],
    isListenerAttached: false,
    resizeTimer: null,
    ticking: false, // For scroll throttling

    // Adds a new menu to be managed
    addMenu: function(sectionId, controlsContainerId, controlsPlaceholderId) {
        const section = document.getElementById(sectionId);
        if (!section) {
            console.warn(`Sticky menu setup failed: section '${sectionId}' not found.`);
            return;
        }
        const controlsContainer = section.querySelector(`#${controlsContainerId}`);
        const controlsPlaceholder = section.querySelector(`#${controlsPlaceholderId}`);

        if (!controlsContainer || !controlsPlaceholder) {
            console.warn(`Sticky menu setup failed: one or more elements not found for section '${sectionId}'.`);
            return;
        }

        const menuState = {
            section: section,
            controlsContainer: controlsContainer,
            controlsPlaceholder: controlsPlaceholder,
            naturalWidth: 0,
            height: 0,
            originalOffsetTop: 0,
            isPinned: false,
            isSticky: false
        };

        this.menus.push(menuState);
        this.setupInitial(menuState);

        if (!this.isListenerAttached) {
            window.addEventListener('scroll', this.handleScroll.bind(this));
            window.addEventListener('resize', this.handleResize.bind(this));
            this.isListenerAttached = true;
        }
    },

    // Sets the initial dimensions and position for a menu
    setupInitial: function(menu) {
        menu.controlsContainer.classList.remove('sticky', 'pinned');
        menu.controlsContainer.style.position = '';
        menu.controlsContainer.style.top = '';
        menu.controlsContainer.style.bottom = '';
        menu.controlsContainer.style.left = '';
        menu.controlsContainer.style.width = '';
        menu.controlsContainer.style.transform = '';
        menu.controlsPlaceholder.style.height = '0';

        const measureAndSet = () => {
            const rect = menu.controlsContainer.getBoundingClientRect();
            menu.naturalWidth = rect.width;
            menu.height = rect.height;
            menu.originalOffsetTop = rect.top + window.scrollY;
            this.updateMenuState(menu);
        };

        if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
            MathJax.typesetPromise()
                .then(() => setTimeout(measureAndSet, 700))
                .catch(() => setTimeout(measureAndSet, 700));
        } else {
            setTimeout(measureAndSet, 700);
        }
    },

    // Throttled scroll handler for performance
    handleScroll: function() {
        if (!this.ticking) {
            window.requestAnimationFrame(() => {
                this.menus.forEach(menu => this.updateMenuState(menu));
                this.ticking = false;
            });
            this.ticking = true;
        }
    },

    handleResize: function() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.menus.forEach(menu => this.setupInitial(menu));
        }, 250);
    },

    // The core logic to update a single menu's position
    updateMenuState: function(menu) {
        const currentScrollY = window.scrollY;
        const sectionRect = menu.section.getBoundingClientRect();
        const isAtEnd = (sectionRect.bottom - menu.height) <= 0;

        // Continuously re-calculate offsetTop while the menu is in the normal document flow.
        // This makes it resilient to layout shifts from other elements loading.
        if (!menu.isSticky && !menu.isPinned) {
            menu.originalOffsetTop = menu.controlsContainer.getBoundingClientRect().top + window.scrollY;
        }

        const isBefore = currentScrollY < menu.originalOffsetTop;

        if (isAtEnd) {
            if (menu.isPinned) return;
            menu.isPinned = true;
            menu.isSticky = false;
            const c = menu.controlsContainer;
            c.classList.remove('sticky');
            c.classList.add('pinned');
            c.style.position = 'absolute';
            c.style.top = 'auto';
            c.style.bottom = '0';
            c.style.left = '50%';
            c.style.transform = 'translateX(-50%)';
            c.style.width = `${menu.naturalWidth}px`;
            menu.controlsPlaceholder.style.height = `${menu.height}px`;

        } else if (isBefore) {
            if (!menu.isSticky && !menu.isPinned) return;
            menu.isPinned = false;
            menu.isSticky = false;
            const c = menu.controlsContainer;
            c.classList.remove('sticky', 'pinned');
            c.style.position = '';
            c.style.top = '';
            c.style.bottom = '';
            c.style.left = '';
            c.style.width = '';
            c.style.transform = '';
            menu.controlsPlaceholder.style.height = '0';

        } else {
            if (menu.isSticky) return;
            menu.isSticky = true;
            menu.isPinned = false;
            const c = menu.controlsContainer;
            c.classList.remove('pinned');
            c.classList.add('sticky');
            c.style.position = 'fixed';
            c.style.top = '0';
            c.style.bottom = '';
            c.style.left = '50%';
            c.style.transform = 'translateX(-50%)';
            c.style.width = `${menu.naturalWidth}px`;
            menu.controlsPlaceholder.style.height = `${menu.height}px`;
        }
    }
};

function initializeStickyMenu(sectionId, controlsContainerId, controlsPlaceholderId) {
    requestAnimationFrame(() => {
        stickyMenuManager.addMenu(sectionId, controlsContainerId, controlsPlaceholderId);
    });
}
