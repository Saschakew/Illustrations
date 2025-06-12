function initializeSliders() {
    console.log('Initializing sliders...');
    const allSliders = document.querySelectorAll('input[type="range"]');
    const alphaSliders = document.querySelectorAll('.alpha-slider');

    allSliders.forEach(slider => {
        const output = document.getElementById(slider.id + '_value');
        if (output) {
            output.textContent = slider.value;
            slider.addEventListener('input', function() {
                output.textContent = this.value;
                if (this.classList.contains('alpha-slider')) {
                    const currentValue = this.value;
                    alphaSliders.forEach(otherSlider => {
                        if (otherSlider !== this) {
                            otherSlider.value = currentValue;
                            const otherOutput = document.getElementById(otherSlider.id + '_value');
                            if (otherOutput) otherOutput.textContent = currentValue;
                        }
                    });
                }
            });
        }
    });

    if (alphaSliders.length > 0) {
        const initialAlphaValue = alphaSliders[0].value;
        alphaSliders.forEach(slider => {
            slider.value = initialAlphaValue;
            const output = document.getElementById(slider.id + '_value');
            if (output) output.textContent = initialAlphaValue;
        });
    }
    console.log('Sliders initialized.');
}

