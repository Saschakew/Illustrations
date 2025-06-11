// General shared utility functions, namespaced to avoid global scope pollution.

window.SVARGeneral = {
    // --- General Statistical Utilities ---

    normalRandom: function() {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    },

    generateSingleNormalSeries: function(size) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(this.normalRandom()); // Use this.normalRandom
        }
        return series;
    },

    generateMixedNormalData: function(length, s) {
        return Array.from({length}, () => {
            if (Math.random() < 0.9) {
                return this.normalRandom() - 0.1 * s; // Use this.normalRandom
            } else {
                return this.normalRandom() + s - 0.1 * s; // Use this.normalRandom
            }
        });
    },

    // Renamed from NormalizeData for clarity
    normalizeTwoSeriesForMeanAndStdDev: function(series1, series2) {
        if (!series1 || !series2 || series1.length === 0 || series2.length === 0 || series1.length !== series2.length) {
            console.error("Invalid input series for normalization.");
            // Return original or empty arrays to prevent further errors
            return { normalizedSeries1: series1 || [], normalizedSeries2: series2 || [] };
        }

        const length = series1.length;
        let xMean = 0, yMean = 0;
        let count = 0;

        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xMean += series1[i];
                yMean += series2[i];
                count++;
            }
        }

        if (count === 0) { // All values are NaN or empty arrays
            console.warn("Cannot normalize series with all NaN values or zero valid data points.");
            return { normalizedSeries1: series1, normalizedSeries2: series2 };
        }

        xMean /= count;
        yMean /= count;

        let xStd = 0, yStd = 0;
        for (let i = 0; i < length; i++) {
            if (!isNaN(series1[i]) && !isNaN(series2[i])) {
                xStd += Math.pow(series1[i] - xMean, 2);
                yStd += Math.pow(series2[i] - yMean, 2);
            }
        }
        
        xStd = Math.sqrt(xStd / (count > 1 ? count - 1 : 1)); // Sample standard deviation, handle count=1 case
        yStd = Math.sqrt(yStd / (count > 1 ? count - 1 : 1)); // Sample standard deviation, handle count=1 case

        const normalizedSeries1 = new Array(length);
        const normalizedSeries2 = new Array(length);

        for (let i = 0; i < length; i++) {
            if (isNaN(series1[i]) || isNaN(series2[i])) {
                normalizedSeries1[i] = NaN; // Preserve NaNs
                normalizedSeries2[i] = NaN;
            } else {
                normalizedSeries1[i] = (xStd === 0) ? (series1[i] - xMean) : (series1[i] - xMean) / xStd;
                normalizedSeries2[i] = (yStd === 0) ? (series2[i] - yMean) : (series2[i] - yMean) / yStd;
            }
        }
        return { normalizedSeries1, normalizedSeries2 };
    },

    matrixToHtml: function(matrix, precision = 2) {
        if (!matrix || matrix.length !== 2 || matrix[0].length !== 2 || matrix[1].length !== 2) {
            console.warn("Invalid matrix provided to matrixToHtml. Expected 2x2 matrix.");
            return `<div class="matrix-display"><table><tr><td>?</td><td>?</td></tr><tr><td>?</td><td>?</td></tr></table></div>`;
        }
        return `
            <div class="matrix-display">
                <table>
                    <tr>
                        <td>${matrix[0][0].toFixed(precision)}</td>
                        <td>${matrix[0][1].toFixed(precision)}</td>
                    </tr>
                    <tr>
                        <td>${matrix[1][0].toFixed(precision)}</td>
                        <td>${matrix[1][1].toFixed(precision)}</td>
                    </tr>
                </table>
            </div>
        `;
    }
};
