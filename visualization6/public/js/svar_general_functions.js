// public/js/svar_general_functions.js
window.SVARGeneralUtil = {
    /**
     * Generates a random number from a standard normal distribution using the Box-Muller transform.
     * @returns {number} A random number from N(0,1).
     */
    normalRandom: function(mean = 0, stdDev = 1) {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        const standardNormal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        return mean + stdDev * standardNormal;
    },

    /**
     * Generates a series of random numbers from a standard normal distribution.
     * @param {number} size - The number of random numbers to generate.
     * @returns {number[]} An array of 'size' random numbers from N(0,1).
     */
    generateSingleNormalSeries: function(size) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(this.normalRandom());
        }
        return series;
    },

    /**
     * Calculates the mean of a series of numbers.
     * @param {number[]} series - An array of numbers.
     * @returns {number} The mean of the series.
     */
    calculateMean: function(series) {
        if (series.length === 0) return 0;
        const sum = series.reduce((acc, val) => acc + val, 0);
        return sum / series.length;
    },

    /**
     * Calculates the standard deviation of a series of numbers.
     * @param {number[]} series - An array of numbers.
     * @param {number} [mean] - Optional pre-calculated mean of the series.
     * @returns {number} The standard deviation of the series.
     */
    calculateStdDev: function(series, mean) {
        if (series.length === 0) return 0;
        const seriesMean = mean === undefined ? this.calculateMean(series) : mean;
        const variance = series.reduce((acc, val) => acc + Math.pow(val - seriesMean, 2), 0) / series.length;
        return Math.sqrt(variance);
    },

    /**
     * Normalizes a single series to have a mean of 0 and a standard deviation of 1.
     * @param {number[]} series - An array of numbers.
     * @returns {number[]} The normalized series.
     */
    normalizeSingleSeries: function(series) {
        if (series.length === 0) return [];
        const mean = this.calculateMean(series);
        const stdDev = this.calculateStdDev(series, mean);
        if (stdDev === 0) {
            return series.map(() => 0); // All elements are the same, map to 0
        }
        return series.map(val => (val - mean) / stdDev);
    },
    
    /**
     * Normalizes two series independently to have a mean of 0 and a standard deviation of 1.
     * @param {number[]} series1 - The first array of numbers.
     * @param {number[]} series2 - The second array of numbers.
     * @returns {{normalizedSeries1: number[], normalizedSeries2: number[]}} An object containing the two normalized series.
     */
    normalizeTwoSeriesForMeanAndStdDev: function(series1, series2) {
        const normalizedSeries1 = this.normalizeSingleSeries(series1);
        const normalizedSeries2 = this.normalizeSingleSeries(series2);
        return { normalizedSeries1, normalizedSeries2 };
    },

    /**
     * Generates a single random number from a mixture of two normal distributions.
     * Component 1 (90% prob): N(-0.1*s_param, 1)
     * Component 2 (10% prob): N(0.9*s_param, 1)
     * @param {number} s_param - The skewness parameter.
     * @returns {number} A random number from the mixture distribution.
     */
    generateSingleMixtureNormalValue: function(s_param) {
        const prob = Math.random();
        let mean, stdDev = 1;

        if (prob < 0.9) { // 90% probability for component 1
            mean = -0.1 * s_param;
        } else { // 10% probability for component 2
            mean = 0.9 * s_param;
        }
        return this.normalRandom(mean, stdDev);
    },

    /**
     * Generates a series of random numbers from a mixture of two normal distributions.
     * @param {number} size - The number of random numbers to generate.
     * @param {number} s_param - The skewness parameter for the mixture.
     * @returns {number[]} An array of 'size' random numbers from the mixture distribution.
     */
    generateMixtureNormalSeries: function(size, s_param) {
        const series = [];
        for (let i = 0; i < size; i++) {
            series.push(this.generateSingleMixtureNormalValue(s_param));
        }
        return series;
    }
};
