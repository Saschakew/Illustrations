window.Navigation = (function() {
    const DebugManager = window.DebugManager;

    function initializeNavigation() {
        DebugManager.log('NAVIGATION', 'Initializing navigation features.');
        setupSmoothScrolling();
        setupActiveLinkHighlighting();
    }

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
        window.addEventListener('resize', updateActiveLink); // Recalculate on resize
    }

    return {
        initializeNavigation
    };
})();
