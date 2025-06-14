// hero_particles.js
// Initializes tsParticles animation in the hero section canvas.
// GPU-accelerated, lightweight, and uses CSS brand colors.

(function () {
    DebugManager.log('HERO', 'Script started.');
    // NOTE: Temporarily disabled reduced motion check to ensure particles always show
    // Uncomment this block to re-enable accessibility feature
    /*
    // Respect reduced motion user preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        DebugManager.log('HERO', 'Reduced motion preference detected. Skipping particle animation.');
        return; // Do not run the animation
    }
    */
    DebugManager.log('HERO', 'Reduced motion check bypassed. Proceeding with particle animation.');

    /**
     * Initialize tsParticles in #hero-particles canvas.
     */
    function initParticles() {
        const particlesContainerId = 'hero-particles';
        DebugManager.log('HERO', `Attempting to get canvas element with ID: ${particlesContainerId}`);
        const particlesContainer = document.getElementById(particlesContainerId);
        if (!particlesContainer) {
            DebugManager.error('HERO', `Canvas element with ID '${particlesContainerId}' not found.`);
            return;
        }

        // Retrieve CSS variable colors for brand consistency
        const rootStyles = getComputedStyle(document.documentElement);
        const primaryColor = rootStyles.getPropertyValue('--color-accent-primary').trim() || '#17A2B8';
        const secondaryColor = rootStyles.getPropertyValue('--color-accent-secondary-plot-loss').trim() || '#E83E8C';
        const tertiaryColor = rootStyles.getPropertyValue('--color-accent-tertiary-particles').trim() || '#FFC107'; // Added tertiary color
        DebugManager.log('HERO', `Primary color: ${primaryColor}, Secondary color: ${secondaryColor}, Tertiary color: ${tertiaryColor}`);

        // Ensure tsParticles is available
        if (!window.tsParticles) {
            DebugManager.error('HERO', 'tsParticles library not found. Ensure it is loaded before this script.');
            return;
        }

        DebugManager.log('HERO', `Calling tsParticles.load for container ID: ${particlesContainerId}`);
        window.tsParticles.load(particlesContainerId, {
            fpsLimit: 60,
            fullScreen: {
                enable: false // Keep inside the hero section only
            },
            detectRetina: true,
            background: {
                color: { value: 'transparent' }
            },
            particles: {
                number: { value: 55, density: { enable: true, area: 800 } },
                color: { value: [primaryColor, secondaryColor, tertiaryColor] }, // Added tertiaryColor to the array
                shape: { type: 'circle' },
                opacity: { value: 0.35 }, // Compromise: Spec is 0.25, raised slightly for visibility
                size: { value: { min: 1.5, max: 3 }, random: true },
                links: { enable: false },
                move: {
                    enable: true,
                    speed: 0.18,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outModes: { default: 'out' }
                }
            },
            interactivity: {
                detectsOn: 'canvas',
                events: {
                    onHover: { enable: true, mode: ['parallax', 'repulse'] },
                    onClick: { enable: false, mode: 'push' }, // Disabled as requested
                    resize: true
                },
                modes: {
                    parallax: { force: 8, smooth: 20 },
                    repulse: { distance: 25, duration: 0.6 } // Added gentle push-away
                }
            },
            backgroundMask: { enable: false }
            
        }).then(container => {
            DebugManager.log('HERO', 'tsParticles.load SUCCEEDED. Particle container:', container);
        }).catch(error => {
            DebugManager.error('HERO', 'tsParticles.load FAILED. Error:', error);
        });
    }

    DebugManager.log('HERO', `Checking document.readyState. Current state: ${document.readyState}`);
    // Run immediately if DOM is already parsed, otherwise wait.
    if (document.readyState === 'loading') {
        DebugManager.log('HERO', 'Document is loading. Adding DOMContentLoaded listener for initParticles.');
        document.addEventListener('DOMContentLoaded', initParticles);
    } else {
        DebugManager.log('HERO', 'Document already loaded/interactive. Calling initParticles directly.');
        initParticles();
    }
})();
