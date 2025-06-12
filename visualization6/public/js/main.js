// main.js

/**
 * Regenerates the structural shock series (epsilon_1t, epsilon_2t) based on 
 * current parameters in sharedData (primarily sharedData.T) and stores them back into sharedData.
 */
function regenerateSvarData() {
    DebugManager.log('SVAR_DATA_PIPELINE', 'Attempting to regenerate epsilon_t series...');

    if (!window.SVARCoreFunctions || typeof window.SVARCoreFunctions.generateEpsilon !== 'function') {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: SVARCoreFunctions or generateEpsilon function not found. Cannot generate epsilon_t.');
        return;
    }

    if (!window.sharedData) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: sharedData not found. Cannot access T or store epsilon_t.');
        return;
    }

    const T = window.sharedData.T;
    if (typeof T !== 'number' || T <= 0 || isNaN(T)) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Invalid sample size T in sharedData:', T, '- Epsilon generation skipped.');
        // Optionally clear or set to empty arrays on error to prevent using stale data
        window.sharedData.epsilon_1t = [];
        window.sharedData.epsilon_2t = [];
        return;
    }

    try {
        const { epsilon_1t, epsilon_2t } = window.SVARCoreFunctions.generateEpsilon(T);
        
        window.sharedData.epsilon_1t = epsilon_1t;
        window.sharedData.epsilon_2t = epsilon_2t;

        DebugManager.log('SVAR_DATA_PIPELINE', 'Successfully generated and stored epsilon_1t (length:', epsilon_1t.length, ') and epsilon_2t (length:', epsilon_2t.length, ') in sharedData.');
    } catch (error) {
        DebugManager.log('SVAR_DATA_PIPELINE', 'ERROR: Failed to generate epsilon_t:', error);
        window.sharedData.epsilon_1t = [];
        window.sharedData.epsilon_2t = [];
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    await loadSections();
    initializeApp();
});

async function loadSections() {
    DebugManager.log('MAIN_APP', 'Loading sections...');
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
                        DebugManager.log('MAIN_APP', 'ERROR: Empty or invalid section content loaded from:', src, tempDiv.innerHTML);
                        placeholder.innerHTML = '<p>Error: Could not load section content properly. Ensure the fetched HTML has a single root element (e.g., a <section> tag).</p>';
                    }
                })
                .catch(error => {
                    DebugManager.log('MAIN_APP', 'ERROR: Error loading section:', src, error);
                    placeholder.innerHTML = `<p>Error loading content from ${src}. Check console for details.</p>`;
                });
            fetchPromises.push(promise);
        }
    });

    try {
        await Promise.all(fetchPromises);
        DebugManager.log('MAIN_APP', 'All sections loaded successfully.');
    } catch (error) {
        DebugManager.log('MAIN_APP', 'ERROR: One or more sections failed to load:', error);
    }
}

