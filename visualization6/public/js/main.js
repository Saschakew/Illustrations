document.addEventListener('DOMContentLoaded', async function() {
    await loadSections();
    initializeApp();
});

async function loadSections() {
    console.log('Loading sections...');
    const placeholders = document.querySelectorAll('div[data-section-src]');
    const fetchPromises = [];

    placeholders.forEach(placeholder => {
        const src = placeholder.dataset.sectionSrc;
        if (src) {
            const promise = fetch(src)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status} for ${src}`);
                    }
                    return response.text();
                })
                .then(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html.trim();
                    
                    if (tempDiv.firstChild && placeholder.parentNode) {
                        placeholder.parentNode.replaceChild(tempDiv.firstChild, placeholder);
                    } else {
                        console.error('Empty or invalid section content loaded from:', src, tempDiv.innerHTML);
                        placeholder.innerHTML = '<p>Error: Could not load section content properly. Ensure the fetched HTML has a single root element (e.g., a <section> tag).</p>';
                    }
                })
                .catch(error => {
                    console.error('Error loading section:', src, error);
                    placeholder.innerHTML = `<p>Error loading content from ${src}. Check console for details.</p>`;
                });
            fetchPromises.push(promise);
        }
    });

    try {
        await Promise.all(fetchPromises);
        console.log('All sections loaded successfully.');
    } catch (error) {
        console.error('One or more sections failed to load:', error);
    }
}

function initializeApp() {
    console.log('Initializing app features...');

    const navLinks = document.querySelectorAll('.main-navigation a');
    const mainNavElement = document.getElementById('main-nav');
    
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href'); 
            const targetElement = document.querySelector(targetId); 
            const currentMainNavHeight = mainNavElement ? mainNavElement.offsetHeight : 70;

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

    // Active link highlighting
    const sections = document.querySelectorAll('.content-section');
    const updateActiveLink = () => {
        let currentSectionId = '';
        const currentMainNavHeight = mainNavElement ? mainNavElement.offsetHeight : 70;

        sections.forEach(section => {
            if (section.id) {
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset;
                const activationPoint = sectionTop - currentMainNavHeight - 50; 
                if (window.pageYOffset >= activationPoint) {
                    currentSectionId = section.id;
                }
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active-link');
            const href = link.getAttribute('href');
            if (href && href.substring(1) === currentSectionId) {
                link.classList.add('active-link');
            }
        });
    };

    if (sections.length > 0) {
        window.addEventListener('scroll', updateActiveLink);
        window.addEventListener('resize', updateActiveLink);
        updateActiveLink(); // Initial check
    }

    // Initialize sliders
    if (typeof initializeSliders === 'function') {
        initializeSliders();
    } else {
        console.error('initializeSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize sticky menus
    if (typeof initializeStickyMenus === 'function') {
        initializeStickyMenus();
    } else {
        console.error('initializeStickyMenus function not found. Make sure sticky_menu.js is loaded.');
    }

    // Initialize section-specific JavaScript
    console.log('Initializing section-specific JavaScript...');
    if (typeof initializeSectionOne === 'function' && document.getElementById('section-one')) {
        initializeSectionOne();
    } else if (typeof initializeSectionOne !== 'function') {
        console.warn('initializeSectionOne function not found. Make sure section_one.js is loaded.');
    }

    if (typeof initializeSectionTwo === 'function' && document.getElementById('section-two')) {
        initializeSectionTwo();
    } else if (typeof initializeSectionTwo !== 'function') {
        console.warn('initializeSectionTwo function not found. Make sure section_two.js is loaded.');
    }

    if (typeof initializeSectionThree === 'function' && document.getElementById('section-three')) {
        initializeSectionThree();
    } else if (typeof initializeSectionThree !== 'function') {
        console.warn('initializeSectionThree function not found. Make sure section_three.js is loaded.');
    }

    if (typeof initializeSectionFour === 'function' && document.getElementById('section-four')) {
        initializeSectionFour();
    } else if (typeof initializeSectionFour !== 'function') {
        console.warn('initializeSectionFour function not found. Make sure section_four.js is loaded.');
    }
    console.log('All initializations complete.');
}
