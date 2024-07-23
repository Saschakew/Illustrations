function  getB(phi) {
    let B = [
        [Math.cos(phi), - Math.sin(phi)],
        [Math.sin(phi), Math.cos(phi)]
    ];

    return B
}

function loss34(u1, u2, phi) {  
    B = getB(phi) 

    const [e1, e2] = getE(u1,u2,B)

    const out = calculateMoments(e1, e2).loss
  
    return out;
  }

function lossCov(u1, u2, phi) {  
    B = getB(phi) 

    const [e1, e2] = getE(u1,u2,B)

    const out = calculateMoments(e1, e2).covariance

    return out;
}

function calculateMoments(data1, data2) {
    if (!Array.isArray(data1) || !Array.isArray(data2) || data1.length !== data2.length || data1.length === 0) {
        throw new Error("Input must be non-empty arrays of equal length");
    }

    const n = data1.length;

    // Helper function to calculate mean
    const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / n;

    // Calculate basic moments
    const covariance = mean(data1.map((d1, i) => d1 * data2[i]));
    const coskewness1 = mean(data1.map((d1, i) => d1 * d1 * data2[i]));
    const coskewness2 = mean(data1.map((d1, i) => d1 * data2[i] * data2[i]));
    const cokurtosis1 = mean(data1.map((d1, i) => d1 * d1 * d1 * data2[i]));
    const cokurtosis2 = mean(data1.map((d1, i) => d1 * data2[i] * data2[i] * data2[i]));
    const cokurtosis3 = mean(data1.map((d1, i) => d1 * d1 * data2[i] * data2[i]))-1;

    const mean1 = mean(data1)
    const mean2 = mean(data2)
    const mean_squared1 = mean(data1.map(d => d * d))
    const mean_squared2= mean(data2.map(d => d * d))
    const mean_cubed1= mean(data1.map(d => d * d * d))
    const mean_cubed2= mean(data2.map(d => d * d * d))
    const mean_fourth1= mean(data1.map(d => d * d * d * d))-3
    const mean_fourth2= mean(data2.map(d => d * d * d * d))-3

    return {
        covariance,
        coskewness1,
        coskewness2,
        cokurtosis1,
        cokurtosis2,
        cokurtosis3,
        mean1,
        mean2,
        mean_squared1,
        mean_squared2,
        mean_cubed1,
        mean_cubed2,
        mean_fourth1,
        mean_fourth2,
        loss: Math.pow(coskewness1, 2) +Math.pow(coskewness2, 2) +Math.pow(cokurtosis1, 2) + Math.pow(cokurtosis2, 2) + Math.pow(cokurtosis3, 2)
    };
}
