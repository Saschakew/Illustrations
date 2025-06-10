document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        'svar_setup',
        'estimation_restrictions',
        'estimation_nongaussianity',
        'ridge_estimation'
    ];

    sections.forEach(sectionId => {
        fetch(`sections/${sectionId}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const sectionElement = document.getElementById(sectionId.replace(/_/g, '-'));
                if (sectionElement) {
                    sectionElement.innerHTML = data;
                    // Manually execute scripts
                    Array.from(sectionElement.querySelectorAll("script")).forEach(oldScript => {
                        const newScript = document.createElement("script");
                        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            })
            .catch(error => console.error(`Error loading section ${sectionId}:`, error));
    });
});
