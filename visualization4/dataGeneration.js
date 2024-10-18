
function generateMixedNormalData(length, s) {
    return Array.from({length}, () => {
      if (Math.random() < 0.9) {
        // 90% standard normal
        return normalRandom() - 0.1*s;
      } else {
        // 10% normal with mean s and variance 1
        return normalRandom() + s - 0.1*s;
      }
    });
  }
  
  function normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  
  function NormalizeData(rawEpsilon1, rawEpsilon2){
    // Compute sample means and covariance matrix
    const mean1 = rawEpsilon1.reduce((a, b) => a + b, 0) / T;
    const mean2 = rawEpsilon2.reduce((a, b) => a + b, 0) / T;
    let cov11 = 0, cov12 = 0, cov22 = 0;
    for (let i = 0; i < T; i++) {
      cov11 += (rawEpsilon1[i] - mean1) * (rawEpsilon1[i] - mean1);
      cov12 += (rawEpsilon1[i] - mean1) * (rawEpsilon2[i] - mean2);
      cov22 += (rawEpsilon2[i] - mean2) * (rawEpsilon2[i] - mean2);
    }
    cov11 /= T - 1;
    cov12 /= T - 1;
    cov22 /= T - 1;
  
    // Compute Cholesky decomposition
    const L11 = Math.sqrt(cov11);
    const L21 = cov12 / L11;
    const L22 = Math.sqrt(cov22 - L21 * L21);
  
    // Orthogonalize and normalize the shocks
    epsilon1 = new Array(T);
    epsilon2 = new Array(T);
    for (let i = 0; i < T; i++) {
      epsilon1[i] = (rawEpsilon1[i] - mean1) / L11;
      epsilon2[i] = ((rawEpsilon2[i] - mean2) - L21 * epsilon1[i]) / L22;
    }
  
    // Ensure zero mean and unit variance
    let newMean1 = 0, newMean2 = 0, newVar1 = 0, newVar2 = 0;
    for (let i = 0; i < T; i++) {
      newMean1 += epsilon1[i];
      newMean2 += epsilon2[i];
    }
    newMean1 /= T;
    newMean2 /= T;
  
    for (let i = 0; i < T; i++) {
      epsilon1[i] -= newMean1;
      epsilon2[i] -= newMean2;
      newVar1 += epsilon1[i] * epsilon1[i];
      newVar2 += epsilon2[i] * epsilon2[i];
    }
    newVar1 = Math.sqrt(newVar1 / (T ));
    newVar2 = Math.sqrt(newVar2 / (T ));
  
    for (let i = 0; i < T; i++) {
      epsilon1[i] /= newVar1;
      epsilon2[i] /= newVar2;
    }
    
    selectedPointIndex = null;
  
    return [epsilon1, epsilon2]
  
  }
  


  function getU(epsilon1, epsilon2, Bthis) {
    const [b00, b01, b10, b11] = [Bthis[0][0], Bthis[0][1], Bthis[1][0], Bthis[1][1]];
    const u1 = new Array(epsilon1.length);
    const u2 = new Array(epsilon1.length);
  
    for (let i = 0; i < epsilon1.length; i++) {
      u1[i] = b00 * epsilon1[i] + b01 * epsilon2[i];
      u2[i] = b10 * epsilon1[i] + b11 * epsilon2[i];
    }
  
    return [u1, u2];
  }

function getE(u1, u2, Bthis) {
  const A = math.inv(Bthis);
  const [a00, a01, a10, a11] = [A[0][0], A[0][1], A[1][0], A[1][1]];
  const e1 = new Array(u1.length);
  const e2 = new Array(u1.length);

  for (let i = 0; i < u1.length; i++) {
    e1[i] = a00 * u1[i] + a01 * u2[i];
    e2[i] = a10 * u1[i] + a11 * u2[i];
  }

  return [e1, e2];
}