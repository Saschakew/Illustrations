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

// Univariate non-Gaussianity loss (page 5):
// Sum of squared skewness and excess kurtosis of e1 and e2
function lossNonGaussian(u1, u2, phi) {
    const B = getB(phi);
    const [e1, e2] = getE(u1, u2, B);
    const stats = calculateMoments(e1, e2);
    const skewTerm = Math.pow(stats.mean_cubed1, 2) + Math.pow(stats.mean_cubed2, 2);
    const kurtTerm = Math.pow(stats.mean_fourth1, 2) + Math.pow(stats.mean_fourth2, 2);
    return skewTerm + kurtTerm;
}

function lossCov(u1, u2, phi) {  
    B = getB(phi) 

    const [e1, e2] = getE(u1,u2,B)

    const out = calculateMoments(e1, e2).covariance

    return out;
}

function lossZ1(u1, u2, z1, z2, W, phi) {  
    // Independence-based loss (sum of squared higher co-moments)
    const B = getB(phi);
    const [e1, e2] = getE(u1, u2, B);
    return calculateMoments(e1, e2).loss;
}

function lossZ2(u1, u2, z1, z2, W, phi) {  
    // Squared covariance of innovations (uncorrelatedness)
    const B = getB(phi);
    const [e1, e2] = getE(u1, u2, B);
    const cov = calculateMoments(e1, e2).covariance;
    return cov * cov;
}
function lossZ12(u1, u2, z1, z2, W, phi) { 
    // Use the independence co-moment loss for combined loss
    const B = getB(phi);
    const [e1, e2] = getE(u1, u2, B);
    return calculateMoments(e1, e2).loss;
}

  function getW(  epsilon2, z1, z2) {  
  
    const n = epsilon2.length;
    const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / n;
  
    // Calculate e2*z1 and e2*z2
    const e2z1 = epsilon2.map((e2i, i) => e2i * z1[i]);
    const e2z2 = epsilon2.map((e2i, i) => e2i * z2[i]);
  
    // Calculate the variance-covariance matrix S
    const meanE2z1Squared = mean(e2z1.map(val => val * val));
    const meanE2z2Squared = mean(e2z2.map(val => val * val));
    const meanE2z1E2z2 = mean(e2z1.map((val, i) => val * e2z2[i]));
  
    const S = [
      [meanE2z1Squared, meanE2z1E2z2],
      [meanE2z1E2z2, meanE2z2Squared]
    ];
  
    // Calculate S^(-1) 
    const W = math.inv(S);

    return W
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