function initializeApp() {
    DebugManager.log('MAIN_APP', 'Initializing app features...');

    // --- Dynamically create controls from placeholders ---
    DebugManager.log('MAIN_APP', 'Processing UI control placeholders...');
    document.querySelectorAll('[data-control-type]').forEach(placeholder => {
        const type = placeholder.dataset.controlType;
        const id = placeholder.dataset.controlId; // Essential for unique elements
        let controlHtml = '';

        if (type === 't-slider' && window.uiFactory && typeof window.uiFactory.createTSlider === 'function') {
            // Pass the label from data-attribute if present, otherwise factory uses default
            const label = placeholder.dataset.controlLabel; 
            controlHtml = window.uiFactory.createTSlider(id, label); 
        } else if (type === 'mode-switch' && window.uiFactory && typeof window.uiFactory.createModeSwitch === 'function') {
            const label = placeholder.dataset.controlLabel; // Allow custom label via data-attribute
            controlHtml = window.uiFactory.createModeSwitch(id, label);
        } else if (type === 'phi-slider' && window.uiFactory && typeof window.uiFactory.createPhiSlider === 'function') {
            controlHtml = window.uiFactory.createPhiSlider(id);
        } else if (type === 'lambda-slider' && window.uiFactory && typeof window.uiFactory.createLambdaSlider === 'function') {
            controlHtml = window.uiFactory.createLambdaSlider(id);
        } else if (type === 'new-data-button' && window.uiFactory && typeof window.uiFactory.createNewDataButton === 'function') {
            controlHtml = window.uiFactory.createNewDataButton(id);
        }
        // else if (type === 'button' && window.uiFactory && typeof window.uiFactory.createButton === 'function') {
        //     const text = placeholder.dataset.buttonText || 'Button';
        //     const classes = placeholder.dataset.buttonClasses || '';
        //     controlHtml = window.uiFactory.createButton(id, text, classes);
        // }
        // ... other control types can be added here
        
        if (controlHtml) {
            // Replace the placeholder div itself with the new control's HTML
            placeholder.outerHTML = controlHtml; 
            DebugManager.log('MAIN_APP', `Created ${type} with id '${id}'.`);
        } else {
            DebugManager.log('MAIN_APP', `WARNING: Could not create control of type: '${type}' with id: '${id}'. Check ui_factory.js and placeholder attributes.`);
        }
    });
    DebugManager.log('MAIN_APP', 'Finished processing UI control placeholders.');
    // --- End of dynamic control creation ---

    const navLinks = document.querySelectorAll('.main-navigation a');
    const mainNavElement = document.getElementById('main-nav');
    
    DebugManager.log('MAIN_APP', 'Smooth scrolling initialized for nav links.');
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
        DebugManager.log('MAIN_APP', 'ERROR: initializeSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize sticky menus
    if (typeof initializeStickyMenus === 'function') {
        initializeStickyMenus();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeStickyMenus function not found. Make sure sticky_menu.js is loaded.');
    }

    // Initialize mode switches
    if (typeof initializeModeSwitches === 'function') {
        initializeModeSwitches(); // Initialize all mode switches
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeModeSwitches function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize phi sliders
    if (typeof initializePhiSliders === 'function') {
        initializePhiSliders(); // Initialize all phi sliders
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializePhiSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize lambda sliders
    if (typeof initializeLambdaSliders === 'function') {
        initializeLambdaSliders();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeLambdaSliders function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize New Data buttons

    // Regenerate SVAR base data (epsilon_t) after all controls are initialized
    // and their initial values might have updated sharedData (e.g., sharedData.T).
    // This ensures epsilon_t is ready before section-specific JS that might use it.
    DebugManager.log('MAIN_APP', 'Calling initial SVAR data regeneration...');
    regenerateSvarData();

    if (typeof initializeNewDataButtons === 'function') {
        initializeNewDataButtons();
    } else {
        DebugManager.log('MAIN_APP', 'ERROR: initializeNewDataButtons function not found. Make sure shared_controls.js is loaded.');
    }

    // Initialize section-specific JavaScript
    DebugManager.log('MAIN_APP', 'Initializing section-specific JavaScript...');
    if (typeof initializeSectionOne === 'function' && document.getElementById('section-one')) {
        initializeSectionOne();
    } else if (typeof initializeSectionOne !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionOne function not found. Make sure section_one.js is loaded.');
    }

    if (typeof initializeSectionTwo === 'function' && document.getElementById('section-two')) {
        initializeSectionTwo();
    } else if (typeof initializeSectionTwo !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionTwo function not found. Make sure section_two.js is loaded.');
    }

    if (typeof initializeSectionThree === 'function' && document.getElementById('section-three')) {
        initializeSectionThree();
    } else if (typeof initializeSectionThree !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionThree function not found. Make sure section_three.js is loaded.');
    }

    if (typeof initializeSectionFour === 'function' && document.getElementById('section-four')) {
        initializeSectionFour();
    } else if (typeof initializeSectionFour !== 'function') {
        DebugManager.log('MAIN_APP', 'WARNING: initializeSectionFour function not found. Make sure section_four.js is loaded.');
    }
    DebugManager.log('MAIN_APP', 'All initializations complete.');
}
